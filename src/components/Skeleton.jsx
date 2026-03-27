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
