import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useStore'
import { formatDate } from '../utils/dateUtils'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'

export default function Header({ onNav, onMenuToggle, isMenuOpen }) {
  const syncStatus = useAppStore(s => s.syncStatus)
  const hasHydrated = useAppStore(s => s.hasHydrated)
  const user = auth.currentUser

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  // IST clock — always use Asia/Kolkata timezone
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const dateStr = time.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: '2-digit', month: 'short' })
  const timeStr = time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })

  const syncConfig = {
    ok:      { color: 'var(--green)', label: 'SYNCED',    pulse: false },
    syncing: { color: 'var(--gold)',  label: 'SYNCING…',  pulse: true  },
    err:     { color: 'var(--red)',   label: 'OFFLINE',   pulse: false },
  }
  const sc = syncConfig[syncStatus] || syncConfig.syncing

  return (
    <header className="hdr fade-in" role="banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Top-Left Toggle Button */}
        <button
          className={`hdr-menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={onMenuToggle}
          aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="2" width="6" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="10" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="10" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="10" y1="13" x2="17" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Brand */}
        <div className="hdr-brand"
          onClick={() => onNav('dash')}
          onKeyDown={e => e.key === 'Enter' && onNav('dash')}
          tabIndex="0" role="button" aria-label="Go to Dashboard">
          <div className="hdr-text">
            <div className="hdr-title">ZeroHour</div>
            <div className="hdr-sub">Strategic Academy</div>
          </div>
        </div>
      </div>

      {/* Right: sync status + clock */}
      <div className="hdr-right-info hide-mob" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={handleSignOut}
          className="btn"
          style={{ 
            height: '32px', 
            minHeight: '32px', 
            fontSize: '11px', 
            padding: '0 12px',
            background: 'transparent',
            borderColor: 'var(--border3)',
            color: 'var(--text3)'
          }}
        >
          Sign Out
        </button>

        {/* Animated sync status dot */}
        <div className="hdr-sync-pill" title={`Sync: ${sc.label}`}>
          <span
            className={`sync-dot ${syncStatus}`}
            style={{
              background: sc.color,
              boxShadow: `0 0 8px ${sc.color}`,
              animation: sc.pulse ? 'pulse .8s infinite' : 'none',
            }}
            aria-label={`Sync status: ${sc.label}`}
          />
          {/* Show skeleton shimmer while hydrating, real label after */}
          {hasHydrated ? (
            <span className="hdr-sync-text" style={{ color: sc.color }}>{sc.label}</span>
          ) : (
            <span className="skeleton-text" style={{ width: 60, height: 10, borderRadius: 4, display: 'inline-block' }} />
          )}
        </div>

        <div className="hdr-clock-container">
          <div className="hdr-time">{timeStr}</div>
          <div className="hdr-date">{dateStr} IST</div>
        </div>
      </div>
    </header>
  )
}
