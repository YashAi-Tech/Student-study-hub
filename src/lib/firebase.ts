import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCA6HX2UN82GgIvYxgczWTvmK7_GMyKocs",
  authDomain: "credible-sunset-w8gvj.firebaseapp.com",
  projectId: "credible-sunset-w8gvj",
  storageBucket: "credible-sunset-w8gvj.firebasestorage.app",
  messagingSenderId: "891874806048",
  appId: "1:891874806048:web:70c9e7c98086804ee0af45"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
