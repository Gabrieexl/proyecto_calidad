import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

function readEnv(name: string) {
  const v = process.env[name];
  return (v && v.trim().length > 0) ? v : undefined;
}

const firebaseConfig = {
  apiKey: readEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: readEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: readEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

if (typeof window !== "undefined") {
  console.log("ENV CHECK:", {
    apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.slice(0, 6) + "..." : "MISSING",
    authDomain: firebaseConfig.authDomain ?? "MISSING",
    projectId: firebaseConfig.projectId ?? "MISSING",
  });
}

const allPresent =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId;

export const app = allPresent
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig as Required<typeof firebaseConfig>))
  : null;

export const db = app ? getFirestore(app) : null;
