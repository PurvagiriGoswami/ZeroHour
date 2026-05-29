import { useMemo } from 'react'
import { useAppStore } from '../store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import SafeChart from '../components/SafeChart'
import { MASTER_TOPICS } from '../data'

const SUBJECT_COLORS = {
  "Mathematics": '#22c55e',
  "English": '#3b82f6',
  "GK / GA": '#a78bfa',
  "Science": '#06b6d4',
  "AFCAT": '#f97316',
  "SSB": '#f59e0b'
}

export default function Analytics() {
  const { zh_mocks, zh_topicMap, zh_sessions } = useAppStore(
    useShallow(s => ({
      zh_mocks: s.zh_mocks,
      zh_topicMap: s.zh_topicMap,
      zh_sessions: s.zh_sessions
    }))
  )

  // Mock test scores
  const mockScores = useMemo(() => {
    try {
      if (!zh_mocks || !zh_mocks.length) return []
      return [...zh_mocks].reverse().slice(0, 10).reverse().map((m, i) => ({
        name: `M${i + 1}`,
        score: m.total || 0,
        target: 60,
      }))
    } catch(e) { return [] }
  }, [zh_mocks])

  // Subject progress
  const subjectProgress = useMemo(() => {
    return Object.keys(MASTER_TOPICS).map(sub => {
      const allSubTopics = [];
      Object.values(MASTER_TOPICS[sub]).forEach(list => allSubTopics.push(...list));
      const done = allSubTopics.filter(t => !!zh_topicMap[`${sub}::${t}`]).length;
      const total = allSubTopics.length;
      return { 
        name: sub, 
        done, 
        total, 
        pct: total > 0 ? Math.round(done / total * 100) : 0, 
        fill: SUBJECT_COLORS[sub] || '#4a4a4a'
      }
    })
  }, [zh_topicMap])

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontSize: 13, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <div style={{ color: 'var(--text)', marginBottom: 8, fontWeight: 800 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color || p.fill, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill }} />
            <span style={{ fontWeight: 600 }}>{p.name}: {p.value}%</span>
          </div>
        ))}
      </div>
    )
  }

  // Heatmap data
  const heatmap = useMemo(() => {
    const weeks = 12;
    const days = 7;
    const data = [];
    const today = new Date();
    
    for (let w = weeks - 1; w >= 0; w--) {
      const week = [];
      for (let d = 0; d < days; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const dStr = date.toISOString().split('T')[0];
        const sessionCount = (zh_sessions || []).filter(s => s.date === dStr).length;
        week.push({ date: dStr, count: sessionCount });
      }
      data.push(week);
    }
    return data;
  }, [zh_sessions]);

  return (
    <div className="page-inner fade-in">
      {/* Performance Header */}
      <div className="card" style={{borderRadius:24, padding:'24px 20px', background: 'var(--bg2)', border:'1px solid var(--border)', marginBottom:24}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, gap:16, flexWrap:'wrap'}}>
          <div>
            <div className="label-caps" style={{ color:'var(--green)', marginBottom:6 }}>Strategic Analysis</div>
            <div style={{fontSize:'clamp(22px, 6vw, 28px)', fontWeight:800, color:'var(--text)'}}>Operational Readiness Report</div>
          </div>
        </div>
        
        <div className="g2 keep" style={{gap:10}}>
          {[
            ['Mock Tests Logged', zh_mocks.length, 'var(--green)'],
            ['Objectives Started', Object.keys(zh_topicMap).length, 'var(--indigo)'],
          ].map(([l,v,c]) => (
            <div key={l} style={{background:'rgba(255,255,255,0.03)', padding:12, borderRadius:14, border:'1px solid rgba(255,255,255,0.05)', textAlign:'center', minWidth:0}}>
              <div style={{fontSize:18, fontWeight:800, color:c}}>{v}</div>
              <div className="label-caps" style={{ marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="g2">
        {/* Mock Test Scores */}
        <div className="card" style={{borderRadius:20, padding:24}}>
          <div className="label-caps" style={{ marginBottom:24 }}>Mock Performance Trend</div>
          <SafeChart data={mockScores} height={260} emptyMessage="No mock data available. Log your first test." emptyCta="Log Mock Test">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{fill:'var(--text4)', fontSize:10, fontWeight:600}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'var(--text4)', fontSize:10, fontWeight:600}} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" fill="var(--green)" fillOpacity={0.8} name="Score" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="target" fill="var(--amber)" fillOpacity={0.2} name="Target" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </SafeChart>
        </div>

        {/* Syllabus Progress */}
        <div className="card" style={{borderRadius:20, padding:24}}>
          <div className="label-caps" style={{ marginBottom:24 }}>Theatre Deployment Progress</div>
          <div style={{display:'flex', flexDirection:'column', gap:20}}>
            {subjectProgress.map(s => (
              <div key={s.name}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <div style={{width:12, height:12, borderRadius:4, background:s.fill}} />
                    <span style={{fontSize:14, fontWeight:700, color:'var(--text2)'}}>{s.name}</span>
                  </div>
                  <span style={{fontSize:12, fontWeight:800, color:'var(--text4)'}}>
                    {s.done}/{s.total} Objectives · {s.pct}%
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

      <div className="card" style={{ marginTop: 24, padding: 24 }}>
        <div className="label-caps" style={{ marginBottom: 20 }}>Consistency Matrix (12 Weeks)</div>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 10 }}>
          {heatmap.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {week.map((day, di) => {
                let color = 'var(--bg4)';
                if (day.count > 0) color = 'rgba(34, 197, 94, 0.2)';
                if (day.count > 2) color = 'rgba(34, 197, 94, 0.5)';
                if (day.count > 4) color = 'rgba(34, 197, 94, 1)';
                
                return (
                  <div 
                    key={di} 
                    title={`${day.date}: ${day.count} sessions`}
                    style={{ 
                      width: 12, height: 12, background: color, borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.05)'
                    }} 
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <span style={{ fontSize: 9, color: 'var(--text4)' }}>LESS</span>
          <div style={{ width: 10, height: 10, background: 'var(--bg4)', borderRadius: 2 }} />
          <div style={{ width: 10, height: 10, background: 'rgba(34, 197, 94, 0.2)', borderRadius: 2 }} />
          <div style={{ width: 10, height: 10, background: 'rgba(34, 197, 94, 0.5)', borderRadius: 2 }} />
          <div style={{ width: 10, height: 10, background: 'rgba(34, 197, 94, 1)', borderRadius: 2 }} />
          <span style={{ fontSize: 9, color: 'var(--text4)' }}>MORE</span>
        </div>
      </div>
    </div>
  )
}
