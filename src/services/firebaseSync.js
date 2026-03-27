import { setDoc, doc } from 'firebase/firestore'; 
 import { db } from '../firebase'; 
 
 let timer = null; 
 
 export function scheduleSyncToFirestore(uid, state) { 
   if (!uid || !db) return;
   clearTimeout(timer); 
   timer = setTimeout(async () => { 
     try { 
       await setDoc(doc(db, 'users', uid, 'userData', 'main'), {
         ...state,
         _ts: Date.now()
       }, { merge: true }); 
     } catch (e) { 
       console.error('[ZeroHour] Firestore sync failed:', e); 
     } 
   }, 500); 
 } 
