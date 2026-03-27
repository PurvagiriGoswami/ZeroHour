import { useShallow } from 'zustand/react/shallow'
import { TABS } from '../data'
import { auth } from '../firebase'
import { useAppStore } from '../store/useStore'
import { getTopicRevisionStatus } from '../utils/spacedRepetition'

export function SideMenu({ active, onNav, isOpen, isCollapsed, onClose }) {
  const user = auth.currentUser
  const { settings, revision, syl, revisionCycles } = useAppStore(
    useShallow(s => ({
      settings: s.settings,
      revision: s.revision,
      syl: s.syl,
      revisionCycles: s.revisionCycles
    }))
  )
  const name = user?.displayName || settings.name || 'User'
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()

  const overdueCount = syl.filter(t => {
    const rv = revision.find(r => r.topicId === t.id) || {}
    const status = getTopicRevisionStatus(t, rv, revisionCycles)
    return status && status.isDue
  }).length

  return (
    <>
      {/* Overlay backdrop for mobile */}
      {isOpen && (
        <div 
          className="sidemenu-backdrop hide-desk" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <nav className={`sidemenu ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`} aria-label="Main Navigation">
        <div className="sidemenu-inner">
          <div className="sidemenu-items">
            {TABS.map(t => {
              const isProfile = t.id === 'profile'
              const isRevision = t.id === 'rev'
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onNav(t.id)
                    if (onClose) onClose()
                  }}
                  className={`sidemenu-item${active === t.id ? ' active' : ''}`}
                  aria-current={active === t.id ? 'page' : undefined}
                  aria-label={t.label}
                >
                  <span className="sidemenu-icon" aria-hidden="true">
                    {isProfile ? (
                      user?.photoURL ? (
                        <img src={user.photoURL} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                      ) : (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg3)', color: 'var(--indigo)', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                          {initials}
                        </div>
                      )
                    ) : isRevision ? (
                      <div style={{ position: 'relative', display: 'inline-flex' }}> 
                        {t.icon}
                        {overdueCount > 0 && ( 
                          <span style={{ 
                            position: 'absolute', top: -4, right: -6, 
                            background: '#E24B4A', color: '#fff', 
                            borderRadius: 10, fontSize: 10, fontWeight: 500, 
                            padding: '1px 5px', minWidth: 16, textAlign: 'center', 
                            lineHeight: '16px' 
                          }}> 
                            {overdueCount > 99 ? '99+' : overdueCount} 
                          </span> 
                        )} 
                      </div> 
                    ) : t.icon}
                  </span>
                  <span className="sidemenu-label">{t.label}</span>
                  {isCollapsed && <span className="sidemenu-tooltip">{t.label}</span>}
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
