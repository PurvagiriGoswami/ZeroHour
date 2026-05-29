/**
 * Skeleton loader components for loading states.
 * Usage: <SkeletonBlock h={20} w="60%" /> or <SkeletonCard lines={3} />
 */

export function SkeletonBlock({ h = 16, w = '100%', radius = 6, style = {} }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height: h,
        width: w,
        borderRadius: radius,
        background: 'linear-gradient(90deg, var(--bg3) 25%, var(--bg4) 50%, var(--bg3) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}

export function SkeletonCard({ lines = 3, title = true }) {
  return (
    <div className="card" aria-busy="true" aria-label="Loading…">
      {title && <SkeletonBlock h={14} w="40%" style={{ marginBottom: 16 }} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBlock key={i} h={12} w={i === lines - 1 ? '60%' : '100%'} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }} aria-busy="true">
      <SkeletonBlock h={32} w="50%" style={{ margin: '0 auto 8px' }} />
      <SkeletonBlock h={10} w="70%" style={{ margin: '0 auto' }} />
    </div>
  )
}

export default function Skeleton({ type = 'page' }) {
  if (type === 'full') {
    return (
      <div style={{ height: '100vh', width: '100vw', background: 'var(--bg)', display: 'flex' }}>
        <div style={{ width: '260px', borderRight: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SkeletonBlock h={40} w="80%" style={{ marginBottom: '24px' }} />
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} h={44} w="100%" />
          ))}
        </div>
        <div style={{ flex: 1, padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            <SkeletonBlock h={32} w="200px" />
            <SkeletonBlock h={32} w="120px" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <SkeletonCard lines={6} />
            <SkeletonCard lines={6} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <SkeletonBlock h={28} w="240px" />
        <SkeletonBlock h={28} w="100px" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
      </div>
      <div className="g2">
        <SkeletonCard lines={5} />
        <SkeletonCard lines={5} />
      </div>
    </div>
  )
}
