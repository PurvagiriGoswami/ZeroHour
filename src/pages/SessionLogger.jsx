import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { SUBJECT_COLORS, DAY_NAMES } from '../data';
import { getTodayStr } from '../utils/tacticalEngine';

const ALL_SUBJECTS = [
  'Maths', 'Economics', 'Physics', 'Chemistry', 'Biology',
  'Polity', 'Geography', 'History-Ancient', 'History-Medieval', 'History-Modern',
  'Revision', 'PYQ', 'Mock Test', 'Current Affairs'
];

export default function SessionLogger() {
  const {
    zh_weeklyTimetable,
    zh_sessionLogs, setSessionLogs,
    zh_sessions, setSessions,
    zh_xp, setXP,
    settings
  } = useAppStore(
    useShallow(s => ({
      zh_weeklyTimetable: s.zh_weeklyTimetable,
      zh_sessionLogs: s.zh_sessionLogs,
      setSessionLogs: s.setSessionLogs,
      zh_sessions: s.zh_sessions,
      setSessions: s.setSessions,
      zh_xp: s.zh_xp,
      setXP: s.setXP,
      settings: s.settings
    }))
  );

  const [date, setDate] = useState(() => getTodayStr());
  const [subject, setSubject] = useState('Maths');
  const [duration, setDuration] = useState(60);
  const [note, setNote] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Determine the day name of the selected date
  const dayName = useMemo(() => {
    try {
      const d = new Date(date);
      const dayIndex = d.getDay();
      const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return dayMap[dayIndex];
    } catch {
      return 'monday';
    }
  }, [date]);

  // Extract subjects recommended for the selected date
  const recommendedSubjects = useMemo(() => {
    if (!zh_weeklyTimetable?.dailySlots) return [];
    
    // Check if using new array-based structure or old object-based
    const daySlots = Array.isArray(zh_weeklyTimetable.dailySlots) 
      ? zh_weeklyTimetable.dailySlots[new Date(date).getDay()] 
      : zh_weeklyTimetable.dailySlots[dayName];
      
    if (!daySlots) return [];

    const recs = [];
    
    // Handle new structure first
    if (Array.isArray(daySlots.slots)) {
      daySlots.slots.forEach(slot => {
        if (slot.subject) recs.push(slot.subject);
      });
    } else {
      // Handle old structure
      if (daySlots.maths) recs.push('Maths');
      if (daySlots.english) recs.push('English');
      if (daySlots.economics) recs.push('Economics');
      
      if (daySlots.subjects) {
        daySlots.subjects.forEach((sub, slotIdx) => {
          const overrideSub = zh_weeklyTimetable.overrides?.[dayName]?.[slotIdx];
          recs.push(overrideSub || sub.name);
        });
      }

      if (daySlots.revision) recs.push('Revision');
      if (daySlots.pyq) recs.push('PYQ');
      if (daySlots.mock) recs.push('Mock Test');
      if (daySlots.currentAffairs) recs.push('Current Affairs');
    }

    return recs;
  }, [zh_weeklyTimetable, dayName, date]);

  // When dayName or recommendations change, adjust the default selected subject if not in the options
  useEffect(() => {
    if (recommendedSubjects.length > 0) {
      setSubject(recommendedSubjects[0]);
    } else {
      setSubject('Maths');
    }
  }, [recommendedSubjects]);

  // Pre-fill target duration based on selected subject and day template
  useEffect(() => {
    if (!zh_weeklyTimetable?.dailySlots) return;
    
    // Check if using new array-based structure or old object-based
    const daySlots = Array.isArray(zh_weeklyTimetable.dailySlots) 
      ? zh_weeklyTimetable.dailySlots[new Date(date).getDay()] 
      : zh_weeklyTimetable.dailySlots[dayName];

    if (!daySlots) return;

    // Handle new structure
    if (Array.isArray(daySlots.slots)) {
      const matchingSlot = daySlots.slots.find(slot => slot.subject === subject);
      if (matchingSlot && matchingSlot.duration) {
        setDuration(matchingSlot.duration);
        return;
      }
    } else {
      // Handle old structure
      // Core slots
      if (subject === 'Maths' && daySlots.maths) {
        setDuration(daySlots.maths.duration || 180);
        return;
      }
      if (subject === 'English' && daySlots.english) {
        setDuration(daySlots.english.duration || 60);
        return;
      }
      if (subject === 'Economics' && daySlots.economics) {
        setDuration(daySlots.economics.duration || 60);
        return;
      }

      // Extras
      if (subject === 'Revision' && daySlots.revision) {
        setDuration(daySlots.revision.duration || 150);
        return;
      }
      if (subject === 'PYQ' && daySlots.pyq) {
        setDuration(daySlots.pyq.duration || 90);
        return;
      }
    }

    // Default general duration fallback
    setDuration(60);
  }, [subject, dayName, zh_weeklyTimetable, date]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const xpGained = 8;
    const sessionId = `session_${Date.now()}`;
    const timestampStr = new Date().toISOString();

    // 1. Add to new zh_sessionLogs slice
    const newLog = {
      id: sessionId,
      date,
      subject,
      duration: parseInt(duration) || 60,
      note,
      xp_earned: xpGained,
      timestamp: timestampStr
    };
    setSessionLogs([newLog, ...zh_sessionLogs]);

    // 2. Add to existing zh_sessions for backward compatibility & analytics pipeline
    const newSession = {
      id: sessionId,
      date,
      timestamp: timestampStr,
      subject,
      topic: note || 'Study Session',
      phase: 'Logger',
      duration: parseInt(duration) || 60,
      mood: null,
      notes: note
    };
    setSessions([newSession, ...zh_sessions]);

    // 3. Add XP
    setXP(zh_xp + xpGained);

    // Toast feedback
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);

    // Reset notes/inputs
    setNote('');
  };

  // Get total logged time for the selected date
  const selectedDateTotalHours = useMemo(() => {
    const mins = zh_sessionLogs
      .filter(log => log.date === date)
      .reduce((acc, log) => acc + log.duration, 0);
    return Math.round((mins / 60) * 10) / 10;
  }, [zh_sessionLogs, date]);

  // Today's logs list
  const todayLogs = useMemo(() => {
    return zh_sessionLogs.filter(log => log.date === date);
  }, [zh_sessionLogs, date]);

  const dailyGoal = settings.dailyStudyGoal || 6;
  const goalProgressPercent = Math.min(100, (selectedDateTotalHours / dailyGoal) * 100);

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: 100 }}>
      {/* Toast Alert */}
      {showToast && (
        <div style={{ 
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', 
          background: 'var(--bg2)', padding: '12px 20px', borderRadius: 8, border: '1px solid var(--green)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', gap: 15, alignItems: 'center'
        }}>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>✓ SESSION LOGGED | +8 XP AWARDED TO RANK PROGRESS</div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 25 }}>
        <h1 className="card-title" style={{ marginBottom: 5 }}>TACTICAL SESSION LOGGER</h1>
        <p style={{ color: 'var(--text4)', fontSize: 11 }}>Log completed study hours to secure rank progression and track analytics.</p>
      </div>

      <div className="g2">
        {/* Logger Form */}
        <div className="card">
          <div className="label-caps" style={{ marginBottom: 20 }}>Log Entry Parameters</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            
            {/* Date Input */}
            <div>
              <label className="label-caps" style={{ fontSize: 9, display: 'block', marginBottom: 5 }}>DEPLOYMENT DATE</label>
              <input 
                type="date" 
                className="inp" 
                style={{ width: '100%' }} 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                required 
              />
            </div>

            {/* Subject Selector */}
            <div className="g2">
              <div>
                <label className="label-caps" style={{ fontSize: 9, display: 'block', marginBottom: 5 }}>SECTOR (SUBJECT)</label>
                <select 
                  className="inp" 
                  style={{ width: '100%' }} 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                >
                  {/* Recommended subjects for this day */}
                  {recommendedSubjects.length > 0 && (
                    <optgroup label="RECOMMENDED FOR TODAY">
                      {recommendedSubjects.map(s => (
                        <option key={`rec-${s}`} value={s}>{s}</option>
                      ))}
                    </optgroup>
                  )}
                  {/* General subjects fallback */}
                  <optgroup label="ALL SECTORS">
                    {ALL_SUBJECTS.map(s => (
                      <option key={`all-${s}`} value={s}>{s}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Duration Input */}
              <div>
                <label className="label-caps" style={{ fontSize: 9, display: 'block', marginBottom: 5 }}>DURATION (MINUTES)</label>
                <input 
                  type="number" 
                  className="inp" 
                  style={{ width: '100%' }} 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)} 
                  min="1" 
                  max="1440" 
                  required 
                />
              </div>
            </div>

            {/* Note Input */}
            <div>
              <label className="label-caps" style={{ fontSize: 9, display: 'block', marginBottom: 5 }}>SESSION DESCRIPTION / TARGET TOPIC</label>
              <input 
                type="text" 
                className="inp" 
                style={{ width: '100%' }} 
                placeholder="e.g. Practiced 40 Algebra questions, Revised mechanics formulas" 
                value={note} 
                onChange={e => setNote(e.target.value)} 
              />
            </div>

            <button type="submit" className="btn btn-g" style={{ padding: 12, fontWeight: 'bold', marginTop: 10 }}>
              LOG SESSION & EARN +8 XP
            </button>
          </form>
        </div>

        {/* Daily Capacity Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Daily study time progress */}
          <div className="card" style={{ padding: 25 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <div>
                <h3 className="label-caps" style={{ fontSize: 10, color: 'var(--text4)' }}>DAILY PROGRESS LOG</h3>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginTop: 5 }}>
                  {selectedDateTotalHours}h <span style={{ fontSize: 13, color: 'var(--text4)' }}>/ {dailyGoal}h Goal</span>
                </div>
              </div>
              <div style={{ fontSize: 32 }}>⏱</div>
            </div>

            <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden', marginBottom: 15 }}>
              <div style={{ 
                height: '100%', 
                width: `${goalProgressPercent}%`, 
                background: goalProgressPercent >= 100 ? 'var(--green)' : 'var(--indigo)',
                transition: 'width 0.4s ease'
              }} />
            </div>
            
            <span style={{ fontSize: 10, color: 'var(--text4)' }}>
              {goalProgressPercent >= 100 
                ? 'Daily target secured. Solid work, Commander.' 
                : `${Math.round((dailyGoal - selectedDateTotalHours) * 10) / 10} hours remaining to secure daily target.`
              }
            </span>
          </div>

          {/* Today's Logged History */}
          <div className="card" style={{ flexGrow: 1 }}>
            <div className="label-caps" style={{ marginBottom: 15 }}>SECURED SESSIONS ON {date}</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 250, overflowY: 'auto' }}>
              {todayLogs.map(log => {
                const subColor = SUBJECT_COLORS[log.subject] || 'var(--border)';
                return (
                  <div key={log.id} style={{ 
                    padding: 12, 
                    background: 'var(--bg3)', 
                    borderLeft: `3px solid ${subColor}`,
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff' }}>{log.subject.toUpperCase()}</div>
                      <div style={{ fontSize: 9, color: 'var(--text4)', marginTop: 2 }}>{log.note || 'No notes added'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text2)' }}>⏱ {log.duration} min</div>
                      <div style={{ fontSize: 8, color: 'var(--green)', marginTop: 2 }}>+{log.xp_earned} XP</div>
                    </div>
                  </div>
                );
              })}

              {todayLogs.length === 0 && (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--text4)', fontSize: 11, fontStyle: 'italic' }}>
                  No sessions logged for this date.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
