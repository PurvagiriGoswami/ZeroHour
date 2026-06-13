import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useStore'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'

export default function Header({ onNav, onMenuClick, isCollapsed, onToggleCollapse }) {
  const syncStatus = useAppStore(s => s.syncStatus)
  const user = auth.currentUser

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  // IST clock
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const dateStr = time.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: '2-digit', month: 'short' })
  const timeStr = time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })

  const syncConfig = {
    ok:      { color: 'var(--green)', label: 'CONNECTED',    pulse: false },
    syncing: { color: 'var(--amber)', label: 'SYNCING...',  pulse: true  },
    err:     { color: 'var(--red)',   label: 'OFFLINE',     pulse: false },
  }
  const sc = syncConfig[syncStatus] || syncConfig.syncing

  return (
    <header className="hdr fade-in" role="banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Contextual Toggle Button */}
        <button
          className="hdr-menu-toggle"
          onClick={() => {
            if (window.innerWidth <= 1024) {
              onMenuClick();
            } else {
              onToggleCollapse();
            }
          }}
          aria-label="Toggle navigation"
          style={{ 
            width: 40, height: 40, borderRadius: 10, border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        {/* Brand */}
        <div className="hdr-brand" onClick={() => onNav('hq')} style={{ cursor: 'pointer' }}>
          <div className="hdr-text">
            <div className="hdr-title" style={{ fontSize: 20, letterSpacing: -1, fontWeight: 800 }}>ZeroHour</div>
            <div className="hdr-sub" style={{ fontSize: 8, letterSpacing: 2, color: 'var(--text4)', marginTop: 0 }}>STRATEGIC ACADEMY</div>
          </div>
        </div>
      </div>

      {/* Right Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="hide-mob" style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{timeStr}</div>
          <div style={{ fontSize: 9, color: 'var(--text4)', letterSpacing: 1 }}>{dateStr.toUpperCase()}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid var(--border)' }}>
          <div style={{ 
            width: 6, height: 6, borderRadius: '50%', 
            background: sc.color, 
            animation: sc.pulse ? 'pulse 2s infinite' : 'none'
          }} />
          <span style={{ fontSize: 9, fontWeight: 800, color: sc.color, letterSpacing: 1 }}>{sc.label}</span>
        </div>

        <button 
          onClick={handleSignOut}
          className="btn"
          style={{ 
            height: 32, fontSize: 9, padding: '0 12px', borderColor: 'var(--border)', 
            color: 'var(--text4)', background: 'transparent'
          }}
        >
          LOGOUT
        </button>
      </div>

      <style>{`
        .hdr {
          height: 64px;
          padding: 0 24px;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .hdr-menu-toggle:hover {
          border-color: var(--green) !important;
          color: var(--green);
          background: rgba(34, 197, 94, 0.05) !important;
        }
        @media (max-width: 768px) {
          .hdr { padding: 0 16px; height: 56px; }
          .hide-mob { display: none; }
        }
      `}</style>
    </header>
  )
}
