// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyALm9NkknY74WjGLu0crBC2GbSj2ntFgpw",
  authDomain: "server-922c9.firebaseapp.com",
  projectId: "server-922c9",
  storageBucket: "server-922c9.firebasestorage.app",
  messagingSenderId: "61302548059",
  appId: "1:61302548059:web:3d01a573a5310f8f1c417e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
