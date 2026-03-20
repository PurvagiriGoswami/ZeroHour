import { useState } from 'react'
import { useStore } from '../store'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'

const TAGS = ['English','GS','General']
const emptyForm = () => ({ word:'', meaning:'', example:'', tag:'English' })

export default function Vocab() {
  const { state, act } = useStore()
  const toast = useToast()
  const confirm = useConfirm()
  const { vocab } = state
  const [form, setForm] = useState(emptyForm())
  const [filter, setFilter] = useState('All')
  const [quiz, setQuiz] = useState(null)
  const f = form
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const filtered = filter==='All' ? vocab : vocab.filter(v=>v.tag===filter)

  function addVocab() {
    if(!f.word.trim()||!f.meaning.trim()){ toast('Enter word and meaning','warn'); return }
    act({ type:'SET_VOCAB', vocab:[{id:Date.now(),word:f.word.trim(),meaning:f.meaning.trim(),example:f.example||'',tag:f.tag||'English',learned:false},...vocab] })
    toast(`Added: ${f.word}`,'ok')
    setForm(emptyForm())
  }

  function deleteVocab(id) {
    confirm('DELETE WORD','Remove this vocab entry?',()=>{
      act({ type:'SET_VOCAB', vocab:vocab.filter(v=>v.id!==id) })
      toast('Word removed','info')
    })
  }

  function toggleLearned(id) {
    act({ type:'SET_VOCAB', vocab:vocab.map(v=>v.id===id?{...v,learned:!v.learned}:v) })
  }

  function startQuiz() {
    const ws = [...vocab].sort(()=>Math.random()-.5).slice(0,Math.min(20,vocab.length))
    setQuiz({words:ws,idx:0,score:0,wrong:[],reveal:false})
  }

  function quizReveal() { setQuiz(q=>({...q,reveal:true})) }

  function quizAnswer(knew) {
    if(!quiz) return
    const wrong = knew ? quiz.wrong : [...quiz.wrong, quiz.words[quiz.idx].word]
    const score = knew ? quiz.score+1 : quiz.score
    const idx = quiz.idx+1
    if(idx>=quiz.words.length){
      setQuiz(null)
      toast(`Quiz done! ${score}/${quiz.words.length}${wrong.length?' — Review: '+wrong.slice(0,3).join(', '):'  Perfect! 🎯'}`,
        score/quiz.words.length>=0.7?'ok':'warn', 5000)
      return
    }
    setQuiz({...quiz,idx,score,wrong,reveal:false})
  }

  const stats = [
    ['TOTAL',vocab.length,'var(--cyan)'],
    ['LEARNED',vocab.filter(v=>v.learned).length,'var(--green)'],
    ['PENDING',vocab.filter(v=>!v.learned).length,'var(--gold)'],
  ]

  if(quiz){
    const w = quiz.words[quiz.idx]
    return (
      <div className="page-inner fade-in">
        <div className="g3 keep" style={{marginBottom:12}}>
          {stats.map(([l,v,c])=>(
            <div key={l} className="card" style={{textAlign:'center',padding:12,marginBottom:0,borderColor:`${c}22`}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:24,color:c}}>{v}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text4)'}}>{l}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{borderColor:'#00d4ff44',background:'#00101a'}}>
          <div className="card-title" style={{color:'var(--cyan)'}}>
            📖 QUIZ — {quiz.idx+1}/{quiz.words.length}
            <span style={{color:'var(--text4)'}}>Score: {quiz.score}/{quiz.idx}</span>
          </div>
          <div style={{textAlign:'center',padding:'24px 0'}}>
            <div style={{fontSize:28,fontWeight:700,color:'var(--cyan)',marginBottom:12}}>{w.word}</div>
            <div style={{fontSize:12,color:'var(--text4)',marginBottom:14}}>Tag: {w.tag}</div>
            {quiz.reveal ? (
              <div style={{animation:'fadeIn .2s ease'}}>
                <div style={{fontSize:16,color:'var(--text)',marginBottom:10,padding:14,background:'var(--bg4)',border:'1px solid var(--border)',borderRadius:4}}>{w.meaning}</div>
                {w.example&&<div style={{fontSize:13,color:'var(--text3)',fontStyle:'italic',marginBottom:16}}>"{w.example}"</div>}
                <div style={{display:'flex',justifyContent:'center',gap:14,flexWrap:'wrap'}}>
                  <button className="btn btn-g" style={{fontSize:14,padding:'12px 22px'}} onClick={()=>quizAnswer(true)}>✓ KNEW IT</button>
                  <button className="btn btn-r" style={{fontSize:14,padding:'12px 22px'}} onClick={()=>quizAnswer(false)}>✗ MISSED</button>
                </div>
              </div>
            ) : (
              <button className="btn btn-y" style={{fontSize:14,padding:'12px 26px'}} onClick={quizReveal}>REVEAL MEANING</button>
            )}
          </div>
        </div>
        <button className="btn btn-r" style={{width:'100%',padding:12}} onClick={()=>setQuiz(null)}>✕ END QUIZ</button>
      </div>
    )
  }

  return (
    <div className="page-inner fade-in">
      <div className="g3 keep" style={{marginBottom:12}}>
        {stats.map(([l,v,c])=>(
          <div key={l} className="card" style={{textAlign:'center',padding:12,marginBottom:0,borderColor:`${c}22`}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:24,color:c}}>{v}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text4)'}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {['All',...TAGS].map(t=>(
            <button key={t} className={`btn${filter===t?' btn-g':''}`} style={{fontSize:9,padding:'5px 12px'}} onClick={()=>setFilter(t)}>{t}</button>
          ))}
        </div>
        {vocab.length>=4&&<button className="btn btn-y" style={{padding:'8px 16px'}} onClick={startQuiz}>🎯 START QUIZ</button>}
      </div>

      <div className="card">
        <div className="card-title">➕ ADD WORD</div>
        <div className="g3" style={{marginBottom:12}}>
          <div><label className="lbl">WORD / PHRASE</label><input className="inp" placeholder="Ephemeral" value={f.word} onChange={set('word')}/></div>
          <div><label className="lbl">TAG</label>
            <select className="inp" value={f.tag} onChange={set('tag')}>
              {TAGS.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="lbl">EXAMPLE (optional)</label><input className="inp" placeholder="Use in a sentence..." value={f.example} onChange={set('example')}/></div>
        </div>
        <div style={{marginBottom:12}}><label className="lbl">MEANING</label><input className="inp" placeholder="Short, memorable definition..." value={f.meaning} onChange={set('meaning')}/></div>
        <button className="btn btn-g" onClick={addVocab}>ADD WORD ↵</button>
      </div>

      <div className="card">
        <div className="card-title">📖 WORD BANK ({filtered.length}{filter!=='All'?' filtered':''})</div>
        {filtered.length===0 ? <div className="empty">// NO WORDS YET</div> : filtered.map(v=>(
          <div key={v.id} style={{padding:'12px 0',borderBottom:'1px solid var(--border3)',display:'flex',gap:10,alignItems:'flex-start'}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',gap:7,alignItems:'center',flexWrap:'wrap',marginBottom:5}}>
                <span style={{fontSize:16,fontWeight:700,color:'var(--cyan)'}}>{v.word}</span>
                <span className="tag" style={{background:'#00d4ff11',border:'1px solid #00d4ff33',color:'var(--cyan)'}}>{v.tag}</span>
                {v.learned&&<span className="tag" style={{background:'#0d3320',border:'1px solid #39ff1433',color:'var(--green)'}}>LEARNED ✓</span>}
              </div>
              <div style={{fontSize:13,color:'var(--text)'}}>{v.meaning}</div>
              {v.example&&<div style={{fontSize:12,color:'var(--text3)',fontStyle:'italic',marginTop:3}}>"{v.example}"</div>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:5,flexShrink:0}}>
              <button className={`btn ${v.learned?'btn-r':'btn-g'}`} style={{padding:'5px 10px',fontSize:9}} onClick={()=>toggleLearned(v.id)}>
                {v.learned?'UNLEARN':'LEARNED'}
              </button>
              <button className="btn btn-r" style={{padding:'5px 10px',fontSize:9}} onClick={()=>deleteVocab(v.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
