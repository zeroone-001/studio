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
import { firebaseConfig } from './config';

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;

export function initializeFirebase() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    
    // Enable production-grade logging for Kiosk
    // 'error' level prevents minor connection warnings from flooding consoles
    setLogLevel('error');

    // Initialize Firestore with Offline Persistence (IndexedDB)
    // This allows the kiosk to operate even with intermittent internet
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ 
        tabManager: persistentMultipleTabManager() 
      })
    });
    
    storage = getStorage(app);
  } else {
    app = getApps()[0];
    // Avoid double initialization
    try {
      db = getFirestore(app);
    } catch (e) {
      db = initializeFirestore(app, {});
    }
    storage = getStorage(app);
  }
  return { app, db, storage };
}

export const getFirebase = initializeFirebase;