import { useState } from 'react'
import { useStore } from '../store'
import { SUBC, SC, PRICC, SUBTOTALS } from '../data'
import { getRevDue, td } from '../utils'

export default function Syllabus() {
  const { state, act } = useStore()
  const { syl, revision } = state
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState({})
  const subjects = ['All','Maths','English','GS','AFCAT']
  const filtered = filter==='All' ? syl : syl.filter(t=>t.sub===filter)
  const groups = {}
  filtered.forEach(t=>{ if(!groups[t.sub]) groups[t.sub]=[]; groups[t.sub].push(t) })

  const totalDone = syl.filter(t=>t.status==='Done').length

  function toggleExp(id) { setExpanded(p=>({...p,[id]:!p[id]})) }

  function toggleSubtopic(topicId, si, val) {
    const newSyl = syl.map(t=>{
      if(t.id!==topicId) return t
      const done={...t.done,[si]:val}
      const allDone=t.subs.every((_,i)=>done[i])
      const anyDone=Object.values(done).some(Boolean)
      return {...t,done,status:allDone?'Done':anyDone?'In Progress':'Not Started',lastStudied:val?td():t.lastStudied}
    })
    act({type:'SET_SYL', syl:newSyl})
  }

  function setSylConf(topicId, v) {
    act({type:'SET_SYL', syl:syl.map(t=>t.id===topicId?{...t,conf:+v}:t)})
  }

  function markAllSubs(topicId, val) {
    act({type:'SET_SYL', syl:syl.map(t=>{
      if(t.id!==topicId) return t
      return {...t,done:Object.fromEntries(t.subs.map((_,i)=>[i,val])),status:val?'Done':'Not Started',lastStudied:val?td():t.lastStudied}
    })})
  }

  function advance(topicId) {
    const t = syl.find(x=>x.id===topicId); if(!t) return
    const today = td()
    if(t.status==='Not Started') {
      const tgt = Math.max(1,Math.floor((t.subs||[]).length/2))
      act({type:'SET_SYL', syl:syl.map(x=>x.id===topicId?{...x,status:'In Progress',done:Object.fromEntries(t.subs.map((_,i)=>[i,i<tgt])),lastStudied:today}:x)})
    } else if(t.status==='In Progress') {
      act({type:'SET_SYL', syl:syl.map(x=>x.id===topicId?{...x,status:'Done',done:Object.fromEntries(t.subs.map((_,i)=>[i,true])),lastStudied:today}:x)})
    }
  }

  const statsBar = subjects.filter(s=>s!=='All').map(s=>{
    const done=syl.filter(t=>t.sub===s&&t.status==='Done').length
    const total=SUBTOTALS[s]; const pct=Math.round(done/total*100)
    return (
      <div key={s} style={{flex:1,textAlign:'center',padding:8,background:'var(--bg4)',border:`1px solid ${SUBC[s]}22`,borderRadius:3}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:16,color:SUBC[s]}}>{done}/{total}</div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'var(--text4)'}}>{s}</div>
        <div className="pb" style={{marginTop:5}}>
          <div className="pf" style={{width:`${pct}%`,background:SUBC[s]}}/>
        </div>
      </div>
    )
  })

  return (
    <div className="page-inner fade-in">
      <div className="card" style={{padding:12}}>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
          {subjects.map(s=>(
            <button key={s} className={`btn${filter===s?' btn-g':''}`} style={{padding:'5px 12px',fontSize:9}} onClick={()=>setFilter(s)}>{s}</button>
          ))}
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{statsBar}</div>
      </div>

      {Object.entries(groups).map(([sub,topics])=>{
        const subDone=topics.filter(t=>t.status==='Done').length
        const total=SUBTOTALS[sub]||topics.length
        const pct=Math.round(subDone/total*100)
        const color=SUBC[sub]||'#39ff14'
        return (
          <div key={sub} className="card" style={{padding:0,overflow:'hidden'}}>
            <div style={{padding:'10px 14px',background:'var(--bg2)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color,letterSpacing:2}}>▶ {sub.toUpperCase()}</span>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:'var(--text4)'}}>{subDone}/{total} · {pct}%</span>
              </div>
              <div className="pb" style={{width:100,margin:0}}>
                <div className="pf" style={{width:`${pct}%`,background:color}}/>
              </div>
            </div>
            {topics.map(t=>{
              const st=t.status||'Not Started', sc=SC[st], isExp=!!expanded[t.id]
              const doneSubs=Object.values(t.done||{}).filter(Boolean).length
              const totalSubs=t.subs.length
              const subPct=totalSubs>0?Math.round(doneSubs/totalSubs*100):0
              const rv=revision.find(r=>r.topicId===t.id)||{}
              const due=getRevDue(t,rv)
              return (
                <div key={t.id} style={{borderBottom:'1px solid var(--border3)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',cursor:'pointer',transition:'background .15s'}}
                    onMouseOver={e=>e.currentTarget.style.background='var(--bg4)'}
                    onMouseOut={e=>e.currentTarget.style.background='transparent'}
                    onClick={()=>toggleExp(t.id)}>
                    <span style={{color,fontSize:13,width:16,flexShrink:0,fontFamily:"'Share Tech Mono',monospace"}}>{isExp?'▼':'▶'}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
                        <span style={{fontSize:14,color:st==='Done'?'var(--text5)':st==='In Progress'?'var(--text2)':'var(--text)'}}>{t.topic}</span>
                        <span className="tag" style={{background:`${PRICC[t.pri]}11`,border:`1px solid ${PRICC[t.pri]}33`,color:PRICC[t.pri]}}>{t.pri}</span>
                        <span className="tag" style={{background:`${sc}11`,border:`1px solid ${sc}33`,color:sc}}>{st}</span>
                        {due && <span className="tag" style={{background:'var(--yldim)',border:'1px solid #ffd70033',color:'var(--gold)'}}>⚠ {due.round} DUE</span>}
                        {t.conf>0 && <span className="tag" style={{background:'var(--bg4)',border:'1px solid var(--border)',color:'var(--text3)'}}>CONF {t.conf}/5</span>}
                      </div>
                      <div className="pb" style={{marginTop:4,maxWidth:200}}>
                        <div className="pf" style={{width:`${subPct}%`,background:color,opacity:.6}}/>
                      </div>
                    </div>
                    <button className="btn" style={{padding:'4px 10px',fontSize:8,flexShrink:0}} onClick={e=>{e.stopPropagation();advance(t.id)}}>ADVANCE</button>
                  </div>
                  {isExp && (
                    <div style={{padding:'12px 12px 16px 28px',background:'var(--bg4)',borderTop:'1px solid var(--border3)'}}>
                      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'var(--text5)',letterSpacing:1,marginBottom:10}}>SUBTOPICS ({doneSubs}/{totalSubs})</div>
                      <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:12}}>
                        {t.subs.map((s,si)=>(
                          <label key={si} style={{display:'flex',alignItems:'center',gap:5,cursor:'pointer',fontSize:13,
                            color:t.done&&t.done[si]?color:'var(--text3)',
                            background:t.done&&t.done[si]?`${color}11`:'transparent',
                            padding:'5px 12px',border:`1px solid ${t.done&&t.done[si]?`${color}33`:'var(--border2)'}`,
                            borderRadius:3,transition:'all .12s',userSelect:'none',minHeight:36}}>
                            <input type="checkbox" checked={!!(t.done&&t.done[si])} onChange={e=>toggleSubtopic(t.id,si,e.target.checked)}/>
                            {s}
                          </label>
                        ))}
                      </div>
                      <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text3)'}}>CONFIDENCE:</span>
                          <select className="inp" style={{width:70,padding:'5px 8px',fontSize:13}} value={t.conf||0} onChange={e=>setSylConf(t.id,e.target.value)}>
                            {[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <button className="btn btn-g" style={{padding:'5px 12px',fontSize:9}} onClick={()=>markAllSubs(t.id,true)}>TICK ALL</button>
                        <button className="btn btn-r" style={{padding:'5px 12px',fontSize:9}} onClick={()=>markAllSubs(t.id,false)}>CLEAR</button>
                        {t.lastStudied && <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text5)'}}>Last: {t.lastStudied}</span>}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
