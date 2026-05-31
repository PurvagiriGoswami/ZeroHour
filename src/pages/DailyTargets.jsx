import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { MASTER_TOPICS } from '../data';
import { getTodayStr, getRolloverTargets, calculateDailySummary } from '../utils/tacticalEngine';

const TARGET_TYPES = ['Practice', 'Revision', 'Vocab', 'Mock Test', 'Reading'];
const EXAMS_LIST = ['CDS', 'NDA', 'AFCAT', 'All'];
const PRIORITIES = ['High', 'Medium', 'Low'];

export default function DailyTargets({ onNav }) {
  const { 
    zh_targets, setTargets, 
    zh_dailySummaries, setDailySummaries,
    settings, profile
  } = useAppStore(
    useShallow(s => ({
      zh_targets: s.zh_targets,
      setTargets: s.setTargets,
      zh_dailySummaries: s.zh_dailySummaries,
      setDailySummaries: s.setDailySummaries,
      settings: s.settings,
      profile: s.profile
    }))
  );

  const today = getTodayStr();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEODReview, setIsEODReview] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [form, setForm] = useState({
    title: '',
    type: 'Practice',
    estimated_minutes: 30,
    priority: 'Medium',
    exam: 'All'
  });

  const dailyTargets = useMemo(() => 
    zh_targets.filter(t => t.date === today), 
  [zh_targets, today]);

  const totalEstimatedMinutes = useMemo(() => 
    dailyTargets.reduce((acc, t) => acc + t.estimated_minutes, 0),
  [dailyTargets]);

  const maxMinutes = (settings.maxStudyHours || 8) * 60;

  // Handle Rollover at start of day
  useEffect(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Check if rollover already happened for today
    const alreadyRolled = zh_targets.some(t => t.date === today && t.rolled_over_from);
    
    if (!alreadyRolled) {
      const rolled = getRolloverTargets(zh_targets, yesterdayStr);
      if (rolled.length > 0) {
        setTargets([...zh_targets, ...rolled]);
      }
    }
  }, []);

  const handleAddTarget = (e) => {
    e.preventDefault();
    if (totalEstimatedMinutes + form.estimated_minutes > maxMinutes) {
      if (!window.confirm(`Warning: This target exceeds your daily cap of ${settings.maxStudyHours} hours. Add anyway?`)) {
        return;
      }
    }

    const newTarget = {
      ...form,
      id: `target_${Date.now()}`,
      user_id: profile.uid || 'anon',
      date: today,
      status: 'pending',
      actual_minutes: 0,
      rollover_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTargets([...zh_targets, newTarget]);
    setForm({ title: '', type: 'Practice', estimated_minutes: 30, priority: 'Medium', exam: 'All' });
    setShowAddForm(false);
  };

  const handleUpdateStatus = (id, status, actualMins = 0) => {
    const updated = zh_targets.map(t => 
      t.id === id ? { ...t, status, actual_minutes: actualMins, updated_at: new Date().toISOString() } : t
    );
    setTargets(updated);
  };

  const startEODReview = () => {
    setIsEODReview(true);
  };

  const finishEODReview = () => {
    const summary = calculateDailySummary(today, zh_targets);
    if (summary) {
      setDailySummaries([...zh_dailySummaries, summary]);
    }
    setShowSummary(true);
    setIsEODReview(false);
  };

  const getEncouragement = (rate) => {
    if (rate >= 100) return "Exceptional performance, Commander. Tactical objectives fully secured.";
    if (rate >= 80) return "Strong execution. Most objectives met. Maintain momentum.";
    if (rate >= 50) return "Mission partially successful. Evaluate blockers and adjust for tomorrow.";
    return "Operational setback detected. Deferring objectives. Rest and regroup.";
  };

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: 5 }}>DAILY TARGETS</h1>
          <p style={{ color: 'var(--text4)', fontSize: 11 }}>Operational objectives for {today}.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={() => onNav('weekly_planner')}>WEEK VIEW</button>
          {!isEODReview && !showSummary && (
            <button className="btn btn-g" onClick={() => setShowAddForm(true)}>+ NEW TARGET</button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card" style={{ marginBottom: 20, padding: '15px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 11 }}>
          <span className="label-caps">Daily Capacity Usage</span>
          <span>{Math.round(totalEstimatedMinutes / 60 * 10) / 10} / {settings.maxStudyHours}h</span>
        </div>
        <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${Math.min(100, (totalEstimatedMinutes / maxMinutes) * 100)}%`, 
            background: totalEstimatedMinutes > maxMinutes ? 'var(--red)' : 'var(--indigo)',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Target List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        {dailyTargets.length === 0 && !showAddForm && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 24, marginBottom: 15 }}>🎯</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>No targets set for today.</div>
            <button className="btn btn-c" onClick={() => setShowAddForm(true)}>SET YOUR FIRST TARGET</button>
          </div>
        )}

        {dailyTargets.map(t => (
          <div key={t.id} className="card" style={{ 
            borderLeft: `4px solid ${t.status === 'complete' ? 'var(--green)' : t.rolled_over_from ? 'var(--amber)' : 'var(--indigo)'}`,
            opacity: t.status === 'complete' ? 0.6 : 1,
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
                  <span className="label-caps" style={{ fontSize: 8, padding: '2px 6px', background: 'var(--bg4)', borderRadius: 4 }}>{t.type}</span>
                  {t.rolled_over_from && <span className="label-caps" style={{ fontSize: 8, padding: '2px 6px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--amber)', borderRadius: 4 }}>ROLLED OVER</span>}
                  {t.rollover_count >= 2 && <span className="label-caps" style={{ fontSize: 8, padding: '2px 6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', borderRadius: 4 }}>STUCK</span>}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, textDecoration: t.status === 'complete' ? 'line-through' : 'none' }}>{t.title}</div>
                <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 4 }}>{t.estimated_minutes}m | Priority: {t.priority} | {t.exam}</div>
              </div>
              
              {!isEODReview && t.status !== 'complete' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-g" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => handleUpdateStatus(t.id, 'complete', t.estimated_minutes)}>✓ DONE</button>
                  <button className="btn" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => {
                    const updated = zh_targets.filter(x => x.id !== t.id);
                    setTargets(updated);
                  }}>REMOVE</button>
                </div>
              )}

              {isEODReview && t.status === 'pending' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-g" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => handleUpdateStatus(t.id, 'complete', t.estimated_minutes)}>✓ DONE</button>
                  <button className="btn btn-r" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => handleUpdateStatus(t.id, 'incomplete', 0)}>✗ MISSED</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card fade-in" style={{ maxWidth: 500, width: '100%' }}>
            <div className="label-caps" style={{ marginBottom: 25 }}>Target Parameters</div>
            <form onSubmit={handleAddTarget} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div>
                <label className="label-caps" style={{ fontSize: 9, display: 'block', marginBottom: 5 }}>Objective Title</label>
                <input className="inp" style={{ width: '100%' }} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Polity - Parliament, 30 MCQs" required />
              </div>
              <div className="g2">
                <div>
                  <label className="label-caps" style={{ fontSize: 9, display: 'block', marginBottom: 5 }}>Type</label>
                  <select className="inp" style={{ width: '100%' }} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {TARGET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-caps" style={{ fontSize: 9, display: 'block', marginBottom: 5 }}>Estimated Time (Min)</label>
                  <input type="number" className="inp" style={{ width: '100%' }} value={form.estimated_minutes} onChange={e => setForm({...form, estimated_minutes: parseInt(e.target.value)})} required />
                </div>
              </div>
              <div className="g2">
                <div>
                  <label className="label-caps" style={{ fontSize: 9, display: 'block', marginBottom: 5 }}>Priority</label>
                  <select className="inp" style={{ width: '100%' }} value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-caps" style={{ fontSize: 9, display: 'block', marginBottom: 5 }}>Linked Exam</label>
                  <select className="inp" style={{ width: '100%' }} value={form.exam} onChange={e => setForm({...form, exam: e.target.value})}>
                    {EXAMS_LIST.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>CANCEL</button>
                <button type="submit" className="btn btn-g" style={{ flex: 1 }}>SAVE OBJECTIVE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EOD Review Actions */}
      {!isEODReview && !showSummary && dailyTargets.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <button className="btn btn-c" style={{ width: '100%', padding: 15 }} onClick={startEODReview}>INITIATE END-OF-DAY REVIEW</button>
        </div>
      )}

      {isEODReview && (
        <div style={{ marginTop: 30 }}>
          <button className="btn btn-g" style={{ width: '100%', padding: 15 }} onClick={finishEODReview}>FINALIZE MISSION REPORT</button>
        </div>
      )}

      {/* Day Summary Modal */}
      {showSummary && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card fade-in" style={{ maxWidth: 400, width: '100%', textAlign: 'center', padding: 30 }}>
            <div className="label-caps" style={{ marginBottom: 20 }}>Day Summary Report</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--green)', marginBottom: 10 }}>
              {Math.round(calculateDailySummary(today, zh_targets)?.completion_rate || 0)}%
            </div>
            <div className="label-caps" style={{ fontSize: 10, marginBottom: 25 }}>Objectives Completed</div>
            <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--text3)', marginBottom: 30 }}>
              "{getEncouragement(calculateDailySummary(today, zh_targets)?.completion_rate || 0)}"
            </p>
            <button className="btn btn-g" style={{ width: '100%' }} onClick={() => setShowSummary(false)}>CLOSE REPORT</button>
          </div>
        </div>
      )}
    </div>
  );
}
