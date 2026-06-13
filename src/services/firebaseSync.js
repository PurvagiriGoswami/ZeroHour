import { setDoc, doc } from 'firebase/firestore'; 
 import { db } from '../firebase'; 

 let timer = null; 

 /**
  * Helper function to safely convert nested arrays to a structure Firestore supports.
  * Firestore allows arrays, but arrays cannot contain other arrays directly.
  * Converts arrays of arrays to objects with index keys.
  */
 function sanitizeForFirestore(data) {
   if (data === null || data === undefined) {
     return data;
   }

   if (Array.isArray(data)) {
     return data.map(item => sanitizeForFirestore(item));
   }

   if (typeof data === 'object') {
     const result = {};
     for (const key in data) {
       if (Object.prototype.hasOwnProperty.call(data, key)) {
         const value = data[key];
         if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0])) {
           // If value is an array of arrays, convert it to an object with numeric keys
           const obj = {};
           value.forEach((item, index) => {
             obj[index] = sanitizeForFirestore(item);
           });
           result[key] = obj;
         } else {
           result[key] = sanitizeForFirestore(value);
         }
       }
     }
     return result;
   }

   return data;
 }

 /**
  * Helper function to convert back from Firestore sanitized data to original structure
  */
 export function unsanitizeFromFirestore(data) {
   if (data === null || data === undefined) {
     return data;
   }

   if (Array.isArray(data)) {
     return data.map(item => unsanitizeFromFirestore(item));
   }

   if (typeof data === 'object') {
     // Check if this object is an array of arrays converted to object with numeric keys
     const keys = Object.keys(data);
     const isNumericKeys = keys.every(key => !isNaN(parseInt(key)));
     if (isNumericKeys && keys.length > 0) {
       const arr = [];
       for (let i = 0; i < keys.length; i++) {
         arr[i] = unsanitizeFromFirestore(data[i]);
       }
       return arr;
     }

     const result = {};
     for (const key in data) {
       if (Object.prototype.hasOwnProperty.call(data, key)) {
         result[key] = unsanitizeFromFirestore(data[key]);
       }
     }
     return result;
   }

   return data;
 }

 export function scheduleSyncToFirestore(uid, state) { 
   if (!uid || !db) return;
   clearTimeout(timer); 
   timer = setTimeout(async () => { 
     try { 
       await setDoc(doc(db, 'users', uid, 'userData', 'main'), {
         ...sanitizeForFirestore(state),
         _ts: Date.now()
       }, { merge: true }); 
     } catch (e) { 
       console.error('[ZeroHour] Firestore sync failed:', e); 
     } 
   }, 500); 
 } 
