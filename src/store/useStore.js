import { create } from 'zustand'
import { db, auth } from '../firebase'
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { makeSyl } from '../data'
import { DEFAULT_CYCLES } from '../utils/spacedRepetition'
import { INITIAL_VOCAB } from '../utils/initialVocab'

// ── LocalStorage helpers ──
const sg = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb } catch { return fb } }
const ss = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

// ── Zustand Store ──
export const useAppStore = create((set, get) => ({
  // ── Auth State ──
  uid: null,
  
  // ── Data State ──
  syl: sg('syl4', makeSyl()),
  mocks: sg('mocks4', []),
  logs: sg('logs4', []),
  habs: sg('habs4', []),
  revision: sg('rev4', []),
  vocab: sg('vocab4', INITIAL_VOCAB),
  pyqlog: sg('pyqlog4', []),
  pomoSessions: sg('pomoSessions4', []),
  quizResults: sg('quizResults', []),
  plannerTasks: sg('plannerTasks', []),
  revisionCycles: sg('revisionCycles', DEFAULT_CYCLES),
  settings: sg('settings4', {
    name: 'Aspirant',
    targetExam: 'CDS',
    dailyStudyGoal: 6,
    afcatDate: '',
    targetIMA: 160,
    targetAFA: 175,
    targetAFCAT: 170,
    fontSize: 'medium',
    accentColor: '#39ff14',
    questionsPerQuiz: 10,
    quizDifficulty: 'mixed',
    quizFrequency: 7,
  }),
  syncStatus: 'syncing',
  hasHydrated: false,

  // ── Actions ──
  setSyl: (syl) => { set({ syl }); ss('syl4', syl); get()._scheduleSync() },
  setMocks: (mocks) => { set({ mocks }); ss('mocks4', mocks); get()._scheduleSync() },
  setLogs: (logs) => { set({ logs }); ss('logs4', logs); get()._scheduleSync() },
  setHabs: (habs) => { set({ habs }); ss('habs4', habs); get()._scheduleSync() },
  setRevision: (revision) => { set({ revision }); ss('rev4', revision); get()._scheduleSync() },
  setVocab: (vocab) => { set({ vocab }); ss('vocab4', vocab); get()._scheduleSync() },
  setPyqlog: (pyqlog) => { set({ pyqlog }); ss('pyqlog4', pyqlog); get()._scheduleSync() },
  setPomoSessions: (pomoSessions) => { set({ pomoSessions }); ss('pomoSessions4', pomoSessions); get()._scheduleSync() },
  setQuizResults: (quizResults) => { set({ quizResults }); ss('quizResults', quizResults); get()._scheduleSync() },
  setPlannerTasks: (plannerTasks) => { set({ plannerTasks }); ss('plannerTasks', plannerTasks); get()._scheduleSync() },
  setRevisionCycles: (revisionCycles) => { set({ revisionCycles }); ss('revisionCycles', revisionCycles); get()._scheduleSync() },
  setSettings: (updates) => {
    const current = get().settings
    const settings = { ...current, ...updates }
    set({ settings })
    ss('settings4', settings)
    get()._scheduleSync()
  },

  // ── Firebase Sync ──
  _syncTimer: null,
  _unsub: null,
  _scheduleSync: () => {
    const uid = get().uid
    if (!uid || !db) return

    const timer = get()._syncTimer
    if (timer) clearTimeout(timer)
    const newTimer = setTimeout(async () => {
      set({ syncStatus: 'syncing' })
      ss('_localTs', Date.now())
      const s = get()
      try {
        await setDoc(doc(db, 'users', uid, 'userData', 'main'), {
          syl: s.syl, mocks: s.mocks, logs: s.logs,
          habs: s.habs, revision: s.revision,
          vocab: s.vocab, pyqlog: s.pyqlog, pomoSessions: s.pomoSessions,
          quizResults: s.quizResults, plannerTasks: s.plannerTasks,
          revisionCycles: s.revisionCycles,
          settings: s.settings,
          _ts: Date.now()
        })
        set({ syncStatus: 'ok' })
      } catch (e) {
        console.warn('FB push error:', e)
        set({ syncStatus: 'err' })
      }
    }, 1200)
    set({ _syncTimer: newTimer })
  },

  initFirebase: () => {
    console.log('useAppStore: initFirebase called');
    return new Promise((resolve) => {
      let resolved = false
      const unsubAuth = onAuthStateChanged(auth, async (user) => {
        console.log('useAppStore: onAuthStateChanged', user?.uid);
        
        // 1. CLEAR PREVIOUS SNAPSHOT LISTENER IMMEDIATELY
        const currentUnsub = get()._unsub
        if (typeof currentUnsub === 'function') {
          console.log('useAppStore: clearing old unsub');
          currentUnsub()
          set({ _unsub: null })
        }

        if (user && db) {
          const uid = user.uid
          set({ uid, syncStatus: 'syncing' })
          
          // Initial Pull
          try {
            console.log('useAppStore: fetching data for', uid);
            const snap = await getDoc(doc(db, 'users', uid, 'userData', 'main'))
            if (snap.exists()) {
              console.log('useAppStore: snap exists, applying data');
              const data = snap.data()
              const localTs = sg('_localTs', 0)
              const remoteTs = data._ts || 0
              if (remoteTs > localTs) {
                get()._applyData(data)
              }
            } else {
              console.log('useAppStore: no remote data found');
            }
            set({ syncStatus: 'ok', hasHydrated: true })
          } catch (e) {
            console.warn('Firebase pull:', e)
            set({ syncStatus: 'err', hasHydrated: true })
          }

          // Real-time listener
          const unsubSnap = onSnapshot(doc(db, 'users', uid, 'userData', 'main'), snap => {
            console.log('useAppStore: onSnapshot fired');
            if (snap.exists()) {
              const data = snap.data()
              const localTs = sg('_localTs', 0)
              const remoteTs = data._ts || 0
              if (remoteTs > localTs) {
                get()._applyData(data)
              }
            }
            set({ syncStatus: 'ok' })
          }, (error) => {
            console.error('Firestore snapshot error:', error);
            set({ syncStatus: 'err' });
          })
          set({ _unsub: unsubSnap })
        } else if (user && !db) {
          console.warn('useAppStore: user logged in but db is null');
          set({ uid: user.uid, syncStatus: 'err', hasHydrated: true })
        } else {
          console.log('useAppStore: user is null, clearing local data');
          // User signed out
          get()._clearLocalData()
          set({ uid: null, syncStatus: 'ok', hasHydrated: true, _unsub: null })
        }

        if (!resolved) {
          console.log('useAppStore: resolving initFirebase promise');
          resolved = true
          resolve(unsubAuth)
        }
      })
    })
  },

  _applyData: (data) => {
    if (data.syl?.length) { set({ syl: data.syl }); ss('syl4', data.syl) }
    if (data.mocks) { set({ mocks: data.mocks }); ss('mocks4', data.mocks) }
    if (data.logs) { set({ logs: data.logs }); ss('logs4', data.logs) }
    if (data.habs) { set({ habs: data.habs }); ss('habs4', data.habs) }
    if (data.revision) { set({ revision: data.revision }); ss('rev4', data.revision) }
    if (data.vocab) { set({ vocab: data.vocab }); ss('vocab4', data.vocab) }
    if (data.pyqlog) { set({ pyqlog: data.pyqlog }); ss('pyqlog4', data.pyqlog) }
    if (data.pomoSessions) { set({ pomoSessions: data.pomoSessions }); ss('pomoSessions4', data.pomoSessions) }
    if (data.quizResults) { set({ quizResults: data.quizResults }); ss('quizResults', data.quizResults) }
    if (data.plannerTasks) { set({ plannerTasks: data.plannerTasks }); ss('plannerTasks', data.plannerTasks) }
    if (data.revisionCycles) { set({ revisionCycles: data.revisionCycles }); ss('revisionCycles', data.revisionCycles) }
    if (data.settings) {
      const current = get().settings
      const merged = { ...current, ...data.settings }
      set({ settings: merged }); ss('settings4', merged)
    }
  },

  _clearLocalData: () => {
    set({
      syl: makeSyl(), mocks: [], logs: [], habs: [],
      revision: [], vocab: INITIAL_VOCAB, pyqlog: [], pomoSessions: [],
      quizResults: [], plannerTasks: [], revisionCycles: DEFAULT_CYCLES,
      settings: {
        name: 'Aspirant',
        targetExam: 'CDS',
        dailyStudyGoal: 6,
        afcatDate: '',
        targetIMA: 160,
        targetAFA: 175,
        targetAFCAT: 170,
        fontSize: 'medium',
        accentColor: '#39ff14',
        questionsPerQuiz: 10,
        quizDifficulty: 'mixed',
        quizFrequency: 7,
      }
    })
    localStorage.clear() // Clear all local storage on sign out
  },

  // ── Reset Actions ──
  clearAllData: () => {
    set({
      syl: makeSyl(), mocks: [], logs: [], habs: [],
      revision: [], vocab: INITIAL_VOCAB, pyqlog: [], pomoSessions: [],
      quizResults: [], plannerTasks: [], revisionCycles: DEFAULT_CYCLES,
    })
    ss('syl4', makeSyl()); ss('mocks4', []); ss('logs4', []); ss('habs4', [])
    ss('rev4', []); ss('vocab4', INITIAL_VOCAB); ss('pyqlog4', []); ss('pomoSessions4', [])
    ss('quizResults', []); ss('plannerTasks', []); ss('revisionCycles', DEFAULT_CYCLES)
    get()._scheduleSync()
  },
  clearVocab: () => { set({ vocab: INITIAL_VOCAB }); ss('vocab4', INITIAL_VOCAB); get()._scheduleSync() },
  resetSyl: () => { const s = makeSyl(); set({ syl: s }); ss('syl4', s); get()._scheduleSync() },
}))

