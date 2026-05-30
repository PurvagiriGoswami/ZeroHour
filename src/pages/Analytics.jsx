import { useMemo, useState } from 'react'
import { useAppStore } from '../store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts'
import SafeChart from '../components/SafeChart'
import { MASTER_TOPICS, RADAR_SUBJECTS } from '../data'

export default function Analytics() {
  const { zh_mocks, zh_topicMap, zh_sessions, settings, zh_radar, zh_errors, zh_xp } = useAppStore(
    useShallow(s => ({
      zh_mocks: s.zh_mocks,
      zh_topicMap: s.zh_topicMap,
      zh_sessions: s.zh_sessions,
      settings: s.settings,
      zh_radar: s.zh_radar,
      zh_errors: s.zh_errors,
      zh_xp: s.zh_xp
    }))
  )

  const { setRadar } = useAppStore();

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

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: 100 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 className="card-title">STRATEGIC ANALYTICS</h1>
        <p style={{ color: 'var(--text4)', fontSize: 11 }}>In-depth performance evaluation and deployment matrix.</p>
      </div>

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
  )
}
