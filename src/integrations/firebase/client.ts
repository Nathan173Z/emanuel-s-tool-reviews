import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";

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

let _auth: Auth | undefined;
export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(firebaseApp);
  return _auth;
}

let _db: Firestore | undefined;
/** Firestore singleton. Usa long polling no Node (SSR) para compatibilidade com Vercel/Nitro. */
export function getFirebaseDb(): Firestore {
  if (_db) return _db;
  if (typeof window === "undefined") {
    _db = initializeFirestore(firebaseApp, { experimentalForceLongPolling: true });
  } else {
    _db = getFirestore(firebaseApp);
  }
  return _db;
}

export let firebaseAnalytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported()
    .then((ok) => {
      if (ok) firebaseAnalytics = getAnalytics(firebaseApp);
    })
    .catch(() => {});
}
