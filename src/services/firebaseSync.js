import { setDoc, doc } from 'firebase/firestore'; 
import { db } from '../firebase'; 

let timer = null; 
const QUEUE_KEY = 'zh_firebase_sync_queue';
let isProcessing = false;

/**
 * Helper function to safely convert nested arrays to a structure Firestore supports.
 * Firestore allows arrays, but arrays cannot contain other arrays directly.
 * Converts arrays of arrays to objects with index keys.
 */
function sanitizeForFirestore(data) {
  if (data === null || data === undefined) {
    return null; // Convert undefined to null for Firestore compatibility
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item));
  }

  if (typeof data === 'object') {
    const result = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        if (value === undefined) {
          continue; // Skip undefined fields entirely
        }
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

/**
 * Queue management functions
 */
function getQueue() {
  try {
    const queue = localStorage.getItem(QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (e) {
    return [];
  }
}

function setQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function addToQueue(uid, state) {
  const queue = getQueue();
  queue.push({
    uid,
    state,
    timestamp: Date.now()
  });
  setQueue(queue);
}

/**
 * Process the queue
 */
async function processQueue() {
  if (isProcessing || !db) return;
  isProcessing = true;
  
  let queue = getQueue();
  while (queue.length > 0) {
    const item = queue.shift();
    try {
      await setDoc(doc(db, 'users', item.uid, 'userData', 'main'), {
        ...sanitizeForFirestore(item.state),
        _ts: item.timestamp
      }, { merge: true });
    } catch (e) {
      // Add back to front of queue and break
      queue.unshift(item);
      setQueue(queue);
      isProcessing = false;
      return;
    }
  }
  setQueue(queue);
  isProcessing = false;
}

/**
 * Start processing queue when app starts
 */
setTimeout(() => {
  processQueue();
}, 1000);

export function scheduleSyncToFirestore(uid, state, onSuccess, onError) { 
  if (!uid || !db) {
    if (uid) {
      addToQueue(uid, state);
    }
    if (typeof onError === 'function') onError(new Error('DB not initialized'));
    return;
  }
  clearTimeout(timer); 
  timer = setTimeout(async () => { 
    try { 
      await setDoc(doc(db, 'users', uid, 'userData', 'main'), {
        ...sanitizeForFirestore(state),
        _ts: Date.now()
      }, { merge: true }); 
      if (typeof onSuccess === 'function') onSuccess();
      // Process any queued items
      processQueue();
    } catch (e) { 
      console.error('[ZeroHour] Firestore sync failed, adding to queue:', e); 
      addToQueue(uid, state);
      if (typeof onError === 'function') onError(e);
    } 
  }, 500); 
} 
