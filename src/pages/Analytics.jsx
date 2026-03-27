import { useMemo } from 'react'
import { useStore } from '../store'
import { SUBC } from '../data'
import { getWeaknessLevel, analyzeSubjectPerformance, analyzeTopicPerformance, getPerformanceTrend, getOverallAccuracy } from '../utils/weaknessEngine'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import SafeChart from '../components/SafeChart'

const CHART_COLORS = ['#ffd700', '#00d4ff', '#39ff14', '#bf80ff', '#ff3333', '#ff8888']

export default function Analytics() {
  const { state } = useStore()
  const quizResults = state?.quizResults || []
  const mocks = state?.mocks || []
  const syl = state?.syl || []
  const vocab = state?.vocab || []

  const overallAcc = getOverallAccuracy(quizResults) || 0
  const overall = getWeaknessLevel(overallAcc) || { color: 'var(--text4)', emoji: '❓', label: 'Incomplete' }

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

  // Weakness Analysis
  const weaknesses = useMemo(() => {
    return topicPerf.filter(t => t.accuracy < 60).slice(0, 5).map(t => ({
      topic: t.name,
      acc: t.accuracy,
      count: t.total,
      sub: syl.find(s => s.topic === t.name)?.sub || 'General',
      ...getWeaknessLevel(t.accuracy)
    }))
  }, [topicPerf, syl])

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
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontSize: 13, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <div style={{ color: 'var(--text)', marginBottom: 8, fontWeight: 800 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color || p.fill, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill }} />
            <span style={{ fontWeight: 600 }}>{p.name}: {p.value}{typeof p.value === 'number' && p.name?.includes('ccuracy') ? '%' : ''}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="page-inner fade-in">
      {/* Performance Header */}
      <div className="card" style={{borderRadius:24, padding:'24px 20px', background:'linear-gradient(135deg, var(--bg2) 0%, var(--bg) 100%)', border:'1px solid rgba(88, 166, 255, 0.2)', marginBottom:24}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, gap:16, flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:10, fontWeight:800, color:'var(--indigo)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:6}}>Performance Analysis</div>
            <div style={{fontSize:'clamp(22px, 6vw, 28px)', fontWeight:800, color:'var(--text)'}}>Candidate Report</div>
          </div>
          <div style={{textAlign:'right', marginLeft:'auto'}}>
            <div style={{fontSize:10, fontWeight:800, color:'var(--text4)', textTransform:'uppercase', letterSpacing:1, marginBottom:6}}>Global Readiness</div>
            <div style={{display:'flex', alignItems:'center', gap:10, justifyContent:'flex-end'}}>
              <div style={{fontSize:'clamp(24px, 5vw, 32px)', fontWeight:800, color:overall.color}}>{overallAcc}%</div>
              <div style={{fontSize:20}}>{overall.emoji}</div>
            </div>
          </div>
        </div>
        
        <div className="g4 keep" style={{gap:10}}>
          {[
            ['Quizzes', quizResults.length, 'var(--cyan)'],
            ['Mocks', mocks.length, 'var(--green)'],
            ['Vocab', vocab.length, 'var(--gold)'],
            ['Topics', syl.filter(t=>t.status==='Done').length, 'var(--purple)'],
          ].map(([l,v,c]) => (
            <div key={l} style={{background:'rgba(255,255,255,0.03)', padding:12, borderRadius:14, border:'1px solid rgba(255,255,255,0.05)', textAlign:'center', minWidth:0}}>
              <div style={{fontSize:18, fontWeight:800, color:c, overflow:'hidden', textOverflow:'ellipsis'}}>{v}</div>
              <div style={{fontSize:8, fontWeight:700, color:'var(--text4)', marginTop:2, textTransform:'uppercase'}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="g2">
        {/* Quiz Accuracy Trend */}
        <div className="card" style={{borderRadius:20, padding:24}}>
          <div className="card-title" style={{fontSize:16, marginBottom:20}}>📈 Mastery Trend</div>
          <SafeChart data={trend.length > 1 ? trend : []} height={260} emptyMessage="Take more quizzes to see your trend" emptyCta="Complete at least 2 quizzes">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{fill:'var(--text4)', fontSize:10, fontWeight:600}} tickFormatter={d => d ? d.slice(5) : ''} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'var(--text4)', fontSize:10, fontWeight:600}} domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="accuracy" stroke="var(--indigo)" strokeWidth={4} dot={{fill:'var(--indigo)', r:4, strokeWidth:2, stroke:'#fff'}} activeDot={{r:6, strokeWidth:0}} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </SafeChart>
        </div>

        {/* Subject-wise Accuracy */}
        <div className="card" style={{borderRadius:20, padding:24}}>
          <div className="card-title" style={{fontSize:16, marginBottom:20}}>📊 Subject Proficiency</div>
          <SafeChart data={subjectPerf} height={260} emptyMessage="Complete quizzes to unlock subject data" emptyCta="Start a Daily Quiz">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerf} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{fill:'var(--text4)', fontSize:10, fontWeight:600}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'var(--text4)', fontSize:10, fontWeight:600}} domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="accuracy" name="Accuracy %" radius={[6, 6, 0, 0]} barSize={32}>
                  {subjectPerf.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SafeChart>
        </div>
      </div>

      <div className="g2">
        {/* Weakness Analysis */}
        <div className="card" style={{borderRadius:24, padding:'32px 24px', border:'1px solid var(--border)', background:'var(--bg2)'}}>
          <div className="card-title" style={{fontSize:18, marginBottom:32}}>
            🎯 Critical Focus Areas
            <span style={{fontSize:11, color:'var(--text4)', fontWeight:600, marginLeft:12}}>WEAKNESS ANALYSIS</span>
          </div>
          {weaknesses.length > 0 ? (
            <div style={{display:'flex', flexDirection:'column', gap:16}}>
              {weaknesses.map(w => (
                <div key={w.topic} style={{padding:20, background:'var(--bg3)', borderRadius:16, border:`1px solid ${w.color}22`, display:'flex', justifyContent:'space-between', alignItems:'center', transition:'all 0.2s'}} onMouseOver={e=>e.currentTarget.style.borderColor=w.color} onMouseOut={e=>e.currentTarget.style.borderColor='transparent'}>
                  <div style={{display:'flex', alignItems:'center', gap:16}}>
                    <div style={{width:40, height:40, borderRadius:12, background:`${w.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20}}>
                      {w.emoji}
                    </div>
                    <div>
                      <div style={{fontSize:15, fontWeight:800, color:'var(--text)'}}>{w.topic}</div>
                      <div style={{fontSize:11, color:'var(--text4)', marginTop:4, textTransform:'uppercase', letterSpacing:0.5}}>{w.sub} · {w.count} Attempts</div>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:18, fontWeight:900, color:w.color}}>{w.acc}%</div>
                    <div style={{fontSize:9, fontWeight:800, color:'var(--text4)', textTransform:'uppercase', marginTop:2}}>Accuracy</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty" style={{padding:'60px 0'}}>
              <div style={{fontSize:40, marginBottom:16}}>🛡️</div>
              NO CRITICAL WEAKNESSES DETECTED
            </div>
          )}
        </div>

        {/* Mistake Analysis */}
        <div className="card" style={{borderRadius:20, padding:24}}>
          <div className="card-title" style={{fontSize:16, marginBottom:20}}>❌ Mistake Distribution</div>
          <SafeChart data={mistakeAnalysis} height={260} emptyMessage="No mistakes recorded yet" emptyCta="Complete quizzes to track errors">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mistakeAnalysis} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={60} paddingAngle={5}>
                  {mistakeAnalysis.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} formatter={(v) => <span style={{color:'var(--text3)', fontSize:11, fontWeight:600, textTransform:'uppercase'}}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </SafeChart>
        </div>
      </div>

      <div className="g2">
        {/* Mock Test Scores */}
        <div className="card" style={{borderRadius:20, padding:24}}>
          <div className="card-title" style={{fontSize:16, marginBottom:24}}>📝 Mock Performance</div>
          <SafeChart data={mockScores} height={260} emptyMessage="Add mock tests to see performance" emptyCta="Log your first mock test">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{fill:'var(--text4)', fontSize:10, fontWeight:600}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'var(--text4)', fontSize:10, fontWeight:600}} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" fill="var(--green)" fillOpacity={0.8} name="Score" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="target" fill="var(--gold)" fillOpacity={0.2} name="Target" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </SafeChart>
        </div>

        {/* Syllabus Progress */}
        <div className="card" style={{borderRadius:20, padding:24}}>
          <div className="card-title" style={{fontSize:16, marginBottom:24}}>📚 Curriculum Progress</div>
          <div style={{display:'flex', flexDirection:'column', gap:20}}>
            {subjectProgress.map(s => (
              <div key={s.name}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <div style={{width:12, height:12, borderRadius:4, background:s.fill}} />
                    <span style={{fontSize:14, fontWeight:700, color:'var(--text2)'}}>{s.name}</span>
                  </div>
                  <span style={{fontSize:12, fontWeight:800, color:'var(--text4)'}}>
                    {s.done}/{s.total} Topics · {s.pct}%
                  </span>
                </div>
                <div className="pb" style={{height:6, background:'var(--bg4)'}}>
                  <div className="pf" style={{width:`${s.pct}%`, background: s.fill, borderRadius:3}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weakness Summary */}
      {topicPerf.filter(t => t.accuracy < 60).length > 0 && (
        <div className="card" style={{borderRadius:20, padding:24, background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.1)'}}>
          <div className="card-title" style={{color:'var(--red)', fontSize:16, marginBottom:20}}>🔴 Critical Focus Areas</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:12}}>
            {topicPerf.filter(t => t.accuracy < 60).map((t, i) => (
              <div key={i} style={{
                padding:'12px 20px', background:'var(--bg2)', border:'1px solid rgba(239,68,68,0.2)',
                borderRadius:12, fontSize:13, display:'flex', gap:10, alignItems:'center',
                boxShadow:'0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <div style={{width:8, height:8, borderRadius:'50%', background:'var(--red)'}} />
                <span style={{color:'var(--text2)', fontWeight:700}}>{t.name}</span>
                <span style={{fontSize:11, fontWeight:800, color:'var(--red)', background:'rgba(239,68,68,0.1)', padding:'2px 8px', borderRadius:6}}>{t.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
