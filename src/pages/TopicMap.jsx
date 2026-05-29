import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useStore';
import { MASTER_TOPICS } from '../data';

export default function TopicMap() {
  const { zh_topicMap, setTopicMap } = useAppStore();
  const [activeSub, setActiveSub] = useState(Object.keys(MASTER_TOPICS)[0]);
  const [editingTopic, setEditingTopic] = useState(null); // { key, name, notes }

  const handleMarkStarted = (subject, topic) => {
    const topicKey = `${subject}::${topic}`;
    const newTopicData = {
      firstStudied: new Date().toISOString().split('T')[0],
      revisits: []
    };
    setTopicMap({ ...zh_topicMap, [topicKey]: newTopicData });
  };

  const getNextDueDate = (firstStudied, revisits) => {
    const completedRounds = revisits.length;
    const intervals = [7, 14, 30];
    if (completedRounds >= intervals.length) return 'MASTERED';

    const firstDate = new Date(firstStudied);
    const dueDate = new Date(firstDate.getTime() + intervals[completedRounds] * 24 * 60 * 60 * 1000);
    return dueDate.toISOString().split('T')[0];
  };

  const handleSaveIntel = () => {
    if (!editingTopic) return;
    const existing = zh_topicMap[editingTopic.key] || { 
      firstStudied: new Date().toISOString().split('T')[0], 
      revisits: [] 
    };
    const newTopicData = {
      ...existing,
      intel: editingTopic.notes
    };
    setTopicMap({ ...zh_topicMap, [editingTopic.key]: newTopicData });
    setEditingTopic(null);
  };

  const currentList = useMemo(() => {
    const sub = MASTER_TOPICS[activeSub];
    const flattened = [];
    Object.entries(sub).forEach(([category, topics]) => {
      topics.forEach(t => {
        flattened.push({ 
          name: t, 
          p: category, 
          isStarred: t.includes('⭐') 
        });
      });
    });
    return flattened;
  }, [activeSub]);

  const stats = useMemo(() => {
    const total = currentList.length;
    const started = currentList.filter(t => !!zh_topicMap[`${activeSub}::${t.name}`]).length;
    return { total, started, pct: total > 0 ? Math.round(started / total * 100) : 0 };
  }, [currentList, zh_topicMap, activeSub]);

  return (
    <div className="page-inner fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 30 }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: 5 }}>THEATRE TOPIC MAP</h1>
          <p style={{ color: 'var(--text4)', fontSize: 12 }}>Objective readiness and deployment status tracker.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="label-caps" style={{ color: 'var(--green)' }}>Readiness Level</div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>{stats.pct}%</div>
          <div style={{ fontSize: 10, color: 'var(--text4)' }}>{stats.started} / {stats.total} Objectives</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 30, overflowX: 'auto', paddingBottom: 10 }}>
        {Object.keys(MASTER_TOPICS).map(sub => (
          <button
            key={sub}
            className={`btn ${activeSub === sub ? 'active' : ''}`}
            onClick={() => setActiveSub(sub)}
            style={{ whiteSpace: 'nowrap', fontSize: 11, padding: '8px 16px' }}
          >
            {sub.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th className="label-caps" style={{ padding: '12px 20px' }}>Objective</th>
              <th className="label-caps" style={{ padding: '12px 20px' }}>Status</th>
              <th className="label-caps" style={{ padding: '12px 20px', textAlign: 'center' }}>Revisits</th>
              <th className="label-caps" style={{ padding: '12px 20px' }}>Next Due</th>
              <th className="label-caps" style={{ padding: '12px 20px', textAlign: 'right' }}>Tactical Intel</th>
            </tr>
          </thead>
              <tbody>
                {currentList.map(topic => {
                  const topicKey = `${activeSub}::${topic.name}`;
                  const data = zh_topicMap[topicKey];
                  const displayCategory = topic.p;
                  const categoryColor = displayCategory.includes('ESSENTIAL') ? 'var(--red)' : 
                                      displayCategory.includes('HIGH') ? 'var(--amber)' : 
                                      'var(--green)';

                  return (
                    <tr key={topic.name} style={{ borderBottom: '1px solid var(--border)', background: data ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: topic.isStarred ? 'var(--amber)' : 'inherit' }}>
                            {topic.name}
                          </span>
                          <span className="label-caps" style={{ fontSize: 8, color: categoryColor, background: `${categoryColor}11`, padding: '2px 6px', borderRadius: 4, border: `1px solid ${categoryColor}33` }}>
                            {displayCategory}
                          </span>
                        </div>
                      </td>
                  <td style={{ padding: '16px 20px' }}>
                    {data ? (
                      <div style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800 }}>ACTIVE</div>
                          <div style={{ fontSize: 9, color: 'var(--text4)' }}>SINCE {data.firstStudied}</div>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="btn" 
                        style={{ fontSize: 9, padding: '6px 12px', borderColor: 'var(--border)', color: 'var(--text4)' }}
                        onClick={() => handleMarkStarted(activeSub, topic.name)}
                      >
                        INITIATE MISSION
                      </button>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: data?.revisits.length > 0 ? 'var(--indigo)' : 'var(--text4)' }}>
                    {data ? data.revisits.length : '--'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {data ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)' }}>
                        {getNextDueDate(data.firstStudied, data.revisits)}
                      </span>
                    ) : '--'}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button 
                      className="btn" 
                      style={{ 
                        fontSize: 9, padding: '6px 12px', 
                        borderColor: data?.intel ? 'var(--green)' : 'var(--border)',
                        background: data?.intel ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
                        color: data?.intel ? 'var(--green)' : 'var(--text4)'
                      }}
                      onClick={() => setEditingTopic({ key: topicKey, name: topic.name, notes: data?.intel || '' })}
                    >
                      {data?.intel ? 'VIEW INTEL' : '+ ADD INTEL'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingTopic && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card pop-in" style={{ maxWidth: 500, width: '100%', border: '1px solid var(--green)', boxShadow: '0 0 40px rgba(34, 197, 94, 0.1)' }}>
            <div className="label-caps" style={{ color: 'var(--green)', marginBottom: 12 }}>Tactical Intel Briefing</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24, letterSpacing: -0.5 }}>{editingTopic.name}</h2>
            <textarea 
              className="ta" 
              style={{ minHeight: 200, marginBottom: 24, fontSize: 13, lineHeight: 1.6 }} 
              placeholder="Record key formulas, tactical shortcuts, or critical observations for this objective..."
              value={editingTopic.notes}
              onChange={e => setEditingTopic({ ...editingTopic, notes: e.target.value })}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setEditingTopic(null)}>ABORT</button>
              <button className="btn btn-g" style={{ flex: 2 }} onClick={handleSaveIntel}>SAVE INTEL DATA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
