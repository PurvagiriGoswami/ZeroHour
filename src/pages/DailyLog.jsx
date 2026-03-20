import { useState } from 'react'
import { useStore } from '../store'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { DAILY_PLANS } from '../data'
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
  const plan = DAILY_PLANS[f.date] || 'No specific plan for this date — set your own focus.'

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
      <div className="card">
        <div className="card-title">
          📅 LOG ENTRY — <span style={{color:'var(--gold)'}}>{f.date}</span>
          <span style={{fontSize:9,color:existing?'var(--green)':'var(--text4)'}}>{existing?'● SAVED':'○ UNSAVED'}</span>
        </div>
        <div style={{padding:10,background:'var(--bg4)',border:'1px solid #ffd70022',borderRadius:3,marginBottom:14}}>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--gold)'}}>TODAY'S PLAN: </span>
          <span style={{fontSize:13,color:'var(--text)'}}>{plan}</span>
        </div>
        <div className="g3" style={{marginBottom:12}}>
          <div><label className="lbl">DATE</label><input type="date" className="inp" value={f.date} onChange={e=>setV('date',e.target.value)}/></div>
          <div><label className="lbl">WAKE TIME</label><input className="inp" placeholder="05:00" value={f.wake} onChange={set('wake')}/></div>
          <div><label className="lbl">SLEEP TIME</label><input className="inp" placeholder="22:00" value={f.sleep} onChange={set('sleep')}/></div>
        </div>
        <div style={{marginBottom:12}}>
          <label className="lbl">ENERGY LEVEL: <span style={{color:'var(--green)',fontSize:12}}>{f.energy}/5</span></label>
          <input type="range" min={1} max={5} value={f.energy} onChange={e=>setV('energy',+e.target.value)}/>
        </div>
        <div className="g3" style={{marginBottom:12}}>
          <div><label className="lbl">MATHS TOPIC</label><input className="inp" placeholder="e.g. Number System" value={f.maths} onChange={set('maths')}/></div>
          <div><label className="lbl">ENGLISH TOPIC</label><input className="inp" placeholder="e.g. Spotting Errors" value={f.eng} onChange={set('eng')}/></div>
          <div><label className="lbl">GS TOPIC</label><input className="inp" placeholder="e.g. Polity" value={f.gs} onChange={set('gs')}/></div>
        </div>
        <div className="g2" style={{marginBottom:12}}>
          <div><label className="lbl">MORNING STUDY</label><input className="inp" placeholder="Topics, resources..." value={f.morning} onChange={set('morning')}/></div>
          <div><label className="lbl">NIGHT STUDY / PYQs</label><input className="inp" placeholder="PYQs, revision..." value={f.night} onChange={set('night')}/></div>
        </div>
        <div className="row" style={{marginBottom:12}}>
          <div className="f1"><label className="lbl">PYQs DONE</label><input className="inp" placeholder="Number System — 20 Qs" value={f.pyqs} onChange={set('pyqs')}/></div>
          <div style={{minWidth:130}}><label className="lbl">MOCK SCORE</label><input className="inp" placeholder="165/300" value={f.score} onChange={set('score')}/></div>
        </div>
        <div style={{display:'flex',gap:10,marginBottom:12,flexWrap:'wrap'}}>
          {[['gym','💪 GYM'],['mock','🎯 MOCK'],['rev','🔄 REVISION']].map(([k,l])=>(
            <button key={k} onClick={()=>setV(k,!f[k])} style={{
              background:f[k]?'var(--gdim)':'transparent',
              border:`1px solid ${f[k]?'var(--green)':'var(--border)'}`,
              padding:'10px 16px',borderRadius:3,cursor:'pointer',
              fontFamily:"'Share Tech Mono',monospace",fontSize:11,
              color:f[k]?'var(--green)':'var(--text4)',
              transition:'all .15s',display:'flex',alignItems:'center',gap:6,minHeight:44
            }}>
              {f[k]?'✓':' '} {l}
            </button>
          ))}
        </div>
        <div style={{marginBottom:12}}><label className="lbl">MISTAKES / NOTES</label><textarea className="ta" value={f.notes} onChange={set('notes')} placeholder="What went wrong today?"/></div>
        <div style={{marginBottom:14}}><label className="lbl">TOMORROW'S PLAN</label><textarea className="ta" style={{minHeight:42}} value={f.plan} onChange={set('plan')} placeholder="Tomorrow's focus topics..."/></div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button className="btn btn-g" onClick={saveLog}>💾 SAVE LOG</button>
          <button className="btn" onClick={()=>setForm(empty())}>↺ CLEAR</button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📁 LOG HISTORY <span style={{color:'var(--text4)',fontSize:9}}>{logs.length} entries</span></div>
        {logs.length === 0 ? <div className="empty">// NO LOG ENTRIES YET</div> : (
          <div style={{maxHeight:350,overflowY:'auto'}}>
            {logs.slice(0,30).map(l=>(
              <div key={l.date} style={{padding:12,borderBottom:'1px solid var(--border3)'}}>
                <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap',marginBottom:5}}>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:'var(--gold)'}}>{l.date}</span>
                  {l.energy && <span className="tag" style={{background:l.energy>=4?'#0d3a0d':'#2a1f00',border:`1px solid ${l.energy>=4?'var(--green)':'var(--gold)'}`,color:l.energy>=4?'var(--green)':'var(--gold)'}}>E{l.energy}/5</span>}
                  {l.mock   && <span className="tag" style={{background:'var(--cdim)',border:'1px solid #00d4ff33',color:'var(--cyan)'}}>MOCK</span>}
                  {l.gym    && <span className="tag" style={{background:'#1a002a',border:'1px solid #bf80ff33',color:'var(--purple)'}}>GYM</span>}
                  {l.score  && <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:'var(--green)'}}>{l.score}</span>}
                  <div style={{marginLeft:'auto',display:'flex',gap:5}}>
                    <button className="btn" style={{padding:'5px 10px',fontSize:9}} onClick={()=>editLog(l.date)}>✎ EDIT</button>
                    <button className="btn btn-r" style={{padding:'5px 10px',fontSize:9}} onClick={()=>deleteLog(l.date)}>✕</button>
                  </div>
                </div>
                {(l.maths||l.eng||l.gs) && <div style={{fontSize:13,color:'var(--text2)'}}>M:{l.maths||'—'} · E:{l.eng||'—'} · GS:{l.gs||'—'}</div>}
                {l.notes && <div style={{fontSize:12,color:'#ff8888',fontStyle:'italic',marginTop:3}}>{l.notes.slice(0,100)}{l.notes.length>100?'...':''}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
