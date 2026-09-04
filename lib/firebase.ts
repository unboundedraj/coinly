import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyCQ6FafH_Snp-KHGsOY3Y85E7OED4d3HB4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "coinly-c0af2.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "coinly-c0af2",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "coinly-c0af2.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "656863818810",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:656863818810:web:5a4fb4803df648a9ef7103",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-W0FC3Y8806",
};

const app =
  typeof window === "undefined"
    ? null
    : getApps().length > 0
      ? getApp()
      : initializeApp(firebaseConfig);

export const auth: Auth | null = app ? getAuth(app) : null;
export const analytics: Analytics | null = app ? getAnalytics(app) : null;
export const googleProvider = new GoogleAuthProvider();