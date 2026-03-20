export function DonutChart({ pct, color, size = 72 }) {
  const r = 26, c = size / 2
  const circ = 2 * Math.PI * r
  const dash = Math.max(0, pct) * circ
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="#0d1f0d" strokeWidth={8} />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: 'stroke-dasharray .5s' }}
      />
      <text x={c} y={c + 5} textAnchor="middle" fill={color} fontSize={16}
        fontFamily="Share Tech Mono,monospace">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  )
}

export function LineChart({ data, color, target, w = 280, h = 64 }) {
  if (!data || !data.length) return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      <text x={w/2} y={h/2+5} textAnchor="middle" fill="#2a5a2a" fontSize={16}
        fontFamily="Share Tech Mono,monospace">NO DATA YET</text>
    </svg>
  )
  const max = 300, pad = 4
  const xS = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0
  const pts = data.map((v, i) => `${pad + (data.length > 1 ? i * xS : w/2)},${h-4-(v/max)*(h-8)}`).join(' ')
  const ty = h - 4 - (target / max) * (h - 8)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      <line x1={0} y1={h-2} x2={w} y2={h-2} stroke="#0d1f0d" />
      <line x1={0} y1={ty} x2={w} y2={ty} stroke="#ffd70055" strokeDasharray="4 3" strokeWidth={1} />
      <text x={3} y={ty-2} fill="#ffd70077" fontSize={7} fontFamily="Share Tech Mono,monospace">target {target}</text>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} />
      {data.map((v, i) => {
        const x = pad + (data.length > 1 ? i * xS : w/2)
        const y = h - 4 - (v/max) * (h - 8)
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={3.5} fill={color} />
            <text x={x} y={y-6} textAnchor="middle" fill={color} fontSize={7} fontFamily="Share Tech Mono,monospace">{v}</text>
          </g>
        )
      })}
    </svg>
  )
}

export function BarChart({ data, colors, h = 46 }) {
  if (!data || !data.length) return null
  const W = 280, pad = 2
  const bw = Math.min(80, Math.floor((W - data.length * pad * 2) / data.length))
  const maxVal = Math.max(1, ...data.map(d => d.max || d.value || 1))
  return (
    <svg viewBox={`0 0 ${W} ${h+14}`} width="100%" height={h+14}>
      {data.map((d, i) => {
        const bh = Math.max(2, Math.round((d.value / (d.max || maxVal)) * h))
        const x = i * (bw + pad * 2) + pad
        const c = Array.isArray(colors) ? colors[i % colors.length] : colors
        return (
          <g key={i}>
            <rect x={x} y={h-bh} width={bw} height={bh} fill={c} fillOpacity={0.8} rx={1} />
            <text x={x+bw/2} y={h+5} textAnchor="middle" fill="#4a7a4a" fontSize={6.5} fontFamily="Share Tech Mono,monospace">{d.label}</text>
            <text x={x+bw/2} y={h-bh-3} textAnchor="middle" fill={c} fontSize={16} fontFamily="Share Tech Mono,monospace">{d.value}</text>
          </g>
        )
      })}
    </svg>
  )
}
