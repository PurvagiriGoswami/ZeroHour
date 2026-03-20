import { useState } from 'react'
import { useStore } from '../store'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { SUBC, DEFAULT_FORMULAS } from '../data'

const emptyForm = () => ({ topic:'', formula:'', note:'', sub:'Maths' })

export default function Formulas() {
  const { state, act } = useStore()
  const toast = useToast()
  const confirm = useConfirm()
  const { formulas } = state
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState(emptyForm())
  const f = form
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}))

  // seed defaults if empty
  if(formulas.length===0) act({ type:'SET_FORMULAS', formulas:DEFAULT_FORMULAS })

  const subs = ['All','Maths','English','GS','AFCAT']
  const filtered = filter==='All' ? formulas : formulas.filter(f=>f.sub===filter)
  const learned = formulas.filter(f=>f.learned).length

  function addFormula() {
    if(!f.formula.trim()||!f.topic.trim()){ toast('Enter topic and formula','warn'); return }
    act({ type:'SET_FORMULAS', formulas:[...formulas,{
      id:String(Date.now()), sub:f.sub, topic:f.topic, formula:f.formula, note:f.note, learned:false
    }]})
    toast('Formula added ✓','ok')
    setForm(emptyForm())
  }

  function toggleFormula(id) {
    act({ type:'SET_FORMULAS', formulas:formulas.map(f=>String(f.id)===String(id)?{...f,learned:!f.learned}:f) })
  }

  function deleteFormula(id) {
    confirm('DELETE FORMULA','Remove this formula card?',()=>{
      act({ type:'SET_FORMULAS', formulas:formulas.filter(f=>String(f.id)!==String(id)) })
      toast('Formula removed','info')
    })
  }

  return (
    <div className="page-inner fade-in">
      <div className="card">
        <div className="card-title">
          📐 FORMULA CARDS
          <span style={{color:'var(--green)',fontSize:10}}>{learned}/{formulas.length} LEARNED</span>
        </div>
        <div className="pb" style={{height:5,marginBottom:14}}>
          <div className="pf" style={{width:`${Math.round(learned/Math.max(1,formulas.length)*100)}%`,background:'var(--gold)'}}/>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
          {subs.map(s=>(
            <button key={s} className={`btn${filter===s?' btn-y':''}`} style={{fontSize:9,padding:'5px 12px'}} onClick={()=>setFilter(s)}>{s}</button>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:18}}>
          {filtered.map(f=>(
            <div key={f.id} style={{background:'var(--bg4)',border:`1px solid ${f.learned?'#ffd70044':'var(--border)'}`,borderRadius:4,padding:14,transition:'border .2s'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10,gap:6}}>
                <div>
                  <span className="tag" style={{background:`${SUBC[f.sub]||'#4a4a4a'}11`,border:`1px solid ${SUBC[f.sub]||'#4a4a4a'}22`,color:SUBC[f.sub]||'var(--text)'}}>{f.sub}</span>
                  <div style={{fontSize:13,color:'var(--text2)',marginTop:4}}>{f.topic}</div>
                </div>
                <button className={`btn ${f.learned?'btn-y':''}`} style={{padding:'4px 10px',fontSize:9,flexShrink:0}} onClick={()=>toggleFormula(f.id)}>
                  {f.learned?'✓ DONE':'MARK'}
                </button>
              </div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:'var(--green)',lineHeight:1.8,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{f.formula}</div>
              {f.note&&<div style={{fontSize:12,color:'var(--text3)',marginTop:8,borderTop:'1px solid var(--border3)',paddingTop:6}}>{f.note}</div>}
              <div style={{marginTop:10,textAlign:'right'}}>
                <button className="btn btn-r" style={{padding:'4px 9px',fontSize:8}} onClick={()=>deleteFormula(f.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card-title" style={{marginBottom:10}}>➕ ADD CUSTOM FORMULA</div>
        <div className="g3" style={{marginBottom:12}}>
          <div><label className="lbl">SUBJECT</label>
            <select className="inp" value={f.sub} onChange={set('sub')}>
              {['Maths','English','GS','AFCAT'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="lbl">TOPIC</label><input className="inp" placeholder="e.g. Trigonometry" value={f.topic} onChange={set('topic')}/></div>
          <div><label className="lbl">MEMORY NOTE</label><input className="inp" placeholder="Shortcut / trick" value={f.note} onChange={set('note')}/></div>
        </div>
        <div style={{marginBottom:14}}>
          <label className="lbl">FORMULA</label>
          <textarea className="ta" style={{fontFamily:"'Share Tech Mono',monospace",minHeight:70}} placeholder="Enter formula here..." value={f.formula} onChange={set('formula')}/>
        </div>
        <button className="btn btn-y" onClick={addFormula}>ADD FORMULA ↵</button>
      </div>
    </div>
  )
}
