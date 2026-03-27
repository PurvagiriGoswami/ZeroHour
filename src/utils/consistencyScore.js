// ── Consistency Intelligence Engine ──

/**
 * Calculates weekly consistency score (0-100)
 * @param {Object} data - { habs, logs, revision, mocks, pyqlog }
 * @returns {number} 0-100
 */
export function calculateConsistencyScore(data) {
  const { habs = [], logs = [], revision = [], mocks = [], pyqlog = [] } = data
  
  // Get start of current week (Monday)
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is sunday
  const startOfWeek = new Date(now.setDate(diff))
  startOfWeek.setHours(0, 0, 0, 0)

  // 1. Habit Completion Rate (30%)
  // Formula: (habits completed this week) / (total possible habits this week)
  let habitScore = 0
  if (habs.length > 0) {
    const thisWeekHabs = habs.filter(h => new Date(h.date) >= startOfWeek)
    const completed = thisWeekHabs.filter(h => h.completed).length
    const total = thisWeekHabs.length || 1
    habitScore = (completed / total) * 30
  }

  // 2. Daily Log Streak (25%)
  // Formula: consecutive days with a daily log entry, capped at 7 days
  let logScore = 0
  const recentLogs = logs
    .filter(l => new Date(l.date) >= startOfWeek)
    .map(l => new Date(l.date).toDateString())
  
  const uniqueDays = new Set(recentLogs).size
  logScore = Math.min(uniqueDays, 7) * (25 / 7)

  // 3. Revision Adherence (25%)
  // Formula: (topics done on time) vs (overdue topics)
  let revScore = 25 // Start with full marks
  const overdue = revision.filter(r => new Date(r.nextDate) < new Date() && !r.completedToday).length
  const penalty = Math.min(overdue * 2, 25)
  revScore -= penalty

  // 4. Mock/PYQ Activity (20%)
  // Formula: at least 1 mock or PYQ session logged this week = full marks
  let activityScore = 0
  const thisWeekMocks = mocks.filter(m => new Date(m.date) >= startOfWeek)
  const thisWeekPYQs = pyqlog.filter(p => new Date(p.date) >= startOfWeek)
  if (thisWeekMocks.length > 0 || thisWeekPYQs.length > 0) {
    activityScore = 20
  }

  const totalScore = Math.round(habitScore + logScore + revScore + activityScore)
  return Math.max(0, Math.min(100, totalScore))
}

export function getConsistencyStatus(score) {
  if (score >= 91) return "ELITE — Operate at this level until exam day."
  if (score >= 76) return "STRONG — Keep the pressure on."
  if (score >= 61) return "AVERAGE — Solid base. Close the gaps."
  if (score >= 41) return "BELOW PAR — Push harder. The exam doesn't wait."
  return "CRITICAL — Discipline breakdown. Recalibrate now."
}

export function getConsistencyColor(score) {
  if (score >= 71) return "var(--green)"
  if (score >= 41) return "var(--gold)"
  return "var(--red)"
}

export function getWeekKey() {
  const d = new Date()
  const year = d.getFullYear()
  const oneJan = new Date(d.getFullYear(), 0, 1)
  const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000))
  const week = Math.ceil((d.getDay() + 1 + numberOfDays) / 7)
  return `${year}-W${week}`
}
