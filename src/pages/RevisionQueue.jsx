import { useState } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { MASTER_TOPICS } from '../data';

export default function RevisionQueue({ onNav }) {
  const { zh_sessions, zh_topicMap, setTopicMap, setSessions } = useAppStore(
    useShallow(s => ({
      zh_sessions: s.zh_sessions,
      zh_topicMap: s.zh_topicMap,
      setTopicMap: s.setTopicMap,
      setSessions: s.setSessions
    }))
  );

  const [expanded, setExpanded] = useState({ overdue: true, today: false, upcoming: false });

  const today = new Date().toISOString().split('T')[0];

  const getDueStatus = (topicKey, data) => {
    if (!data.firstStudied || data.state === 'Confident' || data.state === 'Mastered') return null;
    const firstDate = new Date(data.firstStudied);
    const intervals = [1, 3, 7, 14, 30];
    const dueDates = intervals.map(days => {
      const d = new Date(firstDate);
      d.setDate(d.getDate() + days);
      return { days, date: d.toISOString().split('T')[0] };
    });

    const revisitsDone = data.revisits || [];

    const queue = dueDates.map(due => {
      const isDone = revisitsDone.some(r => {
        const rDate = new Date(r.date);
        const dDate = new Date(due.date);
        const diffDays = Math.abs((rDate - dDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 2;
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

  const handleMarkConfident = (item) => {
    const topicData = zh_topicMap[item.topicKey];
    const newTopicData = {
      ...topicData,
      state: item.days === 30 ? 'Mastered' : 'Confident',
      revisits: [...(topicData.revisits || []), { date: today, type: 'Marked Confident' }]
    };

    setTopicMap({ ...zh_topicMap, [item.topicKey]: newTopicData });

    setSessions([{
      id: Date.now().toString(),
      date: today,
      subject: item.subject,
      topic: item.topic,
      phase: 'Marked Confident',
      duration: 0,
      notes: 'Marked Confident from Revision Queue'
    }, ...zh_sessions]);
  };

  const handleSnooze = (item) => {
    const topicData = zh_topicMap[item.topicKey];
    // Push the "firstStudied" forward by 1 day to push all intervals forward
    const d = new Date(topicData.firstStudied);
    d.setDate(d.getDate() + 1);
    
    setTopicMap({
      ...zh_topicMap,
      [item.topicKey]: { ...topicData, firstStudied: d.toISOString().split('T')[0] }
    });
  };

  const RenderSection = ({ id, title, items, color }) => (
    <div style={{ marginBottom: 15 }}>
      <div 
        onClick={() => setExpanded({ ...expanded, [id]: !expanded[id] })}
        style={{ 
          background: 'var(--bg2)', padding: '12px 20px', borderRadius: 8, cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${color}44`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }}></span>
          <span className="label-caps" style={{ color }}>{title}</span>
          <span style={{ fontSize: 10, color: 'var(--text4)' }}>({items.length})</span>
        </div>
        <span>{expanded[id] ? '−' : '+'}</span>
      </div>

      {expanded[id] && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {items.length === 0 ? (
            <div style={{ padding: 20, color: 'var(--text4)', border: '1px dashed var(--border)', borderRadius: 8, textAlign: 'center', fontSize: 11 }}>
              No items in this sector.
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.topicKey}-${item.days}`} className="card" style={{ padding: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 5 }}>{item.topic}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ padding: '2px 8px', background: 'var(--bg4)', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>{item.subject}</span>
                      <span style={{ padding: '2px 8px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--indigo)', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>Day-{item.days}</span>
                      {item.overdue > 0 ? (
                        <span style={{ padding: '2px 8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>{item.overdue}D OVERDUE</span>
                      ) : (
                        <span style={{ padding: '2px 8px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--green)', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>Due {item.date}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => onNav('topics')} style={{ background: 'none', border: 'none', color: 'var(--text4)', cursor: 'pointer', fontSize: 12 }}>👁</button>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleMarkConfident(item)} className="btn" style={{ flex: 2, fontSize: 10, padding: '8px', borderColor: 'var(--green)', color: 'var(--green)' }}>
                    ✅ CONFIDENT
                  </button>
                  <button onClick={() => handleSnooze(item)} className="btn" style={{ flex: 1, fontSize: 10, padding: '8px', borderColor: 'var(--amber)', color: 'var(--amber)' }}>
                    📅 SNOOZE
                  </button>
                  <button onClick={() => onNav('topics')} className="btn" style={{ flex: 1, fontSize: 10, padding: '8px' }}>
                    REVIEW
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="page-inner fade-in">
      <div style={{ marginBottom: 30 }}>
        <h1 className="card-title" style={{ fontSize: 24 }}>REVISION QUEUE</h1>
        <p style={{ color: 'var(--text4)', fontSize: 11 }}>Spaced repetition engine following 1-3-7-14-30 day protocol.</p>
      </div>

      <RenderSection id="overdue" title="🔴 OVERDUE" items={overdue} color="#ef4444" />
      <RenderSection id="today" title="🟡 DUE TODAY" items={dueToday} color="#f59e0b" />
      <RenderSection id="upcoming" title="🟢 UPCOMING" items={upcoming} color="#22c55e" />
    </div>
  );
}
