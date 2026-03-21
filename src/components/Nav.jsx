import { TABS, MOB_TAB_ORDER } from '../data'

export function SidebarNav({ active, onNav }) {
  return (
    <nav className="sidebar-nav">
      {TABS.map(t=>(
        <button key={t.id} onClick={()=>onNav(t.id)}
          className={`sidebar-item${active===t.id?' active':''}`}>
          <span className="sidebar-icon">{t.icon}</span>
          <span className="sidebar-label">{t.label.split(' ').slice(1).join(' ')}</span>
          <span className="sidebar-short">{t.short}</span>
        </button>
      ))}
    </nav>
  )
}

export function MobileNav({ active, onNav }) {
  const mobileTabs = MOB_TAB_ORDER.map(id=>TABS.find(t=>t.id===id)).filter(Boolean)
  return (
    <div className="mob-nav-bar">
      <div className="mob-nav-scroll">
        {mobileTabs.map(t=>{
          const isActive = active === t.id
          return (
            <button
              key={t.id}
              onClick={()=>onNav(t.id)}
              className={`mob-nav-item${isActive?' mob-nav-active':''}`}
            >
              <span className="mob-nav-icon">{t.icon}</span>
              <span className="mob-nav-label">{t.short}</span>
              {isActive && <span className="mob-nav-dot"/>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
