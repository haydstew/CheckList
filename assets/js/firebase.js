import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4P6pJMOlEBef3ARByNoysmx-zR7BE85M",
  authDomain: "pwa-to-do-app-8bba5.firebaseapp.com",
  projectId: "pwa-to-do-app-8bba5",
  storageBucket: "pwa-to-do-app-8bba5.firebasestorage.app",
  messagingSenderId: "899910419626",
  appId: "1:899910419626:web:1ba0790ca226f2f5ba7cd3",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();
