import React from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { SUBJECT_COLORS } from '../data';
import { getTodayISO } from '../utils/dateUtils';

export default function HQDashboard({ onNav }) {
  const {
    derived_todayCompletion,
    derived_subjectTimeToday,
    derived_weeklyHours,
    derived_examCountdowns,
    derived_streak,
    exams,
    dailyTargets,
    sessionLog
  } = useAppStore(
    useShallow(s => ({
      derived_todayCompletion: s.derived_todayCompletion,
      derived_subjectTimeToday: s.derived_subjectTimeToday,
      derived_weeklyHours: s.derived_weeklyHours,
      derived_examCountdowns: s.derived_examCountdowns,
      derived_streak: s.derived_streak,
      exams: s.exams,
      dailyTargets: s.dailyTargets,
      sessionLog: s.sessionLog
    }))
  );

  const today = getTodayISO();
  const todayTargets = dailyTargets[today] || [];
  const todaySessions = sessionLog[today] || [];
  const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.actualMinutes || 0), 0);
  const todayHours = (todayMinutes / 60).toFixed(1);

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 className="card-title">Welcome back!</h1>
        <p style={{ color: 'var(--text4)', fontSize: '14px', marginTop: '5px' }}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text4)', fontWeight: '700', marginBottom: '6px' }}>DAILY TARGETS</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--accent)' }}>{derived_todayCompletion}%</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text4)', fontWeight: '700', marginBottom: '6px' }}>STUDY STREAK</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--accent)' }}>{derived_streak}</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text4)', fontWeight: '700', marginBottom: '6px' }}>TODAY'S HOURS</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--accent)' }}>{todayHours}h</div>
        </div>
      </div>

      {/* Exam Countdowns */}
      {derived_examCountdowns.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text)', marginBottom: '12px' }}>Upcoming Exams</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {derived_examCountdowns.map(exam => {
              const isUrgent = exam.daysLeft <= 30;
              return (
                <div key={exam.id} className="card" style={{ padding: '15px', borderLeft: isUrgent ? '4px solid var(--red)' : '4px solid var(--accent)' }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text)' }}>{exam.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: isUrgent ? 'var(--red)' : 'var(--accent)', margin: '8px 0' }}>{exam.daysLeft} days</div>
                  <div style={{ fontSize: '11px', color: 'var(--text4)' }}>
                    {new Date(exam.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's Targets */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text)' }}>Today's Targets</h2>
          <button className="btn" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => onNav('targets')}>View All</button>
        </div>
        {todayTargets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todayTargets.slice(0, 5).map(target => {
              const color = SUBJECT_COLORS[target.subject] || 'var(--accent)';
              return (
                <div key={target.id} className="card" style={{ padding: '12px', borderLeft: `4px solid ${color}`, background: target.status === 'done' ? 'rgba(34,197,94,0.05)' : 'var(--bg3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text)' }}>{target.subject}</div>
                      {target.topic && <div style={{ fontSize: '11px', color: 'var(--text4)' }}>{target.topic}</div>}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: target.status === 'done' ? 'var(--green)' : target.status === 'in_progress' ? 'var(--accent)' : 'var(--text4)' }}>
                      {target.status === 'done' ? '✓ Done' : target.status === 'in_progress' ? '● In Progress' : 'Pending'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card" style={{ padding: '18px', textAlign: 'center', color: 'var(--text4)', fontSize: '13px' }}>No targets set for today</div>
        )}
      </div>

      {/* Weekly Hours */}
      {derived_weeklyHours.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text)', marginBottom: '12px' }}>This Week</h2>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', height: '120px' }}>
              {derived_weeklyHours.slice().reverse().map((day) => {
                const height = Math.max(8, Math.min(100, (day.minutes / 360) * 100));
                const date = new Date(day.date + 'T00:00:00');
                return (
                  <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text4)' }}>{date.toLocaleDateString(undefined, { weekday: 'narrow' })}</div>
                    <div style={{ width: '100%', height: `${height}%`, background: 'var(--accent)', borderRadius: '4px', transition: 'height 0.3s ease' }} />
                    <div style={{ fontSize: '9px', color: 'var(--text4)', fontWeight: '700' }}>{(day.minutes / 60).toFixed(1)}h</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Subject Breakdown */}
      {Object.keys(derived_subjectTimeToday).length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text)', marginBottom: '12px' }}>Subject Breakdown</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {Object.entries(derived_subjectTimeToday).map(([subject, mins]) => {
              const color = SUBJECT_COLORS[subject] || 'var(--accent)';
              return (
                <div key={subject} className="card" style={{ padding: '15px', borderLeft: `4px solid ${color}` }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text)' }}>{subject}</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: color, marginTop: '8px' }}>{(mins / 60).toFixed(1)}h</div>
                  <div style={{ fontSize: '11px', color: 'var(--text4)' }}>{mins} mins</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
