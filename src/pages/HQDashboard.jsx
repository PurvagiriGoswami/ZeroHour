import { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { MASTER_TOPICS, RANKS, SUBJECT_COLORS, CAPF_EXTRA_TOPICS } from '../data';
import { 
  getTodayStr, 
  getPhase, 
  getTopicDueStatus,
  getPrepProgress,
  calculateRank,
  getSystemExams
} from '../utils/tacticalEngine';

export default function HQDashboard({ onNav }) {
  const { 
    zh_sessions, zh_topicMap, zh_xp, zh_milestones, profile, streak, zh_targets,
    zh_examList, setExamList, zh_weeklyTimetable, setWeeklyTimetable,
    zh_sessionLogs, settings, setSettings
  } = useAppStore(
    useShallow(s => ({
      zh_sessions: s.zh_sessions,
      zh_topicMap: s.zh_topicMap,
      zh_xp: s.zh_xp,
      zh_milestones: s.zh_milestones,
      profile: s.profile,
      streak: s.streak,
      zh_targets: s.zh_targets,
      zh_examList: s.zh_examList,
      setExamList: s.setExamList,
      zh_weeklyTimetable: s.zh_weeklyTimetable,
      setWeeklyTimetable: s.setWeeklyTimetable,
      zh_sessionLogs: s.zh_sessionLogs,
      settings: s.settings,
      setSettings: s.setSettings
    }))
  );

  const today = getTodayStr();
  const todayDay = new Date().getDay();

  const [dismissedCapfPrompt, setDismissedCapfPrompt] = useState(false);

  // Active exams for countdown based on new config-driven zh_examList
  const activeExams = useMemo(() => {
    return (zh_examList || [])
      .filter(e => e.active && e.date && new Date(e.date) >= new Date(today))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [zh_examList, today]);

  const primaryExam = activeExams[0];
  const secondaryExams = activeExams.slice(1);

  const primaryDaysRemaining = useMemo(() => {
    if (!primaryExam?.date) return 0;
    return Math.ceil((new Date(primaryExam.date) - new Date(today)) / (1000 * 60 * 60 * 24));
  }, [primaryExam, today]);

  const getUrgencyInfo = (days) => {
    if (days < 14) return { label: 'Final Sprint', color: 'var(--red)' };
    if (days < 30) return { label: 'Revision Mode', color: 'var(--orange)' };
    if (days < 60) return { label: 'Consolidation', color: 'var(--amber)' };
    return { label: 'Building Phase', color: 'var(--indigo)' };
  };

  const cds2Exam = useMemo(() => {
    return (zh_examList || []).find(e => e.id === 'cds2');
  }, [zh_examList]);

  const showCapfPrompt = useMemo(() => {
    if (!cds2Exam || !cds2Exam.date) return false;
    const passed = new Date(cds2Exam.date) < new Date(today);
    const notSwitched = zh_weeklyTimetable?.templateId !== 'capf-prep-v1';
    const notDismissed = !settings?.dismissedCapfPrompt && !dismissedCapfPrompt;
    return passed && notSwitched && notDismissed;
  }, [cds2Exam, today, zh_weeklyTimetable, settings, dismissedCapfPrompt]);

  const loadCapfTemplate = () => {
    const capfSlots = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      const base = zh_weeklyTimetable.dailySlots[day] || {};
      capfSlots[day] = { ...base };
      
      // Relabel maths to Maths PYQ
      if (capfSlots[day].maths) {
        capfSlots[day].maths = { 
          ...capfSlots[day].maths, 
          label: 'Maths PYQ (CDS/AFCAT/CAPF)' 
        };
      }

      // Add CAPF Paper 2 on Mon/Wed/Fri
      if (day === 'monday' || day === 'wednesday' || day === 'friday') {
        capfSlots[day].capfPaper2 = {
          duration: 90,
          components: ['Comprehension', 'English', 'Logical/Analytical Reasoning', 'Numerical Ability']
        };
      }

      // Add English PYQ on Tue/Thu
      if (day === 'tuesday' || day === 'thursday') {
        capfSlots[day].englishPYQ = {
          duration: 45
        };
      }
    });

    // Merge CAPF extra topics into weekly timetable structure
    const updatedTimetable = {
      ...zh_weeklyTimetable,
      templateId: 'capf-prep-v1',
      dailySlots: capfSlots
    };

    setWeeklyTimetable(updatedTimetable);
    setSettings({
      ...settings,
      targetExam: 'CAPF'
    });
    alert('Switched to CAPF Prep Template successfully.');
  };

  const handleDismissCapfPrompt = () => {
    setSettings({
      ...settings,
      dismissedCapfPrompt: true
    });
    setDismissedCapfPrompt(true);
  };

  const rankInfo = calculateRank(zh_xp, RANKS);

  // Daily Targets Summary
  const dailyTargets = zh_targets.filter(t => t.date === today);
  const completedTargets = dailyTargets.filter(t => t.status === 'complete').length;
  const targetRate = dailyTargets.length > 0 ? (completedTargets / dailyTargets.length) * 100 : 0;

  // Today's day name map
  const todayDayName = useMemo(() => {
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayMap[todayDay];
  }, [todayDay]);

  // Today's focus slots from timetable
  const todaySlots = useMemo(() => {
    if (!zh_weeklyTimetable?.dailySlots?.[todayDayName]) return [];
    const slots = zh_weeklyTimetable.dailySlots[todayDayName];
    const list = [];
    if (slots.maths) list.push(slots.maths.label || 'Maths Core');
    if (slots.economics) list.push(slots.economics.label === 'revision' ? 'Economics Revision' : 'Economics Core');
    if (slots.subjects) {
      slots.subjects.forEach((s, idx) => {
        const override = zh_weeklyTimetable.overrides?.[todayDayName]?.[idx];
        list.push(override || s.name);
      });
    }
    if (slots.revision) list.push('Week Revision');
    if (slots.pyq) list.push('PYQ Practice');
    if (slots.currentAffairs) list.push('Current Affairs');
    if (slots.mock) list.push('Full Mock Test');
    return list;
  }, [zh_weeklyTimetable, todayDayName]);

  // Daily logged hours
  const todayStudyHours = useMemo(() => {
    const mins = (zh_sessionLogs || [])
      .filter(log => log.date === today)
      .reduce((acc, log) => acc + log.duration, 0);
    return Math.round((mins / 60) * 10) / 10;
  }, [zh_sessionLogs, today]);

  const dueReviews = useMemo(() => {
    const items = [];
    Object.entries(zh_topicMap).forEach(([key, data]) => {
      const status = getTopicDueStatus(key, data, today);
      if (status?.some(s => s.dueToday || s.overdue > 0)) {
        items.push({ key, name: key.split('::')[1], subject: key.split('::')[0] });
      }
    });
    return items;
  }, [zh_topicMap, today]);

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: 100 }}>
      {/* ── TOP HEADER: XP & RANK ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={{ fontSize: 32 }}>{rankInfo.icon}</div>
          <div>
            <div className="label-caps" style={{ fontSize: 10, color: 'var(--text4)' }}>Current Rank</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--yellow)' }}>{rankInfo.title.toUpperCase()}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="label-caps" style={{ fontSize: 10 }}>Total XP</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--green)' }}>{zh_xp}</div>
        </div>
      </div>

      <div className="rank-progress" style={{ height: 4, background: 'var(--bg4)', borderRadius: 2, marginBottom: 30, position: 'relative' }}>
        <div style={{ height: '100%', width: `${rankInfo.progress}%`, background: 'var(--yellow)', borderRadius: 2, transition: '1s' }} />
        {rankInfo.nextRank && (
          <div style={{ position: 'absolute', right: 0, top: 8, fontSize: 8, color: 'var(--text4)' }}>
            NEXT: {rankInfo.nextRank.title} ({rankInfo.nextRank.minXP} XP)
          </div>
        )}
      </div>

      {/* ── 1. EXAM COUNTDOWN HEADER (REBUILT) ── */}
      <div style={{ marginBottom: 30 }}>
        {primaryExam && (
          <div className="card" style={{ padding: 25, borderColor: getUrgencyInfo(primaryDaysRemaining).color, borderWidth: 2, marginBottom: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <div>
                <span className="label-caps" style={{ fontSize: 12, color: getUrgencyInfo(primaryDaysRemaining).color }}>{primaryExam.name}</span>
                <div style={{ fontSize: 32, fontWeight: 900, marginTop: 5 }}>{primaryDaysRemaining} DAYS</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 800 }}>{new Date(primaryExam.date).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                <div className="label-caps" style={{ fontSize: 10, color: 'var(--text4)', marginTop: 4 }}>{getUrgencyInfo(primaryDaysRemaining).label}</div>
              </div>
            </div>
            <div style={{ height: 8, background: 'var(--bg4)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, 100 - (primaryDaysRemaining / 365 * 100)))}%`, background: getUrgencyInfo(primaryDaysRemaining).color, transition: '1s' }} />
            </div>
          </div>
        )}

        {secondaryExams.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${secondaryExams.length}, 1fr)`, gap: 15 }}>
            {secondaryExams.map(ex => {
              const days = Math.ceil((new Date(ex.date) - new Date(today)) / (1000 * 60 * 60 * 24));
              return (
                <div key={ex.id} className="card" style={{ padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="label-caps" style={{ fontSize: 10 }}>{ex.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 900 }}>{days}d</span>
                </div>
              );
            })}
          </div>
        )}
      </div>



      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* ── 2. DAILY MISSION CARD ── */}
          <div className="card" style={{ borderColor: 'var(--indigo)', background: 'rgba(99, 102, 241, 0.02)' }}>
            <div className="label-caps" style={{ color: 'var(--indigo)', marginBottom: 20 }}>Daily Mission Briefing</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div className="mission-item">
                <div className="label-caps" style={{ fontSize: 9, color: 'var(--text4)' }}>Today's Focus Sectors</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
                  {todaySlots.map(s => {
                    const color = SUBJECT_COLORS[s] || 'var(--indigo)';
                    return (
                      <span key={s} className="badge" style={{ background: `${color}15`, color: color, borderColor: `${color}30`, border: '1px solid', fontSize: 9 }}>
                        {s.toUpperCase()}
                      </span>
                    );
                  })}
                  {todaySlots.length === 0 && <span style={{ fontSize: 12, color: 'var(--text4)' }}>Rest / Off-day</span>}
                </div>
              </div>
              <div className="mission-item" style={{ paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>Daily Targets</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: targetRate >= 100 ? 'var(--green)' : 'var(--text)' }}>{completedTargets} / {dailyTargets.length}</div>
                </div>
                <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden', cursor: 'pointer' }} onClick={() => onNav('targets')}>
                  <div style={{ height: '100%', width: `${targetRate}%`, background: 'var(--green)', transition: '0.5s' }} />
                </div>
              </div>
              <div className="mission-item" style={{ paddingTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Study Time Target</div>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{todayStudyHours}h / {settings.dailyStudyGoal || 6}h</div>
                </div>
                <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (todayStudyHours / (settings.dailyStudyGoal || 6)) * 100)}%`, background: 'var(--indigo)', transition: '0.5s' }} />
                </div>
              </div>
              {dueReviews.length > 0 && (
                <div className="mission-item" style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--red)', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--red)' }}>⚠ {dueReviews.length} REVISIONS DUE</div>
                </div>
              )}
            </div>
          </div>

          {/* ── 19. STREAK TRACKER ── */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 5 }}>🔥</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{streak.current || 0} DAYS</div>
            <div className="label-caps" style={{ fontSize: 10, marginTop: 5 }}>Current Streak</div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 15 }}>
              {[...Array(7)].map((_, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: i < 5 ? 'var(--green)' : 'var(--bg4)' }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. DUE TODAY REVIEWS ── */}
        <div className="card" style={{ borderColor: dueReviews.length > 0 ? 'var(--red)' : 'var(--border)' }}>
          <div className="label-caps" style={{ color: dueReviews.length > 0 ? 'var(--red)' : 'var(--text4)', marginBottom: 20 }}>Intel Recovery Queue (SRS)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dueReviews.length > 0 ? dueReviews.slice(0, 6).map((item, idx) => (
              <div key={idx} className="card-sub" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{item.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text4)' }}>{item.subject}</div>
                </div>
                <button className="btn-icon" style={{ padding: '5px 10px', fontSize: 10, borderColor: 'var(--green)', color: 'var(--green)' }}>REVIEW</button>
              </div>
            )) : (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>✅</div>
                <div style={{ fontSize: 12, color: 'var(--text4)' }}>All revisions completed for today.</div>
              </div>
            )}
            {dueReviews.length > 6 && (
              <button className="btn" onClick={() => onNav('queue')} style={{ width: '100%', fontSize: 10 }}>VIEW ALL {dueReviews.length} REVISIONS</button>
            )}
          </div>
        </div>
      </div>

      {/* ── 18. MILESTONE ALERTS ── */}
      {zh_milestones.length > 0 && (
        <div className="card" style={{ marginTop: 25, borderColor: 'var(--amber)' }}>
          <div className="label-caps" style={{ color: 'var(--amber)', marginBottom: 15 }}>Recent Achievements</div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10 }}>
            {zh_milestones.map(m => (
              <div key={m.id} style={{ minWidth: 100, textAlign: 'center', padding: 10, background: 'var(--bg3)', borderRadius: 8 }}>
                <div style={{ fontSize: 20 }}>{m.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 800, marginTop: 5 }}>{m.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .card-sub { background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; }
        .pulse-border { animation: pulse-yellow 2s infinite; }
        @keyframes pulse-yellow {
          0% { border-color: rgba(255, 215, 0, 0.4); }
          50% { border-color: rgba(255, 215, 0, 1); }
          100% { border-color: rgba(255, 215, 0, 0.4); }
        }
      `}</style>
      {/* CAPF Switch Suggestion Modal */}
      {showCapfPrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card fade-in" style={{ maxWidth: 450, width: '100%', border: '1px solid var(--amber)', padding: 30 }}>
            <div className="label-caps" style={{ color: 'var(--amber)', marginBottom: 15, fontSize: 11 }}>COMMUNICATION DETECTED</div>
            <h3 style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 15 }}>CDS-II Campaign Concluded</h3>
            <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 25 }}>
              The CDS-II exam timeline is complete. Would you like to switch your operational study template to CAPF prep?
              This adjusts your daily loadout (adds CAPF Paper 2 slot, English PYQ, relabels Maths to Maths PYQ, and loads specific CAPF topics).
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" style={{ flex: 1 }} onClick={handleDismissCapfPrompt}>DISMISS</button>
              <button className="btn btn-g" style={{ flex: 1 }} onClick={loadCapfTemplate}>SWITCH TO CAPF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
