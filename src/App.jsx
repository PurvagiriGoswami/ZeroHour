import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import { useAuth } from './context/AuthContext'
import { useAppStore } from './store/useStore'
import { SideMenu } from './components/Nav'
import Header from './components/Header'
import Skeleton from './components/Skeleton'
import ErrorBoundary from './components/ErrorBoundary'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'

// Lazy loaded pages (New Unified System)
const HQDashboard = lazy(() => import('./pages/HQDashboard'));
const SessionLog = lazy(() => import('./pages/SessionLog'));
const Pomodoro = lazy(() => import('./pages/Pomodoro'));
const RevisionQueue = lazy(() => import('./pages/RevisionQueue'));
const MockTestLog = lazy(() => import('./pages/MockTestLog'));
const TopicMap = lazy(() => import('./pages/TopicMap'));
const WeeklySitrep = lazy(() => import('./pages/WeeklySitrep'));
const Analytics = lazy(() => import('./pages/Analytics'));
const DailyTargets = lazy(() => import('./pages/DailyTargets'));
const Features = lazy(() => import('./pages/Features'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const WeeklyPlanner = lazy(() => import('./pages/WeeklyPlanner'));

const PAGES = {
  hq:        HQDashboard,
  log:       SessionLog,
  pomo:      Pomodoro,
  queue:     RevisionQueue,
  mocks_new: MockTestLog,
  topics:    TopicMap,
  sitrep:    WeeklySitrep,
  analytics: Analytics,
  targets:   DailyTargets,
  features:  Features,
  settings:  Settings,
  profile:   Profile,
  weekly_planner: WeeklyPlanner,
}

const map = {
  '1': 'hq', '2': 'log', '3': 'pomo', '4': 'queue', '5': 'mocks_new',
  '6': 'topics', '7': 'sitrep', '8': 'analytics', '9': 'targets', '0': 'profile'
}

export default function App() {
  const { user } = useAuth()
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
  const [tab, setTab] = useState('hq')
  const [showWeeklyPlanner, setShowWeeklyPlanner] = useState(false)

  // Trigger Weekly Planner on Sunday
  useEffect(() => {
    const today = new Date();
    const isSunday = today.getDay() === 0;
    const lastPlanDate = localStorage.getItem('zh_last_plan_date');
    const todayStr = today.toISOString().split('T')[0];

    if (isSunday && lastPlanDate !== todayStr) {
      setShowWeeklyPlanner(true);
    }
  }, []);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Firebase Init
  useEffect(() => {
    initFirebase()
      .then(() => {
        setIsInitialLoad(false)
      })
      .catch((err) => {
        console.error('Firebase init failed:', err)
        setIsInitialLoad(false) // Still allow app to load
      })
  }, [initFirebase])

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (map[e.key]) setTab(map[e.key])
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const Page = PAGES[tab] || HQDashboard

  if (isInitialLoad || !hasHydrated) return <Skeleton type="full" />
  if (!user) return <Login />
  if (showOnboarding) return <Onboarding onComplete={() => setShowOnboarding(false)} />
  if (showWeeklyPlanner) return (
    <Suspense fallback={<Skeleton type="page" />}>
      <WeeklyPlanner onConfirm={() => {
        setShowWeeklyPlanner(false);
        localStorage.setItem('zh_last_plan_date', new Date().toISOString().split('T')[0]);
      }} />
    </Suspense>
  );

  return (
    <div className={`app-shell ${isMenuCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
      <SideMenu 
        active={tab} 
        onNav={setTab} 
        isOpen={isMenuOpen}
        isCollapsed={isMenuCollapsed}
        onClose={() => setIsMenuOpen(false)}
      />
      
      <main className="app-body">
        <Header 
          onNav={setTab}
          syncStatus={syncStatus}
          onMenuClick={() => setIsMenuOpen(true)}
          isCollapsed={isMenuCollapsed}
          onToggleCollapse={() => setIsMenuCollapsed(!isMenuCollapsed)}
        />
        
        <div className="page-content">
          <ErrorBoundary>
            <Suspense fallback={<Skeleton type="page" />}>
              <Page onNav={setTab} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
