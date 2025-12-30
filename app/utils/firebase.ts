import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔴 Validación explícita (esto es CLAVE)
function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`❌ Variable de entorno faltante: ${name}`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

// ✅ Inicializa Firebase UNA sola vez
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Firestore
export const db = getFirestore(app);

// 🔎 Debug SOLO en producción (no expone la key completa)
if (typeof window !== "undefined") {
  console.log("🔥 Firebase inicializado en:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKeyPreview: firebaseConfig.apiKey.slice(0, 6) + "...",
  });
}
