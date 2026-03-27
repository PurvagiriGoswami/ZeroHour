import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider 
} from 'firebase/auth'

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
  const existing = getApps().find(a => a.name === 'zerohour-app')
  app = existing || initializeApp(firebaseConfig, 'zerohour-app')
  db = getFirestore(app)
  auth = getAuth(app)
}

const googleProvider = new GoogleAuthProvider()
const facebookProvider = new FacebookAuthProvider()
const appleProvider = new OAuthProvider('apple.com')

export { db, auth, googleProvider, facebookProvider, appleProvider }

export const DATA_KEYS = [
  'syl','mocks','logs','habs','revision',
  'vocab','pyqlog','pomoSessions','settings',
  'quizResults','plannerTasks','revisionCycles'
]
