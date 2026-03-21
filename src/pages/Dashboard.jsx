import { useMemo } from 'react'
import { useStore } from '../store'
import { useAppStore } from '../store/useStore'
import { EXAMS, SUBC, SUBTOTALS, HABITS } from '../data'
import { daysUntil, calcStreak, clamp, formatDate } from '../utils/dateUtils'
import { getWeaknessLevel, getOverallAccuracy } from '../utils/weaknessEngine'
import { getDueVocab } from '../utils/spacedRepetition'
import { DonutChart, LineChart, BarChart } from '../Charts'

export default function Dashboard({ onNav }) {
  const { state } = useStore()
  const { syl, mocks, logs, habs, revision, vocab, settings, quizResults, plannerTasks } = state
  const revisionCycles = useAppStore(s => s.revisionCycles)

  const subs = ['Maths','English','GS','AFCAT']
  const today = new Date().toISOString().split('T')[0]

  const scores = useMemo(() => [...mocks].reverse().map(m => m.total).filter(Boolean).slice(-10), [mocks])
  const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null
  const best = scores.length ? Math.max(...scores) : null
  const streak = useMemo(() => calcStreak(logs), [logs])
  const totalDone = syl.filter(t => t.status==='Done').length

  // Quiz performance
  const overallAcc = getOverallAccuracy(quizResults)
  const overallWeakness = getWeaknessLevel(overallAcc)

  // Due vocab
  const dueVocabCount = useMemo(() => getDueVocab(vocab, revisionCycles).length, [vocab, revisionCycles])

  // Last 7 days habits
  const last7 = useMemo(() => Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i))
    const ds=d.toISOString().split('T')[0]
    const e=habs.find(h=>h.date===ds)||{}
    return {label:['S','M','T','W','T','F','S'][d.getDay()],value:HABITS.filter(h=>e[h.i]).length,max:6}
  }), [habs])

  // Revision due topics
  const dueTopics = useMemo(() => {
    const arr = []
    syl.filter(t=>t.status==='Done').forEach(t=>{
      const rv = revision.find(r=>r.topicId===t.id)||{}
      for (let i = 0; i < revisionCycles.length; i++) {
        if (!rv[`r${i+1}Done`]) {
          const prevDate = i > 0 ? rv[`r${i}Date`] : (rv.r1Date || t.lastStudied)
          if (prevDate) {
            const elapsed = Math.floor((Date.now() - new Date(prevDate).getTime()) / 86400000)
            if (elapsed >= revisionCycles[i].days) {
              arr.push({...t, topicId:t.id, round:`R${i+1}`, daysOverdue: elapsed - revisionCycles[i].days})
            }
          }
          break
        }
      }
    })
    return arr.sort((a,b)=>(b.daysOverdue||0)-(a.daysOverdue||0))
  }, [syl, revision, revisionCycles])

  // Today's planner tasks
  const todayPlan = plannerTasks.filter(t => t.date === today)
  const planDone = todayPlan.filter(t => t.completed).length

  const allSubDone = syl.reduce((a,t)=>a+Object.values(t.done||{}).filter(Boolean).length, 0)
  const allSubTotal = syl.reduce((a,t)=>a+t.subs.length, 0)

  return (
    <div className="page-inner fade-in">
      {/* Exam Countdowns */}
      <div className="g4 keep" style={{marginBottom:12}}>
        {EXAMS.map(ex=>{
          const d = daysUntil(ex.d||(ex.i==='af'?settings.afcatDate:null)||null)
          const urg = d!==null && d<=7
          return (
            <div key={ex.i} className="card" style={{borderColor:`${ex.c}22`,background:'#050a05',textAlign:'center',cursor:'pointer',padding:'12px 8px',marginBottom:0}}
              onClick={()=>onNav('analytics')}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:d!==null?28:18,color:urg?'#ff3333':ex.c,lineHeight:1,animation:urg?'pulse 1s infinite':'none'}}>
                {d!==null ? d : 'TBD'}
              </div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'var(--text4)',letterSpacing:1,margin:'3px 0'}}>DAYS LEFT</div>
              <div style={{fontSize:12,fontWeight:700,color:ex.c}}>{ex.l}</div>
            </div>
          )
        })}
      </div>

      <div className="g2">
        {/* Subject Progress */}
        <div className="card">
          <div className="card-title">
            📊 SUBJECT PROGRESS
            <button className="btn" style={{fontSize:8,padding:'3px 10px'}} onClick={()=>onNav('syl')}>FULL →</button>
          </div>
          <div style={{display:'flex',justifyContent:'space-around',marginBottom:14,flexWrap:'wrap',gap:8}}>
            {subs.map(s=>{
              const topics=syl.filter(t=>t.sub===s)
              const done=topics.filter(t=>t.status==='Done').length
              const total=SUBTOTALS[s]||topics.length
              return (
                <div key={s} style={{textAlign:'center',cursor:'pointer'}} onClick={()=>onNav('syl')}>
                  <DonutChart pct={total>0?done/total:0} color={SUBC[s]} size={72}/>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:SUBC[s],marginTop:2}}>{s}</div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'var(--text4)'}}>{done}/{total}</div>
                </div>
              )
            })}
          </div>
          <div style={{padding:10,background:'var(--bg4)',border:'1px solid var(--border)',borderRadius:3,marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text4)',marginBottom:4}}>
              OVERALL SUBTOPICS<span style={{color:'var(--green)'}}>{allSubDone}/{allSubTotal}</span>
            </div>
            <div className="pb"><div className="pf" style={{width:`${allSubTotal>0?Math.round(allSubDone/allSubTotal*100):0}%`,background:'var(--green)'}}></div></div>
          </div>
          {subs.map(s=>{
            const done=syl.filter(t=>t.sub===s&&t.status==='Done').length
            const total=SUBTOTALS[s]; const pct=total>0?Math.round(done/total*100):0
            return (
              <div key={s} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}>
                  <span style={{color:SUBC[s],fontWeight:600}}>{s}</span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:'var(--text3)'}}>{done}/{total} · {pct}%</span>
                </div>
                <div className="pb"><div className="pf" style={{width:`${pct}%`,background:SUBC[s]}}></div></div>
              </div>
            )
          })}
        </div>

        {/* Score Trend + Live Stats */}
        <div className="card">
          <div className="card-title">📈 SCORE TREND <span style={{color:'var(--text3)',fontSize:9}}>{avg?`AVG:${avg}`:''}</span></div>
          <LineChart data={scores} color="#39ff14" target={settings.targetIMA} />
          <div style={{display:'flex',gap:6,marginTop:10,marginBottom:14,flexWrap:'wrap'}}>
            {[['AVG',avg?`${avg}/300`:'—',avg>=150?'#39ff14':avg?'#ffd700':'#4a7a4a'],
              ['BEST',best?`${best}/300`:'—','#39ff14'],
              ['MOCKS',mocks.length,'#39ff14'],
              ['GAP',avg&&settings.targetIMA?(avg>=settings.targetIMA?`+${avg-settings.targetIMA}`:`-${settings.targetIMA-avg}`):'—',avg&&avg>=settings.targetIMA?'#39ff14':'#ff3333']
            ].map(([l,v,c])=>(
              <div key={l} style={{flex:1,textAlign:'center',background:'var(--bg4)',border:'1px solid var(--border)',borderRadius:3,padding:'8px 4px'}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:15,color:c}}>{v}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'var(--text4)'}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text4)',marginBottom:8}}>🔥 HABITS — LAST 7 DAYS</div>
          <BarChart data={last7} colors={['#ffd700','#00d4ff','#39ff14','#bf80ff','#ffd700','#00d4ff','#39ff14']} h={40}/>
        </div>
      </div>

      <div className="g2">
        {/* Weakness Overview */}
        <div className="card" style={{borderColor: overallAcc < 60 ? '#ff333333' : '#39ff1433'}}>
          <div className="card-title" style={{color: overallWeakness.color}}>
            {overallWeakness.emoji} PERFORMANCE STATUS
            <button className="btn" style={{fontSize:8,padding:'3px 10px'}} onClick={()=>onNav('analytics')}>ANALYTICS →</button>
          </div>
          {[
            ['Quiz Accuracy', quizResults.length > 0 ? `${overallAcc}%` : '—', overallWeakness.color],
            ['Topics Done', `${totalDone}/50`, '#39ff14'],
            ['Study Streak', `${streak} days`, streak>=7?'#39ff14':streak>=3?'#ffd700':'#ff8888'],
            ['Avg Score', avg?`${avg}/300`:'—', avg>=150?'#39ff14':avg?'#ffd700':'#4a7a4a'],
            ['Vocab Words', vocab.length, '#39ff14'],
            ['Vocab Due', dueVocabCount, dueVocabCount>0?'#ffd700':'#39ff14'],
          ].map(([l,v,c])=>(
            <div key={l} className="sr">
              <span style={{color:'var(--text2)',fontSize:13}}>{l}</span>
              <span style={{fontFamily:"'Share Tech Mono',monospace",color:c,fontSize:11}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop:12,padding:10,background:'var(--bg4)',border:'1px solid #ffd70022',borderRadius:3,textAlign:'center'}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:'var(--gold)',letterSpacing:1}}>
              🎖 "The more you sweat in peace, the less you bleed in war."
            </div>
            <div style={{fontSize:12,color:'var(--text4)',marginTop:5,fontFamily:"'Share Tech Mono',monospace"}}>
              Every day counts, {settings.name} — go get your commission.
            </div>
          </div>
        </div>

        {/* Today's Plan Preview */}
        <div className="card" style={{borderColor:'#00d4ff33',background:'#00101a'}}>
          <div className="card-title" style={{color:'var(--cyan)'}}>
            📋 TODAY'S PLAN
            <button className="btn btn-c" style={{fontSize:8,padding:'3px 10px'}} onClick={()=>onNav('planner')}>FULL PLAN →</button>
          </div>
          {todayPlan.length > 0 ? (
            <>
              <div style={{display:'flex',justifyContent:'space-between',fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text4)',marginBottom:8}}>
                <span>PROGRESS</span>
                <span style={{color:'var(--green)'}}>{planDone}/{todayPlan.length}</span>
              </div>
              <div className="pb" style={{marginBottom:12}}>
                <div className="pf" style={{width:`${todayPlan.length>0?Math.round(planDone/todayPlan.length*100):0}%`,background:'var(--green)'}}/>
              </div>
              {todayPlan.slice(0,5).map(t=>(
                <div key={t.id} style={{padding:'6px 0',borderBottom:'1px solid var(--border3)',display:'flex',gap:8,alignItems:'center',opacity:t.completed?0.5:1}}>
                  <span style={{color:SUBC[t.subject]||'var(--text)',fontFamily:"'Share Tech Mono',monospace",fontSize:9}}>{t.subject}</span>
                  <span style={{fontSize:13,color:t.completed?'var(--text3)':'var(--text)',textDecoration:t.completed?'line-through':'none'}}>{t.topic}</span>
                </div>
              ))}
            </>
          ) : (
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{fontSize:12,color:'var(--text4)',marginBottom:8}}>No plan for today yet</div>
              <button className="btn btn-g" style={{fontSize:9}} onClick={()=>onNav('planner')}>GENERATE PLAN →</button>
            </div>
          )}
        </div>
      </div>

      {/* Revision Alerts */}
      {dueTopics.length > 0 && (
        <div className="card" style={{borderColor:'#ffd70044',background:'#0d0d00'}}>
          <div className="card-title" style={{color:'var(--gold)'}}>
            🔔 REVISION ALERTS — {dueTopics.length} DUE
            <button className="btn btn-y" style={{fontSize:8,padding:'3px 10px'}} onClick={()=>onNav('rev')}>GO TO REVISION →</button>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {dueTopics.slice(0,8).map(a=>(
              <div key={a.topicId} onClick={()=>onNav('rev')}
                style={{padding:'6px 10px',background:'#1a1500',border:'1px solid #ffd70033',borderRadius:3,fontSize:12,display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
                <span style={{color:SUBC[a.sub]||'#ffd700',fontFamily:"'Share Tech Mono',monospace",fontSize:9}}>{a.sub}</span>
                <span style={{color:'var(--text)'}}>{a.topic}</span>
                <span className="tag" style={{background:'#ffd70011',border:'1px solid #ffd70044',color:'var(--gold)'}}>{a.round} · {a.daysOverdue}d late</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
