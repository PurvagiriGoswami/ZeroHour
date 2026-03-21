import { useState, useCallback, useRef, useEffect } from 'react'
import { useStore } from './store'
import { useAppStore } from './store/useStore'
import Header from './components/Header'
import { SidebarNav, MobileNav } from './components/Nav'
import Dashboard  from './pages/Dashboard'
import DailyLog   from './pages/DailyLog'
import Habits     from './pages/Habits'
import Syllabus   from './pages/Syllabus'
import Mocks      from './pages/Mocks'
import PYQLog     from './pages/PYQLog'
import Revision   from './pages/Revision'
import Pomodoro   from './pages/Pomodoro'
import Vocab      from './pages/Vocab'
import Quiz       from './pages/Quiz'
import Planner    from './pages/Planner'
import Analytics  from './pages/Analytics'
import Settings   from './pages/Settings'
import { TABS } from './data'

const PAGES = {
  dash:      Dashboard,
  daily:     DailyLog,
  habits:    Habits,
  syl:       Syllabus,
  mocks:     Mocks,
  pyq:       PYQLog,
  rev:       Revision,
  pomo:      Pomodoro,
  vocab:     Vocab,
  quiz:      Quiz,
  planner:   Planner,
  analytics: Analytics,
  settings:  Settings,
}

