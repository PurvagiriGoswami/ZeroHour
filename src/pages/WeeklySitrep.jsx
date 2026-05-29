import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';

const SUBJECTS = [
  { id: 'math', label: 'Mathematics', color: '#22c55e' },
  { id: 'english', label: 'English', color: '#3b82f6' },
  { id: 'gk', label: 'GK / GA', color: '#a78bfa' },
  { id: 'science', label: 'Science', color: '#06b6d4' },
  { id: 'afcat', label: 'AFCAT', color: '#f97316' },
  { id: 'ssb', label: 'SSB', color: '#f59e0b' }
];

const START_DATE = '2025-06-09';

export default function WeeklySitrep() {
  const { zh_weeklyChecks, setWeeklyChecks } = useAppStore(
    useShallow(s => ({
      zh_weeklyChecks: s.zh_weeklyChecks,
      setWeeklyChecks: s.setWeeklyChecks
    }))
  );

  const [scores, setScores] = useState({
    math: 0, english: 0, gk: 0, science: 0, afcat: 0, ssb: 0
  });
  const [notes, setNotes] = useState('');

  const currentWeek = useMemo(() => {
    const start = new Date(START_DATE);
    const now = new Date();
    const diff = now - start;
    return Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
  }, []);

  const avg = useMemo(() => {
    const vals = Object.values(scores);
    if (vals.every(v => v === 0)) return 0;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }, [scores]);

  const status = useMemo(() => {
    const a = parseFloat(avg);
    if (a >= 4.0) return { label: 'ON TRACK', color: '#22c55e' };
    if (a >= 3.0) return { label: 'STEADY', color: '#3b82f6' };
    if (a >= 2.0) return { label: 'UNDER TARGET', color: '#f59e0b' };
    return { label: 'CRITICAL', color: '#ef4444' };
  }, [avg]);

  const handleSubmit = () => {
    if (Object.values(scores).some(v => v === 0)) {
      alert('Please provide scores for all subjects.');
      return;
    }

    const check = {
      week: currentWeek,
      date: new Date().toISOString().split('T')[0],
      ...scores,
      notes
    };

    setWeeklyChecks([check, ...zh_weeklyChecks]);
    setScores({ math: 0, english: 0, gk: 0, science: 0, afcat: 0, ssb: 0 });
    setNotes('');
  };

  const decisionRules = useMemo(() => {
    const rules = [];
    const a = parseFloat(avg);
    if (a > 0 && a < 3) rules.push("Reduce AFCAT by 2h this week. Reallocate to lowest CDS subject.");
    if (scores.math > 0 && scores.math <= 2) rules.push("Invoke math recovery: 6h Math daily for this week.");
    if (a >= 4) rules.push("Strong week. Optional: add 30 min to weak area or take half-day rest.");
    return rules;
  }, [avg, scores]);

  return (
    <div className="page-inner fade-in">
      <div style={{ marginBottom: 30 }}>
        <h1 className="card-title" style={{ marginBottom: 5 }}>WEEKLY SITREP</h1>
        <p style={{ color: 'var(--text4)', fontSize: 12 }}>Self-assessment for Week {currentWeek} of 13.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        <div className="main-col">
          <div className="card">
            <div className="label-caps" style={{ marginBottom: 20 }}>Subject Proficiency Check</div>
            {SUBJECTS.map(sub => (
              <div key={sub.id} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: sub.color }}>{sub.label}</span>
                  <span className="label-caps" style={{ fontSize: 9 }}>Score: {scores[sub.id] || '—'}/5</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      onClick={() => setScores({ ...scores, [sub.id]: val })}
                      style={{
                        flex: 1, height: 36, borderRadius: 6, border: '1px solid var(--border)',
                        background: scores[sub.id] === val ? sub.color : 'transparent',
                        color: scores[sub.id] === val ? '#fff' : 'var(--text3)',
                        fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginTop: 30 }}>
              <label className="label-caps">Observations / Strategy Adjustments</label>
              <textarea 
                className="ta" style={{ marginTop: 10 }}
                value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="What went well? Where were the blockers?"
              />
            </div>

            <button 
              className="btn" onClick={handleSubmit}
              style={{ width: '100%', marginTop: 20, borderColor: 'var(--green)', background: 'rgba(34, 197, 94, 0.1)' }}
            >
              FILE WEEKLY REPORT
            </button>
          </div>

          <div className="history" style={{ marginTop: 30 }}>
            <div className="label-caps" style={{ marginBottom: 15 }}>Performance History (Last 8 Weeks)</div>
            <div className="card" style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 10, padding: '20px 30px' }}>
              {zh_weeklyChecks.slice(0, 8).reverse().map((check, idx) => {
                const checkAvg = (check.math + check.english + check.gk + check.science + check.afcat + check.ssb) / 6;
                let color = '#ef4444';
                if (checkAvg >= 4.0) color = '#22c55e';
                else if (checkAvg >= 3.0) color = '#3b82f6';
                else if (checkAvg >= 2.0) color = '#f59e0b';

                return (
                  <div key={idx} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div 
                      className="bar-hover"
                      style={{ 
                        width: '100%', height: `${(checkAvg / 5) * 100}%`, background: color, borderRadius: '4px 4px 0 0',
                        minHeight: 10
                      }} 
                    />
                    <div style={{ fontSize: 9, color: 'var(--text4)', marginTop: 8 }}>W{check.week}</div>
                    
                    {/* Hover detail */}
                    <div className="bar-tooltip" style={{
                      position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                      background: 'var(--bg4)', border: '1px solid var(--border)', padding: 8, borderRadius: 6,
                      width: 120, pointerEvents: 'none', opacity: 0, zIndex: 10, marginBottom: 10
                    }}>
                      {SUBJECTS.map(s => (
                        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 2 }}>
                          <span style={{ color: s.color }}>{s.id.toUpperCase()}</span>
                          <span>{check[s.id]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {zh_weeklyChecks.length === 0 && (
                <div style={{ width: '100%', textAlign: 'center', color: 'var(--text4)', paddingBottom: 60 }}>
                  No historical data available.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sidebar-col">
          <div className="card" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div className="label-caps">Combat Health Score</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: status.color, margin: '10px 0' }}>{avg}</div>
            <div style={{ 
              display: 'inline-block', padding: '4px 12px', borderRadius: 4, background: `${status.color}22`,
              color: status.color, fontWeight: 800, fontSize: 12, letterSpacing: 1
            }}>
              {status.label}
            </div>
          </div>

          {scores.math > 0 && scores.math <= 2 && (
            <div className="card" style={{ borderColor: 'var(--red)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <div style={{ color: 'var(--red)', fontWeight: 800, fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>⚠</span> MATH PROTECTION ACTIVE
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
                Math proficiency below threshold. System mandates priority focus. Do not reassign morning block.
              </div>
            </div>
          )}

          <div className="card">
            <div className="label-caps" style={{ marginBottom: 15 }}>Command Decisions</div>
            {decisionRules.length > 0 ? decisionRules.map((rule, idx) => (
              <div key={idx} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12, display: 'flex', gap: 10 }}>
                <span style={{ color: 'var(--indigo)' }}>▶</span>
                {rule}
              </div>
            )) : (
              <div style={{ fontSize: 12, color: 'var(--text4)' }}>Complete proficiency check to generate rules.</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .bar-hover:hover + .bar-tooltip, .bar-tooltip:hover {
          opacity: 1 !important;
        }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 320px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
