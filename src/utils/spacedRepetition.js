// ── Spaced Repetition System ── Advanced revision scheduling

import { daysSince } from './dateUtils'

// Default cycle schedule (in days from last revision)
export const DEFAULT_CYCLES = [
  { id: 'R1', days: 1, label: 'R1 — 1 Day' },
  { id: 'R2', days: 3, label: 'R2 — 3 Days' },
  { id: 'R3', days: 7, label: 'R3 — 7 Days' },
  { id: 'R4', days: 15, label: 'R4 — 15 Days' },
]

/**
 * Check if a vocab word is due for revision
 * @param {Object} word - vocab word with revisionDates[]
 * @param {Array} cycles - revision cycles
 * @returns {{ isDue: boolean, currentCycle: string, daysOverdue: number } | null}
 */
export function getVocabRevisionStatus(word, cycles = DEFAULT_CYCLES) {
  const revDates = word.revisionDates || []
  const completedRounds = revDates.length

  if (completedRounds >= cycles.length) {
    return { isDue: false, currentCycle: 'DONE', daysOverdue: 0, completedRounds }
  }

  const cycle = cycles[completedRounds]
  const lastDate = revDates.length > 0 ? revDates[revDates.length - 1] : word.createdAt
  if (!lastDate) return { isDue: true, currentCycle: cycle.id, daysOverdue: 999, completedRounds }

  const elapsed = daysSince(lastDate)
  const isDue = elapsed >= cycle.days

  return {
    isDue,
    currentCycle: cycle.id,
    daysUntilDue: Math.max(0, cycle.days - elapsed),
    daysOverdue: isDue ? elapsed - cycle.days : 0,
    completedRounds,
  }
}

/**
 * Get all vocab words due for revision today
 * @param {Array} vocabList
 * @param {Array} cycles
 * @returns {Array}
 */
export function getDueVocab(vocabList, cycles = DEFAULT_CYCLES) {
  return vocabList
    .map(w => ({ ...w, revStatus: getVocabRevisionStatus(w, cycles) }))
    .filter(w => w.revStatus && w.revStatus.isDue)
    .sort((a, b) => (b.revStatus.daysOverdue || 0) - (a.revStatus.daysOverdue || 0))
}

/**
 * Check topic revision status (for syllabus topics)
 * @param {Object} topic - syllabus topic
 * @param {Object} revData - revision record { topicId, r1Done, r1Date, ... }
 * @param {Array} cycles
 * @returns {{ isDue: boolean, currentCycle: string, daysOverdue: number } | null}
 */
export function getTopicRevisionStatus(topic, revData, cycles = DEFAULT_CYCLES) {
  if (!topic || topic.status !== 'Done') return null

  for (let i = 0; i < cycles.length; i++) {
    const rKey = `r${i + 1}Done`
    if (!revData[rKey]) {
      const prevDateKey = i > 0 ? `r${i}Date` : null
      const anchor = prevDateKey ? revData[prevDateKey] : (revData.r1Date || topic.lastStudied)
      if (!anchor) return { isDue: true, currentCycle: cycles[i].id, daysOverdue: 999 }
      const elapsed = daysSince(anchor)
      const isDue = elapsed >= cycles[i].days
      return isDue ? { isDue: true, currentCycle: cycles[i].id, daysOverdue: elapsed - cycles[i].days } : null
    }
  }
  return null
}

/**
 * Mark a revision round as complete for a topic
 * @param {Object} existing - current revision record
 * @param {number} round - round number (1-based)
 * @returns {Object} - updated revision record
 */
export function markTopicRevisionDone(existing, round) {
  const today = new Date().toISOString().split('T')[0]
  const up = { ...existing }
  up[`r${round}Done`] = true
  up[`r${round}Date`] = today
  // Auto-complete previous rounds
  for (let i = 1; i < round; i++) {
    if (!up[`r${i}Done`]) {
      up[`r${i}Done`] = true
      if (!up[`r${i}Date`]) up[`r${i}Date`] = today
    }
  }
  return up
}

/**
 * Unmark a revision round
 */
export function unmarkTopicRevision(existing, round) {
  const up = { ...existing }
  up[`r${round}Done`] = false
  delete up[`r${round}Date`]
  // Clear subsequent rounds
  for (let i = round + 1; i <= 10; i++) {
    up[`r${i}Done`] = false
    delete up[`r${i}Date`]
  }
  return up
}
