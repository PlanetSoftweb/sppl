import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDftvn-kDSKxiF6yeNzHGxzHa8HypQ9TTo",
  authDomain: "vedah-photo-s.firebaseapp.com",
  projectId: "vedah-photo-s",
  storageBucket: "vedah-photo-s.firebasestorage.app",
  messagingSenderId: "672444055274",
  appId: "1:672444055274:web:027339ad3970de06d3e193",
  measurementId: "G-28WNYFLM5P"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);