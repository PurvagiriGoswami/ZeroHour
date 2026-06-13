import { getTodayStr } from './tacticalEngine';

/**
 * Get next due date based on round
 */
export const getNextDueDate = (t) => {
  const intervals = [1, 3, 7, 15]; // R1 to R4
  const days = intervals[t.round - 1] || 15;
  const d = new Date(t.lastRevisedAt);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

/**
 * Check if a topic is overdue
 */
export const isOverdue = (t) => {
  const due = getNextDueDate(t);
  const today = getTodayStr();
  return new Date(due) < new Date(today);
};

/**
 * Advance the round and update lastRevisedAt
 */
export const advanceRound = (t) => {
  return {
    ...t,
    round: Math.min(t.round + 1, 4),
    lastRevisedAt: getTodayStr()
  };
};
