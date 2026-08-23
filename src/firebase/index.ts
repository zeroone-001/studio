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
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  AppCheck
} from 'firebase/app-check';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;
let appCheck: AppCheck | undefined;

export function initializeFirebase() {
  const isBrowser =
    typeof window !== 'undefined' &&
    typeof window.indexedDB !== 'undefined';

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

  if (isBrowser && !appCheck) {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(
          '6LeFZX4tAAAAAOkluCTX_38CA-lo-QinTiu0eJxx'
        ),
        isTokenAutoRefreshEnabled: true
      });
    } catch (e) {
      // App Check is non-critical for initialization, ignore failures during pre-render
    }
  }

  return { app, db, storage, auth };
}

export const getFirebase = initializeFirebase;
