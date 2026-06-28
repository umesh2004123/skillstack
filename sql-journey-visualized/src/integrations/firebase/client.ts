import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBPgtIy5Ht5HsPhksCBIETAIoh0cauIDoA",
  authDomain: "studyhub-57c70.firebaseapp.com",
  projectId: "studyhub-57c70",
  storageBucket: "studyhub-57c70.firebasestorage.app",
  messagingSenderId: "89570845954",
  appId: "1:89570845954:web:e2b99e04f400bafd230e1b",
  measurementId: "G-8JDWL65K87",
};

export const ADMIN_EMAIL = "umeshvalavala2004@gmail.com";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);

export function isAdminEmail(email?: string | null) {
  return (email || "").trim().toLowerCase() === ADMIN_EMAIL;
}
