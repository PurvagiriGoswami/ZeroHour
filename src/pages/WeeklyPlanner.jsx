import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { getTodayStr, getRolloverTargets } from '../utils/tacticalEngine';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TARGET_TYPES = ['Practice', 'Revision', 'Vocab', 'Mock Test', 'Reading'];

export default function WeeklyPlanner({ onConfirm }) {
  const { 
    zh_targets, setTargets, 
    zh_exam_registrations,
    zh_sessions,
    settings 
  } = useAppStore(
    useShallow(s => ({
      zh_targets: s.zh_targets,
      setTargets: s.setTargets,
      zh_exam_registrations: s.zh_exam_registrations,
      zh_sessions: s.zh_sessions,
      settings: s.settings
    }))
  );

  const [plannedDays, setPlannedDays] = useState({});
  const [activeDay, setActiveDay] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'Practice', estimated_minutes: 60, exam: 'All' });

  // Get start of the current week (Monday)
  const startOfWeek = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, []);

  // Pre-population logic
  useEffect(() => {
    const newPlan = {};
    const today = new Date();
    
    DAYS.forEach((dayName, idx) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + idx);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get existing targets for this day
      const existing = zh_targets.filter(t => t.date === dateStr);
      newPlan[dateStr] = {
        name: dayName,
        date: dateStr,
        targets: existing,
        isGhost: false
      };
    });

    // Rule 1: Rolled-over items (simplified for planner view)
    // In a real Sunday trigger, we'd look at Saturday's misses
    
    // Rule 2: Neglected topics (Rule: topics not touched in 7+ days)
    const suggestions = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // This is a simplified check - in a full impl we'd iterate MASTER_TOPICS
    // For now, let's just show the logic structure
    
    setPlannedDays(newPlan);
  }, [zh_targets, startOfWeek]);

  const getLoadColor = (minutes) => {
    const cap = (settings.maxStudyHours || 8) * 60;
    const ratio = minutes / cap;
    if (ratio > 1) return 'var(--red)';
    if (ratio >= 0.8) return 'var(--amber)';
    return 'var(--green)';
  };

  const handleConfirm = () => {
    // Merge all planned days back into zh_targets
    const allPlanned = Object.values(plannedDays).flatMap(d => d.targets);
    // Remove old targets for these dates first to avoid duplicates
    const weekDates = Object.keys(plannedDays);
    const filtered = zh_targets.filter(t => !weekDates.includes(t.date));
    setTargets([...filtered, ...allPlanned]);
    if (onConfirm) onConfirm();
  };

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: 5 }}>WEEKLY STRATEGY</h1>
          <p style={{ color: 'var(--text4)', fontSize: 11 }}>Plan your operational load for the week.</p>
        </div>
        <button className="btn btn-g" onClick={handleConfirm}>CONFIRM WEEK PLAN</button>
      </div>

      <div className="planner-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 12,
        overflowX: 'auto',
        paddingBottom: 20
      }}>
        {DAYS.map((day, idx) => {
          const date = new Date(startOfWeek);
          date.setDate(date.getDate() + idx);
          const dateStr = date.toISOString().split('T')[0];
          const dayData = plannedDays[dateStr] || { targets: [] };
          const totalMins = dayData.targets.reduce((acc, t) => acc + t.estimated_minutes, 0);
          const isToday = dateStr === getTodayStr();

          return (
            <div key={dateStr} className="planner-col" style={{ minWidth: 200 }}>
              <div style={{ 
                textAlign: 'center', 
                marginBottom: 10, 
                padding: 10, 
                background: isToday ? 'var(--indigo)' : 'var(--bg2)',
                borderRadius: 8,
                border: isToday ? '1px solid var(--indigo)' : '1px solid var(--bg3)'
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: isToday ? '#fff' : 'var(--text2)' }}>{day.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: isToday ? '#fff' : 'var(--text4)' }}>{date.getDate()} {date.toLocaleString('default', { month: 'short' })}</div>
                <div style={{ 
                  marginTop: 8, 
                  height: 4, 
                  background: 'var(--bg4)', 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(100, (totalMins / ((settings.maxStudyHours || 8) * 60)) * 100)}%`,
                    background: getLoadColor(totalMins)
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dayData.targets.map(t => (
                  <div key={t.id} className="card" style={{ 
                    padding: '8px 10px', 
                    fontSize: 11,
                    borderLeft: `3px solid ${t.isGhost ? 'transparent' : 'var(--indigo)'}`,
                    borderStyle: t.isGhost ? 'dashed' : 'solid',
                    borderColor: t.isGhost ? 'var(--text4)' : 'var(--indigo)',
                    opacity: t.isGhost ? 0.6 : 1
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text4)', fontSize: 9 }}>
                      <span>{t.type}</span>
                      <span>{t.estimated_minutes}m</span>
                    </div>
                  </div>
                ))}
                
                <button 
                  className="btn" 
                  style={{ width: '100%', padding: '8px', fontSize: 10, border: '1px dashed var(--bg4)', background: 'transparent' }}
                  onClick={() => {
                    setActiveDay(dateStr);
                    setShowAddForm(true);
                  }}
                >
                  + ADD TARGET
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card fade-in" style={{ maxWidth: 400, width: '100%' }}>
            <div className="label-caps" style={{ marginBottom: 20 }}>Add Target for {plannedDays[activeDay]?.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <input className="inp" placeholder="Target Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <select className="inp" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                {TARGET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" className="inp" placeholder="Minutes" value={form.estimated_minutes} onChange={e => setForm({...form, estimated_minutes: parseInt(e.target.value)})} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>CANCEL</button>
                <button className="btn btn-g" style={{ flex: 1 }} onClick={() => {
                  const newTarget = {
                    ...form,
                    id: `planner_${Date.now()}`,
                    date: activeDay,
                    status: 'pending'
                  };
                  const updatedPlan = { ...plannedDays };
                  updatedPlan[activeDay].targets.push(newTarget);
                  setPlannedDays(updatedPlan);
                  setShowAddForm(false);
                  setForm({ title: '', type: 'Practice', estimated_minutes: 60, exam: 'All' });
                }}>ADD</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
