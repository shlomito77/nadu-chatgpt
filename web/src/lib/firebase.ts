import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

// Fallback config for build time / server side where env vars might be missing
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'dummy-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'dummy-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'dummy-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '00000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:00000000000:web:00000000000000',
};

// Initialize Firebase
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const functions: Functions = getFunctions(app);
const storage: FirebaseStorage = getStorage(app);

// Connect to emulators in development
// Note: In Next.js, NODE_ENV is 'development' during 'next dev'
if (process.env.NODE_ENV === 'development') {
  // Use a guard to prevent multiple connections (hot reload issue)
  // @ts-ignore - _emulatorsConnected is a custom flag we attach
  if (typeof window !== 'undefined' && !window._emulatorsConnected) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectFunctionsEmulator(functions, 'localhost', 5001);
      connectStorageEmulator(storage, 'localhost', 9199);
      // @ts-ignore
      window._emulatorsConnected = true;
    } catch (e) {
      console.warn('Firebase emulators already connected', e);
    }
  }
}

export { app, auth, db, functions, storage };
