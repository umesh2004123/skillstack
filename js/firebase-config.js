// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPgtIy5Ht5HsPhksCBIETAIoh0cauIDoA",
  authDomain: "studyhub-57c70.firebaseapp.com",
  projectId: "studyhub-57c70",
  storageBucket: "studyhub-57c70.firebasestorage.app",
  messagingSenderId: "89570845954",
  appId: "1:89570845954:web:e2b99e04f400bafd230e1b",
  measurementId: "G-8JDWL65K87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, db, googleProvider };
