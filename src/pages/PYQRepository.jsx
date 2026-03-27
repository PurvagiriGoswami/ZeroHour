import { useState, useMemo } from 'react'
import { ENHANCED_PYQ_BANK } from '../data/enhancedPyqBank'

export default function PYQRepository() {
  const [filter, setFilter] = useState({ subject: 'All', topic: 'All', difficulty: 'All' })
  const [search, setSearch] = useState('')

  const subjects = ['All', ...new Set(ENHANCED_PYQ_BANK.map(q => q.subject))]
  const topics = ['All', ...new Set(ENHANCED_PYQ_BANK.filter(q => filter.subject === 'All' || q.subject === filter.subject).map(q => q.topic))]

  const filtered = useMemo(() => {
    return ENHANCED_PYQ_BANK.filter(q => {
      return (filter.subject === 'All' || q.subject === filter.subject) &&
             (filter.topic === 'All' || q.topic === filter.topic) &&
             (filter.difficulty === 'All' || q.difficulty === filter.difficulty) &&
             (q.question.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase()))
    })
  }, [filter, search])

  return (
    <div className="page-inner fade-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', fontFamily: "'Orbitron', sans-serif" }}>PYQ REPOSITORY</h1>
        <p style={{ color: 'var(--text4)' }}>Complete archive of 500+ previous year questions with detailed solutions.</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '24px', borderRadius: '24px', background: 'var(--bg2)', border: '1px solid var(--border)', marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text4)', display: 'block', marginBottom: '8px' }}>SEARCH</label>
          <input 
            type="text" 
            placeholder="Search keywords..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text4)', display: 'block', marginBottom: '8px' }}>SUBJECT</label>
          <select value={filter.subject} onChange={(e) => setFilter({...filter, subject: e.target.value})} style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text4)', display: 'block', marginBottom: '8px' }}>TOPIC</label>
          <select value={filter.topic} onChange={(e) => setFilter({...filter, topic: e.target.value})} style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text4)', display: 'block', marginBottom: '8px' }}>DIFFICULTY</label>
          <select value={filter.difficulty} onChange={(e) => setFilter({...filter, difficulty: e.target.value})} style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <option value="All">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filtered.slice(0, 50).map((q, i) => (
          <div key={q.id} className="card" style={{ padding: '32px', borderRadius: '24px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '10px', background: 'var(--indigo)', color: 'white', padding: '4px 10px', borderRadius: '4px', fontWeight: '800' }}>{q.subject}</span>
                <span style={{ fontSize: '10px', background: 'var(--bg3)', color: 'var(--text2)', padding: '4px 10px', borderRadius: '4px', fontWeight: '800' }}>{q.year}</span>
              </div>
              <span style={{ fontSize: '10px', color: q.difficulty === 'hard' ? 'var(--red)' : (q.difficulty === 'medium' ? 'var(--gold)' : 'var(--green)'), fontWeight: '900', textTransform: 'uppercase' }}>{q.difficulty}</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', lineHeight: 1.4 }}>{q.question}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {q.options.map((opt, idx) => (
                <div key={idx} style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', fontSize: '14px', color: 'var(--text2)' }}>
                  <strong>{String.fromCharCode(65 + idx)}.</strong> {opt}
                </div>
              ))}
            </div>
            <details style={{ cursor: 'pointer' }}>
              <summary style={{ fontSize: '12px', fontWeight: '900', color: 'var(--indigo)', marginBottom: '12px' }}>VIEW DETAILED SOLUTION</summary>
              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(99,102,241,0.05)', border: '1px dashed var(--indigo)', marginTop: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--green)', marginBottom: '8px' }}>CORRECT OPTION: {q.correct_answer}</div>
                <p style={{ fontSize: '14px', color: 'var(--text3)', lineHeight: 1.6 }}>{q.explanation}</p>
              </div>
            </details>
          </div>
        ))}
        {filtered.length > 50 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text4)' }}>Showing first 50 results. Use search/filter to narrow down.</div>}
      </div>
    </div>
  )
}
