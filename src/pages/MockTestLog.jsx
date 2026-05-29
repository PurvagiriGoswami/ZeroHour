import { useState } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';

const TEST_TYPES = [
  'CDS Full Mock', 'CDS Section Math', 'CDS Section English', 
  'CDS Section GK', 'AFCAT Full Mock', 'Chapter Test'
];

const BENCHMARKS = [
  { week: 6, label: 'CDS Mock 1', target: '50% overall, 45%+ Math' },
  { week: 8, label: 'AFCAT Mock', target: '60% overall' },
  { week: 10, label: 'CDS Mock 2', target: '60% overall, 55%+ Math' },
  { week: 13, label: 'Final', target: '65%+ Math, 70%+ English' },
];

export default function MockTestLog() {
  const { zh_mocks, setZhMocks } = useAppStore(
    useShallow(s => ({
      zh_mocks: s.zh_mocks,
      setZhMocks: s.setZhMocks
    }))
  );

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: TEST_TYPES[0],
    math: '',
    english: '',
    gk: '',
    science: '',
    total: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMock = {
      ...form,
      id: Date.now().toString(),
      math: parseFloat(form.math) || 0,
      english: parseFloat(form.english) || 0,
      gk: parseFloat(form.gk) || 0,
      science: parseFloat(form.science) || 0,
      total: parseFloat(form.total) || 0,
    };
    setZhMocks([newMock, ...zh_mocks]);
    setShowForm(false);
    setForm({
      date: new Date().toISOString().split('T')[0],
      type: TEST_TYPES[0],
      math: '',
      english: '',
      gk: '',
      science: '',
      total: '',
      notes: ''
    });
  };

  const getScoreColor = (score) => {
    if (score >= 60) return '#22c55e';
    if (score >= 45) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="page-inner fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: 5 }}>MOCK TEST LOG</h1>
          <p style={{ color: 'var(--text4)', fontSize: 12 }}>Strategic performance tracking & benchmarks.</p>
        </div>
        <button className="btn" onClick={() => setShowForm(!showForm)} style={{ borderColor: 'var(--indigo)' }}>
          {showForm ? 'CANCEL' : 'LOG NEW TEST'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        <div className="main-col">
          {showForm && (
            <form className="card pop-in" onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
                <div>
                  <label className="label-caps">Date</label>
                  <input type="date" className="inp" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
                <div>
                  <label className="label-caps">Test Type</label>
                  <select className="inp" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {TEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 15 }}>
                <div>
                  <label className="label-caps">Math %</label>
                  <input type="number" className="inp" value={form.math} onChange={e => setForm({...form, math: e.target.value})} placeholder="0" />
                </div>
                <div>
                  <label className="label-caps">Eng %</label>
                  <input type="number" className="inp" value={form.english} onChange={e => setForm({...form, english: e.target.value})} placeholder="0" />
                </div>
                <div>
                  <label className="label-caps">GK %</label>
                  <input type="number" className="inp" value={form.gk} onChange={e => setForm({...form, gk: e.target.value})} placeholder="0" />
                </div>
                <div>
                  <label className="label-caps">Sci %</label>
                  <input type="number" className="inp" value={form.science} onChange={e => setForm({...form, science: e.target.value})} placeholder="0" />
                </div>
              </div>

              <div style={{ marginBottom: 15 }}>
                <label className="label-caps">Overall %</label>
                <input type="number" className="inp" value={form.total} onChange={e => setForm({...form, total: e.target.value})} placeholder="0" required />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="label-caps">Error Notes</label>
                <textarea className="ta" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Patterns, silly mistakes, weak topics..." />
              </div>

              <button type="submit" className="btn" style={{ width: '100%', borderColor: 'var(--green)', background: 'rgba(34, 197, 94, 0.1)' }}>
                SUBMIT INTEL
              </button>
            </form>
          )}

          <div className="history">
            <div className="label-caps" style={{ marginBottom: 15 }}>Test History</div>
            {zh_mocks.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text4)' }}>
                No mock tests logged yet.
              </div>
            ) : (
              zh_mocks.map(mock => (
                <div key={mock.id} className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{mock.type}</div>
                      <div style={{ fontSize: 10, color: 'var(--text4)' }}>{mock.date}</div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: getScoreColor(mock.total) }}>
                      {mock.total}%
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 15 }}>
                    {[
                      { l: 'MTH', v: mock.math },
                      { l: 'ENG', v: mock.english },
                      { l: 'GK', v: mock.gk },
                      { l: 'SCI', v: mock.science }
                    ].map(s => (
                      <div key={s.l} style={{ textAlign: 'center', padding: '8px', background: 'var(--bg3)', borderRadius: 6 }}>
                        <div className="label-caps" style={{ fontSize: 8 }}>{s.l}</div>
                        <div style={{ fontWeight: 700, color: getScoreColor(s.v) }}>{s.v}%</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${mock.total}%`, background: getScoreColor(mock.total) }} />
                  </div>

                  {mock.notes && (
                    <div style={{ marginTop: 15, fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>
                      " {mock.notes} "
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-col">
          <div className="card" style={{ borderColor: 'var(--amber)' }}>
            <div className="label-caps" style={{ color: 'var(--amber)', marginBottom: 15 }}>Benchmark Targets</div>
            {BENCHMARKS.map((b, idx) => (
              <div key={idx} style={{ marginBottom: 15, paddingBottom: 15, borderBottom: idx < BENCHMARKS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{b.label}</span>
                  <span className="label-caps" style={{ fontSize: 8 }}>Week {b.week}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text4)' }}>{b.target}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 300px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
