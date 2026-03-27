import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import { useStore } from './store'
import { useAppStore } from './store/useStore'
import { useAuth } from './context/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import Login from './pages/Login'
import Header from './components/Header'
import Footer from './components/Footer'
import { SideMenu } from './components/Nav'

const Dashboard = lazy(() => import('./pages/Dashboard'));
const DailyLog  = lazy(() => import('./pages/DailyLog'));
const Habits    = lazy(() => import('./pages/Habits'));
const Syllabus  = lazy(() => import('./pages/Syllabus'));
const Mocks     = lazy(() => import('./pages/Mocks'));
const PYQLog    = lazy(() => import('./pages/PYQLog'));
const Revision  = lazy(() => import('./pages/Revision'));
const Vocab     = lazy(() => import('./pages/Vocab'));
const Quiz      = lazy(() => import('./pages/Quiz'));
const Planner   = lazy(() => import('./pages/Planner'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings  = lazy(() => import('./pages/Settings'));
const Profile   = lazy(() => import('./pages/Profile'));
const Simulator = lazy(() => import('./pages/Simulator'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

import { TABS } from './data'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

const ZeroHourLoader = ({ fullScreen = false }) => (
  <div style={{
    position: fullScreen ? 'fixed' : 'relative',
    inset: fullScreen ? 0 : 'auto',
    zIndex: fullScreen ? 9999 : 1,
    height: fullScreen ? '100vh' : 'auto', 
    width: fullScreen ? '100vw' : '100%', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: fullScreen ? '0' : '100px 0', 
    color: 'var(--indigo)',
    background: fullScreen ? '#0d1117' : 'transparent',
    gap: 24,
    animation: fullScreen ? 'fadeIn 0.5s ease-out' : 'none'
  }}>
    <div style={{ position: 'relative', width: fullScreen ? 240 : 60, height: fullScreen ? 240 : 60 }}>
      <img src="/assets/branding/ZeroHour_Main_logo.svg"
        onError={e => { e.target.src = '/assets/branding/logo-1024-transparent.png' }}
        alt="ZeroHour"
        style={{ width: '100%', height: '100%', objectFit: 'contain',
          filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.5))', 
          zIndex: 2,
       }} />
    </div>
    <div className="pulsing" style={{ 
      fontWeight: '800', 
      letterSpacing: fullScreen ? '3px' : '2px', 
      fontSize: fullScreen ? '13px' : '11px',
      textTransform: 'uppercase',
      color: 'var(--indigo)'
    }}>
      {fullScreen ? 'LOADING MISSION...' : 'INITIALIZING...'}
    </div>
  </div>
);

const PAGES = {
  dash:      Dashboard,
  daily:     DailyLog,
  habits:    Habits,
  syl:       Syllabus,
  mocks:     Mocks,
  pyq:       PYQLog,
  rev:       Revision,
  vocab:     Vocab,
  quiz:      Quiz,
  planner:   Planner,
  analytics: Analytics,
  settings:  Settings,
  profile:   Profile,
  simulator: Simulator,
}

export default function App() {
  const { user } = useAuth()
  const { state } = useStore()
  const initFirebase = useAppStore(s => s.initFirebase)
  const syncStatus = useAppStore(s => s.syncStatus)
  const hasHydrated = useAppStore(s => s.hasHydrated)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 1024 : false
  )
  const [tab, setTab] = useState('dash')
  const touchStart = useRef({x:0,y:0})
  const scrollRef = useRef(null)

  const navigate = useCallback((id)=>{ 
    setTab(id); 
    if(scrollRef.current) scrollRef.current.scrollTop=0 
    setIsMenuOpen(false) // Close mobile menu on navigation
  },[])

  const handleMenuToggle = useCallback(() => {
    if (isMobile) {
      setIsMenuOpen(prev => !prev)
    } else {
      setIsMenuCollapsed(prev => !prev)
    }
  }, [isMobile])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 1024)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Initialization & Sync — loading screen shows for a minimum fixed duration
  useEffect(() => {
    console.log('App: useEffect for initFirebase triggered');

    const MIN_DISPLAY = 750 // ms — loading screen always shows at least this long
    const start = Date.now()

    const done = async () => {
      console.log('App: done called, elapsed:', Date.now() - start);
      
      // Check onboarding status for authenticated users
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid, 'meta', 'onboardingComplete'))
          if (!snap.exists()) {
            setShowOnboarding(true)
          }
        } catch (e) {
          console.error('Onboarding check failed:', e)
        }
      }

      const elapsed = Date.now() - start
      const remaining = Math.max(0, MIN_DISPLAY - elapsed)
      setTimeout(() => {
        console.log('App: setting isInitialLoad to false');
        setIsInitialLoad(false);
      }, remaining)
    }

    if (initFirebase) {
      console.log('App: calling initFirebase');
      initFirebase().then(() => {
        console.log('App: initFirebase promise resolved');
        done();
      }).catch(err => {
        console.error('App: initFirebase failure:', err)
        done()
      })
    } else {
      console.log('App: initFirebase is missing');
      done()
    }
  }, [initFirebase, user]); // Added user to dependency array

  // Keyboard shortcuts — guarded against input fields and contentEditable
  useEffect(()=>{
    const onKey = e => {
      const t = e.target
      if(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT') return
      if(t.isContentEditable) return
      const map={'1':'dash','2':'daily','3':'habits','4':'syl','5':'mocks','6':'pyq','7':'rev','8':'vocab','9':'quiz','0':'planner','p':'profile','e':'simulator'}
      if(map[e.key]){ navigate(map[e.key]); e.preventDefault() }
    }
    window.addEventListener('keydown', onKey)
    return ()=>window.removeEventListener('keydown', onKey)
  },[navigate])

  const { settings = {} } = state || {}

  useEffect(() => {
    if (settings.fontSize) {
      document.documentElement.setAttribute('data-font-size', settings.fontSize)
    }
  }, [settings.fontSize])

  if (user === undefined || isInitialLoad || !hasHydrated) {
    return <ZeroHourLoader fullScreen />
  }

  if (user === null) {
    return <Login />
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />
  }

  // Error boundary fallback UI if something is missing
  if (!state) {
    return (
      <div style={{background:'#0f172a', color:'#f8fafc', height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, textAlign:'center'}}>
        <h1 style={{fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize:32, marginBottom:20}}>SYSTEM ERROR</h1>
        <p style={{color:'#94a3b8', marginBottom:30}}>Unable to access local data store. Please wipe cache and restart.</p>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{padding:'12px 24px', background:'#ef4444', border:'none', borderRadius:12, color:'white', fontWeight:'bold', cursor:'pointer'}}>RESET & RESTART</button>
      </div>
    )
  }

  // Apply Preferences
  const fontMap = { small: '14px', medium: '16px', large: '18px' }
  const accent = settings.accentColor || '#58a6ff' // GitHub Blue
  const theme = settings.theme || 'dark'
  
  const themeStyles = {
    dark: { 
      bg: '#0d1117', 
      text: '#e6edf3', 
      border: '#30363d',
      bg2: '#161b22',
      bg3: '#21262d',
      bg4: '#30363d',
      text3: '#8b949e',
      text4: '#6e7681'
    },
    light: { 
      bg: '#ffffff', 
      text: '#1f2328', 
      border: '#d0d7de',
      bg2: '#f6f8fa',
      bg3: '#ffffff',
      bg4: '#f6f8fa',
      text3: '#656d76',
      text4: '#8c959f'
    },
    cyber: { 
      bg: '#000000', 
      text: '#39ff14', 
      border: 'rgba(57,255,20,0.2)',
      bg2: '#0a0a0a',
      bg3: '#111111',
      bg4: '#1a1a1a',
      text3: 'rgba(57,255,20,0.7)',
      text4: 'rgba(57,255,20,0.5)'
    }
  }
  
  const currentTheme = themeStyles[theme] || themeStyles.dark

  const globalStyles = {
    '--indigo': accent,
    '--green': theme === 'cyber' ? '#39ff14' : '#3fb950',
    '--base-font-size': fontMap[settings.fontSize] || '16px',
    '--bg': currentTheme.bg,
    '--bg2': currentTheme.bg2,
    '--bg3': currentTheme.bg3,
    '--bg4': currentTheme.bg4,
    '--text': currentTheme.text,
    '--text3': currentTheme.text3,
    '--text4': currentTheme.text4,
    '--border': currentTheme.border,
    backgroundColor: currentTheme.bg,
    color: currentTheme.text
  }

  // Swipe navigation — vertical threshold lock prevents conflict with scroll
  const onTouchStart = e=>{ touchStart.current={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY} }
  const onTouchEnd = e=>{
    const dx=e.changedTouches[0].clientX-touchStart.current.x
    const dy=e.changedTouches[0].clientY-touchStart.current.y
    // Only trigger horizontal swipe if horizontal movement dominates AND vertical is small
    if(Math.abs(dx)>65 && Math.abs(dx)>Math.abs(dy)*2.5 && Math.abs(dy)<40){
      const idx=TABS.findIndex(t=>t.id===tab)
      if(dx<0&&idx<TABS.length-1) navigate(TABS[idx+1].id)
      else if(dx>0&&idx>0)        navigate(TABS[idx-1].id)
    }
  }

  const PageComponent = PAGES[tab] || Dashboard

  return (
    <ErrorBoundary>
      <div className="app-shell" style={globalStyles}>
        {/* Main Header */}
        <Header 
          onNav={navigate} 
          onMenuToggle={handleMenuToggle} 
          isMenuOpen={isMobile ? isMenuOpen : false} 
        />

        <div className={`app-body ${isMenuCollapsed ? 'menu-collapsed' : ''}`}>
          <SideMenu 
            active={tab} 
            onNav={navigate} 
            isOpen={isMenuOpen}
            isCollapsed={isMenuCollapsed}
            onClose={() => setIsMenuOpen(false)}
          />

          <div ref={scrollRef} className="page-content"
            onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <Suspense fallback={<ZeroHourLoader />}>
              <PageComponent onNav={navigate} key={tab}/>
            </Suspense>
            
            {/* Premium Professional Footer */}
            <Footer onNav={navigate} />
          </div>
        </div>

      </div>
    </ErrorBoundary>
  )
}
