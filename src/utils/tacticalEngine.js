// ── Tactical Logic Engine ──
// Consolidates all core calculations for streaks, SR, and SITREP health.

export const START_DATE = '2026-06-01'; // User specified Jun 1

// ── Date Helpers ──
export const getTodayStr = () => new Date().toISOString().split('T')[0];

/**
 * Calculates the second Sunday of a given month and year.
 * Used for CDS I (April) and CDS II (September).
 */
export const getSecondSunday = (month, year) => {
  const date = new Date(year, month - 1, 1);
  let day = date.getDay(); // 0 (Sun) to 6 (Sat)
  
  let firstSunday;
  if (day === 0) {
    firstSunday = 1;
  } else {
    firstSunday = 1 + (7 - day);
  }
  
  const secondSunday = firstSunday + 7;
  return new Date(year, month - 1, secondSunday);
};

/**
 * Computes or updates system-managed exam registrations (CDS I & II).
 */
export const getSystemExams = (currentDate = new Date()) => {
  const currentYear = currentDate.getFullYear();
  
  const cds1ThisYear = getSecondSunday(4, currentYear);
  const cds2ThisYear = getSecondSunday(9, currentYear);
  
  const exams = [];
  
  if (currentDate <= cds1ThisYear) {
    exams.push({ name: 'CDS I', date: cds1ThisYear, year: currentYear });
  } else {
    exams.push({ name: 'CDS I', date: getSecondSunday(4, currentYear + 1), year: currentYear + 1 });
  }
  
  if (currentDate <= cds2ThisYear) {
    exams.push({ name: 'CDS II', date: cds2ThisYear, year: currentYear });
  } else {
    exams.push({ name: 'CDS II', date: getSecondSunday(9, currentYear + 1), year: currentYear + 1 });
  }
  
  return exams.map(e => ({
    id: `sys_${e.name.replace(' ', '_')}_${e.year}`,
    exam_name: e.name.replace(' ', '_'),
    exam_date: e.date.toISOString().split('T')[0],
    is_system_computed: true,
    is_active: true,
    year: e.year
  }));
};

/**
 * Get prep progress percentages relative to start date and current date
 */
export const getPrepProgress = (activeExams = []) => {
  const start = new Date(START_DATE);
  const now = new Date();
  
  // Sort active exams with a date
  const sortedExams = [...activeExams]
    .filter(e => e.date && e.active)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
    
  const nearest = sortedExams[0];
  let nearestDays = null;
  if (nearest) {
    nearestDays = Math.ceil((new Date(nearest.date) - now) / (1000 * 60 * 60 * 24));
  }

  return {
    nearestExam: nearest ? { ...nearest, daysRemaining: nearestDays } : null
  };
};

export const getWeekNumber = (date = new Date()) => {
  const start = new Date(START_DATE);
  const now = new Date(date);
  const diff = now - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
};

/**
 * Derives current phase based on the nearest active exam
 */
