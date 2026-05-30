import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { MASTER_TOPICS } from '../data';

export default function FeatureModule() {
  const { 
    zh_errors, setErrors, 
    zh_doubts, setDoubts, 
    zh_feynman, setFeynman, 
    zh_flashcards, setFlashcards,
    zh_xp, setXP 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('errors'); // errors | doubts | feynman | flashcards

  // 4. Error Log
  const [errorForm, setErrorForm] = useState({ subject: 'Mathematics', topic: '', mistake: '', correct: '' });
  const handleAddError = (e) => {
    e.preventDefault();
    setErrors([...zh_errors, { ...errorForm, id: Date.now(), date: new Date().toISOString().split('T')[0] }]);
    setXP(zh_xp + 5);
    setErrorForm({ subject: 'Mathematics', topic: '', mistake: '', correct: '' });
  };

  // 14. Doubt Tracker
  const [doubtForm, setDoubtForm] = useState({ subject: 'Mathematics', desc: '' });
  const handleAddDoubt = (e) => {
    e.preventDefault();
    setDoubts([...zh_doubts, { ...doubtForm, id: Date.now(), date: new Date().toISOString().split('T')[0], resolved: false }]);
    setDoubtForm({ subject: 'Mathematics', desc: '' });
  };

  // 12. Feynman Mode
  const [feynmanForm, setFeynmanForm] = useState({ subject: 'Mathematics', text: '' });
  const handleAddFeynman = (e) => {
    e.preventDefault();
    setFeynman([...zh_feynman, { ...feynmanForm, id: Date.now(), date: new Date().toISOString().split('T')[0] }]);
    setFeynmanForm({ subject: 'Mathematics', text: '' });
  };

  // 13. Flashcards
  const [cardForm, setCardForm] = useState({ title: '', content: '', subject: 'Mathematics' });
  const handleAddCard = (e) => {
    e.preventDefault();
    setFlashcards([...zh_flashcards, { ...cardForm, id: Date.now() }]);
    setCardForm({ title: '', content: '', subject: 'Mathematics' });
  };

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: 100 }}>
      <div className="tab-bar-tactical" style={{ display: 'flex', gap: 10, marginBottom: 25, overflowX: 'auto', paddingBottom: 10 }}>
        {['errors', 'doubts', 'feynman', 'flashcards'].map(t => (
          <button 
            key={t} 
            className={`btn ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
            style={{ fontSize: 10, minWidth: 100 }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'errors' && (
        <div className="fade-in">
          <div className="card">
            <div className="label-caps" style={{ marginBottom: 20 }}>4. Error Log with Pattern Alerts</div>
            <form onSubmit={handleAddError} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div className="g2">
                <select className="inp" value={errorForm.subject} onChange={e => setErrorForm({...errorForm, subject: e.target.value})}>
                  {Object.keys(MASTER_TOPICS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input className="inp" placeholder="Topic" value={errorForm.topic} onChange={e => setErrorForm({...errorForm, topic: e.target.value})} required />
              </div>
              <textarea className="inp" placeholder="My Mistake" value={errorForm.mistake} onChange={e => setErrorForm({...errorForm, mistake: e.target.value})} required />
              <input className="inp" placeholder="Correct Answer" value={errorForm.correct} onChange={e => setErrorForm({...errorForm, correct: e.target.value})} required />
              <button type="submit" className="btn btn-g">LOG ERROR & EARN +5 XP</button>
            </form>
          </div>
          <div style={{ marginTop: 20 }}>
            {zh_errors.map(err => (
              <div key={err.id} className="card" style={{ marginBottom: 10, borderLeft: '4px solid var(--red)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span className="label-caps" style={{ fontSize: 9, color: 'var(--red)' }}>{err.subject}</span>
                  <span style={{ fontSize: 9, color: 'var(--text4)' }}>{err.date}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{err.topic}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 5 }}>Mistake: {err.mistake}</div>
                <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 2 }}>Correct: {err.correct}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'doubts' && (
        <div className="fade-in">
          <div className="card">
            <div className="label-caps" style={{ marginBottom: 20 }}>14. Doubt Tracker</div>
            <form onSubmit={handleAddDoubt} style={{ display: 'flex', gap: 10 }}>
              <select className="inp" style={{ width: 120 }} value={doubtForm.subject} onChange={e => setDoubtForm({...doubtForm, subject: e.target.value})}>
                {Object.keys(MASTER_TOPICS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="inp" style={{ flex: 1 }} placeholder="Describe your doubt..." value={doubtForm.desc} onChange={e => setDoubtForm({...doubtForm, desc: e.target.value})} required />
              <button type="submit" className="btn btn-g">+</button>
            </form>
          </div>
          <div style={{ marginTop: 20 }}>
            {zh_doubts.map(d => (
              <div key={d.id} className="card" style={{ marginBottom: 10, opacity: d.resolved ? 0.6 : 1, borderColor: d.resolved ? 'var(--border)' : 'var(--indigo)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="label-caps" style={{ fontSize: 9, color: 'var(--indigo)' }}>{d.subject}</span>
                    <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{d.desc}</div>
                  </div>
                  {!d.resolved && (
                    <button className="btn" style={{ fontSize: 9 }} onClick={() => {
                      setDoubts(zh_doubts.map(x => x.id === d.id ? {...x, resolved: true} : x));
                      setXP(zh_xp + 10);
                    }}>RESOLVE (+10 XP)</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'feynman' && (
        <div className="fade-in">
          <div className="card">
            <div className="label-caps" style={{ marginBottom: 20 }}>12. Feynman Mode — Simple Explanation</div>
            <form onSubmit={handleAddFeynman} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <select className="inp" value={feynmanForm.subject} onChange={e => setFeynmanForm({...feynmanForm, subject: e.target.value})}>
                {Object.keys(MASTER_TOPICS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea className="inp" placeholder="Explain the concept in your own words..." style={{ height: 100 }} value={feynmanForm.text} onChange={e => setFeynmanForm({...feynmanForm, text: e.target.value})} required />
              <button type="submit" className="btn btn-g">SAVE EXPLANATION</button>
            </form>
          </div>
          <div style={{ marginTop: 20 }}>
            {zh_feynman.map(f => (
              <div key={f.id} className="card" style={{ marginBottom: 10 }}>
                <div className="label-caps" style={{ fontSize: 9, marginBottom: 5 }}>{f.subject} • {f.date}</div>
                <div style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'flashcards' && (
        <div className="fade-in">
          <div className="card">
            <div className="label-caps" style={{ marginBottom: 20 }}>13. Formula & Fact Sheet Builder</div>
            <form onSubmit={handleAddCard} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div className="g2">
                <input className="inp" placeholder="Title/Formula" value={cardForm.title} onChange={e => setCardForm({...cardForm, title: e.target.value})} required />
                <select className="inp" value={cardForm.subject} onChange={e => setCardForm({...cardForm, subject: e.target.value})}>
                  {Object.keys(MASTER_TOPICS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <textarea className="inp" placeholder="Content/Details" value={cardForm.content} onChange={e => setCardForm({...cardForm, content: e.target.value})} required />
              <button type="submit" className="btn btn-g">ADD TO SHEET</button>
            </form>
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="label-caps" style={{ fontSize: 10, marginBottom: 15 }}>QUICK REFERENCE SHEET</div>
            {zh_flashcards.map(c => (
              <div key={c.id} className="card" style={{ marginBottom: 10, borderLeft: '3px solid var(--amber)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ fontSize: 13, fontWeight: 900 }}>{c.title}</div>
                  <span className="label-caps" style={{ fontSize: 8 }}>{c.subject}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}