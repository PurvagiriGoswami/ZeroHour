import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useStore';
import { MASTER_TOPICS } from '../data';

const PHASES = ['New Learning', 'Active Recall', 'Spaced Revision', 'Practice Test', 'Error Review', 'Feynman'];
const SUBJECTS = Object.keys(MASTER_TOPICS);

const SignalBars = ({ value, onChange, size = 'large' }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: size === 'large' ? 30 : 15 }}>
    {[1, 2, 3, 4, 5].map(bar => (
      <div 
        key={bar}
        onClick={() => onChange && onChange(bar)}
        style={{ 
          width: size === 'large' ? 8 : 4, 
          height: `${bar * 20}%`, 
          background: bar <= value ? '#39ff14' : 'var(--bg4)',
          borderRadius: 1,
          cursor: onChange ? 'pointer' : 'default',
          transition: 'background 0.2s'
        }} 
      />
    ))}
  </div>
);

const DonutChart = ({ sessions }) => {
  const data = useMemo(() => {
    const counts = {};
    sessions.forEach(s => {
      counts[s.subject] = (counts[s.subject] || 0) + s.duration;
    });
    return Object.entries(counts).slice(0, 4);
  }, [sessions]);

  const total = data.reduce((a, b) => a + b[1], 0);
  let currentPos = 0;
  const colors = ['#39ff14', '#00d4ff', '#ffd700', '#bf80ff'];

  return (
    <svg width="24" height="24" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="transparent" stroke="var(--bg4)" strokeWidth="4" />
      {data.map(([sub, dur], i) => {
        const dash = (dur / total) * 88;
        const offset = -currentPos;
        currentPos += dash;
        return (
          <circle 
            key={sub}
            cx="16" cy="16" r="14" fill="transparent" 
            stroke={colors[i % colors.length]} strokeWidth="4" 
            strokeDasharray={`${dash} 88`} 
            strokeDashoffset={offset}
            transform="rotate(-90 16 16)"
          />
        );
      })}
    </svg>
  );
};

