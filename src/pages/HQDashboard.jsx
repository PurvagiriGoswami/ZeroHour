import { useMemo } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  calculateStreak, 
  getTodayStr, 
  getWeekNumber, 
  getPhase, 
  getTopicDueStatus,
  getDailyMissions,
  getWeaknessProfile
} from '../utils/tacticalEngine';

const SUBJECTS = [
  { id: 'Mathematics', color: '#22c55e', target: 10 },
  { id: 'English', color: '#3b82f6', target: 5 },
  { id: 'GK / GA', color: '#a78bfa', target: 5 },
  { id: 'Science', color: '#06b6d4', target: 5 },
  { id: 'AFCAT', color: '#f97316', target: 5 },
  { id: 'SSB', color: '#f59e0b', target: 5 }
];

export default function HQDashboard({ onNav }) {
  const { 
    zh_sessions, zh_topicMap, zh_mocks, zh_pomodoro_today 
  } = useAppStore(
    useShallow(s => ({
      zh_sessions: s.zh_sessions,
      zh_topicMap: s.zh_topicMap,
      zh_mocks: s.zh_mocks,
      zh_pomodoro_today: s.zh_pomodoro_today
    }))
  );

  const today = getTodayStr();
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

  const currentWeek = getWeekNumber();
  const phase = getPhase(currentWeek);

  const todaySessions = zh_sessions.filter(s => s.date === today);
  const todayHours = todaySessions.reduce((a, b) => a + (b.duration || 0), 0) / 60;
  
  const weekSessions = zh_sessions.filter(s => s.date >= startOfWeekStr);
  const weekHours = weekSessions.reduce((a, b) => a + (b.duration || 0), 0) / 60;

  const streak = useMemo(() => calculateStreak(zh_sessions), [zh_sessions]);

  const overdueItems = useMemo(() => {
    const items = [];
    Object.entries(zh_topicMap).forEach(([key, data]) => {
      const status = getTopicDueStatus(key, data, today);
      if (!status) return;
      
      status.forEach(s => {
        if (s.overdue > 0) {
          items.push({ key, topic: key.split('::')[1], overdue: s.overdue });
        }
      });
    });
    return items.sort((a, b) => b.overdue - a.overdue);
  }, [zh_topicMap, today]);

  const mathWeekHours = weekSessions.filter(s => s.subject === 'Mathematics').reduce((a, b) => a + (b.duration || 0), 0) / 60;
  const mathTarget = currentWeek <= 8 ? 10 : 12;
  const lastMockMath = zh_mocks.find(m => m.math > 0)?.math || 0;

  const subjectStats = SUBJECTS.map(sub => {
    const hours = weekSessions.filter(s => s.subject === sub.id).reduce((a, b) => a + (b.duration || 0), 0) / 60;
    return { ...sub, hours };
  });

  const missions = useMemo(() => getDailyMissions(zh_sessions, zh_pomodoro_today, zh_topicMap), [zh_sessions, zh_pomodoro_today, zh_topicMap]);
  const weaknesses = useMemo(() => getWeaknessProfile(zh_sessions, zh_mocks), [zh_sessions, zh_mocks]);

  return (
    <div className="page-inner fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 30 }}>
        <div>
          <div className="label-caps" style={{ color: 'var(--green)', marginBottom: 5 }}>Operational Status: Active</div>
          <h1 className="card-title" style={{ marginBottom: 0, fontSize: 28 }}>STRATEGIC HQ</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="label-caps">{phase.name}</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{phase.desc}</div>
          <div style={{ fontSize: 10, color: 'var(--text4)' }}>Week {currentWeek} of 13</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15, marginBottom: 30 }}>
        {[
          { label: "Today's Study", value: `${todayHours.toFixed(1)}h`, icon: "⏱" },
          { label: "Weekly Volume", value: `${weekHours.toFixed(1)}h`, icon: "📅" },
          { label: "Operational Streak", value: `${streak} Days`, icon: "🔥" },
          { label: "Overdue Intel", value: overdueItems.length, icon: "⚠", color: overdueItems.length > 0 ? 'var(--red)' : 'var(--text)' }
        ].map((card, idx) => (
          <div key={idx} className="card" style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{ fontSize: 20, marginBottom: 5 }}>{card.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: card.color || 'var(--text)' }}>{card.value}</div>
            <div className="label-caps" style={{ marginTop: 5 }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
        <div className="card" style={{ borderColor: 'var(--amber)', background: 'rgba(245, 158, 11, 0.02)' }}>
          <div className="label-caps" style={{ color: 'var(--amber)', marginBottom: 20 }}>Daily Mission Briefing</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {missions.map(m => (
              <div key={m.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ 
                  width: 18, height: 18, borderRadius: 4, border: `1px solid ${m.done ? 'var(--green)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2,
                  background: m.done ? 'rgba(34, 197, 94, 0.1)' : 'transparent'
                }}>
                  {m.done && <span style={{ color: 'var(--green)', fontSize: 12 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: m.done ? 'var(--text4)' : 'var(--text)' }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text4)' }}>{m.desc} ({m.current}/{m.target})</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ borderColor: weaknesses.length > 0 ? 'var(--red)' : 'var(--border)' }}>
          <div className="label-caps" style={{ color: weaknesses.length > 0 ? 'var(--red)' : 'var(--text4)', marginBottom: 20 }}>Tactical Weakness Radar</div>
          {weaknesses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {weaknesses.map((w, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{w.subject}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 60, height: 4, background: 'var(--bg4)', borderRadius: 2 }}>
                      <div style={{ width: `${w.avg}%`, height: '100%', background: 'var(--red)', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--red)' }}>{w.avg.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 9, color: 'var(--text4)', fontStyle: 'italic', marginTop: 5 }}>
                Priority deployment recommended to these sectors.
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text4)', fontSize: 12 }}>
              No critical weaknesses detected in recent data.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
        <div className="card" style={{ borderColor: 'var(--green)', background: 'rgba(34, 197, 94, 0.02)' }}>
          <div className="label-caps" style={{ color: 'var(--green)', marginBottom: 20 }}>Math Intel Card</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Weekly Progress</span>
            <span style={{ fontSize: 13, fontWeight: 800 }}>{mathWeekHours.toFixed(1)} / {mathTarget}h</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg4)', borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ height: '100%', width: `${Math.min(100, (mathWeekHours / mathTarget) * 100)}%`, background: 'var(--green)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="label-caps">Last Mock Performance</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: lastMockMath >= 50 ? 'var(--green)' : 'var(--red)' }}>{lastMockMath}%</div>
          </div>
        </div>

        <div className="card" style={{ borderColor: overdueItems.length > 0 ? 'var(--red)' : 'var(--border)' }}>
          <div className="label-caps" style={{ color: overdueItems.length > 0 ? 'var(--red)' : 'var(--text4)', marginBottom: 20 }}>Overdue Alerts</div>
          {overdueItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {overdueItems.slice(0, 3).map((item, idx) => (
                <div key={idx} style={{ padding: '8px 12px', border: '1px solid var(--red)', borderRadius: 6, background: 'rgba(239, 68, 68, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{item.topic}</span>
                  <span className="label-caps" style={{ color: 'var(--red)', fontSize: 8 }}>{item.overdue}D Overdue</span>
                </div>
              ))}
              <button onClick={() => onNav('queue')} style={{ background: 'none', border: 'none', color: 'var(--indigo)', fontSize: 10, fontWeight: 800, cursor: 'pointer', textAlign: 'left', marginTop: 5, padding: 0 }}>VIEW FULL QUEUE →</button>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text4)', fontSize: 12 }}>All systems clear. No overdue revisions.</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="label-caps" style={{ marginBottom: 20 }}>Weekly Subject Deployment</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {subjectStats.map(sub => (
              <div key={sub.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11 }}>
                  <span style={{ fontWeight: 700 }}>{sub.id}</span>
                  <span style={{ color: 'var(--text4)' }}>{sub.hours.toFixed(1)} / {sub.target}h</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2, position: 'relative' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (sub.hours / sub.target) * 100)}%`, background: sub.color, borderRadius: 2 }} />
                  <div style={{ position: 'absolute', top: 0, left: '100%', height: '100%', width: 1, background: 'rgba(255,255,255,0.2)', transform: `translateX(-${(1 - sub.target / 10) * 100}%)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="label-caps">Today's Missions</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--green)' }}>{zh_pomodoro_today} <span style={{ fontSize: 12 }}>🍅</span></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todaySessions.length > 0 ? todaySessions.map(s => (
              <div key={s.id} style={{ padding: '10px 15px', background: 'var(--bg3)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{s.topic}</div>
                  <div style={{ fontSize: 9, color: 'var(--text4)' }}>{s.subject} • {s.phase}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--indigo)' }}>{s.duration}m</div>
              </div>
            )) : (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text4)', fontSize: 12 }}>No missions logged today.</div>
            )}
            <button className="btn" onClick={() => onNav('log')} style={{ marginTop: 10, fontSize: 10, borderColor: 'var(--border)' }}>LOG MANUAL SESSION</button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
