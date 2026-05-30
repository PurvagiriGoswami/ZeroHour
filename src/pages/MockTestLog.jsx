import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { CDS_PAPER, AFCAT_PAPER } from '../data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

export default function MockTestLog() {
  const { zh_mocks, setZhMocks, settings, setTopicMap, zh_topicMap } = useAppStore(
    useShallow(s => ({
      zh_mocks: s.zh_mocks,
      setZhMocks: s.setZhMocks,
      settings: s.settings,
      setTopicMap: s.setTopicMap,
      zh_topicMap: s.zh_topicMap
    }))
  );

  const [showForm, setShowForm] = useState(false);
  const [examType, setExamType] = useState('CDS');
  const [historyFilter, setHistoryFilter] = useState('ALL');
  
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    scores: {} // will hold { subjectId: { attempted, correct } }
  });

  const paper = examType === 'CDS' ? CDS_PAPER : AFCAT_PAPER;

  const calculated = useMemo(() => {
    const res = { subjects: {}, totalMarks: 0, totalMax: paper.totalMarks, accuracy: 0 };
    let totalCorrect = 0;
    let totalAttempted = 0;

    paper.subjects.forEach(sub => {
      const s = form.scores[sub.id] || { attempted: 0, correct: 0 };
      const wrong = s.attempted - s.correct;
      const marks = (s.correct * sub.correct) - (wrong * sub.penalty);
      const acc = s.attempted > 0 ? (s.correct / s.attempted) * 100 : 0;
      
      res.subjects[sub.id] = { ...s, wrong, marks, acc };
      res.totalMarks += marks;
      totalCorrect += s.correct;
      totalAttempted += s.attempted;
    });

    res.accuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;
    return res;
  }, [form.scores, paper]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMock = {
      id: Date.now().toString(),
      date: form.date,
      type: examType,
      scores: form.scores,
      calculated: calculated,
      total: (calculated.totalMarks / paper.totalMarks) * 100
    };
    setZhMocks([newMock, ...zh_mocks]);
    setShowForm(false);
    setForm({ date: new Date().toISOString().split('T')[0], scores: {} });
  };

  const trendData = useMemo(() => {
    return zh_mocks
      .filter(m => m.type === examType)
      .reverse()
      .map((m, i) => ({
        name: `Mock ${i + 1}`,
        score: m.total,
        ...Object.entries(m.calculated.subjects).reduce((acc, [id, data]) => {
          acc[id] = data.acc;
          return acc;
        }, {})
      }));
  }, [zh_mocks, examType]);

  const weakAreas = useMemo(() => {
    if (zh_mocks.length === 0) return [];
    const lastMock = zh_mocks[0];
    return Object.entries(lastMock.calculated.subjects)
      .sort((a, b) => a[1].acc - b[1].acc)
      .slice(0, 2)
      .map(([id, data]) => ({ id, ...data }));
  }, [zh_mocks]);

  const filteredHistory = zh_mocks.filter(m => historyFilter === 'ALL' || m.type === historyFilter);

  return (
    <div className="page-inner fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: 5 }}>MOCK TEST LOG</h1>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button 
              className={`btn ${examType === 'CDS' ? 'active' : ''}`} 
              onClick={() => { setExamType('CDS'); setForm({ ...form, scores: {} }); }}
              style={{ fontSize: 10, padding: '4px 12px' }}
            >CDS</button>
            <button 
              className={`btn ${examType === 'AFCAT' ? 'active' : ''}`} 
              onClick={() => { setExamType('AFCAT'); setForm({ ...form, scores: {} }); }}
              style={{ fontSize: 10, padding: '4px 12px' }}
            >AFCAT</button>
          </div>
        </div>
        <button className="btn" onClick={() => setShowForm(!showForm)} style={{ borderColor: 'var(--indigo)' }}>
          {showForm ? 'CANCEL' : 'LOG NEW TEST'}
        </button>
      </div>

      {showForm && (
        <form className="card pop-in" onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
          <div style={{ marginBottom: 20 }}>
            <label className="label-caps">Date</label>
            <input type="date" className="inp" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginBottom: 25 }}>
            {paper.subjects.map(sub => (
              <div key={sub.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15, alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{sub.label} <span style={{ fontSize: 9, color: 'var(--text4)' }}>({sub.questions}Q)</span></div>
                <input 
                  type="number" className="inp" placeholder="Attempted" 
                  value={form.scores[sub.id]?.attempted || ''} 
                  onChange={e => setForm({
                    ...form, 
                    scores: { ...form.scores, [sub.id]: { ...form.scores[sub.id], attempted: parseInt(e.target.value) || 0 } }
                  })}
                />
                <input 
                  type="number" className="inp" placeholder="Correct" 
                  value={form.scores[sub.id]?.correct || ''} 
                  onChange={e => setForm({
                    ...form, 
                    scores: { ...form.scores, [sub.id]: { ...form.scores[sub.id], correct: parseInt(e.target.value) || 0 } }
                  })}
                />
              </div>
            ))}
          </div>

          <div className="card" style={{ background: 'var(--bg2)', border: 'none', marginBottom: 20 }}>
            <div className="label-caps" style={{ marginBottom: 15 }}>Auto-Calculated Intel</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 15 }}>
              {paper.subjects.map(sub => {
                const calc = calculated.subjects[sub.id];
                return (
                  <div key={sub.id} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: 'var(--text4)' }}>{sub.label}</div>
                    <div style={{ fontWeight: 800, color: 'var(--green)' }}>{calc.marks.toFixed(1)}M</div>
                    <div style={{ fontSize: 8, color: 'var(--text4)' }}>{calc.acc.toFixed(0)}% Acc</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 20, paddingTop: 15, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <div className="label-caps">Total Score</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--indigo)' }}>{calculated.totalMarks.toFixed(1)} / {paper.totalMarks}</div>
            </div>
          </div>

          <button type="submit" className="btn" style={{ width: '100%', borderColor: 'var(--green)', background: 'rgba(34, 197, 94, 0.1)' }}>
            SUBMIT INTEL
          </button>
        </form>
      )}

      {!showForm && zh_mocks.length > 0 && (
        <div className="card" style={{ marginBottom: 30, padding: '20px' }}>
          <div className="label-caps" style={{ marginBottom: 20 }}>Score Trend — {examType}</div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg4)" />
                <XAxis dataKey="name" stroke="var(--text4)" fontSize={10} />
                <YAxis stroke="var(--text4)" fontSize={10} />
                <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="score" name="Overall %" stroke="var(--indigo)" strokeWidth={3} dot={{ r: 4 }} />
                {paper.subjects.map((sub, i) => (
                  <Line key={sub.id} type="monotone" dataKey={sub.id} name={`${sub.label} %`} stroke={['#39ff14', '#ffd700', '#00d4ff', '#bf80ff', '#ff4444'][i % 5]} strokeWidth={1} dot={{ r: 2 }} />
                ))}
                <ReferenceLine y={settings.cdsCutoff || 160} stroke="var(--red)" strokeDasharray="3 3" label={{ position: 'right', value: 'Cutoff', fill: 'var(--red)', fontSize: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {weakAreas.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--red)', background: 'rgba(239, 68, 68, 0.02)', marginBottom: 30 }}>
          <div className="label-caps" style={{ color: 'var(--red)', marginBottom: 15 }}>Weak Areas from Last Mock</div>
          <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
            {weakAreas.map(w => (
              <div key={w.id} style={{ flex: 1, minWidth: 200, padding: 15, background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontWeight: 800 }}>{w.id.toUpperCase()}</div>
                  <div style={{ color: 'var(--red)', fontWeight: 800 }}>{w.acc.toFixed(0)}% Acc</div>
                </div>
                <button 
                  className="btn" 
                  style={{ width: '100%', fontSize: 9, borderColor: 'var(--indigo)' }}
                  onClick={() => onNav('queue')}
                >
                  ADD TO REVISION QUEUE +
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="history">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <div className="label-caps">Mock Intel History</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['ALL', 'CDS', 'AFCAT'].map(f => (
              <button 
                key={f} 
                onClick={() => setHistoryFilter(f)}
                className={`btn ${historyFilter === f ? 'active' : ''}`}
                style={{ fontSize: 8, padding: '2px 8px' }}
              >{f}</button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text4)' }}>
            No intel logged for this sector.
          </div>
        ) : (
          filteredHistory.map(mock => (
            <div key={mock.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{mock.type} FULL MOCK</div>
                  <div style={{ fontSize: 10, color: 'var(--text4)' }}>{mock.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: mock.total >= 60 ? 'var(--green)' : 'var(--red)' }}>
                    {mock.calculated.totalMarks.toFixed(1)}M
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text4)' }}>{mock.total.toFixed(1)}% Score</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 10 }}>
                {Object.entries(mock.calculated.subjects).map(([id, data]) => (
                  <div key={id} style={{ padding: '8px', background: 'var(--bg3)', borderRadius: 6, textAlign: 'center' }}>
                    <div className="label-caps" style={{ fontSize: 8 }}>{id.toUpperCase()}</div>
                    <div style={{ fontWeight: 700, color: data.acc >= 60 ? 'var(--green)' : 'var(--red)', fontSize: 11 }}>{data.marks.toFixed(1)}</div>
                    <div style={{ fontSize: 8, color: 'var(--text4)' }}>{data.acc.toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
