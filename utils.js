// utils.js
import { translations } from './translations.js';
import { auth, db } from './firebase.js';
import {
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  deleteUser
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let currentLang = localStorage.getItem('language') || 'ru';
let currentTheme = localStorage.getItem('theme') || 'dark';

export function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  applyTranslations();
  const user = auth.currentUser;
  if (user) {
    updateDoc(doc(db, "profiles", user.uid), { language: lang });
  }
}

export function setTheme(theme) {
  currentTheme = theme;
  document.body.className = `theme-${theme}`;
  localStorage.setItem('theme', theme);
  const user = auth.currentUser;
  if (user) {
    updateDoc(doc(db, "profiles", user.uid), { theme });
  }
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang] && translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });
}

export function logoutUser() {
  import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js").then(({ signOut }) => {
    signOut(auth).then(() => {
      window.location.href = "index.html";
    });
  });
}

export async function reauthAndChangeEmail(newEmail) {
  const user = auth.currentUser;
  const password = prompt(translations[currentLang].password || "Password:");
  if (!password) return;
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  await updateEmail(user, newEmail);
  alert("Email updated!");
}

export async function reauthAndChangePassword(newPassword) {
  const user = auth.currentUser;
  const password = prompt(translations[currentLang].password || "Password:");
  if (!password) return;
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
  alert("Password updated!");
}

export async function reauthAndDeleteAccount() {
  if (!confirm(translations[currentLang].confirmDelete || "Delete account?")) return;
  const user = auth.currentUser;
  const password = prompt(translations[currentLang].password || "Password:");
  if (!password) return;
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  await deleteUser(user);
  alert("Account deleted.");
  window.location.href = "index.html";
}

// Глобальная инициализация
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('language') || 'ru';
  const savedTheme = localStorage.getItem('theme') || 'dark';
  currentLang = savedLang;
  currentTheme = savedTheme;
  setTheme(savedTheme);
  applyTranslations();
});

// Экспортируем для inline-использования
window.setLanguage = setLanguage;
window.setTheme = setTheme;
window.logoutUser = logoutUser;
window.reauthAndChangeEmail = reauthAndChangeEmail;
window.reauthAndChangePassword = reauthAndChangePassword;
window.reauthAndDeleteAccount = reauthAndDeleteAccount;
