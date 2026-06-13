import { getTodayStr } from './tacticalEngine';

export const triggerNotifications = (state) => {
  const { 
    zh_notifications, 
    zh_targets, 
    zh_sessions, 
    zh_examList,
    zh_weeklyTimetable,
    streak,
    profile
  } = state;

  if (!zh_notifications || !zh_notifications.enabled) return [];

  const notifications = [];
  const today = getTodayStr();
  const now = new Date();
  
  const dayIndex = now.getDay();
  const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayMap[dayIndex];

  // Active exam list sorted
  const activeExams = (zh_examList || [])
    .filter(e => e.active && e.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const nextExam = activeExams.find(e => new Date(e.date) >= now);

  // 1. Daily / Saturday / Sunday Briefing Notifications
  if (dayName === 'saturday') {
    notifications.push({
      type: 'DAILY_BRIEFING',
      message: "Saturday Deployment: Full week revision + PYQ + Monthly CA (Jan–Aug)",
      priority: 'High'
    });
  } else if (dayName === 'sunday') {
    const daysToExamStr = nextExam 
      ? `${Math.ceil((new Date(nextExam.date) - now) / (1000 * 60 * 60 * 24))} days to ${nextExam.name}`
      : 'no upcoming exams configured';
    notifications.push({
      type: 'DAILY_BRIEFING',
      message: `Sunday Deployment: Full Mock today — ${daysToExamStr}`,
      priority: 'High'
    });
  } else {
    // Weekday slot focus
    const daySlots = zh_weeklyTimetable?.dailySlots?.[dayName] || {};
    const subjectsStr = (daySlots.subjects || []).map((s, idx) => {
      const override = zh_weeklyTimetable.overrides?.[dayName]?.[idx];
      const finalSub = override || s.name;
      const currentPhase = zh_weeklyTimetable.subjectRotationTracker?.[finalSub] || 1;
      return `${finalSub}·Phase${currentPhase}`;
    }).join(', ');
    
    if (subjectsStr) {
      notifications.push({
        type: 'DAILY_BRIEFING',
        message: `${dayName.toUpperCase()}: Today's focus — ${subjectsStr} + Economics + Maths`,
        priority: 'High'
      });
    }
  }

  // 2. Exam Proximity (60, 30, 14, 7 days threshold)
  if (zh_notifications.exam_proximity) {
    activeExams.forEach(exam => {
      const examDate = new Date(exam.date);
      const diffDays = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
      
      const thresholds = [60, 30, 14, 7];
      if (thresholds.includes(diffDays)) {
        let message = "";
        if (diffDays === 60) message = `${exam.name} is 60 days away. Are your weekly targets on track?`;
        if (diffDays === 30) message = `30 days to ${exam.name}. Time to shift towards revision and mocks.`;
        if (diffDays === 14) message = `2 weeks to ${exam.name}. Daily mock tests recommended from here.`;
        if (diffDays === 7) message = `🚨 Critical Threshold: 7 days until ${exam.name}. Stick to revision only — no new topics.`;
        
        if (message) notifications.push({ type: 'EXAM_PROXIMITY', message, priority: 'High' });
      }
    });
  }

  // 3. Rollover Streak
  if (zh_notifications.rollover_streak && zh_targets) {
    const rolledTargets = zh_targets.filter(t => t.date === today && t.rollover_count >= 2);
    rolledTargets.forEach(t => {
      if (t.rollover_count === 2) {
        notifications.push({ 
          type: 'ROLLOVER_STREAK', 
          message: `${t.title} has rolled over twice. Want to break it into smaller parts?`,
          priority: 'Medium'
        });
      } else if (t.rollover_count === 3) {
        notifications.push({ 
          type: 'ROLLOVER_STREAK', 
          message: `${t.title} keeps getting pushed. Consider rescheduling or splitting it.`,
          priority: 'Medium'
        });
      }
    });
  }

  // 4. Completion Positive (consistency streaks)
  if (zh_notifications.completion_positive && streak) {
    if (streak.current === 3) {
      notifications.push({ type: 'STREAK', message: "3 days in a row — solid consistency.", priority: 'Low' });
    } else if (streak.current === 7) {
      notifications.push({ type: 'STREAK', message: "Week-long streak. You're building real momentum.", priority: 'Low' });
    }
  }

  return notifications;
};
