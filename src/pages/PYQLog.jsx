import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { SUBC } from '../data'
import { td } from '../utils'

const emptyForm = () => ({ date:'', subject:'Maths', topic:'', qty:'', correct:'', wrong:'', notes:'' })
const SUBJECTS = ['Maths','English','GS','AFCAT Reasoning']

export default function PYQLog() {
  const { state, act } = useStore()
  const toast = useToast()
  const confirm = useConfirm()
  const { pyqlog } = state
  const [form, setForm] = useState(emptyForm())
  const f = form
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const byTopic = useMemo(()=>{
    const map = {}
    pyqlog.forEach(p=>{
      const k=`${p.subject}||${p.topic}`
      if(!map[k]) map[k]={subject:p.subject,topic:p.topic,sessions:[],totalQty:0,totalCorrect:0,totalWrong:0}
      map[k].sessions.push(p); map[k].totalQty+=+p.qty||0
      map[k].totalCorrect+=+p.correct||0; map[k].totalWrong+=+p.wrong||0
    })
    return Object.values(map).sort((a,b)=>a.subject.localeCompare(b.subject))
  },[pyqlog])

  function addPYQ() {
    if(!f.topic.trim()){ toast('Enter a topic','warn'); return }
    act({ type:'SET_PYQLOG', pyqlog:[{
      id:Date.now(), date:f.date||td(), subject:f.subject, topic:f.topic,
      qty:+f.qty||0, correct:+f.correct||0, wrong:+f.wrong||0, notes:f.notes||''
    },...pyqlog]})
    toast(`PYQ saved — ${f.qty||0}Q`,'ok')
    setForm(emptyForm())
  }

  function deletePYQ(id) {
    confirm('DELETE SESSION','Remove this PYQ session?',()=>{
      act({ type:'SET_PYQLOG', pyqlog:pyqlog.filter(p=>p.id!==id) })
      toast('Session deleted','info')
    })
  }

  return (
    <div className="page-inner fade-in">
      <div className="card">
        <div className="card-title">📝 LOG PYQ SESSION</div>
        <div className="g3" style={{marginBottom:12}}>
          <div><label className="lbl">DATE</label><input type="date" className="inp" value={f.date||td()} onChange={set('date')}/></div>
          <div><label className="lbl">SUBJECT</label>
            <select className="inp" value={f.subject} onChange={set('subject')}>
              {SUBJECTS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="lbl">TOPIC</label><input className="inp" placeholder="e.g. Number System" value={f.topic} onChange={set('topic')}/></div>
        </div>
        <div className="g3" style={{marginBottom:12}}>
          <div><label className="lbl">QUESTIONS</label><input type="number" min={0} className="inp" placeholder="0" value={f.qty} onChange={set('qty')}/></div>
          <div><label className="lbl">CORRECT ✓</label><input type="number" min={0} className="inp" style={{borderColor:'#39ff1444'}} placeholder="0" value={f.correct} onChange={set('correct')}/></div>
          <div><label className="lbl">WRONG ✗</label><input type="number" min={0} className="inp" style={{borderColor:'#ff333344'}} placeholder="0" value={f.wrong} onChange={set('wrong')}/></div>
        </div>
        <div style={{marginBottom:14}}><label className="lbl">NOTES / PATTERNS</label>
          <input className="inp" placeholder="e.g. Remainder theorem trips me up" value={f.notes} onChange={set('notes')}/>
        </div>
        <button className="btn btn-g" onClick={addPYQ}>💾 SAVE SESSION</button>
      </div>

      <div className="card">
        <div className="card-title">📊 ACCURACY SUMMARY ({byTopic.length} topics)</div>
        {byTopic.length===0 ? <div className="empty">// NO PYQ SESSIONS YET</div> : byTopic.map(t=>{
          const acc = t.totalQty>0 ? Math.round(t.totalCorrect/t.totalQty*100) : 0
          return (
            <div key={`${t.subject}${t.topic}`} style={{display:'flex',gap:8,alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border3)',flexWrap:'wrap'}}>
              <span className="tag" style={{background:`${SUBC[t.subject]||'#4a4a4a'}11`,border:`1px solid ${SUBC[t.subject]||'#4a4a4a'}33`,color:SUBC[t.subject]||'var(--text)'}}>{t.subject}</span>
              <span style={{flex:1,fontSize:13,color:'var(--text)',minWidth:80}}>{t.topic}</span>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:'var(--text4)'}}>{t.sessions.length} sess · {t.totalQty} Qs</span>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:acc>=70?'var(--green)':acc>=50?'var(--gold)':'var(--red)'}}>{acc}%</span>
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="card-title">📋 RECENT SESSIONS ({pyqlog.length} total)</div>
        {pyqlog.length===0 ? <div className="empty">// NO SESSIONS LOGGED</div> : pyqlog.slice(0,30).map(p=>(
          <div key={p.id} style={{padding:'9px 0',borderBottom:'1px solid var(--border3)',display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--gold)'}}>{p.date}</span>
            <span className="tag" style={{background:`${SUBC[p.subject]||'#4a4a4a'}11`,border:`1px solid ${SUBC[p.subject]||'#4a4a4a'}22`,color:SUBC[p.subject]||'var(--text)'}}>{p.subject}</span>
            <span style={{fontSize:13,flex:1,minWidth:80,color:'var(--text)'}}>{p.topic}</span>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:'var(--text3)'}}>{p.qty||0}Q ✓{p.correct||0} ✗{p.wrong||0}</span>
            <button className="btn btn-r" style={{padding:'5px 10px',fontSize:9}} onClick={()=>deletePYQ(p.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
