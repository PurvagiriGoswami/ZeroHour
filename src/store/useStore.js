import { create } from 'zustand'
import { db, auth } from '../firebase'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { scheduleSyncToFirestore, unsanitizeFromFirestore } from '../services/firebaseSync'
import { DEFAULT_EXAM_LIST, DEFAULT_CDS_TIMETABLE, DEFAULT_CDS_SYLLABUS } from '../data'
import { computeDerived } from '../utils/derivedState'
import { generateId, getCurrentTime, minutesBetween } from '../utils/helpers'
import { getISOWeek, getTodayISO } from '../utils/dateUtils'

// ── LocalStorage helpers ──
const sg = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb } catch { return fb } }
const ss = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { } }
// List of all app-owned localStorage keys for safe deletion
const APP_LOCAL_STORAGE_KEYS = [
  'zh_sessions', 'zh_topicMap', 'zh_mocks', 'zh_weeklyChecks',
  'zh_pomodoro_today', 'zh_last_pomo_date', 'zh_errors', 'zh_doubts',
  'zh_feynman', 'zh_radar', 'zh_xp', 'zh_milestones', 'zh_weeklyJournals',
  'zh_intentions', 'zh_flashcards', 'zh_targets', 'zh_dailySummaries',
  'zh_exam_registrations', 'zh_notifications', 'zh_weeklyTimetable',
  'zh_dailyChecklist', 'zh_sessionLogs', 'zh_examList',
  'quizResults', 'plannerTasks', 'zh_profile', 'zh_settings', 'zh_streak',
  'zh_pomodoro', 'zh_sitrep', 'exams', 'weeklyPlan', 'weeklyPlanOverrides',
  'dailyTargets', 'sessionLog', 'habits', '_localTs'
];
const clearAppLocalStorage = () => {
  APP_LOCAL_STORAGE_KEYS.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('[ZeroHour] Failed to remove localStorage key:', key, e);
    }
  });
};

// ── Default Exams ──
const defaultExams = [
  { id: 'afcat1_2026', label: 'AFCAT 1 2026', date: '2026-08-08', subjects: ['GK', 'English', 'Reasoning', 'Maths'] },
  { id: 'cds2_2026', label: 'CDS II 2026', date: '2026-09-13', subjects: ['Maths', 'English', 'GK'] },
  { id: 'cds1_2027', label: 'CDS I 2027', date: '2027-02-08', subjects: ['Maths', 'English', 'GK'] },
]

