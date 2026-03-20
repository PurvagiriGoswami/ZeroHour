import { useMemo } from 'react'
import { useStore } from '../store'
import { EXAMS, SUBC, SUBTOTALS, HABITS } from '../data'
import { daysUntil, calcStreak, getRevDue, clamp } from '../utils'
import { DonutChart, LineChart, BarChart } from '../Charts'

export default function Dashboard({ onNav }) {
  const { state, act } = useStore()
  const { syl, mocks, logs, habs, errs, revision, settings } = state

  const subs = ['Maths','English','GS','AFCAT']
  const today = new Date().toISOString().split('T')[0]

  const scores = useMemo(() => [...mocks].reverse().map(m => m.total).filter(Boolean).slice(-10), [mocks])
  const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null
  const best = scores.length ? Math.max(...scores) : null
  const streak = useMemo(() => calcStreak(logs), [logs])
  const totalDone = syl.filter(t => t.status==='Done').length
  const unfix = errs.filter(e => !e.resolved).length

  const last7 = useMemo(() => Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i))
    const ds=d.toISOString().split('T')[0]
    const e=habs.find(h=>h.date===ds)||{}
    return {label:['S','M','T','W','T','F','S'][d.getDay()],value:HABITS.filter(h=>e[h.i]).length,max:6}
  }), [habs])

  const errBySubj = useMemo(()=>[
    {label:'Math', value:errs.filter(e=>e.subject==='Maths').length,     max:Math.max(1,errs.length)},
    {label:'Eng',  value:errs.filter(e=>e.subject==='English').length,    max:Math.max(1,errs.length)},
    {label:'GS',   value:errs.filter(e=>e.subject==='GS').length,         max:Math.max(1,errs.length)},
    {label:'AFCAT',value:errs.filter(e=>e.subject==='AFCAT Reasoning').length, max:Math.max(1,errs.length)},
  ], [errs])

  const dueTopics = useMemo(() => {
    const arr = []
    syl.filter(t=>t.status==='Done').forEach(t=>{
      const rv = revision.find(r=>r.topicId===t.id)||{}
      const due = getRevDue(t,rv)
      if(due) arr.push({...t,...due,topicId:t.id})
    })
    return arr.sort((a,b)=>(b.overdueBy||0)-(a.overdueBy||0))
  }, [syl, revision])

  const habToday = habs.find(h=>h.date===today)||{}
  const focus = habToday.focus||3
  const logToday = logs.find(l=>l.date===today)||{}
  const energy = logToday.energy||3
  const slots = clamp(3+Math.round(((energy+focus)/2)-3), 3, 7)

  const planTasks = useMemo(()=>{
    const tasks = dueTopics.slice(0,slots).map(d=>({type:'rev',...d}))
    if(tasks.length < slots){
      const errBySub={Maths:0,English:0,GS:0,AFCAT:0}
      errs.filter(e=>!e.resolved).forEach(e=>{
        if(e.subject==='Maths')errBySub.Maths++
        else if(e.subject==='English')errBySub.English++
        else if(e.subject==='GS')errBySub.GS++
        else errBySub.AFCAT++
      })
      const scored = syl.filter(t=>t.status!=='Done')
        .map(t=>({t, score:(t.pri==='H'?3:t.pri==='M'?2:1)*10+(5-(Number(t.conf)||0))+(errBySub[t.sub]||0)*.6+(t.status==='Not Started'?2:1)}))
        .sort((a,b)=>b.score-a.score).map(x=>x.t)
      for(const t of scored){
        if(tasks.length>=slots)break
        tasks.push({type:'study',topicId:t.id,topic:t.topic,sub:t.sub,pri:t.pri,conf:t.conf||0})
      }
    }
    return tasks
  }, [dueTopics, syl, errs, slots])

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
              onClick={()=>onNav('calc')}>
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

        {/* Score Trend */}
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
        {/* Error Analysis */}
        <div className="card">
          <div className="card-title">🔴 ERROR ANALYSIS
            <button className="btn" style={{fontSize:8,padding:'3px 10px'}} onClick={()=>onNav('errors')}>VIEW ALL →</button>
          </div>
          <BarChart data={errBySubj} colors={[SUBC.Maths,SUBC.English,SUBC.GS,SUBC.AFCAT]} h={36}/>
          <div style={{display:'flex',gap:8,marginTop:10}}>
            {[['TOTAL',errs.length,'#ff8888'],['UNRESOLVED',unfix,'#ff3333'],['FIXED',errs.filter(e=>e.resolved).length,'#39ff14']].map(([l,v,c])=>(
              <div key={l} style={{flex:1,textAlign:'center'}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:22,color:c}}>{v}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text4)',marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Stats */}
        <div className="card">
          <div className="card-title">⚡ LIVE STATS</div>
          {[
            ['Topics Done',`${totalDone}/50`,'#39ff14'],
            ['Study Streak',`${streak} days`,streak>=7?'#39ff14':streak>=3?'#ffd700':'#ff8888'],
            ['Avg Score',avg?`${avg}/300`:'—',avg>=150?'#39ff14':avg?'#ffd700':'#4a7a4a'],
            ['Errors Unresolved',unfix,unfix>0?'#ff3333':'#39ff14'],
            ['Logs Saved',logs.length,'#39ff14'],
            ['Habits Days',habs.length,'#39ff14'],
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
                <span className="tag" style={{background:'#ffd70011',border:'1px solid #ffd70044',color:'var(--gold)'}}>{a.round} · {a.daysSince}/{a.dueDays}d</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Plan */}
      {planTasks.length > 0 && (
        <div className="card" style={{borderColor:'#00d4ff33',background:'#00101a'}}>
          <div className="card-title" style={{color:'var(--cyan)'}}>
            🧠 SMART COMMANDER PLAN
            <span style={{color:'var(--text4)',fontSize:8}}>Focus {focus}/5 · Energy {energy}/5</span>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {planTasks.map((t,i)=>{
              const subCol = SUBC[t.sub]||'#ffd700'
              if(t.type==='rev') return (
                <div key={i} style={{padding:'7px 10px',background:'#1a1500',border:'1px solid #00d4ff33',borderRadius:4,fontSize:12,display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                  <span style={{color:subCol,fontFamily:"'Share Tech Mono',monospace",fontSize:9}}>{t.sub}</span>
                  <span style={{color:'var(--text)'}}>{t.topic}</span>
                  <span className="tag" style={{background:'#00d4ff11',border:'1px solid #00d4ff44',color:'var(--cyan)'}}>{t.round} · {t.overdueBy}d late</span>
                </div>
              )
              return (
                <div key={i} style={{padding:'7px 10px',background:'var(--bg4)',border:'1px solid var(--border)',borderRadius:4,fontSize:12,display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                  <span style={{color:subCol,fontFamily:"'Share Tech Mono',monospace",fontSize:9}}>{t.sub}</span>
                  <span style={{color:'var(--text)'}}>{t.topic}</span>
                  <span className="tag" style={{background:'#39ff1411',border:'1px solid #39ff1444',color:'var(--green)'}}>PRI {t.pri} · CONF {t.conf}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
