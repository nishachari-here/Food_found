// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8yHc68-cymTGzD92QZPgumX6sw94BLCw",
  authDomain: "food-found.firebaseapp.com",
  projectId: "food-found",
  storageBucket: "food-found.firebasestorage.app",
  messagingSenderId: "1004895694406",
  appId: "1:1004895694406:web:bbb0271a5f746867e7a447",
  measurementId: "G-E5H8QKVLQF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);