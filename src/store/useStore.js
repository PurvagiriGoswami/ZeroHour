import { create } from 'zustand'
import { db, auth } from '../firebase'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { scheduleSyncToFirestore } from '../services/firebaseSync'

// ── LocalStorage helpers ──
const sg = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb } catch { return fb } }
const ss = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

// ── Zustand Store ──
export const useAppStore = create((set, get) => ({
  // ── Auth State ──
  uid: null,
  
  // ── Unified Tactical Data (zh_ prefix) ──
  zh_sessions: sg('zh_sessions', []),
  zh_topicMap: sg('zh_topicMap', {}),
  zh_mocks: sg('zh_mocks', []),
  zh_weeklyChecks: sg('zh_weeklyChecks', []),
  zh_pomodoro_today: sg('zh_pomodoro_today', 0),
  zh_last_pomo_date: sg('zh_last_pomo_date', null),
  zh_errors: sg('zh_errors', []),
  zh_doubts: sg('zh_doubts', []),
  zh_feynman: sg('zh_feynman', []),
  zh_radar: sg('zh_radar', {
    'Maths': 5, 'English': 5, 'History': 5, 'Polity': 5, 'Science': 5,
    'Geography': 5, 'Economics': 5, 'Defence GK': 5, 'Reasoning': 5
  }),
  zh_xp: sg('zh_xp', 0),
  zh_milestones: sg('zh_milestones', []),
  zh_weeklyJournals: sg('zh_weeklyJournals', {}),
  zh_intentions: sg('zh_intentions', {}),
  zh_flashcards: sg('zh_flashcards', []),
  
  // ── Supporting Data ──
  quizResults: sg('quizResults', []),
  plannerTasks: sg('plannerTasks', []),

  profile: sg('zh_profile', {
    name: 'Aspirant',
    tagline: 'Ready for Battle',
    targetExam: 'CDS',
    rank: 'Recruit',
    xp: 0
  }),

  settings: sg('zh_settings', {
    name: 'Aspirant',
    targetExam: 'CDS',
    dailyStudyGoal: 6,
    afcatDate: '',
    targetIMA: 160,
    targetAFA: 175,
    targetAFCAT: 170,
    fontSize: 'medium',
    accentColor: '#22c55e',
    examDates: { cds1: '2026-04-12', afcat: '', cds2: '2026-09-13', cds2027: '2027-04-11' },
    dailyPomoTarget: 8,
    offDays: ['Sunday'],
    cdsCutoff: 160,
    subjectTargets: { 'Mathematics': 30, 'English': 35, 'GS': 35 }
  }),

  streak: sg('zh_streak', {
    current: 0,
    longest: 0,
    lastLoggedDate: ''
  }),

  pomodoro: sg('zh_pomodoro', {
    date: '',
    completed: 0,
    target: 8
  }),

  sitrep: sg('zh_sitrep', {}),
  
  syncStatus: 'syncing',
  hasHydrated: false,
  _unsub: null,

  // ── Actions ──
  setSessions: (zh_sessions) => { set({ zh_sessions }); ss('zh_sessions', zh_sessions); get()._scheduleSync() },
  setTopicMap: (zh_topicMap) => { set({ zh_topicMap }); ss('zh_topicMap', zh_topicMap); get()._scheduleSync() },
  setZhMocks: (zh_mocks) => { set({ zh_mocks }); ss('zh_mocks', zh_mocks); get()._scheduleSync() },
  setWeeklyChecks: (zh_weeklyChecks) => { set({ zh_weeklyChecks }); ss('zh_weeklyChecks', zh_weeklyChecks); get()._scheduleSync() },
  setQuizResults: (quizResults) => { set({ quizResults }); ss('quizResults', quizResults); get()._scheduleSync() },
  setPlannerTasks: (plannerTasks) => { set({ plannerTasks }); ss('plannerTasks', plannerTasks); get()._scheduleSync() },
  
  setErrors: (zh_errors) => { set({ zh_errors }); ss('zh_errors', zh_errors); get()._scheduleSync() },
  setDoubts: (zh_doubts) => { set({ zh_doubts }); ss('zh_doubts', zh_doubts); get()._scheduleSync() },
  setFeynman: (zh_feynman) => { set({ zh_feynman }); ss('zh_feynman', zh_feynman); get()._scheduleSync() },
  setRadar: (zh_radar) => { set({ zh_radar }); ss('zh_radar', zh_radar); get()._scheduleSync() },
  setXP: (val) => { 
    const xp = typeof val === 'function' ? val(get().zh_xp) : val;
    set({ zh_xp: xp }); ss('zh_xp', xp); get()._scheduleSync() 
  },
  setMilestones: (zh_milestones) => { set({ zh_milestones }); ss('zh_milestones', zh_milestones); get()._scheduleSync() },
  setWeeklyJournals: (zh_weeklyJournals) => { set({ zh_weeklyJournals }); ss('zh_weeklyJournals', zh_weeklyJournals); get()._scheduleSync() },
  setIntentions: (zh_intentions) => { set({ zh_intentions }); ss('zh_intentions', zh_intentions); get()._scheduleSync() },
  setFlashcards: (zh_flashcards) => { set({ zh_flashcards }); ss('zh_flashcards', zh_flashcards); get()._scheduleSync() },

  setProfile: (updates) => {
    const profile = { ...get().profile, ...updates }
    set({ profile }); ss('zh_profile', profile); get()._scheduleSync()
  },

  setStreak: (updates) => {
    const streak = { ...get().streak, ...updates }
    set({ streak }); ss('zh_streak', streak); get()._scheduleSync()
  },

  setPomodoro: (updates) => {
    const pomodoro = { ...get().pomodoro, ...updates }
    set({ pomodoro }); ss('zh_pomodoro', pomodoro); get()._scheduleSync()
  },

  setSitrep: (sitrep) => { set({ sitrep }); ss('zh_sitrep', sitrep); get()._scheduleSync() },

  setPomoToday: (count) => { 
    const today = new Date().toISOString().split('T')[0]
    set({ zh_pomodoro_today: count, zh_last_pomo_date: today })
    ss('zh_pomodoro_today', count)
    ss('zh_last_pomo_date', today)
    // Update structured pomo too
    get().setPomodoro({ date: today, completed: count })
    get()._scheduleSync()
  },

  setSettings: (updates) => {
    const current = get().settings
    const settings = { ...current, ...updates }
    set({ settings })
    ss('zh_settings', settings)
    get()._scheduleSync()
  },

  // ── Firebase Sync ──
  _scheduleSync: () => {
    const uid = get().uid
    if (!uid) return
    
    set({ syncStatus: 'syncing' })
    ss('_localTs', Date.now())
    const s = get()
    const stateToSync = {
      zh_sessions: s.zh_sessions,
      zh_topicMap: s.zh_topicMap,
      zh_mocks: s.zh_mocks,
      zh_weeklyChecks: s.zh_weeklyChecks,
      zh_pomodoro_today: s.zh_pomodoro_today,
      zh_last_pomo_date: s.zh_last_pomo_date,
      zh_errors: s.zh_errors,
      zh_doubts: s.zh_doubts,
      zh_feynman: s.zh_feynman,
      zh_radar: s.zh_radar,
      zh_xp: s.zh_xp,
      zh_milestones: s.zh_milestones,
      zh_weeklyJournals: s.zh_weeklyJournals,
      zh_intentions: s.zh_intentions,
      zh_flashcards: s.zh_flashcards,
      quizResults: s.quizResults,
      plannerTasks: s.plannerTasks,
      settings: s.settings,
      profile: s.profile,
      streak: s.streak,
      pomodoro: s.pomodoro,
      sitrep: s.sitrep
    }
    
    scheduleSyncToFirestore(uid, stateToSync)
    set({ syncStatus: 'ok' })
  },

  initFirebase: () => {
    return new Promise((resolve) => {
      if (!auth) {
        set({ uid: null, syncStatus: 'ok', hasHydrated: true })
        resolve(() => {}) // Return dummy unsubscribe
        return
      }

      let resolved = false
      const unsubAuth = onAuthStateChanged(auth, async (user) => {
        const currentUnsub = get()._unsub
        if (typeof currentUnsub === 'function') {
          currentUnsub()
          set({ _unsub: null })
        }

        if (user && db) {
          const uid = user.uid
          set({ uid, syncStatus: 'syncing' })
          
          try {
            const snap = await getDoc(doc(db, 'users', uid, 'userData', 'main'))
            if (snap.exists()) {
              const data = snap.data()
              const localTs = sg('_localTs', 0)
              const remoteTs = data._ts || 0
              if (remoteTs > localTs) {
                get()._applyData(data)
              }
            }
            set({ syncStatus: 'ok', hasHydrated: true })
          } catch (e) {
            set({ syncStatus: 'err', hasHydrated: true })
          }

          const unsubSnap = onSnapshot(doc(db, 'users', uid, 'userData', 'main'), snap => {
            if (snap.exists()) {
              const data = snap.data()
              const localTs = sg('_localTs', 0)
              const remoteTs = data._ts || 0
              if (remoteTs > localTs) {
                get()._applyData(data)
              }
            }
            set({ syncStatus: 'ok' })
          })
          set({ _unsub: unsubSnap })
        } else {
          get()._clearLocalData()
          set({ uid: null, syncStatus: 'ok', hasHydrated: true, _unsub: null })
        }

        if (!resolved) {
          resolved = true
          resolve(unsubAuth)
        }
      })
    })
  },

  _applyData: (data) => {
    if (data.zh_sessions) { set({ zh_sessions: data.zh_sessions }); ss('zh_sessions', data.zh_sessions) }
    if (data.zh_topicMap) { set({ zh_topicMap: data.zh_topicMap }); ss('zh_topicMap', data.zh_topicMap) }
    if (data.zh_mocks) { set({ zh_mocks: data.zh_mocks }); ss('zh_mocks', data.zh_mocks) }
    if (data.zh_weeklyChecks) { set({ zh_weeklyChecks: data.zh_weeklyChecks }); ss('zh_weeklyChecks', data.zh_weeklyChecks) }
    if (data.zh_pomodoro_today !== undefined) { set({ zh_pomodoro_today: data.zh_pomodoro_today }); ss('zh_pomodoro_today', data.zh_pomodoro_today) }
    if (data.zh_last_pomo_date) { set({ zh_last_pomo_date: data.zh_last_pomo_date }); ss('zh_last_pomo_date', data.zh_last_pomo_date) }
    if (data.zh_errors) { set({ zh_errors: data.zh_errors }); ss('zh_errors', data.zh_errors) }
    if (data.zh_doubts) { set({ zh_doubts: data.zh_doubts }); ss('zh_doubts', data.zh_doubts) }
    if (data.zh_feynman) { set({ zh_feynman: data.zh_feynman }); ss('zh_feynman', data.zh_feynman) }
    if (data.zh_radar) { set({ zh_radar: data.zh_radar }); ss('zh_radar', data.zh_radar) }
    if (data.zh_xp !== undefined) { set({ zh_xp: data.zh_xp }); ss('zh_xp', data.zh_xp) }
    if (data.zh_milestones) { set({ zh_milestones: data.zh_milestones }); ss('zh_milestones', data.zh_milestones) }
    if (data.zh_weeklyJournals) { set({ zh_weeklyJournals: data.zh_weeklyJournals }); ss('zh_weeklyJournals', data.zh_weeklyJournals) }
    if (data.zh_intentions) { set({ zh_intentions: data.zh_intentions }); ss('zh_intentions', data.zh_intentions) }
    if (data.zh_flashcards) { set({ zh_flashcards: data.zh_flashcards }); ss('zh_flashcards', data.zh_flashcards) }
    if (data.quizResults) { set({ quizResults: data.quizResults }); ss('quizResults', data.quizResults) }
    if (data.plannerTasks) { set({ plannerTasks: data.plannerTasks }); ss('plannerTasks', data.plannerTasks) }
    
    if (data.profile) { set({ profile: data.profile }); ss('zh_profile', data.profile) }
    if (data.streak) { set({ streak: data.streak }); ss('zh_streak', data.streak) }
    if (data.pomodoro) { set({ pomodoro: data.pomodoro }); ss('zh_pomodoro', data.pomodoro) }
    if (data.sitrep) { set({ sitrep: data.sitrep }); ss('zh_sitrep', data.sitrep) }

    if (data.settings) {
      const current = get().settings
      const merged = { ...current, ...data.settings }
      set({ settings: merged }); ss('zh_settings', merged)
    }
  },

  _clearLocalData: () => {
    set({
      zh_sessions: [], zh_topicMap: {}, zh_mocks: [],
      zh_weeklyChecks: [], zh_pomodoro_today: 0, zh_last_pomo_date: null,
      quizResults: [], plannerTasks: [],
      profile: { name: 'Aspirant', tagline: 'Ready for Battle', targetExam: 'CDS' },
      streak: { current: 0, longest: 0, lastLoggedDate: '' },
      pomodoro: { date: '', completed: 0, target: 8 },
      sitrep: {},
      settings: {
        name: 'Aspirant',
        targetExam: 'CDS',
        dailyStudyGoal: 6,
        afcatDate: '',
        targetIMA: 160,
        targetAFA: 175,
        targetAFCAT: 170,
        fontSize: 'medium',
        accentColor: '#22c55e',
        examDates: { cds1: '2026-04-12', afcat: '', cds2: '2026-09-13', cds2027: '2027-04-11' },
        dailyPomoTarget: 8,
        offDays: ['Sunday'],
        cdsCutoff: 160,
        subjectTargets: { 'Mathematics': 30, 'English': 35, 'GS': 35 }
      }
    })
    localStorage.clear()
  },

  clearAllData: () => {
    set({
      zh_sessions: [], zh_topicMap: {}, zh_mocks: [],
      zh_weeklyChecks: [], zh_pomodoro_today: 0, zh_last_pomo_date: null,
      quizResults: [], plannerTasks: [],
    })
    ss('zh_sessions', []); ss('zh_topicMap', {}); ss('zh_mocks', [])
    ss('zh_weeklyChecks', []); ss('zh_pomodoro_today', 0)
    ss('quizResults', []); ss('plannerTasks', [])
    get()._scheduleSync()
  },
}))
