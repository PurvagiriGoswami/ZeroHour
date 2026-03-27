import { useState } from 'react'
import { useAppStore } from '../store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { LineChart } from '../Charts'
import { today as getToday } from '../utils/dateUtils'
import { EmptyState } from '../components/EmptyState'

const emptyForm = () => ({ date:'', exam:'CDS I', maths:'', eng:'', gs:'', silly:'', concept:'', weak:'', take:'', time:'' })

export default function Mocks() {
  const { mocks, settings } = useAppStore(
    useShallow(s => ({
      mocks: s.mocks,
      settings: s.settings
    }))
  )
  const setMocks = useAppStore(s => s.setMocks)
  const [form, setForm] = useState(emptyForm())
  const [showForm, setShowForm] = useState(false)
  const f = form
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const total = (+f.maths||0)+(+f.eng||0)+(+f.gs||0)
  const totalColor = total>=settings.targetIMA?'var(--green)':total>=120?'var(--gold)':'var(--red)'

  const avg = mocks.length ? Math.round(mocks.reduce((a,m)=>a+(m.total||0),0)/mocks.length) : null
  const best = mocks.length ? Math.max(...mocks.map(m=>m.total||0)) : null
  const scores = [...mocks].reverse().slice(-10).map(m=>m.total||0)

  const toast = useToast()
  const confirm = useConfirm()

  function addMock() {
    const m=+f.maths||0, e=+f.eng||0, g=+f.gs||0
    if(!m&&!e&&!g){ toast('Enter at least one score','warn'); return }
    setMocks([{
      id:Date.now(), date:f.date||getToday(), exam:f.exam||'CDS I',
      maths:m, eng:e, gs:g, total:m+e+g,
      silly:f.silly||0, concept:f.concept||0, weak:f.weak||'', take:f.take||'', time:f.time||''
    },...mocks])
    toast(`Mock saved: ${m+e+g}/300`,'ok')
    setShowForm(false); setForm(emptyForm())
  }

  function deleteMock(id) {
    confirm('DELETE MOCK','Remove this mock entry permanently?',()=>{
      setMocks(mocks.filter(m=>m.id!==id))
      toast('Mock deleted','info')
    })
  }

  return (
    <div className="page-inner fade-in">
      {/* Stats row */}
      <div className="g3 keep" style={{marginBottom:24, gap:12}}>
        {[['MOCKS',mocks.length,'var(--cyan)'],
          ['AVG SCORE',avg||'—',avg>=settings.targetIMA?'var(--green)':avg?'var(--gold)':'var(--text4)'],
          ['BEST',best||'—','var(--green)']
        ].map(([l,v,c])=>(
          <div key={l} className="card" style={{textAlign:'center',padding:'16px 10px',marginBottom:0, borderRadius:16, borderColor:`${c}33`}}>
            <div style={{fontSize:28, fontWeight:900, color:c}}>{v}</div>
            <div style={{fontSize:10, fontWeight:800, color:'var(--text4)', marginTop:4, textTransform:'uppercase', letterSpacing:1}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Score trend */}
      {mocks.length >= 2 && (
        <div className="card" style={{padding:'20px 24px',marginBottom:24, borderRadius:20}}>
          <div className="card-title" style={{fontSize:16,marginBottom:16}}>📈 SCORE TREND</div>
          <LineChart data={scores} color="var(--indigo)" target={settings.targetIMA}/>
        </div>
      )}

      {/* Add Mock */}
      <div className="card" style={{borderRadius:20, padding:24, marginBottom:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12, marginBottom:showForm?20:0}}>
          <div className="card-title" style={{marginBottom:0, fontSize:18}}>📝 ADD MOCK</div>
          <button className={`btn ${showForm?'btn-r':'btn-g'}`} style={{borderRadius:12, fontWeight:800}} onClick={()=>setShowForm(p=>!p)}>
            {showForm?'✕ CANCEL':'+ ADD MOCK'}
          </button>
        </div>
        {showForm && (
          <div style={{animation:'fadeIn .2s ease'}}>
            <div className="g3" style={{marginBottom:16}}>
              <div><label className="lbl">DATE</label><input type="date" className="inp" style={{borderRadius:10}} value={f.date||getToday()} onChange={set('date')}/></div>
              <div><label className="lbl">EXAM</label>
                <select className="inp" style={{borderRadius:10}} value={f.exam} onChange={set('exam')}>
                  {['CDS I','CDS II','AFCAT','CDS 2027'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="lbl">TIME TAKEN</label><input className="inp" style={{borderRadius:10}} placeholder="2h 30m" value={f.time} onChange={set('time')}/></div>
            </div>
            <div className="g3" style={{marginBottom:16}}>
              <div><label className="lbl">MATHS SCORE</label><input type="number" min={0} max={100} className="inp" style={{borderRadius:10, borderColor:'rgba(210, 153, 34, 0.3)'}} placeholder="0" value={f.maths} onChange={set('maths')}/></div>
              <div><label className="lbl">ENGLISH SCORE</label><input type="number" min={0} max={100} className="inp" style={{borderRadius:10, borderColor:'rgba(57, 197, 207, 0.3)'}} placeholder="0" value={f.eng} onChange={set('eng')}/></div>
              <div><label className="lbl">GS SCORE</label><input type="number" min={0} max={100} className="inp" style={{borderRadius:10, borderColor:'rgba(63, 185, 80, 0.3)'}} placeholder="0" value={f.gs} onChange={set('gs')}/></div>
            </div>
            <div style={{fontSize:32, fontWeight:900, color:totalColor,textAlign:'center',padding:16,background:'var(--bg3)',border:`1px solid ${totalColor}33`,borderRadius:16,marginBottom:20,transition:'color .2s'}}>
              {total}/300 <span style={{fontSize:16, fontWeight:700, color:'var(--text3)'}}>({Math.round(total/3)}% acc.)</span>
            </div>
            <div className="g3" style={{marginBottom:16}}>
              <div><label className="lbl">SILLY ERRORS</label><input type="number" min={0} className="inp" style={{borderRadius:10}} placeholder="0" value={f.silly} onChange={set('silly')}/></div>
              <div><label className="lbl">CONCEPT GAPS</label><input type="number" min={0} className="inp" style={{borderRadius:10}} placeholder="0" value={f.concept} onChange={set('concept')}/></div>
              <div><label className="lbl">WEAK AREA</label><input className="inp" style={{borderRadius:10}} placeholder="e.g. Geometry" value={f.weak} onChange={set('weak')}/></div>
            </div>
            <div style={{marginBottom:20}}><label className="lbl">KEY TAKEAWAY</label>
              <textarea className="ta" style={{borderRadius:10, minHeight:80}} value={f.take} onChange={set('take')} placeholder="Main lesson from this mock..."/>
            </div>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <button className="btn btn-g" style={{padding:'12px 24px', borderRadius:12, fontWeight:800}} onClick={addMock}>💾 SAVE MOCK</button>
              <button className="btn" style={{padding:'12px 24px', borderRadius:12, fontWeight:800}} onClick={()=>{setShowForm(false);setForm(emptyForm())}}>CANCEL</button>
            </div>
          </div>
        )}
      </div>

      {/* Mock list */}
      <div className="card" style={{borderRadius:20, padding:24}}>
        <div className="card-title" style={{fontSize:18, marginBottom:20}}>📋 ALL MOCKS ({mocks.length})</div>
        {mocks.length===0 ? (
          <EmptyState 
            icon="📝" 
            title="No mocks logged yet. Start tracking your performance today." 
            cta="+ ADD MOCK" 
            onAction={() => setShowForm(true)} 
          />
        ) : mocks.map(m=>{
          const tot = m.total||(m.maths||0)+(m.eng||0)+(m.gs||0)
          const col = tot>=settings.targetIMA?'var(--green)':tot>=120?'var(--gold)':'var(--red)'
          return (
            <div key={m.id} style={{padding:'20px 0',borderBottom:'1px solid var(--border2)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
                <div>
                  <span style={{fontSize:12, fontWeight:800, color:'var(--indigo)', letterSpacing:1}}>{m.date}</span>
                  <span style={{fontSize:11, fontWeight:700, color:'var(--text4)', marginLeft:12, textTransform:'uppercase'}}>{m.exam||'CDS I'}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:16}}>
                  <span style={{fontSize:32, fontWeight:900, color:col, lineHeight:1}}>{tot}</span>
                  <span style={{fontSize:14, fontWeight:700, color:'var(--text3)'}}>{Math.round(tot/3)}%</span>
                  <button className="btn btn-r" style={{padding:'8px', borderRadius:10, minWidth:36, height:36}} onClick={()=>deleteMock(m.id)}>✕</button>
                </div>
              </div>
              <div style={{display:'flex',gap:16,marginTop:12,flexWrap:'wrap'}}>
                {m.maths!==undefined&&<span style={{fontSize:14, fontWeight:600}}><span style={{color:'var(--gold)', fontWeight:800, fontSize:11, marginRight:4}}>M</span><span style={{color:'var(--text2)'}}>{m.maths||0}</span></span>}
                {m.eng!==undefined&&<span style={{fontSize:14, fontWeight:600}}><span style={{color:'var(--cyan)', fontWeight:800, fontSize:11, marginRight:4}}>E</span><span style={{color:'var(--text2)'}}>{m.eng||0}</span></span>}
                {m.gs!==undefined&&<span style={{fontSize:14, fontWeight:600}}><span style={{color:'var(--green)', fontWeight:800, fontSize:11, marginRight:4}}>GS</span><span style={{color:'var(--text2)'}}>{m.gs||0}</span></span>}
                {m.silly?<span className="tag" style={{background:'rgba(248, 81, 73, 0.1)',border:'1px solid rgba(248, 81, 73, 0.2)',color:'var(--red)', borderRadius:6}}>Silly: {m.silly}</span>:null}
                {m.weak?<span style={{fontSize:13,color:'var(--text3)', fontWeight:500}}>Weak: {m.weak}</span>:null}
              </div>
              {m.take&&<div style={{fontSize:13,color:'var(--text2)',marginTop:12,padding:'12px 16px',background:'var(--bg3)',borderLeft:'3px solid var(--indigo)',borderRadius:'0 12px 12px 0', lineHeight:1.5}}>{m.take}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
