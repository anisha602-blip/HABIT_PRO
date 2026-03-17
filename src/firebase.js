import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const isConfigured = !!(apiKey && apiKey.length > 10 && !apiKey.startsWith('your_'));

let auth = null;
let db = null;
let googleProvider = null;

if (isConfigured) {
  try {
    const firebaseConfig = {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (e) {
    console.warn('[HabitPro] Firebase init failed:', e.message);
  }
}

export { auth, db, googleProvider, isConfigured };

export const signInWithGoogle = () => {
  if (!auth) throw new Error('Firebase not configured. Please add your .env file.');
  return signInWithPopup(auth, googleProvider);
};

export const signOutUser = () => {
  if (!auth) return Promise.resolve();
  return signOut(auth);
};

export const onAuthChange = (cb) => {
  if (!auth) {
    // No Firebase — immediately report logged out
    cb(null);
    return () => { };
  }
  return onAuthStateChanged(auth, cb);
};

export const loadUserData = async (uid) => {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const saveUserData = async (uid, data) => {
  if (!db) return;
  await setDoc(doc(db, 'users', uid), data, { merge: true });
};

export const subscribeUserData = (uid, cb) => {
  if (!db) return () => { };
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    cb(snap.exists() ? snap.data() : null);
  });
};
