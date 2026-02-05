// Firebase SDK only
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCC_PkB6ku4wHa9cv9At49EBAqFEkLFTmY",
  authDomain: "bas-website-75a3f.firebaseapp.com",
  projectId: "bas-website-75a3f",
  storageBucket: "bas-website-75a3f.firebasestorage.app",
  messagingSenderId: "479794328516",
  appId: "1:479794328516:web:aa54b7ad01090aa44c6a91",
  measurementId: "G-GHQSRJ6MQH"
};

const app = initializeApp(firebaseConfig);
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  // Analytics may fail in some environments; ignore silently
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