// ── Backward compatibility wrapper ──
// This hook wraps Zustand for components still using the old { state, act } pattern
export function useStore() {
  const store = useAppStore()
  // Build a compatible `state` object with fallbacks to prevent crashes
  const state = {
    syl: store.syl || [],
    mocks: store.mocks || [],
    logs: store.logs || [],
    habs: store.habs || [],
    revision: store.revision || [],
    vocab: store.vocab || [],
    pyqlog: store.pyqlog || [],
    pomoSessions: store.pomoSessions || [],
    quizResults: store.quizResults || [],
    plannerTasks: store.plannerTasks || [],
    revisionCycles: store.revisionCycles || DEFAULT_CYCLES,
    settings: store.settings || {
      name: 'Aspirant',
      targetExam: 'CDS',
      dailyStudyGoal: 6,
      afcatDate: '',
      targetIMA: 160,
      targetAFA: 175,
      targetAFCAT: 170,
      fontSize: 'medium',
      accentColor: '#39ff14',
      questionsPerQuiz: 10,
      quizDifficulty: 'mixed',
      quizFrequency: 7,
    },
    syncStatus: store.syncStatus,
    hasHydrated: store.hasHydrated,
  }

  // Compatible `act` dispatcher
  const act = (action) => {
    switch (action.type) {
      case 'SET_SYL': store.setSyl(action.syl); break
      case 'SET_MOCKS': store.setMocks(action.mocks); break
      case 'SET_LOGS': store.setLogs(action.logs); break
      case 'SET_HABS': store.setHabs(action.habs); break
      case 'SET_REVISION': store.setRevision(action.revision); break
      case 'SET_VOCAB': store.setVocab(action.vocab); break
      case 'SET_PYQLOG': store.setPyqlog(action.pyqlog); break
      case 'SET_POMO_SESSIONS': store.setPomoSessions(action.pomoSessions); break
      case 'SET_SETTINGS': store.setSettings(action.settings); break
      default: console.warn('Unknown action:', action.type)
    }
  }

  return { state, act }
}
