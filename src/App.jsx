import { useState, useCallback, useRef, useEffect } from 'react'
import { useStore } from './store'
import Header from './components/Header'
import { SidebarNav, MobileNav } from './components/Nav'
import Dashboard  from './pages/Dashboard'
import DailyLog   from './pages/DailyLog'
import Habits     from './pages/Habits'
import Syllabus   from './pages/Syllabus'
import Mocks      from './pages/Mocks'
import PYQLog     from './pages/PYQLog'
import Errors     from './pages/Errors'
import Revision   from './pages/Revision'
import Pomodoro   from './pages/Pomodoro'
import Vocab      from './pages/Vocab'
import Formulas   from './pages/Formulas'
import Calculator from './pages/Calculator'
import Settings   from './pages/Settings'
import { TABS } from './data'

const PAGES = {
  dash:     Dashboard,
  daily:    DailyLog,
  habits:   Habits,
  syl:      Syllabus,
  mocks:    Mocks,
  pyq:      PYQLog,
  errors:   Errors,
  rev:      Revision,
  pomo:     Pomodoro,
  vocab:    Vocab,
  formulas: Formulas,
  calc:     Calculator,
  settings: Settings,
}

export default function App() {
  const { state, act } = useStore()
  const [tab, setTab] = useState('dash')
  const touchStart = useRef({x:0,y:0})
  const scrollRef = useRef(null)

  const navigate = useCallback((id)=>{ setTab(id); if(scrollRef.current) scrollRef.current.scrollTop=0 },[])

  // Keyboard shortcuts
  useEffect(()=>{
    const onKey = e => {
      if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT') return
      const map={'1':'dash','2':'daily','3':'habits','4':'syl','5':'mocks','6':'pyq','7':'errors','8':'rev','9':'pomo','0':'vocab'}
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

  return (
    <div className="app-shell">
      <Header/>
      <div className="app-body">
        {/* Sidebar nav — hidden on mobile via CSS */}
        <div className="hide-mob">
          <SidebarNav active={tab} onNav={navigate}/>
        </div>

        <div ref={scrollRef} className="page-content"
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <PageComponent onNav={navigate} key={tab}/>
        </div>
      </div>

      {/* Mobile nav — hidden on desktop/tablet via CSS */}
      <div className="hide-desk">
        <MobileNav active={tab} onNav={navigate}/>
      </div>
    </div>
  )
}
