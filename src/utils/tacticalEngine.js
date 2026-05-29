// ── Tactical Logic Engine ──
// Consolidates all core calculations for streaks, SR, and SITREP health.

export const START_DATE = '2025-06-09';

// ── Date Helpers ──
export const getTodayStr = () => new Date().toISOString().split('T')[0];

export const getWeekNumber = (date = new Date()) => {
  const start = new Date(START_DATE);
  const now = new Date(date);
  const diff = now - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
};

export const getPhase = (week) => {
  return week <= 8 
    ? { name: 'PHASE 1', desc: 'BALANCED PREP — CDS + AFCAT' }
    : { name: 'PHASE 2', desc: 'CDS INTENSIFICATION' };
};

// ── Streak Calculation ──
export const calculateStreak = (sessions) => {
  const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  const today = getTodayStr();
  let streak = 0;
  let d = new Date();
  
  while (true) {
    const dStr = d.toISOString().split('T')[0];
    if (dates.includes(dStr)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      // Allow for today being incomplete
      if (dStr === today) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return streak;
};

// ── Spaced Repetition Logic ──
export const getTopicDueStatus = (topicKey, data, today = getTodayStr()) => {
  if (!data.firstStudied) return null;
  const firstDate = new Date(data.firstStudied);
  const intervals = [7, 14, 30];
  const dueDates = intervals.map(days => {
    const d = new Date(firstDate);
    d.setDate(d.getDate() + days);
    return { days, date: d.toISOString().split('T')[0] };
  });

  const revisitsDone = data.revisits || [];

  return dueDates.map(due => {
    const isDone = revisitsDone.some(r => {
      const rDate = new Date(r.date);
      const dDate = new Date(due.date);
      const diffDays = Math.abs((rDate - dDate) / (1000 * 60 * 60 * 24));
      // ±2 day window for revision window
      return diffDays <= 2 && (r.type === 'Spaced Revision' || r.type === 'Active Recall');
    });

    const dDate = new Date(due.date);
    const tDate = new Date(today);
    const diffDays = Math.ceil((tDate - dDate) / (1000 * 60 * 60 * 24));

    return {
      ...due,
      isDone,
      overdue: diffDays > 0 && !isDone ? diffDays : 0,
      dueToday: diffDays === 0 && !isDone,
      upcoming: diffDays < 0 && diffDays >= -7 && !isDone
    };
  });
};

export const getOverdueCount = (topicMap) => {
  let count = 0;
  const today = getTodayStr();
  Object.entries(topicMap).forEach(([key, data]) => {
    const status = getTopicDueStatus(key, data, today);
    if (status) {
      count += status.filter(s => s.overdue > 0).length;
    }
  });
  return count;
};

// ── SITREP Health Scoring ──
export const calculateHealthScore = (scores) => {
  const vals = Object.values(scores).filter(v => typeof v === 'number' && v > 0);
  if (vals.length === 0) return 0;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
};

export const getHealthStatus = (avg) => {
  const a = parseFloat(avg);
  if (a >= 4.0) return { label: 'ON TRACK', color: '#22c55e' };
  if (a >= 3.0) return { label: 'STEADY', color: '#3b82f6' };
  if (a >= 2.0) return { label: 'UNDER TARGET', color: '#f59e0b' };
  return { label: 'CRITICAL', color: '#ef4444' };
};

// ── Math Protection Logic ──
export const isMathProtectionActive = (mathScore) => mathScore > 0 && mathScore <= 2;

export const getCommandDecisions = (avg, scores) => {
  const rules = [];
  const a = parseFloat(avg);
  if (a > 0 && a < 3) rules.push("Reduce AFCAT by 2h this week. Reallocate to lowest CDS subject.");
  if (isMathProtectionActive(scores.math)) rules.push("Invoke math recovery: 6h Math daily for this week.");
  if (a >= 4) rules.push("Strong week. Optional: add 30 min to weak area or take half-day rest.");
  return rules;
};

// ── Weakness Radar ──
export const getWeaknessProfile = (sessions, mocks) => {
  const subjectScores = {};

  // Aggregate from sessions
  sessions.forEach(s => {
    if (s.score) {
      if (!subjectScores[s.subject]) subjectScores[s.subject] = [];
      subjectScores[s.subject].push(parseFloat(s.score));
    }
  });

  // Aggregate from mocks
  mocks.forEach(m => {
    if (m.math) { if (!subjectScores['Mathematics']) subjectScores['Mathematics'] = []; subjectScores['Mathematics'].push(m.math); }
    if (m.english) { if (!subjectScores['English']) subjectScores['English'] = []; subjectScores['English'].push(m.english); }
    if (m.gk) { if (!subjectScores['GK / GA']) subjectScores['GK / GA'] = []; subjectScores['GK / GA'].push(m.gk); }
    if (m.science) { if (!subjectScores['Science']) subjectScores['Science'] = []; subjectScores['Science'].push(m.science); }
  });

  const profile = Object.entries(subjectScores).map(([subject, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { subject, avg };
  }).sort((a, b) => a.avg - b.avg);

  return profile.filter(p => p.avg < 60).slice(0, 3);
};

// ── Daily Mission Logic ──
export const getDailyMissions = (sessions, pomosToday, topicMap) => {
  const today = getTodayStr();
  const missions = [
    { 
      id: 'pomo', 
      label: 'Operational Readiness', 
      desc: 'Complete 4 Pomodoros today', 
      target: 4, 
      current: pomosToday,
      done: pomosToday >= 4 
    },
    { 
      id: 'sr', 
      label: 'Intel Recovery', 
      desc: 'Clear 1 overdue revision', 
      target: 1, 
      current: 0, // Calculated below
      done: false 
    },
    { 
      id: 'log', 
      label: 'Combat Training', 
      desc: 'Log 2 study missions', 
      target: 2, 
      current: sessions.filter(s => s.date === today).length,
      done: sessions.filter(s => s.date === today).length >= 2
    }
  ];

  // Calculate SR progress
  let srDoneToday = 0;
  sessions.filter(s => s.date === today && (s.phase === 'Spaced Revision' || s.phase === 'Active Recall')).forEach(s => {
    srDoneToday++;
  });
  missions[1].current = srDoneToday;
  missions[1].done = srDoneToday >= 1;

  return missions;
};