// ── Zustand Store ──
export const useAppStore = create((set, get) => {
  // Helper to migrate weekly timetable from array to object
  const migrateWeeklyTimetable = (raw) => {
    if (!raw) return DEFAULT_CDS_TIMETABLE;
    // If dailySlots is an array, convert to object
    if (Array.isArray(raw.dailySlots)) {
      console.log('[ZeroHour] Migrating weekly timetable from array to object');
      return {
        ...DEFAULT_CDS_TIMETABLE,
        ...raw,
        dailySlots: DEFAULT_CDS_TIMETABLE.dailySlots
      };
    }
    return raw;
  };
  
  // Initial state
  const initialState = {
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
    zh_targets: sg('zh_targets', []),
    zh_dailySummaries: sg('zh_dailySummaries', []),
    zh_exam_registrations: sg('zh_exam_registrations', []),
    zh_notifications: sg('zh_notifications', {
      enabled: true,
      frequency_auto_reduce: true,
      morning_briefing: { enabled: true, time: '07:00' },
      eod_reminder: { enabled: true, time: '21:30' },
      topic_neglect: true,
      exam_proximity: true,
      rollover_streak: true,
      completion_positive: true
    }),
    
    // ── Weekly Planner & Exam Slices ──
    zh_weeklyTimetable: migrateWeeklyTimetable(sg('zh_weeklyTimetable', null)),
    zh_dailyChecklist: sg('zh_dailyChecklist', {}),
    zh_sessionLogs: sg('zh_sessionLogs', []),
    zh_examList: sg('zh_examList', DEFAULT_EXAM_LIST),
    
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
      maxStudyHours: 8,
      eodReviewTime: '22:00',
      morningReminderTime: '08:00',
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
    
    // ── New V5 State ──
    exams: sg('exams', defaultExams),
    weeklyPlan: sg('weeklyPlan', {
      Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
    }),
    weeklyPlanOverrides: sg('weeklyPlanOverrides', {}),
    dailyTargets: sg('dailyTargets', {}),
    sessionLog: sg('sessionLog', {}),
    habits: sg('habits', {}),
    // Derived state (not persisted)
    derived_todayCompletion: 0,
    derived_subjectTimeToday: {},
    derived_weeklyHours: [],
    derived_examCountdowns: [],
    derived_analytics: {},
    derived_streak: 0,
    
    syncStatus: 'syncing',
    hasHydrated: false,
    _unsub: null,
  }

  // Helper to persist and compute derived
  const persistAndCompute = (partial) => set((state) => {
    // Support both object patches and function updaters
    const patch = typeof partial === 'function' ? partial(state) : partial
    const newState = { ...state, ...patch }
    const computedState = computeDerived(newState)
    // Persist all persisted keys
    const keysToPersist = [
      'zh_sessions', 'zh_topicMap', 'zh_mocks', 'zh_weeklyChecks', 'zh_pomodoro_today',
      'zh_last_pomo_date', 'zh_errors', 'zh_doubts', 'zh_feynman', 'zh_radar', 'zh_xp',
      'zh_milestones', 'zh_weeklyJournals', 'zh_intentions', 'zh_flashcards', 'zh_targets',
      'zh_dailySummaries', 'zh_exam_registrations', 'zh_notifications', 'zh_weeklyTimetable',
      'zh_dailyChecklist', 'zh_sessionLogs', 'zh_examList', 'quizResults', 'plannerTasks',
      'profile', 'settings', 'streak', 'pomodoro', 'sitrep',
      'exams', 'weeklyPlan', 'weeklyPlanOverrides', 'dailyTargets', 'sessionLog', 'habits'
    ]
    keysToPersist.forEach(key => ss(key, computedState[key]))
    // Schedule sync if we have uid and are hydrated
    if (computedState.uid && computedState.hasHydrated) {
      get()._scheduleSync()
    }
    return computedState
  })

  return {
    ...initialState,

    // ── New V5 Actions ──
    addWeeklyTarget: (day, targetData) => persistAndCompute((state) => {
      const item = { id: generateId(), order: (state.weeklyPlan[day]?.length ?? 0), ...targetData }
      return { weeklyPlan: { ...state.weeklyPlan, [day]: [...(state.weeklyPlan[day] ?? []), item] } }
    }),

    editWeeklyTarget: (day, itemId, updates) => persistAndCompute((state) => {
      const dayPlan = [...(state.weeklyPlan[day] ?? [])]
      const idx = dayPlan.findIndex(x => x.id === itemId)
      if (idx !== undefined && idx >= 0) {
        dayPlan[idx] = { ...dayPlan[idx], ...updates }
        return { weeklyPlan: { ...state.weeklyPlan, [day]: dayPlan } }
      }
      return state
    }),

    removeWeeklyTarget: (day, itemId) => persistAndCompute((state) => {
      return { weeklyPlan: { ...state.weeklyPlan, [day]: (state.weeklyPlan[day] ?? []).filter(x => x.id !== itemId) } }
    }),

    overrideWeeklyTopic: (isoDate, planItemId, topic) => persistAndCompute((state) => {
      const weekNum = getISOWeek(isoDate)
      const key = `${isoDate.slice(0, 4)}-W${weekNum}:${planItemId}`
      return { weeklyPlanOverrides: { ...state.weeklyPlanOverrides, [key]: topic } }
    }),

    addAdHocTarget: (date, targetData) => persistAndCompute((state) => {
      const newTarget = {
        id: generateId(),
        weeklyPlanItemId: null,
        date,
        status: 'pending',
        sessionLogId: null,
        completedMinutes: 0,
        adHoc: true,
        ...targetData
      }
      return { dailyTargets: { ...state.dailyTargets, [date]: [...(state.dailyTargets[date] ?? []), newTarget] } }
    }),

    updateDailyTargetStatus: (date, targetId, status) => persistAndCompute((state) => {
      const targets = [...(state.dailyTargets[date] ?? [])]
      const targetIdx = targets.findIndex(t => t.id === targetId)
      if (targetIdx === -1) return state
      const target = { ...targets[targetIdx] }
      target.status = status

      if (status === 'in_progress' && !target.sessionLogId) {
        const sessionId = generateId()
        target.sessionLogId = sessionId
        const newSession = {
          id: sessionId,
          date,
          dailyTargetId: targetId,
          subject: target.subject,
          topic: target.topic,
          startTime: getCurrentTime(),
          endTime: null,
          actualMinutes: 0,
          questionsAttempted: 0,
          questionsCorrect: 0,
          notes: '',
          mood: 3,
          autoCreated: true,
        }
        targets[targetIdx] = target
        return {
          dailyTargets: { ...state.dailyTargets, [date]: targets },
          sessionLog: { ...state.sessionLog, [date]: [...(state.sessionLog[date] ?? []), newSession] }
        }
      }

      if (status === 'done') {
        const sessions = [...(state.sessionLog[date] ?? [])]
        const sessionIdx = sessions.findIndex(s => s.id === target.sessionLogId)
        if (sessionIdx !== -1 && !sessions[sessionIdx].endTime) {
          sessions[sessionIdx] = { ...sessions[sessionIdx], endTime: getCurrentTime() }
          const computed = minutesBetween(sessions[sessionIdx].startTime, sessions[sessionIdx].endTime)
          sessions[sessionIdx].actualMinutes = computed > 0 ? computed : target.targetMinutes
          target.completedMinutes = sessions[sessionIdx].actualMinutes
          targets[targetIdx] = target
          return {
            dailyTargets: { ...state.dailyTargets, [date]: targets },
            sessionLog: { ...state.sessionLog, [date]: sessions }
          }
        }
      }

      targets[targetIdx] = target
      return { dailyTargets: { ...state.dailyTargets, [date]: targets } }
    }),

    updateSessionLog: (date, sessionId, updates) => persistAndCompute((state) => {
      const sessions = [...(state.sessionLog[date] ?? [])]
      const sessionIdx = sessions.findIndex(s => s.id === sessionId)
      if (sessionIdx === -1) return state
      
      let newSession = { ...sessions[sessionIdx], ...updates }
      
      if (updates.startTime || updates.endTime) {
        if (newSession.startTime && newSession.endTime) {
          newSession.actualMinutes = minutesBetween(newSession.startTime, newSession.endTime)
        }
      }
      
      sessions[sessionIdx] = newSession
      const newState = { sessionLog: { ...state.sessionLog, [date]: sessions } }
      
      if (newSession.dailyTargetId) {
        const targets = [...(state.dailyTargets[date] ?? [])]
        const targetIdx = targets.findIndex(t => t.id === newSession.dailyTargetId)
        if (targetIdx !== -1) {
          targets[targetIdx] = { ...targets[targetIdx], completedMinutes: newSession.actualMinutes }
          newState.dailyTargets = { ...state.dailyTargets, [date]: targets }
        }
      }
      
      return newState
    }),

    addManualSession: (date, sessionData) => persistAndCompute((state) => {
      const newSession = { id: generateId(), date, dailyTargetId: null, autoCreated: false, ...sessionData }
      return { sessionLog: { ...state.sessionLog, [date]: [...(state.sessionLog[date] ?? []), newSession] } }
    }),

    removeSession: (date, sessionId) => persistAndCompute((state) => {
      return { sessionLog: { ...state.sessionLog, [date]: (state.sessionLog[date] ?? []).filter(s => s.id !== sessionId) } }
    }),

    addExam: (exam) => persistAndCompute((state) => ({ exams: [...state.exams, { id: generateId(), ...exam }] })),
    updateExam: (examId, updates) => persistAndCompute((state) => {
      const idx = state.exams.findIndex(e => e.id === examId)
      if (idx >= 0) {
        const newExams = [...state.exams]
        newExams[idx] = { ...newExams[idx], ...updates }
        return { exams: newExams }
      }
      return state
    }),
    removeExam: (examId) => persistAndCompute((state) => ({ exams: state.exams.filter(e => e.id !== examId) })),
    setExams: (exams) => persistAndCompute({ exams }),

    // ── Existing Actions (updated) ──
    setSessions: (zh_sessions) => persistAndCompute({ zh_sessions }),
    setTopicMap: (zh_topicMap) => persistAndCompute({ zh_topicMap }),
    setZhMocks: (zh_mocks) => persistAndCompute({ zh_mocks }),
    setWeeklyChecks: (zh_weeklyChecks) => persistAndCompute({ zh_weeklyChecks }),
    setQuizResults: (quizResults) => persistAndCompute({ quizResults }),
    setPlannerTasks: (plannerTasks) => persistAndCompute({ plannerTasks }),
    setWeeklyTimetable: (zh_weeklyTimetable) => persistAndCompute({ zh_weeklyTimetable }),
    setDailyChecklist: (zh_dailyChecklist) => persistAndCompute({ zh_dailyChecklist }),
    setSessionLogs: (zh_sessionLogs) => persistAndCompute({ zh_sessionLogs }),
    setExamList: (zh_examList) => persistAndCompute({ zh_examList }),
    
    setErrors: (zh_errors) => persistAndCompute({ zh_errors }),
    setDoubts: (zh_doubts) => persistAndCompute({ zh_doubts }),
    setFeynman: (zh_feynman) => persistAndCompute({ zh_feynman }),
    setRadar: (zh_radar) => persistAndCompute({ zh_radar }),
    setXP: (val) => { 
      const xp = typeof val === 'function' ? val(get().zh_xp) : val;
      persistAndCompute({ zh_xp: xp })
    },
    setMilestones: (zh_milestones) => persistAndCompute({ zh_milestones }),
    setWeeklyJournals: (zh_weeklyJournals) => persistAndCompute({ zh_weeklyJournals }),
    setIntentions: (zh_intentions) => persistAndCompute({ zh_intentions }),
    setFlashcards: (zh_flashcards) => persistAndCompute({ zh_flashcards }),
    setTargets: (zh_targets) => persistAndCompute({ zh_targets }),
    setDailySummaries: (zh_dailySummaries) => persistAndCompute({ zh_dailySummaries }),
    setExamRegistrations: (zh_exam_registrations) => persistAndCompute({ zh_exam_registrations }),
    setNotifications: (updates) => {
      const zh_notifications = { ...get().zh_notifications, ...updates }
      persistAndCompute({ zh_notifications })
    },

    setProfile: (updates) => {
      const profile = { ...get().profile, ...updates }
      persistAndCompute({ profile })
    },

    setStreak: (updates) => {
      const streak = { ...get().streak, ...updates }
      persistAndCompute({ streak })
    },

    setPomodoro: (updates) => {
      const pomodoro = { ...get().pomodoro, ...updates }
      persistAndCompute({ pomodoro })
    },

    setSitrep: (sitrep) => persistAndCompute({ sitrep }),

    setPomoToday: (count) => { 
      const today = getTodayISO()
      persistAndCompute({ 
        zh_pomodoro_today: count, 
        zh_last_pomo_date: today,
        pomodoro: { date: today, completed: count }
      })
    },

    setSettings: (updates) => {
      const current = get().settings
      const settings = { ...current, ...updates }
      persistAndCompute({ settings })
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
        zh_targets: s.zh_targets,
        zh_dailySummaries: s.zh_dailySummaries,
        zh_exam_registrations: s.zh_exam_registrations,
        zh_notifications: s.zh_notifications,
        quizResults: s.quizResults,
        plannerTasks: s.plannerTasks,
        settings: s.settings,
        profile: s.profile,
        streak: s.streak,
        pomodoro: s.pomodoro,
        sitrep: s.sitrep,
        zh_weeklyTimetable: s.zh_weeklyTimetable,
        zh_dailyChecklist: s.zh_dailyChecklist,
        zh_sessionLogs: s.zh_sessionLogs,
        zh_examList: s.zh_examList,
        exams: s.exams,
        weeklyPlan: s.weeklyPlan,
        weeklyPlanOverrides: s.weeklyPlanOverrides,
        dailyTargets: s.dailyTargets,
        sessionLog: s.sessionLog,
        habits: s.habits,
      }
      
      scheduleSyncToFirestore(
        uid, 
        stateToSync,
        () => set({ syncStatus: 'ok' }), // onSuccess
        () => set({ syncStatus: 'err' }) // onError
      )
    },

    initFirebase: () => {
      return new Promise((resolve) => {
        if (!auth) {
          // Initialize derived state
          persistAndCompute({ uid: null, syncStatus: 'ok', hasHydrated: true })
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
              // Compute derived state after hydrating
              persistAndCompute({ syncStatus: 'ok', hasHydrated: true })
            } catch (e) {
              persistAndCompute({ syncStatus: 'err', hasHydrated: true })
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
            persistAndCompute({ uid: null, syncStatus: 'ok', hasHydrated: true, _unsub: null })
          }

          if (!resolved) {
            resolved = true
            resolve(unsubAuth)
          }
        })
      })
    },

    _applyData: (rawData) => {
      const data = unsanitizeFromFirestore(rawData);
      const updates = {}
      
      if (data.zh_sessions) updates.zh_sessions = data.zh_sessions
      if (data.zh_topicMap) updates.zh_topicMap = data.zh_topicMap
      if (data.zh_mocks) updates.zh_mocks = data.zh_mocks
      if (data.zh_weeklyChecks) updates.zh_weeklyChecks = data.zh_weeklyChecks
      if (data.zh_pomodoro_today !== undefined) updates.zh_pomodoro_today = data.zh_pomodoro_today
      if (data.zh_last_pomo_date) updates.zh_last_pomo_date = data.zh_last_pomo_date
      if (data.zh_errors) updates.zh_errors = data.zh_errors
      if (data.zh_doubts) updates.zh_doubts = data.zh_doubts
      if (data.zh_feynman) updates.zh_feynman = data.zh_feynman
      if (data.zh_radar) updates.zh_radar = data.zh_radar
      if (data.zh_xp !== undefined) updates.zh_xp = data.zh_xp
      if (data.zh_milestones) updates.zh_milestones = data.zh_milestones
      if (data.zh_weeklyJournals) updates.zh_weeklyJournals = data.zh_weeklyJournals
      if (data.zh_intentions) updates.zh_intentions = data.zh_intentions
      if (data.zh_flashcards) updates.zh_flashcards = data.zh_flashcards
      if (data.zh_targets) updates.zh_targets = data.zh_targets
      if (data.zh_dailySummaries) updates.zh_dailySummaries = data.zh_dailySummaries
      if (data.zh_exam_registrations) updates.zh_exam_registrations = data.zh_exam_registrations
      if (data.zh_notifications) updates.zh_notifications = data.zh_notifications
      if (data.quizResults) updates.quizResults = data.quizResults
      if (data.plannerTasks) updates.plannerTasks = data.plannerTasks
      if (data.zh_weeklyTimetable) updates.zh_weeklyTimetable = data.zh_weeklyTimetable
      if (data.zh_dailyChecklist) updates.zh_dailyChecklist = data.zh_dailyChecklist
      if (data.zh_sessionLogs) updates.zh_sessionLogs = data.zh_sessionLogs
      if (data.zh_examList) updates.zh_examList = data.zh_examList
      if (data.profile) updates.profile = data.profile
      if (data.streak) updates.streak = data.streak
      if (data.pomodoro) updates.pomodoro = data.pomodoro
      if (data.sitrep) updates.sitrep = data.sitrep
      if (data.exams) updates.exams = data.exams
      if (data.weeklyPlan) updates.weeklyPlan = data.weeklyPlan
      if (data.weeklyPlanOverrides) updates.weeklyPlanOverrides = data.weeklyPlanOverrides
      if (data.dailyTargets) updates.dailyTargets = data.dailyTargets
      if (data.sessionLog) updates.sessionLog = data.sessionLog
      if (data.habits) updates.habits = data.habits

      if (data.settings) {
        const current = get().settings
        updates.settings = { ...current, ...data.settings }
      }

      if (Object.keys(updates).length > 0) {
        persistAndCompute(updates)
      }
    },

    _clearLocalData: () => {
      const clearState = {
        zh_sessions: [], zh_topicMap: {}, zh_mocks: [],
        zh_weeklyChecks: [], zh_pomodoro_today: 0, zh_last_pomo_date: null,
        quizResults: [], plannerTasks: [],
        zh_weeklyTimetable: DEFAULT_CDS_TIMETABLE,
        zh_dailyChecklist: {},
        zh_sessionLogs: [],
        zh_examList: DEFAULT_EXAM_LIST,
        profile: { name: 'Aspirant', tagline: 'Ready for Battle', targetExam: 'CDS' },
        streak: { current: 0, longest: 0, lastLoggedDate: '' },
        pomodoro: { date: '', completed: 0, target: 8 },
        sitrep: {},
        zh_targets: [],
        zh_dailySummaries: [],
        zh_exam_registrations: [],
        zh_notifications: {
          enabled: true,
          frequency_auto_reduce: true,
          morning_briefing: { enabled: true, time: '07:00' },
          eod_reminder: { enabled: true, time: '21:30' },
          topic_neglect: true,
          exam_proximity: true,
          rollover_streak: true,
          completion_positive: true
        },
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
        },
        exams: defaultExams,
        weeklyPlan: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] },
        weeklyPlanOverrides: {},
        dailyTargets: {},
        sessionLog: {},
        habits: {},
      }
      clearAppLocalStorage()
      persistAndCompute(clearState)
    },

    clearAllData: () => {
      const clearData = {
        zh_sessions: [], zh_topicMap: {}, zh_mocks: [],
        zh_weeklyChecks: [], zh_pomodoro_today: 0, zh_last_pomo_date: null,
        quizResults: [], plannerTasks: [],
        zh_weeklyTimetable: null,
        zh_dailyChecklist: {},
        zh_sessionLogs: [],
        zh_examList: DEFAULT_EXAM_LIST,
      }
      persistAndCompute(clearData)
    },
  }
})