export default function SessionLog() {
  const { zh_sessions, setSessions, zh_topicMap, setTopicMap, zh_xp, setXP, zh_intentions, setIntentions } = useAppStore();

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: SUBJECTS[0],
    topic: '',
    customTopic: '',
    phase: PHASES[0],
    duration: 30,
    score: '',
    notes: '',
    mood: 3,
    intention: '',
    reflection: '',
    blockers: ''
  });

  const [showReflection, setShowReflection] = useState(false);

  const topics = useMemo(() => {
    const subTopics = [];
    const sub = MASTER_TOPICS[form.subject];
    if (sub && sub.categories) {
      Object.values(sub.categories).forEach(cat => {
        cat.topics.forEach(t => subTopics.push(t.name));
      });
    }
    return subTopics;
  }, [form.subject]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTopic = form.topic === 'Custom' ? form.customTopic : form.topic;
    if (!finalTopic) return;

    const topicKey = `${form.subject}::${finalTopic}`;
    const newSession = {
      id: Date.now().toString(),
      ...form,
      topic: finalTopic,
      score: form.score ? parseFloat(form.score) : null,
    };

    // Update Sessions
    setSessions([newSession, ...zh_sessions]);

    // Update XP: +10 for session completion
    setXP(zh_xp + 10);

    // Update Topic Map (Spaced Rep v2 logic)
    const currentTopicData = zh_topicMap[topicKey] || { firstStudied: form.date, revisits: [] };
    if (!zh_topicMap[topicKey]) {
      // First time studied: R1 = +1 day (automatic via tacticalEngine if we just log firstStudied)
      setTopicMap({ ...zh_topicMap, [topicKey]: { firstStudied: form.date, revisits: [] } });
    } else {
      // Revisit
      const level = currentTopicData.revisits.length + 1;
      currentTopicData.revisits.push({
        date: form.date,
        level: level,
        type: form.phase
      });
      setTopicMap({ ...zh_topicMap, [topicKey]: currentTopicData });
    }

    // Save Intention/Reflection
    const dateKey = form.date;
    const dailyIntents = zh_intentions[dateKey] || [];
    setIntentions({
      ...zh_intentions,
      [dateKey]: [...dailyIntents, {
        topic: finalTopic,
        intention: form.intention,
        reflection: form.reflection,
        blockers: form.blockers
      }]
    });

    // Reset Form
    setForm({ ...form, topic: '', customTopic: '', score: '', notes: '', intention: '', reflection: '', blockers: '' });
    setShowReflection(false);
  };

  return (
    <div className="page-inner fade-in">
      <div className="card">
        <div className="label-caps" style={{ marginBottom: 20 }}>11. Session Intention + Reflection</div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div className="g2">
            <div>
              <label className="label-caps" style={{ display: 'block', marginBottom: 5 }}>Date</label>
              <input type="date" className="inp" style={{ width: '100%' }} value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
            </div>
            <div>
              <label className="label-caps" style={{ display: 'block', marginBottom: 5 }}>Subject</label>
              <select className="inp" style={{ width: '100%' }} value={form.subject} onChange={e => setForm({...form, subject: e.target.value, topic: ''})}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="g2">
            <div>
              <label className="label-caps" style={{ display: 'block', marginBottom: 5 }}>Topic</label>
              <select className="inp" style={{ width: '100%' }} value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} required>
                <option value="">Select Topic...</option>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="Custom">-- Custom Topic --</option>
              </select>
            </div>
            {form.topic === 'Custom' && (
              <div>
                <label className="label-caps" style={{ display: 'block', marginBottom: 5 }}>Custom Topic Name</label>
                <input type="text" className="inp" style={{ width: '100%' }} value={form.customTopic} onChange={e => setForm({...form, customTopic: e.target.value})} required />
              </div>
            )}
          </div>

          <div style={{ padding: 15, background: 'rgba(99, 102, 241, 0.05)', borderRadius: 8, border: '1px solid var(--indigo)' }}>
            <label className="label-caps" style={{ color: 'var(--indigo)', marginBottom: 8, display: 'block' }}>Operational Intent</label>
            <input 
              className="inp" style={{ width: '100%', borderColor: 'var(--indigo)' }} 
              placeholder="What will you cover in this session?"
              value={form.intention} onChange={e => setForm({...form, intention: e.target.value})}
            />
          </div>

          <div className="g3">
            <div>
              <label className="label-caps" style={{ display: 'block', marginBottom: 5 }}>Phase</label>
              <select className="inp" style={{ width: '100%' }} value={form.phase} onChange={e => setForm({...form, phase: e.target.value})}>
                {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label-caps" style={{ display: 'block', marginBottom: 5 }}>Duration (Min)</label>
              <input type="number" className="inp" style={{ width: '100%' }} value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})} min="1" required />
            </div>
            <div>
              <label className="label-caps" style={{ display: 'block', marginBottom: 5 }}>Energy / Mood</label>
              <SignalBars value={form.mood} onChange={val => setForm({...form, mood: val})} />
            </div>
          </div>

          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: 5 }}>Mission Notes / Error Patterns</label>
            <textarea className="inp" style={{ width: '100%', height: 60 }} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Key takeaways or mistakes..." />
          </div>

          {!showReflection ? (
            <button type="button" onClick={() => setShowReflection(true)} className="btn" style={{ fontSize: 10 }}>+ ADD POST-SESSION REFLECTION</button>
          ) : (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 15, padding: 15, background: 'rgba(34, 197, 94, 0.05)', borderRadius: 8, border: '1px solid var(--green)' }}>
              <label className="label-caps" style={{ color: 'var(--green)', marginBottom: 0 }}>Mission Debrief</label>
              <div>
                <label style={{ fontSize: 9, color: 'var(--text4)' }}>What did you actually do?</label>
                <textarea className="inp" style={{ width: '100%', height: 40 }} value={form.reflection} onChange={e => setForm({...form, reflection: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: 9, color: 'var(--text4)' }}>Any blockers encountered?</label>
                <input className="inp" style={{ width: '100%' }} value={form.blockers} onChange={e => setForm({...form, blockers: e.target.value})} />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-g" style={{ padding: '12px', marginTop: 10 }}>
            FILE SESSION LOG & EARN +10 XP
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 24 }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="label-caps">Recent Operations</div>
          <div style={{ fontSize: 10, color: 'var(--text4)' }}>Showing last 20 sessions</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: 'var(--bg2)', textAlign: 'left' }}>
                <th className="label-caps" style={{ padding: '12px 20px' }}>Date / Mix</th>
                <th className="label-caps" style={{ padding: '12px 20px' }}>Subject / Topic</th>
                <th className="label-caps" style={{ padding: '12px 20px' }}>Phase</th>
                <th className="label-caps" style={{ padding: '12px 20px' }}>Dur</th>
                <th className="label-caps" style={{ padding: '12px 20px' }}>Mood</th>
              </tr>
            </thead>
            <tbody>
              {zh_sessions.slice(0, 20).map(s => {
                const daySessions = zh_sessions.filter(ds => ds.date === s.date);
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 20px', color: 'var(--text4)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <DonutChart sessions={daySessions} />
                        {s.date.split('-').slice(1).join('/')}
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ fontWeight: 600 }}>{s.topic}</div>
                      <div style={{ fontSize: 9, color: 'var(--text4)' }}>{s.subject}</div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>{s.phase}</td>
                    <td style={{ padding: '12px 20px' }}>{s.duration}m</td>
                    <td style={{ padding: '12px 20px' }}>
                      <SignalBars value={s.mood || 3} size="small" />
                    </td>
                  </tr>
                );
              })}
              {zh_sessions.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text4)' }}>
                    No sessions logged. Initiate first mission.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