export const getPhase = (examList = [], date = new Date()) => {
  const activeExams = (examList || [])
    .filter(e => e.active && e.date && new Date(e.date) >= date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const nearest = activeExams[0];
  if (!nearest) {
    return { id: 'CDS', name: 'CDS MODE ACTIVE', desc: 'Post-AFCAT Specialization' };
  }
  
  if (nearest.id === 'afcat') {
    return { id: 'AFCAT', name: 'AFCAT + CDS BALANCED', desc: 'Pre-AFCAT Balanced Operations' };
  } else if (nearest.id === 'cds2' || nearest.id === 'cds1') {
    return { id: 'CDS', name: 'CDS SPECIALIZATION ACTIVE', desc: 'Focused CDS Operational Campaign' };
  } else if (nearest.id === 'capf') {
    return { id: 'CAPF', name: 'CAPF SPECIALIZATION ACTIVE', desc: 'Strategic CAPF Paper 1 & 2 Focus' };
  }
  return { id: nearest.id.toUpperCase(), name: `${nearest.name} PREP MODE`, desc: `Campaign focused on ${nearest.name}` };
};

// ── XP & Rank Logic ──
export const calculateRank = (xp, ranks) => {
  let currentRank = ranks[0];
  for (const r of ranks) {
    if (xp >= r.minXP) currentRank = r;
    else break;
  }
  const nextRank = ranks[ranks.indexOf(currentRank) + 1] || null;
  const progress = nextRank 
    ? ((xp - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100 
    : 100;
  
  return { ...currentRank, progress, nextRank };
};

// ── Spaced Repetition Logic (v2) ──
export const getNextReviewDate = (level, fromDate = getTodayStr()) => {
  const intervals = [1, 3, 7, 15, 30]; // R1 to R5
  const days = intervals[level] || 30;
  const d = new Date(fromDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const getTopicDueStatus = (topicKey, data, today = getTodayStr()) => {
  if (!data.firstStudied) return null;
  
  const intervals = [1, 3, 7, 15, 30];
  const firstDate = new Date(data.firstStudied);
  
  const levels = intervals.map((days, idx) => {
    const d = new Date(firstDate);
    d.setDate(d.getDate() + days);
    const dateStr = d.toISOString().split('T')[0];
    
    const isDone = (data.revisits || []).some(r => r.level === idx + 1);
    const dDate = new Date(dateStr);
    const tDate = new Date(today);
    const diffDays = Math.ceil((tDate - dDate) / (1000 * 60 * 60 * 24));

    return {
      level: idx + 1,
      date: dateStr,
      isDone,
      overdue: diffDays > 0 && !isDone ? diffDays : 0,
      dueToday: diffDays === 0 && !isDone,
    };
  });

  return levels;
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
  if (a > 0 && a < 3) rules.push("Reduce daily workload by 2h this week. Reallocate to weak GS sections.");
  if (isMathProtectionActive(scores.math)) rules.push("Invoke math recovery: 3h Math daily core slots this week.");
  if (a >= 4) rules.push("Strong week. Maintain consistency or rest on Sunday mock conclusion.");
  return rules;
};

// ── Weakness Radar ──
export const getWeaknessProfile = (sessions, mocks) => {
  const subjectScores = {};

  sessions.forEach(s => {
    if (s.score) {
      if (!subjectScores[s.subject]) subjectScores[s.subject] = [];
      subjectScores[s.subject].push(parseFloat(s.score));
    }
  });

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

// ── Rollover Targets Logic ──
export const getRolloverTargets = (targets, yesterdayStr) => {
  return targets
    .filter(t => t.date === yesterdayStr && (t.status === 'pending' || t.status === 'incomplete' || t.status === 'partial'))
    .map(t => {
      const remainingMinutes = t.status === 'partial' 
        ? Math.max(0, t.estimated_minutes - (t.actual_minutes || 0))
        : t.estimated_minutes;
      
      return {
        ...t,
        id: `rolled_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        date: getTodayStr(),
        estimated_minutes: remainingMinutes,
        status: 'pending',
        rolled_over_from: t.id,
        rollover_count: (t.rollover_count || 0) + 1,
        updated_at: new Date().toISOString()
      };
    });
};

export const calculateDailySummary = (dateStr, targets) => {
  const dailyTargets = targets.filter(t => t.date === dateStr);
  if (dailyTargets.length === 0) return null;

  const plannedCount = dailyTargets.length;
  const completedCount = dailyTargets.filter(t => t.status === 'complete').length;
  const partialCount = dailyTargets.filter(t => t.status === 'partial').length;
  const missedCount = dailyTargets.filter(t => t.status === 'incomplete').length;
  
  const totalPlannedMinutes = dailyTargets.reduce((acc, t) => acc + t.estimated_minutes, 0);
  const totalActualMinutes = dailyTargets.reduce((acc, t) => acc + (t.actual_minutes || 0), 0);
  
  const completionRate = plannedCount > 0 ? (completedCount / plannedCount) * 100 : 0;

  return {
    id: `summary_${dateStr}`,
    date: dateStr,
    planned_count: plannedCount,
    completed_count: completedCount,
    partial_count: partialCount,
    missed_count: missedCount,
    total_planned_minutes: totalPlannedMinutes,
    total_actual_minutes: totalActualMinutes,
    completion_rate: completionRate
  };
};

/**
 * Monday Auto-Rotation Progression Logic
 */
export const getAutoProgressionUpdate = (timetable, todayStr = getTodayStr()) => {
  if (!timetable || !timetable.dailySlots || !timetable.subjectRotationTracker || !timetable.subjectSyllabus) {
    return null;
  }

  // Check if today is Monday
  const todayDate = new Date(todayStr);
  if (todayDate.getDay() !== 1) { // 1 = Monday
    return null;
  }

  // Check if we already rotated this week
  if (timetable.lastAutoRotationDate === todayStr) {
    return null;
  }

  const updatedTracker = { ...timetable.subjectRotationTracker };
  const updatedSlots = JSON.parse(JSON.stringify(timetable.dailySlots));
  let hasChanges = false;

  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const activeSubjects = new Set();
  
  weekdays.forEach(day => {
    const slots = updatedSlots[day];
    if (slots && slots.subjects) {
      slots.subjects.forEach((sub, slotIdx) => {
        const override = timetable.overrides?.[day]?.[slotIdx];
        const finalSubName = override || sub.name;
        activeSubjects.add(finalSubName);
      });
    }
  });

  activeSubjects.forEach(subjectName => {
    const currentPhase = updatedTracker[subjectName] || 1;
    const syllabus = timetable.subjectSyllabus[subjectName] || [];
    const totalPhases = syllabus.length;
    
    if (currentPhase < totalPhases) {
      updatedTracker[subjectName] = currentPhase + 1;
      hasChanges = true;
    } else {
      console.warn(`Syllabus for ${subjectName} is fully completed (last phase reached).`);
    }
  });

  if (!hasChanges) {
    return null;
  }

  // Update syllabus topics in dailySlots dynamically
  weekdays.forEach(day => {
    const slots = updatedSlots[day];
    if (slots && slots.subjects) {
      slots.subjects.forEach((sub, slotIdx) => {
        const override = timetable.overrides?.[day]?.[slotIdx];
        const finalSubName = override || sub.name;
        const newPhase = updatedTracker[finalSubName] || 1;
        const syllabus = timetable.subjectSyllabus[finalSubName] || [];
        const newTopics = syllabus[newPhase - 1] || [];
        
        sub.name = finalSubName;
        sub.phase = newPhase;
        sub.topics = newTopics;
      });
    }
  });

  return {
    ...timetable,
    subjectRotationTracker: updatedTracker,
    dailySlots: updatedSlots,
    lastAutoRotationDate: todayStr
  };
};
