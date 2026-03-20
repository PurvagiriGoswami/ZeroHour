import { useState } from 'react'
import { useStore } from '../store'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { SUBC } from '../data'
import { td } from '../utils'

const emptyForm = () => ({ date:'', subject:'Maths', topic:'', source:'', method:'', reason:'Concept Gap' })
const REASONS = ['Concept Gap','Silly Mistake','Time Pressure','Formula Forgot','Misread Question','Guessed Wrong']
const SUBJECTS = ['Maths','English','GS','AFCAT Reasoning']
const SC2 = { Maths:'#ffd700', English:'#00d4ff', GS:'#39ff14', 'AFCAT Reasoning':'#bf80ff' }

export default function Errors() {
  const { state, act } = useStore()
  const toast = useToast()
  const confirm = useConfirm()
  const { errs } = state
  const [form, setForm] = useState(emptyForm())
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const f = form
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const unfix = errs.filter(e=>!e.resolved).length
  const filtered = filter==='all' ? errs : filter==='unresolved' ? errs.filter(e=>!e.resolved) : errs.filter(e=>e.resolved)

  function addErr() {
    if(!f.topic.trim()){ toast('Enter a topic','warn'); return }
    act({ type:'SET_ERRS', errs:[{
      id:Date.now(), date:f.date||td(),
      subject:f.subject, topic:f.topic, source:f.source||'',
      method:f.method||'', reason:f.reason, resolved:false
    },...errs]})
    toast('Error logged','err')
    setShowForm(false); setForm(emptyForm())
  }

  function toggleErr(id) {
    act({ type:'SET_ERRS', errs:errs.map(e=>e.id===id?{...e,resolved:!e.resolved}:e) })
  }

  function deleteErr(id) {
    confirm('DELETE ERROR','Remove this error entry?',()=>{
      act({ type:'SET_ERRS', errs:errs.filter(e=>e.id!==id) })
      toast('Error deleted','info')
    })
  }

  return (
    <div className="page-inner fade-in">
      <div className="g3 keep" style={{marginBottom:12}}>
        {[['TOTAL',errs.length,'#ff8888'],['UNRESOLVED',unfix,'var(--red)'],['FIXED',errs.filter(e=>e.resolved).length,'var(--green)']].map(([l,v,c])=>(
          <div key={l} className="card" style={{textAlign:'center',padding:16,marginBottom:0}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:30,color:c}}>{v}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text4)',marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <div className="card-title" style={{marginBottom:0}}>🔴 LOG NEW ERROR</div>
          <button className={`btn ${showForm?'btn-y':'btn-r'}`} onClick={()=>setShowForm(p=>!p)}>
            {showForm?'✕ CANCEL':'+ LOG ERROR'}
          </button>
        </div>
        {showForm && (
          <div style={{marginTop:14,animation:'fadeIn .2s ease'}}>
            <div className="g3" style={{marginBottom:10}}>
              <div><label className="lbl">DATE</label><input type="date" className="inp" value={f.date||td()} onChange={set('date')}/></div>
              <div><label className="lbl">SUBJECT</label>
                <select className="inp" value={f.subject} onChange={set('subject')}>
                  {SUBJECTS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="lbl">REASON</label>
                <select className="inp" value={f.reason} onChange={set('reason')}>
                  {REASONS.map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="row" style={{marginBottom:10}}>
              <div className="f1"><label className="lbl">TOPIC</label><input className="inp" placeholder="e.g. Number System" value={f.topic} onChange={set('topic')}/></div>
              <div style={{minWidth:150}}><label className="lbl">SOURCE</label><input className="inp" placeholder="Mock #1 / PYQ 2023" value={f.source} onChange={set('source')}/></div>
            </div>
            <div style={{marginBottom:14}}><label className="lbl">CORRECT METHOD / WHAT TO REMEMBER</label>
              <textarea className="ta" value={f.method} onChange={set('method')} placeholder="Explain the correct approach..."/>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="btn btn-r" onClick={addErr}>🔴 LOG ERROR</button>
              <button className="btn" onClick={()=>{setShowForm(false);setForm(emptyForm())}}>CANCEL</button>
            </div>
          </div>
        )}
      </div>

      <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
        {[['all','ALL'],['unresolved','🔴 UNRESOLVED'],['fixed','✅ FIXED']].map(([v,l])=>(
          <button key={v} className={`btn${filter===v?' btn-g':''}`} style={{fontSize:9,padding:'5px 12px'}} onClick={()=>setFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length===0 ? <div className="empty">// NO ERRORS TO DISPLAY</div> : filtered.map(e=>(
        <div key={e.id} style={{background:'var(--bg4)',border:`1px solid ${e.resolved?'var(--border)':'#ff333322'}`,borderRadius:4,padding:14,marginBottom:8,opacity:e.resolved?.55:1,transition:'all .2s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8}}>
            <div style={{display:'flex',gap:7,alignItems:'center',flexWrap:'wrap'}}>
              <span className="tag" style={{background:`${SC2[e.subject]||'#4a4a4a'}11`,border:`1px solid ${SC2[e.subject]||'#4a4a4a'}33`,color:SC2[e.subject]||'var(--text)'}}>{e.subject}</span>
              <span style={{fontSize:14,fontWeight:600,color:e.resolved?'var(--text4)':'#ff8888'}}>{e.topic}</span>
              <span className="tag" style={{background:'var(--rdim)',border:'1px solid #ff333322',color:'#ff8888'}}>{e.reason}</span>
            </div>
            <div style={{display:'flex',gap:6,flexShrink:0}}>
              <button className={`btn ${e.resolved?'':'btn-g'}`} style={{padding:'5px 10px',fontSize:9}} onClick={()=>toggleErr(e.id)}>
                {e.resolved?'RE-OPEN':'✓ FIXED'}
              </button>
              <button className="btn btn-r" style={{padding:'5px 10px',fontSize:9}} onClick={()=>deleteErr(e.id)}>✕</button>
            </div>
          </div>
          {e.method&&<div style={{fontSize:13,color:'var(--text2)',marginTop:10,padding:'8px 10px',background:'var(--bg3)',borderLeft:'2px solid var(--border)',borderRadius:'0 3px 3px 0'}}>{e.method}</div>}
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'var(--text5)',marginTop:6}}>
            {e.date||''}{e.source?' · '+e.source:''}
          </div>
        </div>
      ))}
    </div>
  )
}