export default function App() {
  const { state } = useStore()
  const { settings = {} } = state || {}
  const initFirebase = useAppStore(s => s.initFirebase)
  const syncStatus = useAppStore(s => s.syncStatus)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [tab, setTab] = useState('dash')
  const touchStart = useRef({x:0,y:0})
  const scrollRef = useRef(null)

  // Apply Preferences
  const fontMap = { small: '14px', medium: '16px', large: '18px' }
  const globalStyles = {
    '--green': (settings && settings.accentColor) || '#00ffc3',
    '--base-font-size': (settings && fontMap[settings.fontSize]) || '16px',
    backgroundColor: (settings && settings.theme === 'light') ? '#ffffff' : '#0f172a',
    color: (settings && settings.theme === 'light') ? '#000000' : '#f8fafc'
  }

  // Initialization & Sync
  useEffect(() => {
    console.log('ZeroHour: Booting systems...');
    
    // Absolute fallback to ensure UI is never blocked indefinitely
    const fallbackTimer = setTimeout(() => {
      setIsInitialLoad(current => {
        if (current) console.warn('ZeroHour: Init taking too long, forcing UI load.');
        return false;
      });
    }, 4500);

    if (initFirebase) {
      initFirebase()
        .then(() => {
          console.log('ZeroHour: Firebase sync nominal.');
          setTimeout(() => setIsInitialLoad(false), 600);
        })
        .catch(err => {
          console.error('ZeroHour: Init failure:', err);
          setIsInitialLoad(false);
        });
    }

    return () => clearTimeout(fallbackTimer);
  }, [initFirebase]);

  const navigate = useCallback((id)=>{ 
    setTab(id); 
    if(scrollRef.current) scrollRef.current.scrollTop=0 
  },[])

  // Keyboard shortcuts
  useEffect(()=>{
    const onKey = e => {
      if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT') return
      const map={'1':'dash','2':'daily','3':'habits','4':'syl','5':'mocks','6':'pyq','7':'rev','8':'pomo','9':'vocab','0':'quiz'}
      if(map[e.key]){ navigate(map[e.key]); e.preventDefault() }
    }
    window.addEventListener('keydown', onKey)
    return ()=>window.removeEventListener('keydown', onKey)
  },[navigate])

  // Swipe navigation
  const onTouchStart = e=>{ touchStart.current={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY} }
  const onTouchEnd = e=>{
    const dx=e.changedTouches[0].clientX-touchStart.current.x
    const dy=e.changedTouches[0].clientY-touchStart.current.y
    if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*2){
      const idx=TABS.findIndex(t=>t.id===tab)
      if(dx<0&&idx<TABS.length-1) navigate(TABS[idx+1].id)
      else if(dx>0&&idx>0)        navigate(TABS[idx-1].id)
    }
  }

  const PageComponent = PAGES[tab] || Dashboard

  // Error boundary fallback UI if something is missing
  if (!state) {
    return (
      <div style={{background:'#0f172a', color:'#ffb600', height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, textAlign:'center'}}>
        <h1 style={{fontFamily:"'Share Tech Mono', monospace", fontSize:42, marginBottom:20}}>CORE SYSTEM FAILURE</h1>
        <p style={{color:'#94a3b8', marginBottom:30}}>Unable to access local data store. Please wipe cache and restart.</p>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{padding:'12px 24px', background:'#f43f5e', border:'none', borderRadius:8, color:'white', fontWeight:'bold', cursor:'pointer'}}>WIPE SYSTEM CACHE & REBOOT</button>
      </div>
    )
  }

  return (
    <div className="app-shell" style={globalStyles}>
      {/* Premium Loading Screen */}
      {isInitialLoad && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'var(--bg)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 20,
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <img src="/assets/branding/ZeroHour_Main_logo.svg" alt="ZeroHour" style={{
            height: 140, marginBottom: 20, width:'auto',
            filter: 'drop-shadow(0 0 30px rgba(255,182,0,0.6))',
            animation: 'pulse 2s infinite'
          }} />
          <div style={{
            fontSize: 12, color: 'var(--text4)', letterSpacing: 2,
            textTransform: 'uppercase', opacity: 0.8
          }}>
            Initializing your preparation system...
          </div>
          <div style={{
            width: 200, height: 2, background: 'var(--bg2)',
            borderRadius: 1, overflow: 'hidden', marginTop: 10
          }}>
            <div style={{
              width: '100%', height: '100%', background: 'var(--gold)',
              boxShadow: '0 0 10px var(--gold)',
              animation: 'scanline 1.5s infinite linear'
            }} />
          </div>
        </div>
      )}

      <Header onNav={navigate}/>
      <div className="app-body">
        {/* Sidebar nav — hidden on mobile via CSS */}
        <div className="hide-mob">
          <SidebarNav 
            active={tab} 
            onNav={navigate} 
            isCollapsed={isSidebarCollapsed} 
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        <div ref={scrollRef} className="page-content"
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <PageComponent onNav={navigate} key={tab}/>
          
          {/* Beautified Professional Footer */}
          <footer className="glass" style={{
            padding: '60px 40px', borderTop: '1px solid rgba(255,182,0,0.1)',
            marginTop: 60, background: 'rgba(15, 23, 42, 0.6)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div className="footer-grid">
              <div style={{textAlign: 'left'}}>
                <div style={{fontFamily: "'Share Tech Mono', monospace", color: 'var(--gold)', fontSize: 20, marginBottom: 12, letterSpacing: 2}}>ZEROHOUR / 2026</div>
                <div style={{fontSize: 12, color: 'var(--text3)', maxWidth: 280, lineHeight: 1.6}}>
                  Advanced AI-Powered Defence Preparation System. 
                  Built to ensure performance at the decisive moment.
                </div>
              </div>

              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: 13, color: 'var(--text4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1}}>Command & Control</div>
                <div style={{fontSize: 12, color: 'var(--text3)', marginBottom: 4}}>Designed & Developed by</div>
                <div className="text-glow" style={{fontFamily: "'Share Tech Mono', monospace", color: 'var(--text2)', fontSize: 16, fontWeight: 'bold'}}>INFERNO</div>
                <div style={{fontSize: 10, color: 'var(--text5)', marginTop: 12}}>© ALL RIGHTS RESERVED</div>
              </div>

              <div style={{textAlign: 'right'}}>
                <div style={{fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: 'var(--text5)', letterSpacing: 1, marginBottom: 10}}>SYSTEM_MANIFEST_V1.0</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                  <div style={{fontSize: 11, color: 'var(--text4)'}}>BUILD: <span style={{color: 'var(--gold)'}}>PROD-ENG-2026</span></div>
                  <div style={{fontSize: 11, color: 'var(--text4)'}}>ENGINE: <span style={{color: 'var(--cyan)'}}>ZERO-GEN-X</span></div>
                  <div style={{fontSize: 11, color: 'var(--text4)'}}>STATUS: <span style={{color: 'var(--gold)'}}>NOMINAL</span></div>
                </div>
              </div>
            </div>
            
            {/* Decorative line */}
            <div style={{
              position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1,
              background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
              opacity: 0.3
            }} />
          </footer>
        </div>
      </div>

      {/* Mobile nav — hidden on desktop/tablet via CSS */}
      <div className="hide-desk">
        <MobileNav active={tab} onNav={navigate}/>
      </div>

      {/* Subtle Watermark */}
      <div style={{
        position: 'fixed', bottom: 80, right: 20,
        fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
        color: 'var(--gold)', opacity: 0.1, pointerEvents: 'none',
        zIndex: 100, letterSpacing: 2
      }}>
        ZEROHOUR
      </div>
    </div>
  )
}
