// script.js
import { auth, db, storage } from './firebase.js';
import { setLanguage, setTheme } from './utils.js';
import { translations } from './translations.js';
import {
  signInWithRedirect,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      await initProfile(user);
      showFilesPage();
    } else {
      showLoginPage();
    }
  });
});

async function initProfile(user) {
  const profileRef = doc(db, "profiles", user.uid);
  const profileSnap = await getDoc(profileRef);
  if (!profileSnap.exists()) {
    await setDoc(profileRef, {
      displayName: user.displayName || user.email.split('@')[0],
      email: user.email,
      createdAt: serverTimestamp(),
      theme: 'dark',
      language: 'ru'
    });
  } else {
    const data = profileSnap.data();
    if (data.theme) setTheme(data.theme);
    if (data.language) setLanguage(data.language);
  }
}

function showLoginPage() {
  document.getElementById('app').innerHTML = `
    <h1 data-i18n="welcome"></h1>
    <button id="googleBtn" class="btn" data-i18n="signIn"></button>
    <form id="emailForm" style="margin-top:20px;">
      <div class="form-group">
        <input type="email" id="email" placeholder="Email" required>
      </div>
      <div class="form-group">
        <input type="password" id="password" placeholder="Password" required>
      </div>
      <button type="submit" class="btn">Login</button>
    </form>
  `;
  document.getElementById('googleBtn').addEventListener('click', signInWithGoogle);
  document.getElementById('emailForm').addEventListener('submit', signInWithEmail);
}

function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  signInWithRedirect(auth, provider);
}

function signInWithEmail(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  signInWithEmailAndPassword(auth, email, password)
    .catch(err => alert(err.message));
}

function showFilesPage() {
  document.getElementById('app').innerHTML = `
    <nav>
      <a href="index.html" data-i18n="files"></a>
      <a href="profile.html" data-i18n="profile"></a>
      <a href="settings.html" data-i18n="settings"></a>
      <button onclick="logoutUser()" data-i18n="signOut"></button>
    </nav>
    <div id="fileList">
      <p data-i18n="noFiles"></p>
      <input type="file" id="fileInput" multiple style="margin-top:10px;">
      <button id="uploadBtn" class="btn" data-i18n="uploadFile"></button>
    </div>
  `;
  loadUserFiles();
  document.getElementById('uploadBtn').addEventListener('click', uploadFiles);
}

async function loadUserFiles() {
  const q = query(collection(db, "files"), where("userId", "==", currentUser.uid));
  const querySnapshot = await getDocs(q);
  const list = document.getElementById('fileList');
  if (querySnapshot.empty) {
    list.innerHTML = `
      <p data-i18n="noFiles"></p>
      <input type="file" id="fileInput" multiple>
      <button id="uploadBtn" class="btn" data-i18n="uploadFile"></button>`;
    document.getElementById('uploadBtn').addEventListener('click', uploadFiles);
  } else {
    let html = '';
    querySnapshot.forEach(doc => {
      const f = doc.data();
      html += `
        <div class="file-card">
          <span>${f.name} (${(f.size / 1024).toFixed(1)} KB)</span>
          <button onclick="deleteFile('${doc.id}', '${f.storagePath}')">Удалить</button>
        </div>`;
    });
    list.innerHTML = html;
  }
  // Применить переводы
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = translations[currentLang][key] || key;
  });
}

async function uploadFiles() {
  const files = document.getElementById('fileInput').files;
  if (!files.length) return;
  for (const file of files) {
    const storageRef = ref(storage, `files/${currentUser.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    await addDoc(collection(db, "files"), {
      name: file.name,
      size: file.size,
      type: file.type,
      storagePath: `files/${currentUser.uid}/${file.name}`,
      userId: currentUser.uid,
      uploadedAt: serverTimestamp()
    });
  }
  loadUserFiles();
}

// Глобальные функции
window.deleteFile = async (fileId, storagePath) => {
  if (!confirm("Удалить файл?")) return;
  await deleteObject(ref(storage, storagePath));
  await deleteDoc(doc(db, "files", fileId));
  loadUserFiles();
};
