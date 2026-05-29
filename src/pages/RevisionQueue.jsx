import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { MASTER_TOPICS } from '../data';

export default function RevisionQueue() {
  const { zh_sessions, zh_topicMap, setTopicMap, setSessions } = useAppStore(
    useShallow(s => ({
      zh_sessions: s.zh_sessions,
      zh_topicMap: s.zh_topicMap,
      setTopicMap: s.setTopicMap,
      setSessions: s.setSessions
    }))
  );

  const today = new Date().toISOString().split('T')[0];

  const getDueStatus = (topicKey, data) => {
    if (!data.firstStudied) return null;
    const firstDate = new Date(data.firstStudied);
    const intervals = [7, 14, 30];
    const dueDates = intervals.map(days => {
      const d = new Date(firstDate);
      d.setDate(d.getDate() + days);
      return { days, date: d.toISOString().split('T')[0] };
    });

    // A revisit is "done" if a session was logged for that topic within ±2 days of the due date
    // with phase = "Spaced Revision" or "Active Recall".
    const revisitsDone = data.revisits || [];

    const queue = dueDates.map(due => {
      const isDone = revisitsDone.some(r => {
        const rDate = new Date(r.date);
        const dDate = new Date(due.date);
        const diffDays = Math.abs((rDate - dDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 2 && (r.type === 'Spaced Revision' || r.type === 'Active Recall');
      });

      const dDate = new Date(due.date);
      const tDate = new Date(today);
      const diffDays = Math.ceil((tDate - dDate) / (1000 * 60 * 60 * 24));

      return {
        ...due,
        isDone,
        overdue: diffDays > 0 && !isDone ? diffDays : 0,
        dueToday: diffDays === 0 && !isDone,
        upcoming: diffDays < 0 && diffDays >= -7 && !isDone
      };
    });

    return queue;
  };

  const queueItems = [];
  Object.entries(zh_topicMap).forEach(([topicKey, data]) => {
    const status = getDueStatus(topicKey, data);
    if (!status) return;

    status.forEach(s => {
      if (!s.isDone) {
        queueItems.push({
          topicKey,
          subject: topicKey.split('::')[0],
          topic: topicKey.split('::')[1],
          ...s
        });
      }
    });
  });

  const overdue = queueItems.filter(i => i.overdue > 0).sort((a, b) => b.overdue - a.overdue);
  const dueToday = queueItems.filter(i => i.dueToday);
  const upcoming = queueItems.filter(i => i.upcoming).sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleMarkRevised = (item, score) => {
    const newRevisit = {
      date: today,
      score: score || 0,
      type: 'Spaced Revision'
    };

    const newTopicData = {
      ...zh_topicMap[item.topicKey],
      revisits: [...(zh_topicMap[item.topicKey].revisits || []), newRevisit]
    };

    setTopicMap({
      ...zh_topicMap,
      [item.topicKey]: newTopicData
    });

    // Also log as a session
    const newSession = {
      id: Date.now().toString(),
      date: today,
      subject: item.subject,
      topic: item.topic,
      phase: 'Spaced Revision',
      duration: 30, // Default duration for quick revision
      score: score || 0,
      notes: `Spaced Revision (Day ${item.days})`
    };
    setSessions([newSession, ...zh_sessions]);
  };

  const RenderSection = ({ title, items, color }) => (
    <div style={{ marginBottom: 30 }}>
      <div className="label-caps" style={{ color, marginBottom: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }}></span>
        {title} ({items.length})
      </div>
      {items.length === 0 ? (
        <div style={{ padding: 20, color: 'var(--text4)', border: '1px dashed var(--border)', borderRadius: 8, textAlign: 'center' }}>
          No topics in this sector.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item, idx) => (
            <div key={`${item.topicKey}-${item.days}`} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{item.topic}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <span className="label-caps" style={{ color: 'var(--text3)' }}>{item.subject}</span>
                  <span className="label-caps" style={{ color: 'var(--indigo)' }}>Day-{item.days}</span>
                  {item.overdue > 0 && <span className="label-caps" style={{ color: 'var(--red)' }}>{item.overdue}D OVERDUE</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input 
                  type="number" className="inp" placeholder="Score %" 
                  style={{ width: 80, padding: '6px 10px', fontSize: 12 }} 
                  id={`score-${idx}`}
                />
                <button 
                  className="btn" 
                  style={{ fontSize: 10, padding: '6px 12px', borderColor: color }}
                  onClick={() => {
                    const score = document.getElementById(`score-${idx}`).value;
                    handleMarkRevised(item, score);
                  }}
                >
                  MARK REVISED
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="page-inner fade-in">
      <div style={{ marginBottom: 30 }}>
        <h1 className="card-title">REVISION QUEUE</h1>
        <p style={{ color: 'var(--text4)', fontSize: 12 }}>Spaced repetition engine following 7-14-30 day protocol.</p>
      </div>

      <RenderSection title="OVERDUE" items={overdue} color="#ef4444" />
      <RenderSection title="DUE TODAY" items={dueToday} color="#f59e0b" />
      <RenderSection title="COMING UP" items={upcoming} color="#22c55e" />
    </div>
  );
}
