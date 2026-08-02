
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  Firestore,
  getFirestore,
  setLogLevel
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;

export function initializeFirebase() {
  // Robust check for browser environment
  const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    setLogLevel('error');

    if (isBrowser) {
      try {
        db = initializeFirestore(app, {
          localCache: persistentLocalCache({ 
            tabManager: persistentMultipleTabManager() 
          })
        });
      } catch (e) {
        db = getFirestore(app);
      }
    } else {
      // Server-side safe initialization
      db = getFirestore(app);
    }
    
    storage = getStorage(app);
    auth = getAuth(app);
  } else {
    app = getApps()[0];
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
  }
  return { app, db, storage, auth };
}

export const getFirebase = initializeFirebase;
