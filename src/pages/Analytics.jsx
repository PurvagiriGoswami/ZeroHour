import React from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { SUBJECT_COLORS } from '../data';

export default function Analytics() {
  const { derived_analytics } = useAppStore(
    useShallow(s => ({ derived_analytics: s.derived_analytics }))
  );

  const {
    totalStudyMinutes30d = 0,
    subjectAccuracy = [],
    subjectMinutes = {},
    weeklyPlanAdherence = [],
    calendarData = []
  } = derived_analytics || {};

  const totalHours30d = (totalStudyMinutes30d / 60).toFixed(1);
  const avgHoursPerDay = totalStudyMinutes30d > 0 ? 
    (totalHours30d / Math.min(30, weeklyPlanAdherence.length || 30)).toFixed(1) : '0';

  // Group calendar data by week for heatmap
  const groupByWeek = (data) => {
    const weeks = [];
    let currentWeek = [];
    data.forEach((day, index) => {
      const date = new Date(day.date + 'T00:00:00');
      const dayOfWeek = date.getDay(); // 0 = Sunday
      
      if (index === 0) {
        // Fill leading days with empty
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push(null);
        }
      }
      
      currentWeek.push(day);
      
      if (dayOfWeek === 6 || index === data.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    return weeks;
  };

  const weeks = groupByWeek(calendarData);

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 className="card-title">Analytics</h1>
        <p style={{ color: 'var(--text4)', fontSize: '14px', marginTop: '5px' }}>Last 90 days</p>
      </div>

      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text4)', fontWeight: '700', marginBottom: '6px' }}>TOTAL HOURS</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--accent)' }}>{totalHours30d}h</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text4)', fontWeight: '700', marginBottom: '6px' }}>AVG PER DAY</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--accent)' }}>{avgHoursPerDay}h</div>
        </div>
      </div>

      {/* Study Streak Calendar */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text)', marginBottom: '12px' }}>Study Streak</h2>
        <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '8px', minWidth: 'max-content' }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return <div key={dayIndex} style={{ width: '12px', height: '12px' }} />;
                  }
                  const color = day.hasStudy ? 'var(--green)' : 'var(--bg4)';
                  return (
                    <div 
                      key={day.date} 
                      title={`${new Date(day.date + 'T00:00:00').toLocaleDateString()} - ${day.hasStudy ? 'Studied' : 'No study'}`}
                      style={{ 
                        width: '12px', 
                        height: '12px', 
                        background: color, 
                        borderRadius: '2px' 
                      }} 
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Adherence Heatmap */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text)', marginBottom: '12px' }}>Weekly Adherence</h2>
        <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '8px', minWidth: 'max-content' }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return <div key={dayIndex} style={{ width: '12px', height: '12px' }} />;
                  }
                  let color = 'var(--bg4)';
                  if (day.adherencePct !== null) {
                    if (day.adherencePct >= 80) color = 'var(--green)';
                    else if (day.adherencePct >= 50) color = 'var(--accent)';
                    else if (day.adherencePct > 0) color = 'var(--red)';
                  }
                  return (
                    <div 
                      key={day.date} 
                      title={`${new Date(day.date + 'T00:00:00').toLocaleDateString()} - ${day.adherencePct !== null ? day.adherencePct + '%' : 'No targets'}`}
                      style={{ 
                        width: '12px', 
                        height: '12px', 
                        background: color, 
                        borderRadius: '2px' 
                      }} 
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject Minutes Breakdown */}
      {Object.keys(subjectMinutes).length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text)', marginBottom: '12px' }}>Time by Subject</h2>
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(subjectMinutes)
                .sort(([, a], [, b]) => b - a)
                .map(([subject, mins]) => {
                  const percentage = totalStudyMinutes30d > 0 ? Math.round((mins / totalStudyMinutes30d) * 100) : 0;
                  const color = SUBJECT_COLORS[subject] || 'var(--accent)';
                  return (
                    <div key={subject}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>{subject}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text4)' }}>{(mins / 60).toFixed(1)}h • {percentage}%</div>
                      </div>
                      <div style={{
                        height: '8px',
                        background: 'var(--bg4)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${percentage}%`,
                          background: color,
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Subject Accuracy & Weak Subjects */}
      {subjectAccuracy.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text)', marginBottom: '12px' }}>Accuracy</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {subjectAccuracy.map(subj => {
              const color = subj.weak ? 'var(--red)' : 'var(--green)';
              return (
                <div key={subj.subject} className="card" style={{ padding: '15px', borderLeft: `4px solid ${color}` }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text)' }}>{subj.subject}</div>
                  {subj.accuracy !== null && (
                    <div style={{ fontSize: '24px', fontWeight: '900', color: color, marginTop: '8px' }}>{subj.accuracy}%</div>
                  )}
                  <div style={{ fontSize: '11px', color: 'var(--text4)', marginTop: '4px' }}>
                    {subj.correct}/{subj.attempted} correct
                  </div>
                  {subj.weak && (
                    <div style={{ fontSize: '10px', background: 'rgba(239,68,68,0.1)', color: 'var(--red)', padding: '4px 8px', borderRadius: '4px', marginTop: '8px', display: 'inline-block', fontWeight: '700' }}>
                      Needs work
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Adherence Graph */}
      {weeklyPlanAdherence.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text)', marginBottom: '12px' }}>Target Completion</h2>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '120px', overflowX: 'auto', paddingBottom: '4px' }}>
              {weeklyPlanAdherence.map(day => {
                const percentage = day.pct !== null ? Math.round(day.pct * 100) : 0;
                const date = new Date(day.date + 'T00:00:00');
                return (
                  <div key={day.date} style={{ minWidth: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text4)' }}>
                      {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{
                      width: '24px',
                      height: `${Math.max(8, percentage)}%`,
                      background: percentage >= 70 ? 'var(--green)' : percentage >= 40 ? 'var(--accent)' : 'var(--text4)',
                      borderRadius: '4px'
                    }} />
                    {percentage > 0 && (
                      <div style={{ fontSize: '9px', color: 'var(--text4)', fontWeight: '700' }}>{percentage}%</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
