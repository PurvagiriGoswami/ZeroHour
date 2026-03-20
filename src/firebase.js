import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCG3k2IdzaCTNiImBxYhxx9ew6M4x0YRA8",
  authDomain: "defence-command.firebaseapp.com",
  projectId: "defence-command",
  storageBucket: "defence-command.firebasestorage.app",
  messagingSenderId: "4239232075",
  appId: "1:4239232075:web:7210007667108143ea11ce",
  measurementId: "G-JF2TCHH245"
}

export const FIREBASE_UID = 'purva2027'

const existing = getApps().find(a => a.name === 'defence-cmd')
const app = existing || initializeApp(firebaseConfig, 'defence-cmd')
export const db = getFirestore(app)

export const DATA_KEYS = [
  'syl','mocks','logs','habs','errs','revision',
  'vocab','formulas','pyqlog','pomoSessions','settings'
]

export async function pushToFirebase(data) {
  try {
    await setDoc(doc(db, 'users', FIREBASE_UID), { ...data, _ts: Date.now() })
    return true
  } catch (e) {
    console.warn('FB push error:', e)
    return false
  }
}

export async function pullFromFirebase() {
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
  return onSnapshot(doc(db, 'users', FIREBASE_UID), snap => {
    if (snap.exists()) callback(snap.data())
  })
}
