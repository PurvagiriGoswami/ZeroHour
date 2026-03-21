import { useMemo } from 'react'
import { useStore } from '../store'
import { SUBC } from '../data'
import { getWeaknessLevel, analyzeSubjectPerformance, analyzeTopicPerformance, getPerformanceTrend, getOverallAccuracy } from '../utils/weaknessEngine'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'

const CHART_COLORS = ['#ffd700', '#00d4ff', '#39ff14', '#bf80ff', '#ff3333', '#ff8888']

export default function Analytics() {
  const { state } = useStore()
  const quizResults = state?.quizResults || []
  const mocks = state?.mocks || []
  const syl = state?.syl || []
  const vocab = state?.vocab || []

  const overallAcc = getOverallAccuracy(quizResults) || 0
  const overall = getWeaknessLevel(overallAcc) || { color: 'var(--text4)', emoji: '❓' }

  // Subject-wise performance
  const subjectPerf = useMemo(() => {
    const data = analyzeSubjectPerformance(quizResults)
    return Object.entries(data).map(([sub, d]) => ({
      name: sub, accuracy: d.accuracy, correct: d.correct, total: d.total,
      fill: SUBC[sub] || '#ffd700',
    }))
  }, [quizResults])

  // Topic-wise performance
  const topicPerf = useMemo(() => {
    const data = analyzeTopicPerformance(quizResults)
    return Object.entries(data)
      .map(([topic, d]) => ({ name: topic, accuracy: d.accuracy, correct: d.correct, total: d.total }))
      .sort((a, b) => a.accuracy - b.accuracy)
  }, [quizResults])

  // Performance trend
  const trend = useMemo(() => getPerformanceTrend(quizResults, 15), [quizResults])

  // Mock test scores
  const mockScores = useMemo(() => {
    try {
      if (!mocks || !mocks.length) return []
      return [...mocks].reverse().slice(0, 10).reverse().map((m, i) => {
        let val = m?.score !== undefined ? m.score : (m?.total || 0)
        if (typeof val === 'string') val = parseInt(val.split('/')[0]) || 0
        return {
          name: m?.id ? m.id.substring(0,2)+i : `M${i + 1}`,
          score: typeof val === 'number' && !isNaN(val) ? val : 0,
          target: m?.total ? Math.round(m.total * 0.6) : 160,
        }
      })
    } catch(e) { return [] }
  }, [mocks])

  // Mistake Analysis
  const mistakeAnalysis = useMemo(() => {
    try {
      const types = {}
      quizResults.forEach(qr => {
        (qr?.answers || []).filter(a => !a?.isCorrect).forEach(a => {
          const t = a?.type || 'Other'
          types[t] = (types[t] || 0) + 1
        })
      })
      return Object.entries(types).map(([name, value]) => ({ name, value }))
    } catch(e) { return [] }
  }, [quizResults])

  // Subject progress
  const subjectProgress = useMemo(() => {
    const subs = ['Maths', 'English', 'GS', 'AFCAT']
    return subs.map(s => {
      const topics = syl.filter(t => t.sub === s)
      const done = topics.filter(t => t.status === 'Done').length
      return { name: s, done, total: topics.length, pct: topics.length > 0 ? Math.round(done / topics.length * 100) : 0, fill: SUBC[s] }
    })
  }, [syl])

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', fontFamily: "'Share Tech Mono',monospace", fontSize: 13 }}>
        <div style={{ color: 'var(--text)', marginBottom: 8, fontWeight: 600 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color || p.fill, marginTop: 4 }}>
            {p.name}: {p.value}{typeof p.value === 'number' && p.name?.includes('ccuracy') ? '%' : ''}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="page-inner fade-in">
      {/* Overall Stats */}
      <div className="g4 keep" style={{marginBottom:12}}>
        {[
          ['ACCURACY', quizResults.length > 0 ? `${overallAcc}%` : '—', overall.color],
          ['QUIZZES', quizResults.length, 'var(--cyan)'],
          ['MOCKS', mocks.length, 'var(--green)'],
          ['VOCAB', vocab.length, 'var(--gold)'],
        ].map(([l,v,c]) => (
          <div key={l} className="card" style={{textAlign:'center', padding:12, marginBottom:0, borderColor:`${c}22`}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:24, color:c}}>{v}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:'var(--text4)', marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        {/* Quiz Accuracy Trend */}
        <div className="card">
          <div className="card-title">📈 QUIZ ACCURACY TREND</div>
          {trend.length > 1 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{fill:'var(--text2)', fontSize:12, fontFamily:"'Share Tech Mono',monospace"}} tickFormatter={d => d ? d.slice(5) : ''} dy={10} />
                <YAxis tick={{fill:'var(--text2)', fontSize:12}} domain={[0, 100]} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="accuracy" stroke="var(--green)" strokeWidth={3} dot={{fill:'var(--green)', r:5}} activeDot={{r:8}} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty">// TAKE MORE QUIZZES TO SEE TRENDS</div>
          )}
        </div>

        {/* Subject-wise Accuracy */}
        <div className="card">
          <div className="card-title">📊 SUBJECT ACCURACY</div>
          {subjectPerf.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={subjectPerf} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{fill:'var(--text2)', fontSize:12, fontFamily:"'Share Tech Mono',monospace"}} dy={10} />
                <YAxis tick={{fill:'var(--text2)', fontSize:12}} domain={[0, 100]} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="accuracy" name="Accuracy %" radius={[4, 4, 0, 0]}>
                  {subjectPerf.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} fillOpacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty">// COMPLETE QUIZZES TO SEE SUBJECT DATA</div>
          )}
        </div>
      </div>

      <div className="g2">
        {/* Topic-wise Performance */}
        <div className="card">
          <div className="card-title">🎯 TOPIC PERFORMANCE</div>
          {topicPerf.length > 0 ? (
            <>
              {topicPerf.map((t, i) => {
                const w = getWeaknessLevel(t.accuracy)
                return (
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3}}>
                      <span style={{color:'var(--text)', display:'flex', gap:6, alignItems:'center'}}>
                        {w.emoji} {t.name}
                      </span>
                      <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:w.color}}>
                        {t.accuracy}% ({t.correct}/{t.total})
                      </span>
                    </div>
                    <div className="pb">
                      <div className="pf" style={{width:`${t.accuracy}%`, background:w.color}}/>
                    </div>
                  </div>
                )
              })}
            </>
          ) : (
            <div className="empty">// NO TOPIC DATA YET</div>
          )}
        </div>

        {/* Mistake Analysis */}
        <div className="card">
          <div className="card-title">❌ MISTAKE ANALYSIS</div>
          {mistakeAnalysis.length > 0 ? (
            <div style={{ width: '100%', height: 260, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie data={mistakeAnalysis} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={40}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={true}
                    style={{fill:'var(--text)', fontSize:11, fontFamily:"'Share Tech Mono',monospace", fontWeight: 600}}>
                    {mistakeAnalysis.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.9} stroke="var(--bg3)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty">// NO MISTAKES RECORDED YET</div>
          )}
        </div>
      </div>

      <div className="g2">
        {/* Mock Test Scores */}
        <div className="card">
          <div className="card-title">📝 MOCK SCORES</div>
          {mockScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={mockScores} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{fill:'var(--text2)', fontSize:12, fontFamily:"'Share Tech Mono',monospace"}} dy={10} />
                <YAxis tick={{fill:'var(--text2)', fontSize:12}} domain={[0, 300]} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" fill="var(--green)" fillOpacity={0.9} name="Score" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="var(--gold)" fillOpacity={0.4} name="Target" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty">// ADD MOCK TESTS TO SEE SCORES</div>
          )}
        </div>

        {/* Syllabus Progress */}
        <div className="card">
          <div className="card-title">📚 SYLLABUS PROGRESS</div>
          {subjectProgress.map(s => (
            <div key={s.name} style={{marginBottom:10}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3}}>
                <span style={{color: s.fill, fontWeight:600}}>{s.name}</span>
                <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:'var(--text3)'}}>
                  {s.done}/{s.total} · {s.pct}%
                </span>
              </div>
              <div className="pb"><div className="pf" style={{width:`${s.pct}%`, background: s.fill}}/></div>
            </div>
          ))}
        </div>
      </div>

      {/* Weakness Summary */}
      {topicPerf.filter(t => t.accuracy < 60).length > 0 && (
        <div className="card" style={{borderColor:'#ff333344', background:'#1a0000'}}>
          <div className="card-title" style={{color:'var(--red)'}}>🔴 WEAK AREAS — NEED FOCUS</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
            {topicPerf.filter(t => t.accuracy < 60).map((t, i) => (
              <div key={i} style={{
                padding:'8px 12px', background:'#2a0a0a', border:'1px solid #ff333333',
                borderRadius:4, fontSize:12, display:'flex', gap:6, alignItems:'center',
              }}>
                <span style={{color:'var(--red)'}}>🔴</span>
                <span style={{color:'var(--text)'}}>{t.name}</span>
                <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:'var(--red)'}}>{t.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
