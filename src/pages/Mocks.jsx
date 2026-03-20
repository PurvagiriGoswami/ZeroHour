import { useState } from 'react'
import { useStore } from '../store'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { LineChart } from '../Charts'
import { td } from '../utils'

const emptyForm = () => ({ date:'', exam:'CDS I', maths:'', eng:'', gs:'', silly:'', concept:'', weak:'', take:'', time:'' })

export default function Mocks() {
  const { state, act } = useStore()
  const toast = useToast()
  const confirm = useConfirm()
  const { mocks, settings } = state
  const [form, setForm] = useState(emptyForm())
  const [showForm, setShowForm] = useState(false)
  const f = form
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const total = (+f.maths||0)+(+f.eng||0)+(+f.gs||0)
  const totalColor = total>=settings.targetIMA?'var(--green)':total>=120?'var(--gold)':'var(--red)'

  const avg = mocks.length ? Math.round(mocks.reduce((a,m)=>a+(m.total||0),0)/mocks.length) : null
  const best = mocks.length ? Math.max(...mocks.map(m=>m.total||0)) : null
  const scores = [...mocks].reverse().slice(-10).map(m=>m.total||0)

  function addMock() {
    const m=+f.maths||0, e=+f.eng||0, g=+f.gs||0
    if(!m&&!e&&!g){ toast('Enter at least one score','warn'); return }
    act({ type:'SET_MOCKS', mocks:[{
      id:Date.now(), date:f.date||td(), exam:f.exam||'CDS I',
      maths:m, eng:e, gs:g, total:m+e+g,
      silly:f.silly||0, concept:f.concept||0, weak:f.weak||'', take:f.take||'', time:f.time||''
    },...mocks]})
    toast(`Mock saved: ${m+e+g}/300`,'ok')
    setShowForm(false); setForm(emptyForm())
  }

  function deleteMock(id) {
    confirm('DELETE MOCK','Remove this mock entry permanently?',()=>{
      act({ type:'SET_MOCKS', mocks:mocks.filter(m=>m.id!==id) })
      toast('Mock deleted','info')
    })
  }

  return (
    <div className="page-inner fade-in">
      {/* Stats row */}
      <div className="g3 keep" style={{marginBottom:12}}>
        {[['MOCKS',mocks.length,'var(--green)'],
          ['AVG SCORE',avg||'—',avg>=settings.targetIMA?'var(--green)':avg?'var(--gold)':'var(--text4)'],
          ['BEST',best||'—','var(--green)']
        ].map(([l,v,c])=>(
          <div key={l} className="card" style={{textAlign:'center',padding:14,marginBottom:0}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:26,color:c}}>{v}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text4)',marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Score trend */}
      {mocks.length >= 2 && (
        <div className="card" style={{padding:'10px 14px',marginBottom:12}}>
          <div className="card-title" style={{fontSize:9,marginBottom:8}}>📈 SCORE TREND</div>
          <LineChart data={scores} color="#39ff14" target={settings.targetIMA}/>
        </div>
      )}

      {/* Add Mock */}
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <div className="card-title" style={{marginBottom:0}}>📝 ADD MOCK</div>
          <button className={`btn ${showForm?'btn-r':'btn-g'}`} onClick={()=>setShowForm(p=>!p)}>
            {showForm?'✕ CANCEL':'+ ADD MOCK'}
          </button>
        </div>
        {showForm && (
          <div style={{marginTop:14,animation:'fadeIn .2s ease'}}>
            <div className="g3" style={{marginBottom:10}}>
              <div><label className="lbl">DATE</label><input type="date" className="inp" value={f.date||td()} onChange={set('date')}/></div>
              <div><label className="lbl">EXAM</label>
                <select className="inp" value={f.exam} onChange={set('exam')}>
                  {['CDS I','CDS II','AFCAT','CDS 2027'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="lbl">TIME TAKEN</label><input className="inp" placeholder="2h 30m" value={f.time} onChange={set('time')}/></div>
            </div>
            <div className="g3" style={{marginBottom:10}}>
              <div><label className="lbl">MATHS SCORE</label><input type="number" min={0} max={100} className="inp" style={{borderColor:'#ffd70044'}} placeholder="0" value={f.maths} onChange={set('maths')}/></div>
              <div><label className="lbl">ENGLISH SCORE</label><input type="number" min={0} max={100} className="inp" style={{borderColor:'#00d4ff44'}} placeholder="0" value={f.eng} onChange={set('eng')}/></div>
              <div><label className="lbl">GS SCORE</label><input type="number" min={0} max={100} className="inp" style={{borderColor:'#39ff1444'}} placeholder="0" value={f.gs} onChange={set('gs')}/></div>
            </div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:24,color:totalColor,textAlign:'center',padding:12,border:`1px solid ${totalColor}33`,borderRadius:4,marginBottom:12,transition:'color .2s'}}>
              {total}/300 <span style={{fontSize:14,color:'var(--text3)'}}>({Math.round(total/3)}% acc.)</span>
            </div>
            <div className="g3" style={{marginBottom:10}}>
              <div><label className="lbl">SILLY ERRORS</label><input type="number" min={0} className="inp" placeholder="0" value={f.silly} onChange={set('silly')}/></div>
              <div><label className="lbl">CONCEPT GAPS</label><input type="number" min={0} className="inp" placeholder="0" value={f.concept} onChange={set('concept')}/></div>
              <div><label className="lbl">WEAK AREA</label><input className="inp" placeholder="e.g. Geometry" value={f.weak} onChange={set('weak')}/></div>
            </div>
            <div style={{marginBottom:14}}><label className="lbl">KEY TAKEAWAY</label>
              <textarea className="ta" value={f.take} onChange={set('take')} placeholder="Main lesson from this mock..."/>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="btn btn-g" onClick={addMock}>💾 SAVE MOCK</button>
              <button className="btn" onClick={()=>{setShowForm(false);setForm(emptyForm())}}>CANCEL</button>
            </div>
          </div>
        )}
      </div>

      {/* Mock list */}
      <div className="card">
        <div className="card-title">📋 ALL MOCKS ({mocks.length})</div>
        {mocks.length===0 ? <div className="empty">// NO MOCKS LOGGED YET</div> : mocks.map(m=>{
          const tot = m.total||(m.maths||0)+(m.eng||0)+(m.gs||0)
          const col = tot>=settings.targetIMA?'#39ff14':tot>=120?'#ffd700':'#ff3333'
          return (
            <div key={m.id} style={{padding:12,borderBottom:'1px solid var(--border3)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                <div>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:'var(--gold)'}}>{m.date}</span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text4)',marginLeft:8}}>{m.exam||'CDS I'}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:26,color:col}}>{tot}</span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:'var(--text3)'}}>{Math.round(tot/3)}%</span>
                  <button className="btn btn-r" style={{padding:'5px 10px',fontSize:9}} onClick={()=>deleteMock(m.id)}>✕</button>
                </div>
              </div>
              <div style={{display:'flex',gap:12,marginTop:8,flexWrap:'wrap'}}>
                {m.maths!==undefined&&<span style={{fontSize:12}}><span style={{color:'var(--gold)',fontFamily:"'Share Tech Mono',monospace",fontSize:9}}>M </span><span style={{color:'var(--text2)'}}>{m.maths||0}</span></span>}
                {m.eng!==undefined&&<span style={{fontSize:12}}><span style={{color:'var(--cyan)',fontFamily:"'Share Tech Mono',monospace",fontSize:9}}>E </span><span style={{color:'var(--text2)'}}>{m.eng||0}</span></span>}
                {m.gs!==undefined&&<span style={{fontSize:12}}><span style={{color:'var(--green)',fontFamily:"'Share Tech Mono',monospace",fontSize:9}}>GS </span><span style={{color:'var(--text2)'}}>{m.gs||0}</span></span>}
                {m.silly?<span className="tag" style={{background:'var(--rdim)',border:'1px solid #ff333322',color:'#ff8888'}}>Silly: {m.silly}</span>:null}
                {m.weak?<span style={{fontSize:12,color:'var(--text3)'}}>Weak: {m.weak}</span>:null}
              </div>
              {m.take&&<div style={{fontSize:12,color:'var(--text3)',marginTop:6,padding:'6px 10px',background:'var(--bg4)',borderLeft:'2px solid var(--border)',borderRadius:'0 3px 3px 0'}}>{m.take}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
