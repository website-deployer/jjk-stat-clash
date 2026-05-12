import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBCl-rL8M0GBDBiZMjYzhOYy9LyP7a8NJc",
  authDomain: "jjk-stat-clash-reviews.firebaseapp.com",
  projectId: "jjk-stat-clash-reviews",
  storageBucket: "jjk-stat-clash-reviews.firebasestorage.app",
  messagingSenderId: "520211170628",
  appId: "1:520211170628:web:c2f95a71f0a2527410c311",
  measurementId: "G-V0G68253WY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
