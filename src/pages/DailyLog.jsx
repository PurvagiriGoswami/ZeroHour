import { useState } from 'react'
import { useStore } from '../store'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { td } from '../utils'

const empty = () => ({ date:td(),wake:'',sleep:'',energy:3,maths:'',eng:'',gs:'',morning:'',night:'',pyqs:'',score:'',gym:false,mock:false,rev:false,notes:'',plan:'' })

export default function DailyLog() {
  const { state, act } = useStore()
  const toast = useToast()
  const confirm = useConfirm()
  const { logs } = state
  const [form, setForm] = useState(empty())
  const f = form
  const set = k => e => setForm(p=>({...p,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value}))
  const setV = (k,v) => setForm(p=>({...p,[k]:v}))

  const existing = logs.find(l=>l.date===f.date)
  const todayTasks = state.plannerTasks?.filter(t => t.date === f.date) || []
  const planStr = todayTasks.length > 0 ? todayTasks.map(t => `${t.subject}: ${t.topic}`).join(' | ') : 'No specific plan for this date — set your own focus.'
  const plan = planStr

  function saveLog() {
    const entry = {...f, date:f.date||td()}
    const newLogs = [...logs.filter(l=>l.date!==entry.date), entry].sort((a,b)=>b.date.localeCompare(a.date))
    act({type:'SET_LOGS', logs:newLogs})
    toast('Log saved! ✓','ok')
  }

  function editLog(date) {
    const l = logs.find(lg=>lg.date===date)
    if(l) setForm({...l})
  }

  function deleteLog(date) {
    confirm('DELETE LOG','Remove this log entry permanently?',()=>{
      act({type:'SET_LOGS', logs:logs.filter(l=>l.date!==date)})
      toast('Log deleted','info')
    })
  }

  return (
    <div className="page-inner fade-in">
      <div className="card" style={{borderRadius:20, padding:24, marginBottom:24}}>
        <div className="card-title" style={{fontSize:18, marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>📅 LOG ENTRY — <span style={{color:'var(--indigo)'}}>{f.date}</span></div>
          <span style={{fontSize:10, fontWeight:800, color:existing?'var(--green)':'var(--text4)', padding:'4px 10px', borderRadius:8, background:existing?'rgba(63, 185, 80, 0.1)':'var(--bg3)'}}>{existing?'● SAVED':'○ UNSAVED'}</span>
        </div>
        <div style={{padding:16,background:'var(--bg3)',borderLeft:'3px solid var(--indigo)',borderRadius:'0 12px 12px 0',marginBottom:24}}>
          <div style={{fontSize:10, fontWeight:800, color:'var(--indigo)', textTransform:'uppercase', letterSpacing:1, marginBottom:4}}>TODAY'S PLAN</div>
          <div style={{fontSize:14,color:'var(--text2)', lineHeight:1.5}}>{plan}</div>
        </div>
        <div className="g3" style={{marginBottom:16}}>
          <div><label className="lbl">DATE</label><input type="date" className="inp" style={{borderRadius:10}} value={f.date} onChange={e=>setV('date',e.target.value)}/></div>
          <div><label className="lbl">WAKE TIME</label><input className="inp" style={{borderRadius:10}} placeholder="05:00" value={f.wake} onChange={set('wake')}/></div>
          <div><label className="lbl">SLEEP TIME</label><input className="inp" style={{borderRadius:10}} placeholder="22:00" value={f.sleep} onChange={set('sleep')}/></div>
        </div>
        <div style={{marginBottom:20, padding:16, background:'var(--bg2)', borderRadius:12, border:'1px solid var(--border)'}}>
          <label className="lbl" style={{marginBottom:12}}>ENERGY LEVEL: <span style={{color:'var(--green)',fontSize:14, marginLeft:8}}>{f.energy}/5</span></label>
          <input type="range" min={1} max={5} value={f.energy} onChange={e=>setV('energy',+e.target.value)}/>
        </div>
        <div className="g3" style={{marginBottom:16}}>
          <div><label className="lbl">MATHS TOPIC</label><input className="inp" style={{borderRadius:10}} placeholder="e.g. Number System" value={f.maths} onChange={set('maths')}/></div>
          <div><label className="lbl">ENGLISH TOPIC</label><input className="inp" style={{borderRadius:10}} placeholder="e.g. Spotting Errors" value={f.eng} onChange={set('eng')}/></div>
          <div><label className="lbl">GS TOPIC</label><input className="inp" style={{borderRadius:10}} placeholder="e.g. Polity" value={f.gs} onChange={set('gs')}/></div>
        </div>
        <div className="g2" style={{marginBottom:16}}>
          <div><label className="lbl">MORNING STUDY</label><input className="inp" style={{borderRadius:10}} placeholder="Topics, resources..." value={f.morning} onChange={set('morning')}/></div>
          <div><label className="lbl">NIGHT STUDY / PYQs</label><input className="inp" style={{borderRadius:10}} placeholder="PYQs, revision..." value={f.night} onChange={set('night')}/></div>
        </div>
        <div className="row" style={{marginBottom:20}}>
          <div className="f1"><label className="lbl">PYQs DONE</label><input className="inp" style={{borderRadius:10}} placeholder="Number System — 20 Qs" value={f.pyqs} onChange={set('pyqs')}/></div>
          <div style={{minWidth:130}}><label className="lbl">MOCK SCORE</label><input className="inp" style={{borderRadius:10}} placeholder="165/300" value={f.score} onChange={set('score')}/></div>
        </div>
        <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
          {[['gym','💪 GYM'],['mock','🎯 MOCK'],['rev','🔄 REVISION']].map(([k,l])=>(
            <button key={k} onClick={()=>setV(k,!f[k])} style={{
              background:f[k]?'rgba(63, 185, 80, 0.1)':'var(--bg3)',
              border:`1px solid ${f[k]?'var(--green)':'var(--border)'}`,
              padding:'12px 20px',borderRadius:12,cursor:'pointer',
              fontSize:13, fontWeight:700,
              color:f[k]?'var(--green)':'var(--text4)',
              transition:'all .2s',display:'flex',alignItems:'center',gap:8, flex:1, minWidth:120, justifyContent:'center'
            }}>
              {f[k]?'✓':' '} {l}
            </button>
          ))}
        </div>
        <div style={{marginBottom:16}}><label className="lbl">MISTAKES / NOTES</label><textarea className="ta" style={{borderRadius:10, minHeight:80}} value={f.notes} onChange={set('notes')} placeholder="What went wrong today?"/></div>
        <div style={{marginBottom:24}}><label className="lbl">TOMORROW'S PLAN</label><textarea className="ta" style={{borderRadius:10, minHeight:60}} value={f.plan} onChange={set('plan')} placeholder="Tomorrow's focus topics..."/></div>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <button className="btn btn-g" style={{padding:'14px 24px', borderRadius:12, fontWeight:800, fontSize:13}} onClick={saveLog}>💾 SAVE LOG</button>
          <button className="btn" style={{padding:'14px 24px', borderRadius:12, fontWeight:800, fontSize:13}} onClick={()=>setForm(empty())}>↺ CLEAR</button>
        </div>
      </div>

      <div className="card" style={{borderRadius:20, padding:24}}>
        <div className="card-title" style={{fontSize:18, marginBottom:20}}>📁 LOG HISTORY <span style={{color:'var(--text4)',fontSize:11, fontWeight:600, marginLeft:12}}>{logs.length} entries</span></div>
        {logs.length === 0 ? <div className="empty" style={{padding:'40px 0'}}>// NO LOG ENTRIES YET</div> : (
          <div style={{maxHeight:400,overflowY:'auto', paddingRight:8}}>
            {logs.slice(0,30).map(l=>(
              <div key={l.date} style={{padding:'20px 0',borderBottom:'1px solid var(--border2)'}}>
                <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap',marginBottom:12}}>
                  <span style={{fontSize:13, fontWeight:800, color:'var(--indigo)', letterSpacing:1}}>{l.date}</span>
                  {l.energy && <span className="tag" style={{background:l.energy>=4?'rgba(63, 185, 80, 0.1)':'rgba(210, 153, 34, 0.1)',border:`1px solid ${l.energy>=4?'rgba(63, 185, 80, 0.2)':'rgba(210, 153, 34, 0.2)'}`,color:l.energy>=4?'var(--green)':'var(--gold)', borderRadius:6}}>E{l.energy}/5</span>}
                  {l.mock   && <span className="tag" style={{background:'rgba(57, 197, 207, 0.1)',border:'1px solid rgba(57, 197, 207, 0.2)',color:'var(--cyan)', borderRadius:6}}>MOCK</span>}
                  {l.gym    && <span className="tag" style={{background:'rgba(188, 140, 255, 0.1)',border:'1px solid rgba(188, 140, 255, 0.2)',color:'var(--purple)', borderRadius:6}}>GYM</span>}
                  {l.score  && <span style={{fontSize:12, fontWeight:800, color:'var(--green)', padding:'2px 8px', background:'rgba(63, 185, 80, 0.1)', borderRadius:6}}>{l.score}</span>}
                  <div style={{marginLeft:'auto',display:'flex',gap:8}}>
                    <button className="btn" style={{padding:'6px 12px',fontSize:10, borderRadius:8}} onClick={()=>editLog(l.date)}>✎ EDIT</button>
                    <button className="btn btn-r" style={{padding:'6px 12px',fontSize:10, borderRadius:8}} onClick={()=>deleteLog(l.date)}>✕</button>
                  </div>
                </div>
                {(l.maths||l.eng||l.gs) && <div style={{fontSize:14,color:'var(--text2)', fontWeight:500}}>M: {l.maths||'—'} · E: {l.eng||'—'} · GS: {l.gs||'—'}</div>}
                {l.notes && <div style={{fontSize:13,color:'var(--red)',fontStyle:'italic',marginTop:8, padding:'8px 12px', background:'rgba(248, 81, 73, 0.05)', borderRadius:8, borderLeft:'2px solid var(--red)'}}>{l.notes.slice(0,100)}{l.notes.length>100?'...':''}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
