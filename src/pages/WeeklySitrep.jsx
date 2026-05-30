import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { MASTER_TOPICS } from '../data';

const SUBJECTS = Object.keys(MASTER_TOPICS);

export default function WeeklySitrep() {
  const { zh_sessions, zh_mocks, streak, settings, sitrep, setSitrep, zh_weeklyJournals, setWeeklyJournals, zh_xp, setXP } = useAppStore();

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const weekInfo = useMemo(() => {
    const now = new Date();
    now.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) + (currentWeekOffset * 7));
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const weekNum = Math.ceil((((start - new Date(start.getFullYear(), 0, 1)) / 8.64e7) + new Date(start.getFullYear(), 0, 1).getDay() + 1) / 7);
    const weekKey = `${start.getFullYear()}-W${weekNum}`;
    
    return { start, end, weekNum, weekKey };
  }, [currentWeekOffset]);

  const weekSessions = useMemo(() => {
    return zh_sessions.filter(s => {
      const d = new Date(s.date);
      return d >= weekInfo.start && d <= weekInfo.end;
    });
  }, [zh_sessions, weekInfo]);

  const summary = useMemo(() => {
    const totalHours = weekSessions.reduce((a, b) => a + (b.duration || 0), 0) / 60;
    
    const subBreakdown = {};
    SUBJECTS.forEach(sub => subBreakdown[sub] = 0);
    weekSessions.forEach(s => {
      if (subBreakdown[s.subject] !== undefined) {
        subBreakdown[s.subject] += (s.duration || 0) / 60;
      }
    });

    const neglected = Object.entries(subBreakdown).sort((a, b) => a[1] - b[1])[0];
    
    const pomosCompleted = weekSessions.filter(s => s.phase === 'Pomodoro').length;
    const pomoTarget = (settings.dailyPomoTarget || 8) * 7;

    const weekMocks = zh_mocks.filter(m => {
      const d = new Date(m.date);
      return d >= weekInfo.start && d <= weekInfo.end;
    });
    const lastWeekMocks = zh_mocks.filter(m => {
      const d = new Date(m.date);
      const lastStart = new Date(weekInfo.start);
      lastStart.setDate(lastStart.getDate() - 7);
      const lastEnd = new Date(weekInfo.end);
      lastEnd.setDate(lastEnd.getDate() - 7);
      return d >= lastStart && d <= lastEnd;
    });

    const avgScore = weekMocks.length > 0 ? weekMocks.reduce((a, b) => a + (b.calculated?.totalMarks || 0), 0) / weekMocks.length : 0;
    const lastAvgScore = lastWeekMocks.length > 0 ? lastWeekMocks.reduce((a, b) => a + (b.calculated?.totalMarks || 0), 0) / lastWeekMocks.length : 0;
    const delta = avgScore - lastAvgScore;

    return { totalHours, subBreakdown, neglected, pomosCompleted, pomoTarget, delta, avgScore };
  }, [weekSessions, zh_mocks, weekInfo, settings.dailyPomoTarget]);

  const handleNotesBlur = (val) => {
    const newSitrep = { ...sitrep };
    if (!newSitrep[weekInfo.weekKey]) newSitrep[weekInfo.weekKey] = {};
    newSitrep[weekInfo.weekKey].manualNotes = val;
    setSitrep(newSitrep);
  };

  const journal = zh_weeklyJournals[weekInfo.weekKey] || {
    best: '', worst: '', distraction: '', fix: ''
  };

  const updateJournal = (key, val) => {
    const updated = { ...zh_weeklyJournals, [weekInfo.weekKey]: { ...journal, [key]: val } };
    setWeeklyJournals(updated);
  };

  return (
    <div className="page-inner fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: 5 }}>WEEKLY SITREP</h1>
          <p style={{ color: 'var(--text4)', fontSize: 11 }}>Military intelligence report for operational week {weekInfo.weekNum}.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={() => setCurrentWeekOffset(o => o - 1)} style={{ padding: '4px 12px' }}>←</button>
          <div className="label-caps" style={{ alignSelf: 'center', fontSize: 10 }}>{weekInfo.weekKey}</div>
          <button className="btn" onClick={() => setCurrentWeekOffset(o => o + 1)} style={{ padding: '4px 12px' }}>→</button>
        </div>
      </div>

      <div className="card" style={{ 
        fontFamily: 'monospace', borderColor: 'var(--indigo)', background: 'rgba(99, 102, 241, 0.02)',
        padding: '25px', marginBottom: 30, borderStyle: 'dashed'
      }}>
        <div style={{ textAlign: 'center', borderBottom: '1px solid var(--indigo)', paddingBottom: 15, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>INTELLIGENCE SUMMARY REPORT</div>
          <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 5 }}>CLASSIFIED: LEVEL 1 TACTICAL DATA</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
          <div>
            <div style={{ marginBottom: 15 }}>
              <span style={{ color: 'var(--text4)' }}>TOTAL DEPLOYMENT:</span>
              <span style={{ marginLeft: 10, fontWeight: 900, color: 'var(--indigo)' }}>{summary.totalHours.toFixed(1)} HRS</span>
            </div>
            
            <div style={{ marginBottom: 15 }}>
              <div className="label-caps" style={{ fontSize: 10, marginBottom: 8, color: 'var(--text4)' }}>SUBJECT BREAKDOWN:</div>
              {Object.entries(summary.subBreakdown).filter(([_, h]) => h > 0).map(([sub, h]) => (
                <div key={sub} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                    <span>{sub.toUpperCase()}</span>
                    <span>{h.toFixed(1)}H</span>
                  </div>
                  <div style={{ height: 2, background: 'var(--bg4)', marginTop: 2 }}>
                    <div style={{ height: '100%', background: 'var(--indigo)', width: `${(h / summary.totalHours) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11 }}>
              <span style={{ color: 'var(--red)' }}>NEGLECTED SECTOR:</span>
              <span style={{ marginLeft: 10, fontWeight: 800 }}>{summary.neglected?.[0]?.toUpperCase() || 'NONE'}</span>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: 15 }}>
              <span style={{ color: 'var(--text4)' }}>POMO EFFICIENCY:</span>
              <span style={{ marginLeft: 10, fontWeight: 900 }}>{summary.pomosCompleted} / {summary.pomoTarget} 🍅</span>
            </div>

            <div style={{ marginBottom: 15 }}>
              <span style={{ color: 'var(--text4)' }}>STREAK STATUS:</span>
              <span style={{ marginLeft: 10, fontWeight: 900, color: 'var(--green)' }}>{streak.current} DAYS (ACTIVE)</span>
            </div>

            <div style={{ marginBottom: 15 }}>
              <span style={{ color: 'var(--text4)' }}>MOCK PERFORMANCE:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                <span style={{ fontWeight: 900, fontSize: 18 }}>{summary.avgScore.toFixed(1)}M</span>
                {summary.delta !== 0 && (
                  <span style={{ color: summary.delta > 0 ? 'var(--green)' : 'var(--red)', fontSize: 12 }}>
                    {summary.delta > 0 ? '▲' : '▼'} {Math.abs(summary.delta).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ borderColor: 'var(--amber)', marginBottom: 30 }}>
        <div className="label-caps" style={{ color: 'var(--amber)', marginBottom: 20 }}>15. Weekly Review — Strategic Assessment</div>
        <div className="g2">
          <div>
            <label className="label-caps" style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>Best Subject this week?</label>
            <input className="inp" value={journal.best} onChange={e => updateJournal('best', e.target.value)} placeholder="..." />
          </div>
          <div>
            <label className="label-caps" style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>Worst Subject / Needs Focus?</label>
            <input className="inp" value={journal.worst} onChange={e => updateJournal('worst', e.target.value)} placeholder="..." />
          </div>
          <div>
            <label className="label-caps" style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>Biggest Distraction?</label>
            <input className="inp" value={journal.distraction} onChange={e => updateJournal('distraction', e.target.value)} placeholder="..." />
          </div>
          <div>
            <label className="label-caps" style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>One thing to fix next week?</label>
            <input className="inp" value={journal.fix} onChange={e => updateJournal('fix', e.target.value)} placeholder="..." />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="label-caps" style={{ marginBottom: 15 }}>Mission Debrief — Personal Reflections</div>
        <textarea 
          className="ta"
          defaultValue={sitrep[weekInfo.weekKey]?.manualNotes || ''}
          onBlur={(e) => handleNotesBlur(e.target.value)}
          placeholder="Enter reflections on this week's deployment..."
          style={{ minHeight: 150 }}
        />
      </div>

      <style jsx>{`
        .ta { width: 100%; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 15px; color: var(--text); resize: vertical; }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
