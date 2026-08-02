import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  Firestore,
  getFirestore,
  setLogLevel,
  memoryLocalCache
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;

export function initializeFirebase() {
  const isBrowser = typeof window !== 'undefined';

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    
    setLogLevel('error');

    // Only enable persistence on the client to avoid SSR crashes
    if (isBrowser) {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({ 
          tabManager: persistentMultipleTabManager() 
        })
      });
    } else {
      // Server-side: use simple memory cache for build-time rendering
      db = initializeFirestore(app, {
        localCache: memoryLocalCache()
      });
    }
    
    storage = getStorage(app);
    auth = getAuth(app);
  } else {
    app = getApps()[0];
    // Return existing instances to avoid re-initialization errors
    try {
      db = getFirestore(app);
    } catch (e) {
      // Fallback for edge cases where getFirestore fails before initialization
      db = initializeFirestore(app, {});
    }
    storage = getStorage(app);
    auth = getAuth(app);
  }
  return { app, db, storage, auth };
}

export const getFirebase = initializeFirebase;
