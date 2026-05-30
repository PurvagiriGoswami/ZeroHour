import { useState, useMemo, useRef } from 'react';
import { useAppStore } from '../store/useStore';
import { MASTER_TOPICS } from '../data';

const ProgressRing = ({ state }) => {
  const colors = {
    'Untouched': 'var(--bg4)',
    'Studied': '#00d4ff',
    'Revised': '#ffd700',
    'Confident': '#39ff14',
    'Mastered': '#39ff14'
  };
  const fill = {
    'Untouched': 0,
    'Studied': 25,
    'Revised': 50,
    'Confident': 100,
    'Mastered': 100
  };
  const color = colors[state] || colors['Untouched'];
  const percentage = fill[state] || 0;
  const dash = (percentage / 100) * 88;

  return (
    <svg width="24" height="24" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="transparent" stroke="var(--bg4)" strokeWidth="3" />
      <circle 
        cx="16" cy="16" r="14" fill="transparent" 
        stroke={color} strokeWidth="3" 
        strokeDasharray={`${dash} 88`} 
        transform="rotate(-90 16 16)"
        style={{ transition: 'stroke-dasharray 0.3s ease' }}
      />
    </svg>
  );
};

export default function TopicMap() {
  const { zh_topicMap, setTopicMap } = useAppStore();
  const [examFilter, setExamFilter] = useState('ALL');
  const [editingTopic, setEditingTopic] = useState(null);
  const pressTimer = useRef(null);

  const subjects = useMemo(() => {
    return Object.entries(MASTER_TOPICS)
      .filter(([name, data]) => examFilter === 'ALL' || data.exam_tags.includes(examFilter))
      .map(([name, data]) => ({ name, ...data }));
  }, [examFilter]);

  const handleStateCycle = (topicKey) => {
    const data = zh_topicMap[topicKey] || { state: 'Untouched', firstStudied: null, revisits: [] };
    const states = ['Untouched', 'Studied', 'Revised', 'Confident'];
    const currentIndex = states.indexOf(data.state || 'Untouched');
    const nextState = states[(currentIndex + 1) % states.length];
    
    const newTopicData = {
      ...data,
      state: nextState,
      firstStudied: nextState !== 'Untouched' && !data.firstStudied ? new Date().toISOString().split('T')[0] : data.firstStudied
    };
    setTopicMap({ ...zh_topicMap, [topicKey]: newTopicData });
  };

  const handleTouchStart = (topicKey, topicName, data) => {
    pressTimer.current = setTimeout(() => {
      setEditingTopic({ key: topicKey, name: topicName, notes: data?.intel || '' });
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(pressTimer.current);
  };

  const getSubjectProgress = (subName) => {
    const sub = MASTER_TOPICS[subName];
    let total = 0;
    let confident = 0;
    Object.values(sub.categories || {}).forEach(cat => {
      cat.topics.forEach(t => {
        total++;
        if (zh_topicMap[`${subName}::${t.name}`]?.state === 'Confident') confident++;
      });
    });
    return { total, confident, pct: (confident / total) * 100 };
  };

  return (
    <div className="page-inner fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 30 }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: 5 }}>THEATRE TOPIC MAP</h1>
          <p style={{ color: 'var(--text4)', fontSize: 12 }}>Objective readiness and deployment status tracker.</p>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {['ALL', 'CDS', 'AFCAT'].map(f => (
            <button 
              key={f} 
              onClick={() => setExamFilter(f)}
              className={`btn ${examFilter === f ? 'active' : ''}`}
              style={{ fontSize: 9, padding: '4px 10px' }}
            >{f}</button>
          ))}
        </div>
      </div>

      {subjects.map(sub => {
        const progress = getSubjectProgress(sub.name);
        return (
          <div key={sub.name} style={{ marginBottom: 40 }}>
            <div style={{ marginBottom: 15 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h2 className="label-caps" style={{ fontSize: 14, color: 'var(--indigo)' }}>{sub.name}</h2>
                <div style={{ fontSize: 10, fontWeight: 800 }}>{progress.confident} / {progress.total} Confident</div>
              </div>
              <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${progress.pct}%`, background: 'var(--green)', borderRadius: 2 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 15 }}>
              {Object.entries(sub.categories || {}).map(([catName, catData]) => (
                catData.topics.map(t => {
                  const topicKey = `${sub.name}::${t.name}`;
                  const data = zh_topicMap[topicKey];
                  const isStarred = t.name.includes('⭐');
                  return (
                    <div 
                      key={t.name}
                      className="card"
                      onMouseDown={() => handleTouchStart(topicKey, t.name, data)}
                      onMouseUp={handleTouchEnd}
                      onMouseLeave={handleTouchEnd}
                      onClick={() => handleStateCycle(topicKey)}
                      style={{ 
                        padding: '12px 15px', 
                        cursor: 'pointer',
                        borderLeft: isStarred ? '3px solid #ffd700' : '1px solid var(--border)',
                        background: isStarred ? 'rgba(255,215,0,0.05)' : 'var(--bg2)',
                        position: 'relative'
                      }}
                    >
                      {isStarred && (
                        <div style={{ position: 'absolute', top: 5, right: 5, fontSize: 10 }}>⭐</div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4 }}>{t.name.replace('⭐ ', '')}</div>
                        <ProgressRing state={data?.state || 'Untouched'} />
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text4)', marginTop: 8 }}>{catName}</div>
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        );
      })}

      {editingTopic && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card pop-in" style={{ maxWidth: 500, width: '100%', border: '1px solid var(--green)' }}>
            <div className="label-caps" style={{ color: 'var(--green)', marginBottom: 12 }}>Tactical Intel Briefing</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24 }}>{editingTopic.name}</h2>
            <textarea 
              className="ta" 
              style={{ minHeight: 200, marginBottom: 24 }} 
              placeholder="Notes..."
              value={editingTopic.notes}
              onChange={e => setEditingTopic({ ...editingTopic, notes: e.target.value })}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setEditingTopic(null)}>CLOSE</button>
              <button className="btn" style={{ flex: 2, borderColor: 'var(--green)' }} onClick={() => {
                setTopicMap({ ...zh_topicMap, [editingTopic.key]: { ...(zh_topicMap[editingTopic.key] || {}), intel: editingTopic.notes } });
                setEditingTopic(null);
              }}>SAVE INTEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
