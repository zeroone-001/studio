
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  Firestore,
  getFirestore,
  setLogLevel,
  memoryLocalCache,
  terminate
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;

export function initializeFirebase() {
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    
    setLogLevel('error');

    if (isBrowser) {
      // Browser-only persistent cache
      try {
        db = initializeFirestore(app, {
          localCache: persistentLocalCache({ 
            tabManager: persistentMultipleTabManager() 
          })
        });
      } catch (e) {
        // Fallback to simple firestore if persistent cache fails
        db = getFirestore(app);
      }
    } else {
      // Server-side: use simple getFirestore which is safe for SSR/build-time
      db = getFirestore(app);
    }
    
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
