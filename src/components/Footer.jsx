export default function Footer({ onNav }) {
  const academics = [
    { label: 'Course Map', id: 'syl' },
    { label: 'Test Series', id: 'mocks' },
    { label: 'Word Power', id: 'vocab' },
    { label: 'Daily Challenge', id: 'quiz' },
  ]
  const system = [
    { label: 'Analytics', id: 'analytics' },
    { label: 'Planner', id: 'planner' },
    { label: 'Settings', id: 'settings' },
  ]

  return (
    <footer className="footer">
      <div className="footer-inner container">

        {/* ── Col 1: Brand ── */}
        <div className="footer-col footer-col-brand">
          <button className="footer-brand-btn" onClick={() => onNav('dash')}>
            <img
              src="/assets/branding/ZeroHour_Main_logo.svg"
              onError={e => { e.target.src = '/assets/branding/logo-1024-transparent.png' }}
              alt="ZeroHour logo"
              className="footer-logo"
            />
            <span className="footer-wordmark">ZeroHour</span>
          </button>
          <p className="footer-tagline">
            The gold standard in defence exam preparation. Empowering the next generation of officers for CDS, NDA &amp; AFCAT.
          </p>
          <div className="footer-badge">
            <span className="footer-badge-dot" />
            <span>Systems Nominal</span>
          </div>
        </div>

        {/* ── Col 2: Nav links ── */}
        <div className="footer-col">
          <p className="footer-col-heading">Academics</p>
          {academics.map(l => (
            <button key={l.id} className="footer-nav-link" onClick={() => onNav(l.id)}>{l.label}</button>
          ))}
        </div>

        <div className="footer-col">
          <p className="footer-col-heading">System</p>
          {system.map(l => (
            <button key={l.id} className="footer-nav-link" onClick={() => onNav(l.id)}>{l.label}</button>
          ))}
          <p className="footer-col-heading" style={{ marginTop: 24 }}>Build</p>
          <span className="footer-build">ZH-2.1.4-ENG</span>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bar container">
        <span>© 2026 ZeroHour Strategic Academy. All rights reserved.</span>
      </div>
    </footer>
  )
}
