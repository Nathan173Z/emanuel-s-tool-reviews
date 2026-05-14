import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBVyTqJHpRXr4s2J6w0D0hc7NjzwvRHcms",
  authDomain: "emanuel-solucoes.firebaseapp.com",
  projectId: "emanuel-solucoes",
  storageBucket: "emanuel-solucoes.firebasestorage.app",
  messagingSenderId: "640780423935",
  appId: "1:640780423935:web:69849626d4cd99b1a372ca",
  measurementId: "G-WN0PH6D8YY",
};

export const firebaseApp: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export let firebaseAnalytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported()
    .then((ok) => {
      if (ok) firebaseAnalytics = getAnalytics(firebaseApp);
    })
    .catch(() => {});
}
