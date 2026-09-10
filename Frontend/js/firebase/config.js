// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDODIgvBK2_p2LEWhG-DzakD_73qnMtEZ4",
  authDomain: "uttomebr.firebaseapp.com",
  projectId: "uttomebr",
  storageBucket: "uttomebr.firebasestorage.app",
  messagingSenderId: "788219324757",
  appId: "1:788219324757:web:1e3b5d5715a4c8b2c8e7dc",
  measurementId: "G-X42QMNWH8T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

export { auth, db, rtdb };
