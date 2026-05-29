import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useStore';
import { MASTER_TOPICS } from '../data';

const PHASES = ['New Learning', 'Active Recall', 'Spaced Revision', 'Practice Test', 'Error Review', 'Feynman'];
const SUBJECTS = Object.keys(MASTER_TOPICS);

export default function SessionLog() {
  const { zh_sessions, setSessions, zh_topicMap, setTopicMap } = useAppStore();

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: SUBJECTS[0],
    topic: '',
    customTopic: '',
    phase: PHASES[0],
    duration: 30,
    score: '',
    notes: '',
  });

  const topics = useMemo(() => {
    const subTopics = [];
    Object.values(MASTER_TOPICS[form.subject]).forEach(list => subTopics.push(...list));
    return subTopics; // Remove .sort() to preserve the data.js order and stars
  }, [form.subject]);

  const isDuplicate = useMemo(() => {
    const topicKey = `${form.subject}::${form.topic === 'Custom' ? form.customTopic : form.topic}`;
    return !!zh_topicMap[topicKey];
  }, [form.subject, form.topic, form.customTopic, zh_topicMap]);

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

    // Update Topic Map
    const currentTopicData = zh_topicMap[topicKey] || { firstStudied: form.date, revisits: [] };
    if (zh_topicMap[topicKey]) {
      currentTopicData.revisits.push({
        date: form.date,
        score: form.score ? parseFloat(form.score) : null,
        type: form.phase
      });
    }
    setTopicMap({ ...zh_topicMap, [topicKey]: currentTopicData });

    // Reset Form (keep some defaults)
    setForm({ ...form, topic: '', customTopic: '', score: '', notes: '' });
  };

  return (
    <div className="page-inner fade-in">
      <div className="card">
        <div className="label-caps" style={{ marginBottom: 20 }}>Intel Collection Log</div>
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

          {isDuplicate && (
            <div style={{ padding: '8px 12px', border: '1px solid var(--amber)', color: 'var(--amber)', fontSize: 10, borderRadius: 4 }}>
              ⚠ Already studied — log as revisit
            </div>
          )}

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
              <label className="label-caps" style={{ display: 'block', marginBottom: 5 }}>Score % (Optional)</label>
              <input type="number" className="inp" style={{ width: '100%' }} value={form.score} onChange={e => setForm({...form, score: e.target.value})} min="0" max="100" />
            </div>
          </div>

          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: 5 }}>Mission Notes / Error Patterns</label>
            <textarea className="inp" style={{ width: '100%', height: 60 }} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Key takeaways or mistakes..." />
          </div>

          <button type="submit" className="btn" style={{ borderColor: 'var(--green)', color: 'var(--green)', padding: '12px', marginTop: 10 }}>
            FILE SESSION LOG
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="label-caps">Recent Operations</div>
          <div style={{ fontSize: 10, color: 'var(--text4)' }}>Showing last 20 sessions</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: 'var(--bg2)', textAlign: 'left' }}>
                <th className="label-caps" style={{ padding: '12px 20px' }}>Date</th>
                <th className="label-caps" style={{ padding: '12px 20px' }}>Subject / Topic</th>
                <th className="label-caps" style={{ padding: '12px 20px' }}>Phase</th>
                <th className="label-caps" style={{ padding: '12px 20px' }}>Dur</th>
                <th className="label-caps" style={{ padding: '12px 20px' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {zh_sessions.slice(0, 20).map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--text4)' }}>{s.date.split('-').slice(1).join('/')}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ fontWeight: 600 }}>{s.topic}</div>
                    <div style={{ fontSize: 9, color: 'var(--text4)' }}>{s.subject}</div>
                  </td>
                  <td style={{ padding: '12px 20px' }}>{s.phase}</td>
                  <td style={{ padding: '12px 20px' }}>{s.duration}m</td>
                  <td style={{ padding: '12px 20px' }}>
                    {s.score !== null ? (
                      <span style={{ color: s.score >= 60 ? 'var(--green)' : s.score >= 45 ? 'var(--amber)' : 'var(--red)' }}>
                        {s.score}%
                      </span>
                    ) : '--'}
                  </td>
                </tr>
              ))}
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
