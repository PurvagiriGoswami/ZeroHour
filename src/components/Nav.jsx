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
    <div style={{
      position:'fixed',bottom:0,left:0,right:0,
      background:'var(--bg2)',
      borderTop:'1px solid var(--border)',
      zIndex:100,
      paddingBottom:'var(--safe-bottom)',
    }}>
      <div style={{
        display:'flex',overflowX:'auto',
        scrollbarWidth:'none',
        WebkitOverflowScrolling:'touch',
        height:'var(--mob-h)',
      }}>
        {mobileTabs.map(t=>(
          <button key={t.id} onClick={()=>onNav(t.id)} style={{
            flex:1,minWidth:50,maxWidth:76,
            padding:'6px 4px 8px',
            border:'none',background:'transparent',
            cursor:'pointer',textAlign:'center',
            fontFamily:"'Share Tech Mono',monospace",
            fontSize:15,
            color:active===t.id?'var(--green)':'var(--text4)',
            letterSpacing:'.5px',
            transition:'all .15s',
            display:'flex',flexDirection:'column',
            alignItems:'center',gap:2,
            WebkitTapHighlightColor:'transparent',
          }}>
            <span style={{
              fontSize:18,lineHeight:1,
              filter:active===t.id?'drop-shadow(0 0 5px var(--green))':'none',
              transform:active===t.id?'scale(1.1)':'scale(1)',
              transition:'transform .15s',
            }}>{t.icon}</span>
            <span>{t.short}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
