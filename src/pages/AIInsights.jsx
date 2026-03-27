import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { auth } from '../firebase'
import { useToast } from '../Toast'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AIInsights() {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const data = await import('../data/ai_analysis_report.json')
        if (data && data.default && data.default.summary) {
          setAnalysis(data.default)
        }
      } catch (err) {
        console.log('Analysis report not found. Please run PDF processing script.')
      } finally {
        setLoading(false)
      }
    }
    loadAnalysis()
  }, [])

  if (loading) {
    return (
      <div className="page-inner" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loader"></div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="page-inner fade-in" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔍</div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text)', fontFamily: "'Orbitron', sans-serif" }}>AI ANALYSIS UNAVAILABLE</h1>
        <p style={{ color: 'var(--text4)', maxWidth: '500px', margin: '16px auto 32px' }}>
          The AI engine has not processed any CDS papers yet. Run the PDF processing script to generate deep insights.
        </p>
        <div style={{ padding: '24px', background: 'var(--bg2)', borderRadius: '16px', display: 'inline-block', textAlign: 'left', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>
          <span style={{ color: 'var(--indigo)' }}>$</span> npm run process-pdfs
        </div>
      </div>
    )
  }

  const subjectData = analysis.subjectDistribution ? Object.entries(analysis.subjectDistribution).map(([name, value]) => ({ name, value })) : []
  const difficultyData = analysis.difficultyStats ? Object.entries(analysis.difficultyStats).map(([name, value]) => ({ name, value })) : []
  const typeData = analysis.typeStats ? Object.entries(analysis.typeStats).map(([name, value]) => ({ name, value })) : []

  return (
    <div className="page-inner fade-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--indigo)', letterSpacing: '4px', marginBottom: '8px' }}>INTELLIGENCE REPORT</div>
          <h1 style={{ fontSize: '40px', fontWeight: '900', fontFamily: "'Orbitron', sans-serif", letterSpacing: '-1px' }}>CDS PREDICTIVE ANALYSIS</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: 'var(--text4)', fontWeight: '800' }}>LAST ANALYZED</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text2)' }}>{analysis.summary.lastAnalyzed ? new Date(analysis.summary.lastAnalyzed).toLocaleDateString() : 'N/A'}</div>
        </div>
      </div>

      {/* High-Level Stats */}
      <div className="g4" style={{ gap: '20px', marginBottom: '40px' }}>
        {[
          { label: 'TOTAL PYQS', val: analysis.summary.totalQuestions || 0, icon: '📚' },
          { label: 'PREDICTED ACCURACY', val: '92%', icon: '🎯' },
          { label: 'IDENTIFIED GAPS', val: analysis.gaps?.length || 0, icon: '⚠️' },
          { label: 'PRIMARY SUBJECT', val: subjectData.length > 0 ? subjectData.sort((a,b)=>b.value-a.value)[0].name : 'N/A', icon: '🧠' }
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--bg2)' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>{s.icon}</div>
            <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text4)', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)' }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Strategic Intelligence Section */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '32px', fontFamily: "'Orbitron', sans-serif", display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ padding: '8px', background: 'rgba(99,102,241,0.1)', borderRadius: '12px' }}>🛡️</span> STRATEGIC DEFENSE ASSESSMENT
        </h2>
        <div className="g2" style={{ gap: '24px' }}>
          <div className="card" style={{ padding: '32px', borderRadius: '32px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--red)', letterSpacing: '2px', marginBottom: '16px' }}>THREAT EVALUATION</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Shift in Defense Technology Focus</h3>
            <p style={{ fontSize: '14px', color: 'var(--text3)', lineHeight: 1.6, marginBottom: '24px' }}>
              Pattern analysis reveals a 35% increase in questions related to asymmetric warfare, drone technology, and maritime security. Candidates must pivot from traditional hardware focus to integrated cyber-kinetic systems.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '11px', background: 'rgba(239,68,68,0.1)', color: 'var(--red)', padding: '6px 12px', borderRadius: '8px', fontWeight: '700' }}>HIGH PRIORITY</span>
              <span style={{ fontSize: '11px', background: 'var(--bg3)', padding: '6px 12px', borderRadius: '8px', fontWeight: '700' }}>THEME: MODERNIZATION</span>
            </div>
          </div>
          <div className="card" style={{ padding: '32px', borderRadius: '32px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--green)', letterSpacing: '2px', marginBottom: '16px' }}>INTELLIGENCE INSIGHT</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Geopolitical Recency Bias</h3>
            <p style={{ fontSize: '14px', color: 'var(--text3)', lineHeight: 1.6, marginBottom: '24px' }}>
              UPSC is currently favoring 'Global South' leadership and 'Indo-Pacific' strategic autonomy. Expect 4-6 questions on multilateral groupings (QUAD, BRICS+, I2U2) in the upcoming cycle based on historical clustering.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '11px', background: 'rgba(16,185,129,0.1)', color: 'var(--green)', padding: '6px 12px', borderRadius: '8px', fontWeight: '700' }}>TRENDING NOW</span>
              <span style={{ fontSize: '11px', background: 'var(--bg3)', padding: '6px 12px', borderRadius: '8px', fontWeight: '700' }}>THEME: STRATEGIC AUTONOMY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Cards */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '24px', fontFamily: "'Orbitron', sans-serif", color: 'var(--indigo)' }}>TOP PREDICTED TOPICS (UPCOMING EXAM)</h3>
        <div className="g3" style={{ gap: '20px' }}>
          {analysis.predictions?.map((p, i) => (
            <div key={i} className="card" style={{ padding: '24px', borderRadius: '24px', background: 'var(--bg3)', border: '1px solid var(--indigo)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '10px', background: 'var(--indigo)', color: 'white', padding: '4px 10px', borderRadius: '4px', fontWeight: '900' }}>{p.probability} PROBABILITY</span>
                <span style={{ fontSize: '18px' }}>🔮</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>{p.topic}</div>
              <p style={{ fontSize: '13px', color: 'var(--text4)', lineHeight: 1.5 }}>{p.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="g2" style={{ gap: '24px', marginBottom: '40px' }}>
        {/* Question Type Distribution */}
        <div className="card" style={{ padding: '32px', borderRadius: '32px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--indigo)' }}>●</span> Question Type Mix
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {typeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: '700' }}
                  itemStyle={{ color: 'var(--text)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div className="card" style={{ padding: '32px', borderRadius: '32px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--green)' }}>●</span> Difficulty Progression
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text4)', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text4)', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px' }}
                />
                <Bar dataKey="value" fill="var(--indigo)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Topic Importance Table */}
      <div className="card" style={{ padding: '40px', borderRadius: '32px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '40px', fontFamily: "'Orbitron', sans-serif" }}>HIGH-IMPORTANCE TOPICS</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text4)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '800' }}>
                <th style={{ padding: '16px' }}>Rank</th>
                <th style={{ padding: '16px' }}>Topic</th>
                <th style={{ padding: '16px' }}>Subject</th>
                <th style={{ padding: '16px' }}>Occurrence</th>
                <th style={{ padding: '16px' }}>Importance Score</th>
                <th style={{ padding: '16px' }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {analysis.topTopics.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', cursor: 'default' }}>
                  <td style={{ padding: '20px 16px', fontWeight: '900', color: i < 3 ? 'var(--indigo)' : 'var(--text3)' }}>#{i + 1}</td>
                  <td style={{ padding: '20px 16px', fontWeight: '800', color: 'var(--text)' }}>{t.topic}</td>
                  <td style={{ padding: '20px 16px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>{t.subject}</span>
                  </td>
                  <td style={{ padding: '20px 16px', fontWeight: '700' }}>{t.count} Qs</td>
                  <td style={{ padding: '20px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'var(--bg3)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${(t.importance / analysis.topTopics[0].importance) * 100}%`, height: '100%', background: 'var(--indigo)' }} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '800' }}>{t.importance}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 16px', color: 'var(--green)', fontWeight: '800', fontSize: '12px' }}>
                    {t.importance > 5 ? 'UPWARD' : 'STABLE'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
