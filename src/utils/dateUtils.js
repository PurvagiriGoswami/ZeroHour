// ── Date Utilities ── All dates formatted DD-MM-YYYY globally

export function formatDate(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

export function parseFormattedDate(str) {
  if (!str) return null
  // Handle DD-MM-YYYY
  const parts = str.split('-')
  if (parts.length === 3 && parts[0].length === 2) {
    return new Date(+parts[2], +parts[1] - 1, +parts[0])
  }
  // Fallback to ISO
  return new Date(str)
}

export function today() {
  return new Date().toISOString().split('T')[0]
}

export function todayFormatted() {
  return formatDate(new Date())
}

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

export function calcStreak(logs) {
  let s = 0
  for (let i = 0; i < 90; i++) {
    const d = new Date(); d.setDate(d.getDate() - i)
    if (logs.find(l => l.date === d.toISOString().split('T')[0])) s++
    else break
  }
  return s
}

export const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || 0))
