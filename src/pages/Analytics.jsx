import { useMemo, useState } from 'react'
import { useAppStore } from '../store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts'
import SafeChart from '../components/SafeChart'
import { MASTER_TOPICS, RADAR_SUBJECTS } from '../data'

export default function Analytics() {
  const { zh_mocks, zh_topicMap, zh_sessions, settings, zh_radar, zh_errors, zh_xp, zh_targets, zh_dailySummaries } = useAppStore(
    useShallow(s => ({
      zh_mocks: s.zh_mocks,
      zh_topicMap: s.zh_topicMap,
      zh_sessions: s.zh_sessions,
      settings: s.settings,
      zh_radar: s.zh_radar,
      zh_errors: s.zh_errors,
      zh_xp: s.zh_xp,
      zh_targets: s.zh_targets,
      zh_dailySummaries: s.zh_dailySummaries
    }))
  )

  const { setRadar } = useAppStore();

  const [activeTab, setActiveTab] = useState('performance'); // performance | targets | topics

  // 1. Topic Accuracy Analytics
  const topicAccuracy = useMemo(() => {
    const accuracyMap = {};
    // Calculate from zh_sessions (score) and zh_mocks
    zh_sessions.forEach(s => {
      if (s.score) {
        if (!accuracyMap[s.subject]) accuracyMap[s.subject] = [];
        accuracyMap[s.subject].push(parseFloat(s.score));
      }
    });
    
    return Object.entries(accuracyMap).map(([subject, scores]) => {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      return { subject, avg };
    }).sort((a, b) => a.avg - b.avg);
  }, [zh_sessions]);

  // 2. Topic Coverage (Days since last attempt)
  const topicCoverage = useMemo(() => {
    const lastAttempted = {};
    const today = new Date();
    
    zh_sessions.forEach(s => {
      const date = new Date(s.date);
      if (!lastAttempted[s.subject] || date > new Date(lastAttempted[s.subject])) {
        lastAttempted[s.subject] = s.date;
      }
    });

    return RADAR_SUBJECTS.map(sub => {
      const lastDate = lastAttempted[sub];
      const diffDays = lastDate ? Math.ceil((today - new Date(lastDate)) / (1000 * 60 * 60 * 24)) : 999;
      return { subject: sub, lastDate, diffDays };
    }).sort((a, b) => b.diffDays - a.diffDays);
  }, [zh_sessions]);

  // 6. Radar Data
  const radarData = useMemo(() => {
    return RADAR_SUBJECTS.map(sub => ({
      subject: sub,
      A: zh_radar[sub] || 5,
      fullMark: 10
    }));
  }, [zh_radar]);

  // 5. Mock Trend Data
  const trendData = useMemo(() => {
    return zh_mocks.map(m => ({
      date: m.date,
      score: (m.calculated?.totalMarks / 300) * 100,
      type: m.type
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [zh_mocks]);

  // 7. Weak Area Heatmap
  const heatmapGrid = useMemo(() => {
    return RADAR_SUBJECTS.map(sub => {
      const errors = zh_errors.filter(e => e.subject.includes(sub)).length;
      const rating = zh_radar[sub] || 5;
      // Intensity: higher errors + lower rating = redder
      const intensity = Math.min(100, (errors * 10) + (10 - rating) * 10);
      return { sub, errors, rating, intensity };
    });
  }, [zh_errors, zh_radar]);

  const getHeatmapColor = (intensity) => {
    if (intensity > 70) return '#ef4444'; // Red
    if (intensity > 40) return '#f59e0b'; // Amber
    return '#22c55e'; // Green
  };

  // 5. Target Analytics Data
  const targetHistory = useMemo(() => {
    return zh_dailySummaries.slice(-7).map(s => ({
      date: s.date.split('-').slice(1).join('/'),
      rate: Math.round(s.completion_rate)
    }));
  }, [zh_dailySummaries]);

  const topicCompletion = useMemo(() => {
    const data = {};
    zh_targets.forEach(t => {
      if (!data[t.type]) data[t.type] = { done: 0, total: 0 };
      data[t.type].total++;
      if (t.status === 'complete') data[t.type].done++;
    });
    return Object.entries(data).map(([name, stats]) => ({
      name,
      rate: Math.round((stats.done / stats.total) * 100),
      total: stats.total
    }));
  }, [zh_targets]);

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: 5 }}>STRATEGIC ANALYTICS</h1>
          <p style={{ color: 'var(--text4)', fontSize: 11 }}>In-depth performance evaluation and deployment matrix.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className={`btn ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')} style={{ fontSize: 10 }}>PERFORMANCE</button>
          <button className={`btn ${activeTab === 'targets' ? 'active' : ''}`} onClick={() => setActiveTab('targets')} style={{ fontSize: 10 }}>TARGETS</button>
          <button className={`btn ${activeTab === 'topics' ? 'active' : ''}`} onClick={() => setActiveTab('topics')} style={{ fontSize: 10 }}>TOPICS</button>
        </div>
      </div>

      {activeTab === 'performance' && (
        <div className="fade-in">
          <div className="g2">
            {/* 6. WEEKLY SELF-RATING RADAR */}
            <div className="card">
              <div className="label-caps" style={{ marginBottom: 24 }}>Subject Proficiency Radar</div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text4)', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} />
                    <Radar name="Proficiency" dataKey="A" stroke="var(--green)" fill="var(--green)" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 20 }}>
                {RADAR_SUBJECTS.map(sub => (
                  <div key={sub}>
                    <div style={{ fontSize: 9, color: 'var(--text4)', marginBottom: 4 }}>{sub}</div>
                    <input 
                      type="range" min="1" max="10" 
                      value={zh_radar[sub] || 5} 
                      onChange={e => setRadar({ ...zh_radar, [sub]: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 5. MOCK TREND GRAPH */}
            <div className="card">
              <div className="label-caps" style={{ marginBottom: 24 }}>Mock Performance Trend</div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="var(--indigo)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="g2" style={{ marginTop: 24 }}>
            {/* 7. WEAK AREA HEATMAP */}
            <div className="card">
              <div className="label-caps" style={{ marginBottom: 20 }}>Weak Area Heatmap</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {heatmapGrid.map(item => (
                  <div key={item.sub} style={{ 
                    padding: 15, borderRadius: 8, background: getHeatmapColor(item.intensity), 
                    color: 'black', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 900 }}>{item.sub.toUpperCase()}</div>
                    <div style={{ fontSize: 8, opacity: 0.8 }}>Errors: {item.errors} | Rating: {item.rating}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. ERROR PATTERN ALERTS */}
            <div className="card">
              <div className="label-caps" style={{ marginBottom: 20 }}>Error Pattern Alerts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {heatmapGrid.filter(i => i.errors >= 3).map(i => (
                  <div key={i.sub} style={{ 
                    padding: '12px 15px', borderRadius: 8, border: '1px solid var(--red)', 
                    background: 'rgba(239, 68, 68, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800 }}>{i.sub} Focused Revision</div>
                      <div style={{ fontSize: 9, color: 'var(--text4)' }}>{i.errors} errors detected in this subject</div>
                    </div>
                    <div style={{ background: 'var(--red)', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: 8, fontWeight: 900 }}>CRITICAL</div>
                  </div>
                ))}
                {heatmapGrid.filter(i => i.errors >= 3).length === 0 && (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text4)', fontSize: 12 }}>
                    No significant error patterns detected yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'targets' && (
        <div className="fade-in">
          <div className="g2">
            {/* 7-day completion rate */}
            <div className="card">
              <div className="label-caps" style={{ marginBottom: 24 }}>7-Day Completion Rate</div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={targetHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} />
                    <Bar dataKey="rate" fill="var(--indigo)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Type breakdown */}
            <div className="card">
              <div className="label-caps" style={{ marginBottom: 24 }}>Type-wise Efficiency</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {topicCompletion.map(item => (
                  <div key={item.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11 }}>
                      <span style={{ fontWeight: 700 }}>{item.name}</span>
                      <span style={{ color: item.rate >= 80 ? 'var(--green)' : item.rate >= 50 ? 'var(--amber)' : 'var(--red)' }}>{item.rate}% ({item.total} targets)</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${item.rate}%`, 
                        background: item.rate >= 80 ? 'var(--green)' : item.rate >= 50 ? 'var(--amber)' : 'var(--red)'
                      }} />
                    </div>
                  </div>
                ))}
                {topicCompletion.length === 0 && (
                  <div style={{ padding: 60, textAlign: 'center', color: 'var(--text4)', fontSize: 12 }}>
                    No target data available for analysis.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'topics' && (
        <div className="fade-in">
          <div className="g2">
            {/* Topic Accuracy */}
            <div className="card">
              <div className="label-caps" style={{ marginBottom: 20 }}>Topic Accuracy (Interpret + Act)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {topicAccuracy.map(item => (
                  <div key={item.subject} className="card" style={{ padding: 15, background: 'var(--bg2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11 }}>
                      <span style={{ fontWeight: 700 }}>{item.subject}</span>
                      <span style={{ color: item.avg >= 60 ? 'var(--green)' : 'var(--red)' }}>{item.avg}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{ height: '100%', width: `${item.avg}%`, background: item.avg >= 60 ? 'var(--green)' : 'var(--red)' }} />
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--text4)', marginBottom: 12 }}>
                      Your {item.subject} accuracy is {item.avg}% over recent sessions.
                    </p>
                    {item.avg < 60 && (
                      <button className="btn btn-r" style={{ width: '100%', fontSize: 9, padding: '8px' }}>
                        START 3-DAY {item.subject.toUpperCase()} SPRINT
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Topic Coverage */}
            <div className="card">
              <div className="label-caps" style={{ marginBottom: 20 }}>Topic Coverage Heatmap</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {topicCoverage.map(item => (
                  <div key={item.subject} style={{ 
                    padding: 12, 
                    borderRadius: 8, 
                    background: item.diffDays > 7 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    border: `1px solid ${item.diffDays > 7 ? 'var(--red)' : 'var(--green)'}`
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 800 }}>{item.subject}</div>
                    <div style={{ fontSize: 9, color: 'var(--text4)', marginTop: 4 }}>
                      {item.diffDays === 999 ? 'Never attempted' : `${item.diffDays} days ago`}
                    </div>
                    {item.diffDays > 7 && (
                      <button className="btn" style={{ width: '100%', fontSize: 8, padding: '4px', marginTop: 8, background: 'var(--red)', color: 'white' }}>
                        ADD TO TOMORROW
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
