import { useAppStore } from '../store/useStore';
import { getTodayStr } from './tacticalEngine';

export const triggerNotifications = (state) => {
  const { 
    zh_notifications, 
    zh_targets, 
    zh_sessions, 
    zh_exam_registrations,
    streak,
    profile
  } = state;

  if (!zh_notifications.enabled) return [];

  const notifications = [];
  const today = getTodayStr();
  const now = new Date();

  // 1. Topic Neglect
  if (zh_notifications.topic_neglect) {
    // Logic: check zh_sessions for topics not appeared in N days
    // This requires a full topic list and last appearance date
    // Simplified: check a few key topics
  }

  // 2. Exam Proximity
  if (zh_notifications.exam_proximity) {
    zh_exam_registrations.forEach(exam => {
      const examDate = new Date(exam.exam_date);
      const diffDays = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
      
      const thresholds = [60, 30, 14, 7];
      if (thresholds.includes(diffDays)) {
        let message = "";
        if (diffDays === 60) message = `${exam.exam_name} is 60 days away. Are your weekly targets on track?`;
        if (diffDays === 30) message = `30 days to ${exam.exam_name}. Time to shift towards revision and mocks.`;
        if (diffDays === 14) message = `2 weeks to ${exam.exam_name}. Daily mock tests recommended from here.`;
        if (diffDays === 7) message = `${exam.exam_name} is next week. Stick to revision only — no new topics.`;
        
        if (message) notifications.push({ type: 'EXAM_PROXIMITY', message, priority: 'High' });
      }
    });
  }

  // 3. Rollover Streak
  if (zh_notifications.rollover_streak) {
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

  // 4. Completion Positive
  if (zh_notifications.completion_positive) {
    if (streak.current === 3) {
      notifications.push({ type: 'STREAK', message: "3 days in a row — solid consistency.", priority: 'Low' });
    } else if (streak.current === 7) {
      notifications.push({ type: 'STREAK', message: "Week-long streak. You're building real momentum.", priority: 'Low' });
    }
  }

  // Limit to 2 per day (contextual)
  return notifications.slice(0, 1); 
};
