import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDJRx8nPOSi-qmHoqoBb20GPCy78Ci0WsM",
  authDomain: "shuffle-tut.firebaseapp.com",
  projectId: "shuffle-tut",
  storageBucket: "shuffle-tut.firebasestorage.app",
  messagingSenderId: "359852501217",
  appId: "1:359852501217:web:ba0be826f0430f80302fa0",
  measurementId: "G-6798K8L9Z5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Uncomment for development with Firebase emulators
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export default app;