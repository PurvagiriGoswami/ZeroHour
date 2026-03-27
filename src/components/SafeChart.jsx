/**
 * SafeChart — wraps Recharts charts with:
 * - Empty/zero-only data detection → shows a friendly fallback
 * - Error boundary to prevent crashes
 */
import { Component } from 'react'

// Error boundary for chart crashes
class ChartErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: false } }
  static getDerivedStateFromError() { return { error: true } }
  render() {
    if (this.state.error) return <ChartFallback message="Chart unavailable" />
    return this.props.children
  }
}

function ChartFallback({ message = 'No data yet', cta }) {
  return (
    <div style={{
      height: '100%', minHeight: 160,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 8, color: 'var(--text4)',
    }}>
      <span style={{ fontSize: 28 }}>📊</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{message}</span>
      {cta && <span style={{ fontSize: 11, color: 'var(--text5)' }}>{cta}</span>}
    </div>
  )
}

/**
 * @param {object} props
 * @param {any[]} data - chart data array
 * @param {string} [emptyMessage] - message when no data
 * @param {string} [emptyCta] - call-to-action hint
 * @param {number} [height] - chart container height
 * @param {React.ReactNode} children - the actual chart
 */
export default function SafeChart({ data, emptyMessage, emptyCta, height = 260, children }) {
  const isEmpty = !data || data.length === 0
  const isAllZero = !isEmpty && data.every(d => {
    const vals = Object.values(d).filter(v => typeof v === 'number')
    return vals.length > 0 && vals.every(v => v === 0)
  })

  if (isEmpty || isAllZero) {
    return (
      <div style={{ height }}>
        <ChartFallback message={emptyMessage || 'No data yet'} cta={emptyCta} />
      </div>
    )
  }

  return (
    <ChartErrorBoundary>
      <div style={{ height }}>
        {children}
      </div>
    </ChartErrorBoundary>
  )
}
