import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID,
}

const hasConfig = Object.values(firebaseConfig).every(Boolean)
let app = null
let db = null
let auth = null

if (hasConfig) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  db = getFirestore(app)
  auth = getAuth(app)
}

const googleProvider = new GoogleAuthProvider()

export { db, auth, googleProvider }

export const DATA_KEYS = [
  'syl','mocks','logs','habs','revision',
  'vocab','pyqlog','pomoSessions','settings',
  'quizResults','plannerTasks','revisionCycles'
]
