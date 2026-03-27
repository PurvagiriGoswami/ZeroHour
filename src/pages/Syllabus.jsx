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
      <div key={s} style={{flex:'1 1 100px', minWidth:100, textAlign:'center',padding:12,background:'var(--bg4)',border:`1px solid ${SUBC[s]}33`,borderRadius:12}}>
        <div style={{fontSize:18,fontWeight:700,color:SUBC[s]}}>{done}/{total}</div>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text4)',textTransform:'uppercase',marginTop:4}}>{s}</div>
        <div className="pb" style={{marginTop:8, height:4}}>
          <div className="pf" style={{width:`${pct}%`,background:SUBC[s]}}/>
        </div>
      </div>
    )
  })

  return (
    <div className="page-inner fade-in">
      <div className="card" style={{padding:20, borderRadius:20}}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
          {subjects.map(s=>(
            <button key={s} className={`btn${filter===s?' btn-g':''}`} 
              style={{padding:'8px 16px',fontSize:12, borderRadius:10, background:filter===s?'var(--indigo)':'var(--bg3)', color:filter===s?'white':'var(--text3)'}} 
              onClick={()=>setFilter(s)}>{s}</button>
          ))}
        </div>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>{statsBar}</div>
      </div>

      {Object.entries(groups).map(([sub,topics])=>{
        const subDone=topics.filter(t=>t.status==='Done').length
        const total=SUBTOTALS[sub]||topics.length
        const pct=Math.round(subDone/total*100)
        const color=SUBC[sub]||'#10b981'
        return (
          <div key={sub} className="card" style={{padding:0,overflow:'hidden', borderRadius:20, border:`1px solid rgba(255,255,255,0.05)`, marginBottom:24}}>
            <div style={{padding:'16px 20px',background:'var(--bg2)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:14,fontWeight:800,color,letterSpacing:0.5}}>{sub.toUpperCase()}</span>
                <span style={{fontSize:12,fontWeight:600,color:'var(--text4)'}}>{subDone}/{total} topics completed</span>
              </div>
              <div className="pb" style={{width:120,margin:0, height:6, background:'var(--bg4)'}}>
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
                <div key={t.id} style={{borderBottom:'1px solid var(--border2)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,padding:'16px 20px',cursor:'pointer',transition:'background .2s'}}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                    onMouseOut={e=>e.currentTarget.style.background='transparent'}
                    onClick={()=>toggleExp(t.id)}>
                    <span style={{color:'var(--text4)',fontSize:12,width:20,flexShrink:0}}>{isExp?'▼':'▶'}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                        <span style={{fontSize:15,fontWeight:600,color:st==='Done'?'var(--text4)':st==='In Progress'?'var(--text2)':'var(--text)'}}>{t.topic}</span>
                        <span className="tag" style={{background:`${PRICC[t.pri]}15`,border:`1px solid ${PRICC[t.pri]}33`,color:PRICC[t.pri], borderRadius:6, fontSize:10, fontWeight:700}}>{t.pri === 'H' ? 'High Priority' : t.pri === 'M' ? 'Medium' : 'Low'}</span>
                        <span className="tag" style={{background:`${sc}15`,border:`1px solid ${sc}33`,color:sc, borderRadius:6, fontSize:10, fontWeight:700}}>{st}</span>
                        {due && <span className="tag" style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',color:'var(--gold)', borderRadius:6, fontSize:10, fontWeight:700}}>⚠ {due.round} DUE</span>}
                      </div>
                      <div className="pb" style={{marginTop:8,maxWidth:240, height:4, background:'var(--bg4)'}}>
                        <div className="pf" style={{width:`${subPct}%`,background:color,opacity:.8}}/>
                      </div>
                    </div>
                    <button className="btn" style={{padding:'6px 14px',fontSize:10,fontWeight:700, borderRadius:8, background:'var(--bg3)'}} onClick={e=>{e.stopPropagation();advance(t.id)}}>
                      {st === 'Done' ? 'REVIEW' : 'ADVANCE'}
                    </button>
                  </div>
                  {isExp && (
                    <div style={{padding:'20px 20px 24px 52px',background:'var(--bg4)',borderTop:'1px solid var(--border2)'}}>
                      
                      {/* Why this matters - New Feature */}
                      <div style={{marginBottom:20, padding:16, background:'rgba(99,102,241,0.05)', borderRadius:12, border:'1px solid rgba(99,102,241,0.1)'}}>
                        <div style={{fontSize:11, fontWeight:800, color:'var(--indigo)', textTransform:'uppercase', marginBottom:6, letterSpacing:0.5}}>Why this matters</div>
                        <div style={{fontSize:13, color:'var(--text2)', lineHeight:1.5}}>{t.why}</div>
                      </div>

                      <div style={{fontSize:11,fontWeight:800,color:'var(--text4)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:12}}>Subtopics ({doneSubs}/{totalSubs})</div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
                        {t.subs.map((s,si)=>(
                          <label key={si} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,
                            color:t.done&&t.done[si]?color:'var(--text3)',
                            background:t.done&&t.done[si]?`${color}10`:'var(--bg2)',
                            padding:'8px 16px',border:`1px solid ${t.done&&t.done[si]?`${color}40`:'var(--border)'}`,
                            borderRadius:10,transition:'all .2s',userSelect:'none',minHeight:40, fontWeight:500}}>
                            <input type="checkbox" checked={!!(t.done&&t.done[si])} onChange={e=>toggleSubtopic(t.id,si,e.target.checked)}/>
                            {s}
                          </label>
                        ))}
                      </div>

                      {/* Expected Exam Questions - New Feature */}
                      {t.questions && t.questions.length > 0 && (
                        <div style={{marginBottom:20}}>
                          <div style={{fontSize:11, fontWeight:800, color:'var(--gold)', textTransform:'uppercase', marginBottom:10, letterSpacing:0.5}}>Expected Exam Questions</div>
                          <div style={{display:'flex', flexDirection:'column', gap:8}}>
                            {t.questions.map((q,qi)=>(
                              <div key={qi} style={{fontSize:13, color:'var(--text3)', padding:'10px 14px', background:'rgba(255,255,255,0.02)', borderRadius:10, borderLeft:`3px solid var(--gold)`}}>
                                {q}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap', marginTop:16, paddingTop:16, borderTop:'1px solid var(--border2)'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <span style={{fontSize:11,fontWeight:700,color:'var(--text4)'}}>CONFIDENCE:</span>
                          <select className="inp" style={{width:80,padding:'6px 12px',fontSize:14, borderRadius:8}} value={t.conf||0} onChange={e=>setSylConf(t.id,e.target.value)}>
                            {[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <button className="btn" style={{padding:'8px 16px',fontSize:11, fontWeight:700, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10}} onClick={()=>markAllSubs(t.id,true)}>TICK ALL</button>
                        <button className="btn" style={{padding:'8px 16px',fontSize:11, fontWeight:700, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10}} onClick={()=>markAllSubs(t.id,false)}>CLEAR</button>
                        {t.lastStudied && <span style={{fontSize:11,fontWeight:600,color:'var(--text5)'}}>Last studied: {t.lastStudied}</span>}
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
