import { getTodayISO, getDOW, getLastNDays, diffDays, getISOWeek } from './dateUtils.js'
import { generateId, getCurrentTime, minutesBetween } from './helpers.js'

export function computeDerived(state) {
  const today = getTodayISO()
  const todayDow = getDOW(today)

  // ── 1. SYNC DAILY TARGETS FROM WEEKLY PLAN ──
  const resolveWeekKey = (isoDate, planItemId) => {
    const weekNum = getISOWeek(isoDate)
    const key = `${isoDate.slice(0, 4)}-W${weekNum}:${planItemId}`
    return state.weeklyPlanOverrides[key] ?? null
  }

  const planned = state.weeklyPlan[todayDow] ?? []
  const existing = state.dailyTargets[today] ?? []
  const existingPlanIds = new Set(
    existing.filter(t => t.weeklyPlanItemId).map(t => t.weeklyPlanItemId)
  )

  const newTargets = planned
    .filter(p => !existingPlanIds.has(p.id))
    .map(p => ({
      id: generateId(),
      weeklyPlanItemId: p.id,
      date: today,
      subject: p.subject,
      topic: resolveWeekKey(today, p.id) ?? p.topic,
      targetMinutes: p.targetMinutes,
      examTag: p.examTag ?? null,
      status: 'pending',
      sessionLogId: null,
      completedMinutes: 0,
      adHoc: false,
    }))

  state.dailyTargets[today] = [...existing, ...newTargets]

  // ── 2. TODAY'S COMPLETION % ──
  const todayTargets = state.dailyTargets[today] ?? []
  const actionable = todayTargets.filter(t => t.status !== 'skipped')
  const doneCount = todayTargets.filter(t => t.status === 'done').length
  state.derived_todayCompletion = actionable.length
    ? Math.round((doneCount / actionable.length) * 100)
    : 0

  // ── 3. SUBJECT TIME TODAY ──
  const todaySessions = state.sessionLog[today] ?? []
  state.derived_subjectTimeToday = {}
  for (const s of todaySessions) {
    state.derived_subjectTimeToday[s.subject] =
      (state.derived_subjectTimeToday[s.subject] ?? 0) + (s.actualMinutes ?? 0)
  }

  // ── 4. WEEKLY HOURS (last 7 days) ──
  state.derived_weeklyHours = getLastNDays(7)
    .reverse()
    .map(date => ({
      date,
      minutes: (state.sessionLog[date] ?? []).reduce((s, x) => s + (x.actualMinutes ?? 0), 0),
    }))

  // ── 5. EXAM COUNTDOWNS ──
  state.derived_examCountdowns = (state.exams ?? [])
    .map(e => ({
      ...e,
      daysLeft: diffDays(today, e.date),
      totalDays: diffDays(e.announcedDate ?? e.date, e.date) || 180,
    }))
    .filter(e => e.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  // ── 6. AUTO-COMPLETE HABITS FROM SESSION DATA ──
  if (!state.habits) state.habits = {}
  if (!state.habits[today]) state.habits[today] = {}

  const hasAnyStudy = todaySessions.length > 0
  const hasPYQ = todayTargets.some(t => t.subject === 'PYQ' && t.status === 'done')
  const hasMock = todayTargets.some(t => t.subject === 'Mock' && t.status === 'done')

  if (hasAnyStudy && !state.habits[today].morningStudy) {
    state.habits[today].morningStudy = true
  }
  if (hasPYQ && !state.habits[today].pyqPractice) {
    state.habits[today].pyqPractice = true
  }
  if (hasMock && !state.habits[today].mockRevision) {
    state.habits[today].mockRevision = true
  }

  // ── 7. STUDY STREAK ──
  let streak = 0
  const days = getLastNDays(90)
  for (const d of days) {
    const sessions = state.sessionLog[d] ?? []
    if (sessions.some(s => s.actualMinutes > 0)) {
      streak++
    } else {
      break
    }
  }
  state.derived_streak = streak

  // ── 8. ROLLING ANALYTICS ──
  const last30 = getLastNDays(30)

  const subjectAccuracy = {}
  const subjectMinutes = {}
  for (const d of last30) {
    for (const s of state.sessionLog[d] ?? []) {
      if (!subjectAccuracy[s.subject]) subjectAccuracy[s.subject] = { a: 0, c: 0 }
      subjectAccuracy[s.subject].a += s.questionsAttempted ?? 0
      subjectAccuracy[s.subject].c += s.questionsCorrect ?? 0
      subjectMinutes[s.subject] = (subjectMinutes[s.subject] ?? 0) + (s.actualMinutes ?? 0)
    }
  }

  const adherenceData = last30.map(d => {
    const targets = state.dailyTargets[d] ?? []
    const done = targets.filter(t => t.status === 'done').length
    return { date: d, planned: targets.length, done, pct: targets.length ? done / targets.length : null }
  })

  state.derived_analytics = {
    totalStudyMinutes30d: Object.values(subjectMinutes).reduce((s, v) => s + v, 0),
    subjectAccuracy: Object.entries(subjectAccuracy).map(([subject, { a, c }]) => ({
      subject,
      attempted: a,
      correct: c,
      accuracy: a > 0 ? Math.round((c / a) * 100) : null,
      weak: a > 0 ? c / a < 0.6 : false,
    })),
    subjectMinutes,
    weeklyPlanAdherence: adherenceData,
  }

  return state
}
