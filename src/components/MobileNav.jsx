import { useState, useEffect, useRef } from 'react'
import { TABS } from '../data'
import { auth } from '../firebase'
import { useAppStore } from '../store/useStore'

// Primary tabs always visible in bottom bar
const PRIMARY_IDS = ['dash', 'daily', 'syl', 'quiz']

export default function MobileNav({ active, onNav }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef(null)
  const user = auth.currentUser
  const settings = useAppStore(s => s.settings)
  const name = user?.displayName || settings.name || 'User'
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()

  const PRIMARY = TABS.filter(t => PRIMARY_IDS.includes(t.id))
  const MORE = TABS.filter(t => !PRIMARY_IDS.includes(t.id))

  // Close drawer on outside tap
  useEffect(() => {
    if (!drawerOpen) return
    const handler = e => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false)
      }
    }
    document.addEventListener('touchstart', handler, { passive: true })
    document.addEventListener('mousedown', handler)
    return () => {
      document.removeEventListener('touchstart', handler)
      document.removeEventListener('mousedown', handler)
    }
  }, [drawerOpen])

  function handleNav(id) {
    onNav(id)
    setDrawerOpen(false)
  }

  const moreActive = MORE.some(t => t.id === active)

  function renderIcon(t) {
    if (t.id === 'profile') {
      return user?.photoURL ? (
        <img src={user.photoURL} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
      ) : (
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg3)', color: 'var(--indigo)', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
          {initials}
        </div>
      )
    }
    return t.icon
  }

  return (
    <>
      {/* More drawer */}
      <div
        ref={drawerRef}
        className={`mob-more-drawer ${drawerOpen ? 'open' : ''}`}
        aria-hidden={!drawerOpen}
      >
        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, textAlign: 'center' }}>
          More Sections
        </div>
        <div className="mob-more-grid">
          {MORE.map(t => (
            <button
              key={t.id}
              className={`mob-more-item ${active === t.id ? 'active' : ''}`}
              onClick={() => handleNav(t.id)}
              aria-label={t.label}
              aria-current={active === t.id ? 'page' : undefined}
            >
              <span className="mob-more-icon">{renderIcon(t)}</span>
              <span>{t.short}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom nav bar */}
      <nav className="mob-nav" aria-label="Mobile Navigation">
        {PRIMARY.map(t => (
          <button
            key={t.id}
            className={`mob-nav-item ${active === t.id ? 'active' : ''}`}
            onClick={() => handleNav(t.id)}
            aria-label={t.label}
            aria-current={active === t.id ? 'page' : undefined}
          >
            <span className="mob-nav-icon">{renderIcon(t)}</span>
            <span>{t.short}</span>
          </button>
        ))}
        {/* More button */}
        <button
          className={`mob-nav-item ${moreActive || drawerOpen ? 'active' : ''}`}
          onClick={() => setDrawerOpen(o => !o)}
          aria-label="More sections"
          aria-expanded={drawerOpen}
        >
          <span className="mob-nav-icon">⋯</span>
          <span>MORE</span>
        </button>
      </nav>
    </>
  )
}
