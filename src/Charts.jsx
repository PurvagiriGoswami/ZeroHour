export function DonutChart({ pct, color, size = 80 }) {
  const r = 32, c = size / 2
  const circ = 2 * Math.PI * r
  const dash = Math.max(0, pct) * circ
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
      <text x={c} y={c + 6} textAnchor="middle" fill="var(--text)" fontSize={16} fontWeight={800}
        fontFamily="Plus Jakarta Sans,sans-serif">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  )
}

export function LineChart({ data, color, target, w = 280, h = 64 }) {
  if (!data || !data.length) return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      <text x={w/2} y={h/2+5} textAnchor="middle" fill="var(--text4)" fontSize={14} fontWeight={600}
        fontFamily="Plus Jakarta Sans,sans-serif">NO DATA YET</text>
    </svg>
  )
  const max = 300, pad = 8
  const xS = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0
  const pts = data.map((v, i) => `${pad + (data.length > 1 ? i * xS : w/2)},${h-4-(v/max)*(h-16)}`).join(' ')
  const ty = h - 4 - (target / max) * (h - 16)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      <line x1={0} y1={h-2} x2={w} y2={h-2} stroke="var(--border)" />
      <line x1={0} y1={ty} x2={w} y2={ty} stroke="var(--gold)" strokeDasharray="4 3" strokeWidth={1} opacity={0.3} />
      <text x={pad} y={ty-4} fill="var(--gold)" fontSize={8} fontWeight={700} opacity={0.6} fontFamily="Plus Jakarta Sans,sans-serif">Target {target}</text>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => {
        const x = pad + (data.length > 1 ? i * xS : w/2)
        const y = h - 4 - (v/max) * (h - 16)
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={4} fill="#fff" stroke={color} strokeWidth={2} />
            {i === data.length - 1 && <text x={x} y={y-10} textAnchor="middle" fill={color} fontSize={10} fontWeight={800} fontFamily="Plus Jakarta Sans,sans-serif">{v}</text>}
          </g>
        )
      })}
    </svg>
  )
}

export function BarChart({ data, colors, h = 46 }) {
  if (!data || !data.length) return null
  const W = 280, pad = 4
  const bw = Math.min(60, Math.floor((W - data.length * pad * 2) / data.length))
  const maxVal = Math.max(1, ...data.map(d => d.max || d.value || 1))
  return (
    <svg viewBox={`0 0 ${W} ${h+20}`} width="100%" height={h+20}>
      {data.map((d, i) => {
        const bh = Math.max(4, Math.round((d.value / (d.max || maxVal)) * h))
        const x = i * (bw + pad * 2) + pad
        const c = Array.isArray(colors) ? colors[i % colors.length] : colors
        return (
          <g key={i}>
            <rect x={x} y={h-bh} width={bw} height={bh} fill={c} fillOpacity={0.2} rx={6} />
            <rect x={x} y={h-bh} width={bw} height={bh} fill={c} fillOpacity={0.8} rx={6} />
            <text x={x+bw/2} y={h+12} textAnchor="middle" fill="var(--text4)" fontSize={9} fontWeight={700} fontFamily="Plus Jakarta Sans,sans-serif">{d.label}</text>
            <text x={x+bw/2} y={h-bh-6} textAnchor="middle" fill={c} fontSize={10} fontWeight={800} fontFamily="JetBrains Mono,monospace">{d.value}</text>
          </g>
        )
      })}
    </svg>
  )
}

