import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getFunctions, Functions } from 'firebase/functions';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyDJRx8nPOSi-qmHoqoBb20GPCy78Ci0WsM",
  authDomain: "shuffle-tut.firebaseapp.com",
  projectId: "shuffle-tut",
  storageBucket: "shuffle-tut.firebasestorage.app",
  messagingSenderId: "359852501217",
  appId: "1:359852501217:web:ba0be826f0430f80302fa0",
  measurementId: "G-6798K8L9Z5"
};

const app: FirebaseApp = initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const analytics: Analytics = getAnalytics(app);
export const functions: Functions = getFunctions(app, 'us-central1');

// Google Auth Provider
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Configure Google provider to always show account selection prompt
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Uncomment for development with Firebase emulators
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export default app;