import { TABS, MOB_TAB_ORDER } from '../data'

export function SidebarNav({ active, onNav, isCollapsed, onToggle }) {
  return (
    <nav className={`sidebar-nav glass ${isCollapsed ? 'collapsed' : ''}`} style={{borderRight:'1px solid rgba(0,255,195,0.1)'}}>
      <div className="sidebar-header-text" style={{
        padding: '12px 16px',
        fontSize: 9,
        color: 'var(--text5)',
        letterSpacing: 2,
        fontFamily: "'Share Tech Mono', monospace",
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        marginBottom: 8,
        textTransform: 'uppercase'
      }}>
        Operations Control
      </div>
      <div style={{flex: 1, overflowY: 'auto', scrollbarWidth: 'none'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>onNav(t.id)}
            className={`sidebar-item${active===t.id?' active':''}`}>
            <span className="sidebar-icon">{t.icon}</span>
            {!isCollapsed && <span className="sidebar-label">{t.label.split(' ').slice(1).join(' ')}</span>}
            <span className="sidebar-short">{t.short}</span>
          </button>
        ))}
      </div>
      
      {/* Toggle Button */}
      <button 
        onClick={onToggle}
        style={{
          width: '100%', padding: '16px', border: 'none', background: 'rgba(0,0,0,0.2)',
          cursor: 'pointer', color: 'var(--text3)', display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end',
          borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s'
        }}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--green)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text3)'}
      >
        <span style={{fontSize: 18, transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s'}}>
          ◀
        </span>
      </button>
    </nav>
  )
}

export function MobileNav({ active, onNav }) {
  const mobileTabs = MOB_TAB_ORDER.map(id=>TABS.find(t=>t.id===id)).filter(Boolean)
  return (
    <div className="glass" style={{
      position:'fixed',bottom:0,left:0,right:0,
      borderTop:'1px solid rgba(0,255,195,0.15)',
      zIndex:100,
      paddingBottom:'var(--safe-bottom)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.4)'
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
            fontSize:11,
            color:active===t.id?'var(--green)':'var(--text4)',
            letterSpacing:'.5px',
            transition:'all .2s cubic-bezier(0.4, 0, 0.2, 1)',
            display:'flex',flexDirection:'column',
            alignItems:'center',gap:4,
            WebkitTapHighlightColor:'transparent',
            position: 'relative'
          }}>
            {active === t.id && (
              <div style={{
                position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, 
                background: 'var(--green)', boxShadow: '0 0 10px var(--green)',
                borderRadius: '0 0 2px 2px'
              }} />
            )}
            <span style={{
              fontSize:20,lineHeight:1,
              filter:active===t.id?'drop-shadow(0 0 8px var(--green))':'none',
              transform:active===t.id?'scale(1.15)':'scale(1)',
              transition:'all .2s',
              opacity: active===t.id?1:0.7
            }}>{t.icon}</span>
            <span style={{fontSize: 9, opacity: active===t.id?1:0.6}}>{t.short}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
