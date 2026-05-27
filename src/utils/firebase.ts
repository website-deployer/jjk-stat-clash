import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBCl-rL8M0GBDBiZMjYzhOYy9LyP7a8NJc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "jjk-stat-clash-reviews.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "jjk-stat-clash-reviews",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "jjk-stat-clash-reviews.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "520211170628",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:520211170628:web:c2f95a71f0a2527410c311",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-V0G68253WY",
};

let app: ReturnType<typeof initializeApp> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let analytics: ReturnType<typeof getAnalytics> | null = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
} catch (e) {
  console.warn("Firebase initialization failed:", e);
}

export { app, db, analytics };
