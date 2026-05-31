import { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { MASTER_TOPICS, RANKS, WEEKLY_ROTATION } from '../data';
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
    zh_sessions, zh_topicMap, zh_pomodoro_today, zh_xp, zh_milestones, profile, streak, zh_targets,
    zh_exam_registrations, setExamRegistrations
  } = useAppStore(
    useShallow(s => ({
      zh_sessions: s.zh_sessions,
      zh_topicMap: s.zh_topicMap,
      zh_pomodoro_today: s.zh_pomodoro_today,
      zh_xp: s.zh_xp,
      zh_milestones: s.zh_milestones,
      profile: s.profile,
      streak: s.streak,
      zh_targets: s.zh_targets,
      zh_exam_registrations: s.zh_exam_registrations,
      setExamRegistrations: s.setExamRegistrations
    }))
  );

  const today = getTodayStr();
  const todayDay = new Date().getDay();

  // Auto-refresh system exams
  useEffect(() => {
    const sysExams = getSystemExams();
    const hasCds1 = zh_exam_registrations.some(e => e.exam_name === 'CDS_I' && e.is_active);
    const hasCds2 = zh_exam_registrations.some(e => e.exam_name === 'CDS_II' && e.is_active);
    
    if (!hasCds1 || !hasCds2) {
      // Merge system exams into registrations
      const nonSystem = zh_exam_registrations.filter(e => !e.is_system_computed);
      setExamRegistrations([...nonSystem, ...sysExams]);
    }
  }, []);

  const prep = getPrepProgress(zh_exam_registrations);
  const phase = getPhase();
  const rankInfo = calculateRank(zh_xp, RANKS);

  // Daily Targets Summary
  const dailyTargets = zh_targets.filter(t => t.date === today);
  const completedTargets = dailyTargets.filter(t => t.status === 'complete').length;
  const targetRate = dailyTargets.length > 0 ? (completedTargets / dailyTargets.length) * 100 : 0;

  // Sorted active exams for countdown
  const activeExams = useMemo(() => {
    return [...zh_exam_registrations]
      .filter(e => new Date(e.exam_date) >= new Date(today))
      .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));
  }, [zh_exam_registrations, today]);

  const primaryExam = activeExams[0];
  const secondaryExams = activeExams.slice(1);

  const getUrgencyInfo = (days) => {
    if (days < 14) return { label: 'Final Sprint', color: 'var(--red)' };
    if (days < 30) return { label: 'Revision Mode', color: 'var(--orange)' };
    if (days < 60) return { label: 'Consolidation', color: 'var(--amber)' };
    return { label: 'Building Phase', color: 'var(--indigo)' };
  };

  // 2. Daily Mission (Auto-generated)
  const rotation = WEEKLY_ROTATION[todayDay];
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
          <div className="card" style={{ padding: 25, borderColor: getUrgencyInfo(prep.nearestExam?.daysRemaining).color, borderWidth: 2, marginBottom: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <div>
                <span className="label-caps" style={{ fontSize: 12, color: getUrgencyInfo(prep.nearestExam?.daysRemaining).color }}>{primaryExam.exam_name.replace('_', ' ')}</span>
                <div style={{ fontSize: 32, fontWeight: 900, marginTop: 5 }}>{prep.nearestExam?.daysRemaining} DAYS</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 800 }}>{new Date(primaryExam.exam_date).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                <div className="label-caps" style={{ fontSize: 10, color: 'var(--text4)', marginTop: 4 }}>{getUrgencyInfo(prep.nearestExam?.daysRemaining).label}</div>
              </div>
            </div>
            <div style={{ height: 8, background: 'var(--bg4)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${100 - (prep.nearestExam?.daysRemaining / 365 * 100)}%`, background: getUrgencyInfo(prep.nearestExam?.daysRemaining).color, transition: '1s' }} />
            </div>
          </div>
        )}

        {secondaryExams.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${secondaryExams.length}, 1fr)`, gap: 15 }}>
            {secondaryExams.map(ex => {
              const days = Math.ceil((new Date(ex.exam_date) - new Date(today)) / (1000 * 60 * 60 * 24));
              return (
                <div key={ex.id} className="card" style={{ padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="label-caps" style={{ fontSize: 10 }}>{ex.exam_name.replace('_', ' ')}</span>
                  <span style={{ fontSize: 12, fontWeight: 900 }}>{days}d</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {phase.id === 'CDS' && (
        <div className="card pulse-border" style={{ marginBottom: 30, borderColor: 'var(--yellow)', background: 'rgba(255, 215, 0, 0.05)', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--yellow)' }}>🎖 {phase.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text4)' }}>{phase.desc}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* ── 2. DAILY MISSION CARD ── */}
          <div className="card" style={{ borderColor: 'var(--indigo)', background: 'rgba(99, 102, 241, 0.02)' }}>
            <div className="label-caps" style={{ color: 'var(--indigo)', marginBottom: 20 }}>Daily Mission Briefing</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div className="mission-item">
                <div className="label-caps" style={{ fontSize: 9, color: 'var(--text4)' }}>Block 1 Focus</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{rotation.block1}</div>
              </div>
              <div className="mission-item">
                <div className="label-caps" style={{ fontSize: 9, color: 'var(--text4)' }}>Block 2 Focus</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{rotation.block2}</div>
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
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Pomodoro Target</div>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{zh_pomodoro_today} / 8 🍅</div>
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

      <style jsx>{`
        .card-sub { background: var(--bg3); border: 1px solid var(--border); borderRadius: 8px; }
        .pulse-border { animation: pulse-yellow 2s infinite; }
        @keyframes pulse-yellow {
          0% { border-color: rgba(255, 215, 0, 0.4); }
          50% { border-color: rgba(255, 215, 0, 1); }
          100% { border-color: rgba(255, 215, 0, 0.4); }
        }
      `}</style>
    </div>
  );
}
