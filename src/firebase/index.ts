
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
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    
    // Enable error-only logging for stable kiosk performance
    setLogLevel('error');

    // Enable IndexedDB Persistence for offline resiliency (Crucial for Honor Pad Kiosk)
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ 
        tabManager: persistentMultipleTabManager() 
      })
    });
    
    storage = getStorage(app);
    auth = getAuth(app);
  } else {
    app = getApps()[0];
    try {
      db = getFirestore(app);
    } catch (e) {
      db = initializeFirestore(app, {});
    }
    storage = getStorage(app);
    auth = getAuth(app);
  }
  return { app, db, storage, auth };
}

export const getFirebase = initializeFirebase;
