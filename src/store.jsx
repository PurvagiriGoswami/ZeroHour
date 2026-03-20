import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react'
import { pushToFirebase, pullFromFirebase, subscribeToFirebase } from './firebase'
import { makeSyl, DEFAULT_FORMULAS } from './data'

const sg = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb } catch { return fb } }
const ss = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

function loadInitial() {
  return {
    syl:          sg('syl4',          makeSyl()),
    mocks:        sg('mocks4',        []),
    logs:         sg('logs4',         []),
    habs:         sg('habs4',         []),
    errs:         sg('errs4',         []),
    revision:     sg('rev4',          []),
    vocab:        sg('vocab4',        []),
    formulas:     sg('formulas4',     DEFAULT_FORMULAS),
    pyqlog:       sg('pyqlog4',       []),
    pomoSessions: sg('pomoSessions4', []),
    settings:     sg('settings4',     { name:'Purva', afcatDate:'', targetIMA:160, targetAFA:175, targetAFCAT:170 }),
    syncStatus:   'syncing',
  }
}

const DATA_ACTIONS = new Set(['SET_SYL','SET_MOCKS','SET_LOGS','SET_HABS','SET_ERRS',
  'SET_REVISION','SET_VOCAB','SET_FORMULAS','SET_PYQLOG','SET_POMO_SESSIONS','SET_SETTINGS'])

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SYNC':         return { ...state, syncStatus: action.status }
    case 'SET_SYL':          return { ...state, syl:          action.syl }
    case 'SET_MOCKS':        return { ...state, mocks:        action.mocks }
    case 'SET_LOGS':         return { ...state, logs:         action.logs }
    case 'SET_HABS':         return { ...state, habs:         action.habs }
    case 'SET_ERRS':         return { ...state, errs:         action.errs }
    case 'SET_REVISION':     return { ...state, revision:     action.revision }
    case 'SET_VOCAB':        return { ...state, vocab:        action.vocab }
    case 'SET_FORMULAS':     return { ...state, formulas:     action.formulas }
    case 'SET_PYQLOG':       return { ...state, pyqlog:       action.pyqlog }
    case 'SET_POMO_SESSIONS':return { ...state, pomoSessions: action.pomoSessions }
    case 'SET_SETTINGS':     return { ...state, settings: { ...state.settings, ...action.settings } }
    case 'APPLY_REMOTE': {
      const d = action.data
      const localTs = sg('_localTs', 0)
      const remoteTs = d._ts || 0
      if (remoteTs > 0 && remoteTs <= localTs) return { ...state, syncStatus:'ok' }
      return {
        ...state,
        ...(d.syl?.length      ? { syl:          d.syl }          : {}),
        ...(d.mocks            ? { mocks:         d.mocks }        : {}),
        ...(d.logs             ? { logs:          d.logs }         : {}),
        ...(d.habs             ? { habs:          d.habs }         : {}),
        ...(d.errs             ? { errs:          d.errs }         : {}),
        ...(d.revision         ? { revision:      d.revision }     : {}),
        ...(d.vocab            ? { vocab:         d.vocab }        : {}),
        ...(d.formulas?.length ? { formulas:      d.formulas }     : {}),
        ...(d.pyqlog           ? { pyqlog:        d.pyqlog }       : {}),
        ...(d.pomoSessions     ? { pomoSessions:  d.pomoSessions } : {}),
        ...(d.settings         ? { settings: { ...state.settings, ...d.settings } } : {}),
        syncStatus: 'ok',
      }
    }
    default: return state
  }
}

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadInitial)
  const stateRef = useRef(state)
  const syncTimer = useRef(null)

  // Keep ref in sync for use in callbacks
  useEffect(() => { stateRef.current = state }, [state])

  // Persist to localStorage
  useEffect(() => {
    ss('syl4',          state.syl)
    ss('mocks4',        state.mocks)
    ss('logs4',         state.logs)
    ss('habs4',         state.habs)
    ss('errs4',         state.errs)
    ss('rev4',          state.revision)
    ss('vocab4',        state.vocab)
    ss('formulas4',     state.formulas)
    ss('pyqlog4',       state.pyqlog)
    ss('pomoSessions4', state.pomoSessions)
    ss('settings4',     state.settings)
  }, [state.syl, state.mocks, state.logs, state.habs, state.errs,
      state.revision, state.vocab, state.formulas, state.pyqlog,
      state.pomoSessions, state.settings])

  // Firebase pull on mount + real-time listener
  useEffect(() => {
    let unsub = null
    async function init() {
      dispatch({ type:'SET_SYNC', status:'syncing' })
      try {
        const data = await pullFromFirebase()
        if (data) dispatch({ type:'APPLY_REMOTE', data })
        else dispatch({ type:'SET_SYNC', status:'ok' })
        unsub = subscribeToFirebase(data => dispatch({ type:'APPLY_REMOTE', data }))
      } catch(e) {
        console.warn('Firebase init:', e)
        dispatch({ type:'SET_SYNC', status:'err' })
      }
    }
    init()
    return () => { if(unsub) unsub() }
  }, [])

  // Debounced push to Firebase using latest state from ref
  const scheduleSync = useCallback(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(async () => {
      dispatch({ type:'SET_SYNC', status:'syncing' })
      ss('_localTs', Date.now())
      const s = stateRef.current
      const ok = await pushToFirebase({
        syl: s.syl, mocks: s.mocks, logs: s.logs,
        habs: s.habs, errs: s.errs, revision: s.revision,
        vocab: s.vocab, formulas: s.formulas,
        pyqlog: s.pyqlog, pomoSessions: s.pomoSessions,
        settings: s.settings,
      })
      dispatch({ type:'SET_SYNC', status: ok ? 'ok' : 'err' })
    }, 1200)
  }, [])

  // act = dispatch + schedule sync for data mutations
  const act = useCallback((action) => {
    dispatch(action)
    if (DATA_ACTIONS.has(action.type)) scheduleSync()
  }, [scheduleSync])

  return (
    <StoreCtx.Provider value={{ state, act }}>
      {children}
    </StoreCtx.Provider>
  )
}

export const useStore = () => useContext(StoreCtx)
