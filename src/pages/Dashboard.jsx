import { useMemo, useState, useEffect } from 'react'
import { useStore } from '../store'
import { useAppStore } from '../store/useStore'
import { auth, db } from '../firebase'
import { doc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { EXAMS, SUBC, SUBTOTALS, HABITS } from '../data'
import { daysUntil, calcStreak, clamp, formatDate } from '../utils/dateUtils'
import { getWeaknessLevel, getOverallAccuracy } from '../utils/weaknessEngine'
import { getDueVocab } from '../utils/spacedRepetition'
import { calculateConsistencyScore, getConsistencyStatus, getConsistencyColor, getWeekKey } from '../utils/consistencyScore'
import { DonutChart, LineChart, BarChart } from '../Charts'
import GeoMap from '../components/GeoMap'

export default function Dashboard({ onNav }) {
  const { state } = useStore()
  const { syl, mocks, logs, habs, revision, vocab, settings, quizResults, plannerTasks, pyqlog } = state
  const revisionCycles = useAppStore(s => s.revisionCycles)
  const user = auth.currentUser

  const [consistencyHistory, setConsistencyHistory] = useState([])
  const [lastWeekScore, setLastWeekScore] = useState(null)

  const consistencyScore = useMemo(() => 
    calculateConsistencyScore({ habs, logs, revision, mocks, pyqlog }), 
    [habs, logs, revision, mocks, pyqlog]
  )

  useEffect(() => {
    if (!user) return

    const weekKey = getWeekKey()
    const scoreRef = doc(db, 'users', user.uid, 'consistencyScores', weekKey)
    
    // Save current score
    setDoc(scoreRef, {
      score: consistencyScore,
      updatedAt: new Date().toISOString(),
      weekKey
    }, { merge: true })

    // Fetch history
    const fetchHistory = async () => {
      const q = query(
        collection(db, 'users', user.uid, 'consistencyScores'),
        orderBy('weekKey', 'desc'),
        limit(9) // Current week + 8 previous
      )
      const snap = await getDocs(q)
      const data = snap.docs.map(d => d.data())
      setConsistencyHistory(data.reverse())
      
      // Find last week's score
      const lastWeek = data.find(d => d.weekKey !== weekKey)
      if (lastWeek) setLastWeekScore(lastWeek.score)
    }
    fetchHistory()
  }, [user, consistencyScore])

  const subs = ['Maths','English','GS','AFCAT']
  const today = new Date().toISOString().split('T')[0]

  const scores = useMemo(() => [...mocks].reverse().map(m => m.total).filter(Boolean).slice(-10), [mocks])
  const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null
  const best = scores.length ? Math.max(...scores) : null
  const streak = useMemo(() => calcStreak(logs), [logs])
  const totalDone = syl.filter(t => t.status==='Done').length

  // Quiz performance
  const overallAcc = useMemo(() => getOverallAccuracy(quizResults), [quizResults])
  const overallWeakness = useMemo(() => (overallAcc > 80 ? {emoji:'🌟', color:'var(--green)', label:'Excellent'} : {emoji:'📈', color:'var(--indigo)', label:'Steady Progress'}), [overallAcc])

  // Due vocab
  const dueVocabCount = useMemo(() => getDueVocab(vocab, revisionCycles).length, [vocab, revisionCycles])

  // Today's planner tasks
  const todayPlan = plannerTasks.filter(t => t.date === today)
  const planDone = todayPlan.filter(t => t.completed).length

  const allSubDone = syl.reduce((a,t)=>a+Object.values(t.done||{}).filter(Boolean).length, 0)
  const allSubTotal = syl.reduce((a,t)=>a+t.subs.length, 0)

  return (
    <div className="page-inner fade-in">
      {/* Consistency & Performance Header */}
      <div className="card" style={{borderRadius:32, padding:'32px', marginBottom:24, background:'var(--bg2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:40, flexWrap:'wrap'}}>
        {/* Circular Gauge */}
        <div style={{position:'relative', width:160, height:160, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="var(--bg3)" strokeWidth="12" />
            <circle cx="80" cy="80" r="70" fill="none" stroke={getConsistencyColor(consistencyScore)} strokeWidth="12" 
              strokeDasharray={440} strokeDashoffset={440 - (440 * consistencyScore / 100)} 
              strokeLinecap="round" transform="rotate(-90 80 80)" style={{transition:'stroke-dashoffset 1s ease-out'}}
            />
          </svg>
          <div style={{position:'absolute', textAlign:'center'}}>
            <div style={{fontSize:40, fontWeight:900, color:'var(--text)', lineHeight:1}}>{consistencyScore}</div>
            <div style={{fontSize:10, fontWeight:800, color:'var(--text4)', marginTop:4}}>CONSISTENCY</div>
          </div>
        </div>

        <div style={{flex:1, minWidth:300}}>
          <div style={{fontSize:11, fontWeight:800, color:'var(--text4)', letterSpacing:2, marginBottom:8, textTransform:'uppercase'}}>
            Weekly Performance Analysis
          </div>
          <h2 style={{fontSize:24, fontWeight:900, marginBottom:12, color:getConsistencyColor(consistencyScore)}}>
            {getConsistencyStatus(consistencyScore)}
          </h2>
          <div style={{display:'flex', alignItems:'center', gap:16}}>
            {lastWeekScore !== null && (
              <div style={{fontSize:13, color:'var(--text3)', fontWeight:600}}>
                Last week: <span style={{color:'var(--text)'}}>{lastWeekScore}</span>
                <span style={{marginLeft:8, color: consistencyScore >= lastWeekScore ? 'var(--green)' : 'var(--red)'}}>
                  {consistencyScore >= lastWeekScore ? '▲' : '▼'} {Math.abs(consistencyScore - lastWeekScore)}
                </span>
              </div>
            )}
            <div style={{height:20, width:1, background:'var(--border)'}} />
            <div style={{display:'flex', gap:4, alignItems:'flex-end', height:30}}>
              {consistencyHistory.map((h, i) => (
                <div key={i} title={`Week ${h.weekKey}: ${h.score}`} style={{
                  width:8, background:getConsistencyColor(h.score), height:`${h.score}%`, minHeight:4, borderRadius:2, opacity:0.6
                }} />
              ))}
            </div>
            <span style={{fontSize:10, fontWeight:800, color:'var(--text4)'}}>8-WEEK TREND</span>
          </div>
        </div>

        <div className="hide-mob" style={{display:'flex', gap:24}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:20, fontWeight:900, color:'var(--gold)'}}>{streak}d</div>
            <div style={{fontSize:9, fontWeight:800, color:'var(--text4)'}}>STREAK</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:20, fontWeight:900, color:'var(--green)'}}>{overallAcc}%</div>
            <div style={{fontSize:9, fontWeight:800, color:'var(--text4)'}}>ACCURACY</div>
          </div>
        </div>
      </div>

      {/* Exam Countdowns */}
      <div className="g4 keep" style={{marginBottom:16}}>
        {EXAMS.map(ex=>{
          const d = daysUntil(ex.d||(ex.i==='af'?settings.afcatDate:null)||null)
          const urg = d!==null && d<=15
          return (
            <div key={ex.i} className="card" style={{borderColor:urg?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.05)',background:'var(--bg2)',textAlign:'center',cursor:'pointer',padding:'16px 10px',borderRadius:16}}
              onClick={()=>onNav('analytics')}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:d!==null?32:20,fontWeight:700,color:urg?'var(--red)':ex.c,lineHeight:1}}>
                {d!==null ? d : 'TBD'}
              </div>
              <div style={{fontSize:9,fontWeight:700,color:'var(--text4)',letterSpacing:1,margin:'6px 0',textTransform:'uppercase'}}>DAYS REMAINING</div>
              <div style={{fontSize:13,fontWeight:700,color:ex.c}}>{ex.l}</div>
            </div>
          )
        })}
      </div>

      <div className="g2">
        {/* Subject Progress */}
        <div className="card" style={{borderRadius:20, padding:'20px 16px'}}>
          <div className="card-title" style={{fontSize:16, marginBottom:20, padding:'0 8px'}}>
            📊 Preparation Status
            <button className="btn" style={{fontSize:10,padding:'4px 12px', borderRadius:8, background:'var(--bg3)'}} onClick={()=>onNav('syl')}>Syllabus →</button>
          </div>
          <div style={{display:'flex',justifyContent:'space-around',marginBottom:24,flexWrap:'wrap',gap:16}}>
            {subs.map(s=>{
              const topics=syl.filter(t=>t.sub===s)
              const done=topics.filter(t=>t.status==='Done').length
              const total=SUBTOTALS[s]||topics.length
              return (
                <div key={s} style={{textAlign:'center',cursor:'pointer', flex:'1 1 70px', minWidth:70}} onClick={()=>onNav('syl')}>
                  <DonutChart pct={total>0?done/total:0} color={SUBC[s]} size={64}/>
                  <div style={{fontSize:11,fontWeight:700,color:SUBC[s],marginTop:8}}>{s}</div>
                  <div style={{fontSize:10,color:'var(--text4)'}}>{done}/{total}</div>
                </div>
              )
            })}
          </div>
          <div style={{padding:16,background:'var(--bg4)',borderRadius:12,marginBottom:16, border:'1px solid var(--border)'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,fontWeight:600,color:'var(--text3)',marginBottom:8}}>
              OVERALL PROGRESS<span style={{color:'var(--green)'}}>{allSubDone}/{allSubTotal}</span>
            </div>
            <div className="pb" style={{height:8, background:'var(--bg2)'}}><div className="pf" style={{height:'100%',width:`${allSubTotal>0?Math.round(allSubDone/allSubTotal*100):0}%`,background:'var(--green)', borderRadius:4}}></div></div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="card" style={{borderRadius:24, padding:'24px 20px', border:'1px solid var(--border)', background:'var(--bg2)', position:'relative', overflow:'hidden', cursor:'pointer'}} onClick={()=>onNav('analytics')}>
          <div className="hide-mob" style={{position:'absolute', top:0, right:0, padding:'10px 20px', background:'var(--indigo)', color:'var(--bg)', fontSize:10, fontWeight:800, borderRadius:'0 0 0 16px', letterSpacing:1.5, textTransform:'uppercase'}}>Candidate Report</div>
          
          <div style={{marginBottom:24}}>
            <div style={{fontSize:11, fontWeight:800, color:'var(--text3)', textTransform:'uppercase', letterSpacing:2, marginBottom:8}}>Readiness Score</div>
            <div style={{display:'flex', alignItems:'center', gap:16, flexWrap:'wrap'}}>
              <div style={{fontSize:'clamp(36px, 8vw, 56px)', fontWeight:900, color:'var(--text)', lineHeight:1, letterSpacing:'-2px'}}>{quizResults.length > 0 ? `${overallAcc}%` : '—'}</div>
              <div style={{background:overallAcc > 70 ? 'rgba(63, 185, 80, 0.1)' : 'rgba(210, 153, 34, 0.1)', padding:'6px 14px', borderRadius:99, fontSize:11, fontWeight:800, color: overallAcc > 70 ? 'var(--green)' : 'var(--gold)', border:`1px solid ${overallAcc > 70 ? 'rgba(63, 185, 80, 0.2)' : 'rgba(210, 153, 34, 0.2)'}`}}>
                {overallAcc > 80 ? '🎖️ EXCELLENT' : overallAcc > 60 ? '⚡ ON TRACK' : '📚 FOUNDATION'}
              </div>
            </div>
          </div>

          <div className="g2 keep" style={{gap:12, marginBottom:24}}>
            {[
              { l: 'Streak', v: `${streak}d`, c: 'var(--gold)', icon: '🔥' },
              { l: 'Accuracy', v: overallAcc > 0 ? `${overallAcc}%` : '—', c: 'var(--green)', icon: '🎯' },
              { l: 'Mock Avg', v: avg?`${avg}`:'—', c: 'var(--cyan)', icon: '📊' },
              { l: 'Vocab', v: vocab.length, c: 'var(--purple)', icon: '📚' },
            ].map(({l,v,c,icon})=>(
              <div key={l} style={{background:'var(--bg3)', padding:'16px 14px', borderRadius:16, border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, transition:'all 0.2s'}} onMouseOver={e=>e.currentTarget.style.borderColor=c}>
                <div style={{width:36, height:36, borderRadius:10, background:`${c}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:c, flexShrink:0}}>
                  {icon}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:18, fontWeight:900, color:'var(--text)', lineHeight:1}}>{v}</div>
                  <div style={{fontSize:10, fontWeight:700, color:'var(--text4)', marginTop:4, textTransform:'uppercase', letterSpacing:0.5}}>{l}</div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="btn" style={{width:'100%', background:'var(--indigo)', color:'var(--bg)', border:'none', borderRadius:14, fontWeight:800, fontSize:13, padding:'16px', boxShadow:'0 4px 12px rgba(88, 166, 255, 0.2)'}} onClick={(e)=>{e.stopPropagation(); onNav('analytics')}}>
            VIEW ANALYTICS DASHBOARD →
          </button>
        </div>
      </div>

      <div className="g2">
        {/* Daily Challenge - Quick 5 Question Quiz */}
        <div className="card" style={{borderRadius:24, padding:'32px 20px', border:'1px solid rgba(88, 166, 255, 0.2)', background:'var(--bg2)', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', top:-40, right:-40, width:120, height:120, background:'var(--indigo)', filter:'blur(60px)', opacity:0.1}} />
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:48, marginBottom:16, display:'inline-block', filter:'drop-shadow(0 0 15px rgba(88, 166, 255, 0.3))'}}>⚡</div>
            <div style={{fontSize:20, fontWeight:900, color:'var(--text)', marginBottom:8}}>Daily Challenge</div>
            <div style={{fontSize:13, color:'var(--text3)', marginBottom:24, lineHeight:1.6, maxWidth:280, margin:'0 auto 24px'}}>
              Mixed challenge across Maths, GS, and English.
            </div>
            <button className="btn" style={{width:'100%', background:'var(--indigo)', color:'white', fontWeight:800, borderRadius:16, padding:'16px 0', fontSize:14, boxShadow:'0 15px 30px rgba(88, 166, 255, 0.2)'}} onClick={()=>onNav('quiz')}>
              START CHALLENGE
            </button>
            <div style={{fontSize:10, color:'var(--text4)', marginTop:16, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase'}}>Refreshes in 12h 45m</div>
          </div>
        </div>

        {/* Daily Tasks */}
        <div className="card" style={{borderRadius:20, padding:24, border:'1px solid rgba(14,165,233,0.2)'}}>
          <div className="card-title" style={{fontSize:18, color:'var(--cyan)'}}>
            📋 Today's Schedule
            <button className="btn" style={{fontSize:10,padding:'4px 12px', borderRadius:8, background:'rgba(14,165,233,0.1)', color:'var(--cyan)'}} onClick={()=>onNav('planner')}>Planner →</button>
          </div>
          <div style={{marginTop:20}}>
            {todayPlan.length > 0 ? (
              <>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,fontWeight:600,color:'var(--text4)',marginBottom:8}}>
                  <span>COMPLETED</span>
                  <span style={{color:'var(--cyan)'}}>{planDone}/{todayPlan.length}</span>
                </div>
                <div className="pb" style={{height:6, background:'var(--bg2)', marginBottom:20}}><div className="pf" style={{height:'100%',width:`${todayPlan.length>0?Math.round(planDone/todayPlan.length*100):0}%`,background:'var(--cyan)', borderRadius:3}}/></div>
                {todayPlan.slice(0,5).map(t=>(
                  <div key={t.id} style={{padding:'12px 0',borderBottom:'1px solid var(--border)',display:'flex',gap:12,alignItems:'center',opacity:t.completed?0.5:1}}>
                    <div style={{width:8, height:8, borderRadius:'50%', background:SUBC[t.subject]||'var(--text4)'}} />
                    <span style={{fontSize:14,color:t.completed?'var(--text4)':'var(--text2)',textDecoration:t.completed?'line-through':'none', fontWeight:500}}>{t.topic}</span>
                  </div>
                ))}
              </>
            ) : (
              <div style={{textAlign:'center',padding:'40px 20px',color:'var(--text4)'}}>
                <div style={{fontSize:32,marginBottom:12}}>📅</div>
                <div style={{fontSize:14, fontWeight:600}}>No tasks scheduled for today.</div>
                <button className="btn" style={{marginTop:16, background:'var(--indigo)', color:'white', fontSize:12, borderRadius:10, padding:'8px 20px'}} onClick={()=>onNav('planner')}>Set Daily Goals</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
