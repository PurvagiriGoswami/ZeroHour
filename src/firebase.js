import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID,
}

export const FIREBASE_UID = 'purva2027'

const hasConfig = Object.values(firebaseConfig).every(Boolean)
let app = null
let db = null

if (hasConfig) {
  const existing = getApps().find(a => a.name === 'zerohour-app')
  app = existing || initializeApp(firebaseConfig, 'zerohour-app')
  db = getFirestore(app)
}

export { db }

export const DATA_KEYS = [
  'syl','mocks','logs','habs','revision',
  'vocab','pyqlog','pomoSessions','settings',
  'quizResults','plannerTasks','revisionCycles'
]

export async function pushToFirebase(data) {
  if (!db) return false
  try {
    await setDoc(doc(db, 'users', FIREBASE_UID), { ...data, _ts: Date.now() })
    return true
  } catch (e) {
    console.warn('FB push error:', e)
    return false
  }
}

export async function pullFromFirebase() {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, 'users', FIREBASE_UID))
    if (snap.exists()) return snap.data()
    return null
  } catch (e) {
    console.warn('FB pull error:', e)
    return null
  }
}

export function subscribeToFirebase(callback) {
  if (!db) return () => {}
  return onSnapshot(doc(db, 'users', FIREBASE_UID), snap => {
    if (snap.exists()) callback(snap.data())
  })
}
