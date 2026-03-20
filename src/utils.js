export const td  = () => new Date().toISOString().split('T')[0]
export const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || 0))

export function daysUntil(ds) {
  if (!ds) return null
  const n = new Date(); n.setHours(0,0,0,0)
  const t = new Date(ds); t.setHours(0,0,0,0)
  return Math.ceil((t - n) / 86400000)
}

export function daysSince(ds) {
  if (!ds) return 999
  const n = new Date(); n.setHours(0,0,0,0)
  const a = new Date(ds); a.setHours(0,0,0,0)
  return Math.floor((n - a) / 86400000)
}

export function confAdj(c) {
  c = Number(c) || 0
  if (c <= 1) return -3; if (c === 2) return -1
  if (c >= 5) return 2;  if (c === 4) return 1
  return 0
}
export const priAdj = p => p === 'H' ? -2 : p === 'L' ? 1 : 0

export function r2Days(t) { return clamp(Math.round(21 + confAdj(t?.conf) + priAdj(t?.pri)), 14, 30) }
export function r3Days(t) { return clamp(Math.round(14 + confAdj(t?.conf) + priAdj(t?.pri)),  9, 22) }

export function getRevDue(t, rv) {
  if (!t || t.status !== 'Done') return null
  if (!rv?.r2Done) {
    const d = r2Days(t), anchor = rv?.r1Date || t?.lastStudied, ds = anchor ? daysSince(anchor) : 999
    return ds >= d ? { round:'R2', dueDays:d, daysSince:ds, overdueBy:ds-d } : null
  }
  if (rv?.r2Done && !rv?.r3Done) {
    const d = r3Days(t), anchor = rv?.r2Date || rv?.r1Date || t?.lastStudied, ds = anchor ? daysSince(anchor) : 999
    return ds >= d ? { round:'R3', dueDays:d, daysSince:ds, overdueBy:ds-d } : null
  }
  return null
}

export function calcNM(attempted, correct, total, penalty = 1/3) {
  const att = Number(attempted) || 0
  const cor = Number(correct)   || 0
  const wrong = Math.max(0, att - cor)
  const raw = cor - wrong * penalty
  return {
    raw:   Math.round(raw * 100) / 100,
    wrong, correct: cor, attempted: att,
    acc:   att > 0 ? Math.round(cor / att * 100) : 0,
  }
}

export function calcStreak(logs) {
  let s = 0
  for (let i = 0; i < 90; i++) {
    const d = new Date(); d.setDate(d.getDate() - i)
    if (logs.find(l => l.date === d.toISOString().split('T')[0])) s++
    else break
  }
  return s
}
