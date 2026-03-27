import { useState } from 'react'
import { useStore } from '../store'
import { useAppStore } from '../store/useStore'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { getVocabRevisionStatus } from '../utils/spacedRepetition'
import { formatDate, today } from '../utils/dateUtils'

function createVocabEntry({ word, meaning, example }) {
  return {
    id: Date.now(),
    word: word.trim(),
    meaning: meaning.trim(),
    example: example.trim(),
    learned: false,
    isImportant: false,
    revisionDates: [],
    synonyms: [], // Synonyms can be added later if needed
    tag: 'English'
  }
}

const TAGS = ['English']

export default function Vocab() {
  const { state } = useStore()
  const toast = useToast()
  const confirm = useConfirm()
  const { vocab } = state
  const revisionCycles = useAppStore(s => s.revisionCycles)
  const setVocab = useAppStore(s => s.setVocab)

  const [form, setForm] = useState({ word:'', meaning:'', example:'', tag:'English' })
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showImportant, setShowImportant] = useState(false)
  const [flippedId, setFlippedId] = useState(null)

  const f = form
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const filtered = vocab.filter(v => {
    if (filter !== 'All' && v.tag !== filter) return false
    if (showImportant && !v.isImportant) return false
    if (search && !v.word.toLowerCase().includes(search.toLowerCase()) &&
      !v.meaning.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function addVocab() {
    if(!f.word.trim()||!f.meaning.trim()){ toast('Enter word and meaning','warn'); return }
    const entry = createVocabEntry({ word: f.word, meaning: f.meaning, example: f.example })
    entry.tag = f.tag || 'English'
    setVocab([entry, ...vocab])
    toast(`Added: ${f.word}${entry.synonyms.length ? ` (${entry.synonyms.length} synonyms)` : ''}`,'ok')
    setForm({ word:'', meaning:'', example:'', tag:'English' })
  }

  function deleteVocab(id) {
    confirm('DELETE WORD','Remove this vocab entry?',()=>{
      setVocab(vocab.filter(v=>v.id!==id))
      toast('Word removed','info')
    })
  }

  function toggleImportant(id) {
    setVocab(vocab.map(v=>v.id===id?{...v, isImportant:!v.isImportant}:v))
  }

  function toggleLearned(id) {
    setVocab(vocab.map(v=>v.id===id?{...v, learned:!v.learned}:v))
  }

  function markRevisionDone(id) {
    const td = today()
    setVocab(vocab.map(v => {
      if (v.id !== id) return v
      return { ...v, revisionDates: [...(v.revisionDates || []), td] }
    }))
    toast('Revision marked ✓', 'ok')
  }

  const stats = [
    ['TOTAL WORDS', vocab.length, 'var(--cyan)'],
    ['LEARNED', vocab.filter(v=>v.learned).length, 'var(--green)'],
    ['IMPORTANT', vocab.filter(v=>v.isImportant).length, 'var(--gold)'],
  ]

  return (
    <div className="page-inner fade-in">
      <div className="g3 keep" style={{marginBottom:16, gap:12}}>
        {stats.map(([l,v,c])=>(
          <div key={l} className="card" style={{textAlign:'center',padding:'16px 10px',marginBottom:0,borderColor:`${c}33`, borderRadius:16, flex:'1 1 80px', minWidth:80}}>
            <div style={{fontSize:24, fontWeight:800, color:c}}>{v}</div>
            <div style={{fontSize:9, fontWeight:700, color:'var(--text4)', marginTop:4, textTransform:'uppercase', letterSpacing:0.5}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={{marginBottom:16}}>
        <input className="inp" placeholder="🔍 Search words or meanings..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{marginBottom:12, borderRadius:12, padding:'12px 16px'}} />
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {['All',...TAGS].map(t=>(
              <button key={t} className={`btn${filter===t?' btn-g':''}`} 
                style={{fontSize:11,padding:'6px 16px', borderRadius:10, background:filter===t?'var(--indigo)':'var(--bg3)', color:filter===t?'white':'var(--text3)'}} 
                onClick={()=>setFilter(t)}>{t}</button>
            ))}
            <button className={`btn${showImportant?' btn-y':''}`} 
              style={{fontSize:11,padding:'6px 16px', borderRadius:10, background:showImportant?'var(--gold)':'var(--bg3)', color:showImportant?'black':'var(--text3)'}} 
              onClick={()=>setShowImportant(!showImportant)}>⭐ Important</button>
          </div>
        </div>
      </div>

      {/* Add Word Form */}
      <div className="card" style={{borderRadius:20, padding:24, marginBottom:24}}>
        <div className="card-title" style={{fontSize:18, marginBottom:20}}>➕ Add New Word</div>
        <div className="g3" style={{marginBottom:16}}>
          <div><label className="lbl" style={{fontSize:10, fontWeight:700, color:'var(--text4)', marginBottom:6}}>WORD / PHRASE</label><input className="inp" style={{borderRadius:10}} placeholder="e.g. Ephemeral" value={f.word} onChange={set('word')}/></div>
          <div><label className="lbl" style={{fontSize:10, fontWeight:700, color:'var(--text4)', marginBottom:6}}>TAG</label>
            <select className="inp" style={{borderRadius:10}} value={f.tag} onChange={set('tag')}>
              {TAGS.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="lbl" style={{fontSize:10, fontWeight:700, color:'var(--text4)', marginBottom:6}}>EXAMPLE (optional)</label><input className="inp" style={{borderRadius:10}} placeholder="Use in a sentence..." value={f.example} onChange={set('example')}/></div>
        </div>
        <div style={{marginBottom:20}}><label className="lbl" style={{fontSize:10, fontWeight:700, color:'var(--text4)', marginBottom:6}}>MEANING</label><input className="inp" style={{borderRadius:10}} placeholder="Short, memorable definition..." value={f.meaning} onChange={set('meaning')}/></div>
        <button className="btn btn-g" style={{padding:'12px 24px', borderRadius:12, fontWeight:700}} onClick={addVocab}>SAVE WORD ↵</button>
      </div>

      {/* Word Bank */}
      <div className="card" style={{borderRadius:20, padding:24}}>
        <div className="card-title" style={{fontSize:18, marginBottom:20}}>📖 Word Bank ({filtered.length}{filter!=='All'||showImportant||search?' filtered':''})</div>
        {filtered.length===0 ? (
          <div style={{textAlign:'center', padding:'48px 20px'}}>
            <div style={{fontSize:40, marginBottom:12}}>📖</div>
            <div style={{fontSize:15, fontWeight:700, color:'var(--text3)', marginBottom:8}}>No words found</div>
            <div style={{fontSize:13, color:'var(--text4)'}}>Add your first word using the form above.</div>
          </div>
        ) : filtered.map(v=>{
          const revStatus = getVocabRevisionStatus(v, revisionCycles)
          const isFlipped = flippedId === v.id
          return (
            <div key={v.id} style={{padding:'16px 0',borderBottom:'1px solid var(--border2)'}}>
              <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
                {/* Flip card area */}
                <div
                  className={`vocab-flip-card ${isFlipped ? 'flipped' : ''}`}
                  style={{flex:1, minHeight:120}}
                  onClick={() => setFlippedId(isFlipped ? null : v.id)}
                  title="Click to flip"
                >
                  <div className="vocab-flip-inner">
                    {/* Front: word + tags */}
                    <div className="vocab-flip-front" style={{background:'var(--bg3)', border:'1px solid var(--border)'}}>
                      <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap',marginBottom:8}}>
                        <span style={{fontSize:20,fontWeight:800,color:'var(--text)'}}>{v.word}</span>
                        <span className="tag" style={{background:'rgba(14,165,233,0.1)',border:'1px solid rgba(14,165,233,0.2)',color:'var(--cyan)', borderRadius:6, fontSize:10, fontWeight:700}}>{v.tag}</span>
                        {v.learned&&<span className="tag" style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)',color:'var(--green)', borderRadius:6, fontSize:10, fontWeight:700}}>LEARNED ✓</span>}
                        {revStatus?.isDue&&(
                          <span className="tag" style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',color:'var(--gold)', borderRadius:6, fontSize:10, fontWeight:700, animation:'pulse 2s infinite'}}>
                            {revStatus.currentCycle} DUE
                          </span>
                        )}
                      </div>
                      {v.example&&<div style={{fontSize:13,color:'var(--text4)',fontStyle:'italic', borderLeft:'2px solid var(--border)', paddingLeft:12}}>"{v.example}"</div>}
                      <div style={{fontSize:10, color:'var(--text5)', marginTop:8}}>Tap to reveal meaning →</div>
                    </div>
                    {/* Back: meaning + synonyms */}
                    <div className="vocab-flip-back">
                      <div style={{fontSize:15,color:'var(--text2)',marginBottom:10, lineHeight:1.5, fontWeight:600}}>{v.meaning}</div>
                      <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                        {v.synonyms?.length > 0 && (
                          <div style={{display:'flex', alignItems:'center', gap:6}}>
                            <span style={{fontSize:10,fontWeight:800,color:'var(--green)',textTransform:'uppercase'}}>SYN:</span>
                            <span style={{fontSize:12,color:'var(--text3)'}}>{v.synonyms.join(', ')}</span>
                          </div>
                        )}
                        {v.antonyms?.length > 0 && (
                          <div style={{display:'flex', alignItems:'center', gap:6}}>
                            <span style={{fontSize:10,fontWeight:800,color:'var(--red)',textTransform:'uppercase'}}>ANT:</span>
                            <span style={{fontSize:12,color:'var(--text3)'}}>{v.antonyms.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      {v.revisionDates?.length > 0 && (
                        <div style={{fontSize:10,fontWeight:600,color:'var(--text5)', textTransform:'uppercase', marginTop:8}}>
                          Revisions: {v.revisionDates.length} · Last: {formatDate(v.revisionDates[v.revisionDates.length-1])}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{display:'flex',flexDirection:'column',gap:8,flexShrink:0}}>
                  <button className="btn btn-y" style={{padding:'8px', borderRadius:10, minWidth:36, height:36}} onClick={e=>{e.stopPropagation();toggleImportant(v.id)}} title="Toggle Important">
                    {v.isImportant?'★':'☆'}
                  </button>
                  <button className={`btn ${v.learned?'btn-r':'btn-g'}`} style={{padding:'0 12px',fontSize:10,fontWeight:700, borderRadius:10, height:36}} onClick={e=>{e.stopPropagation();toggleLearned(v.id)}}>
                    {v.learned?'UNLEARN':'LEARNED'}
                  </button>
                  {revStatus?.isDue && (
                    <button className="btn btn-c" style={{padding:'0 12px',fontSize:10,fontWeight:700, borderRadius:10, height:36}} onClick={e=>{e.stopPropagation();markRevisionDone(v.id)}}>
                      {revStatus.currentCycle} ✓
                    </button>
                  )}
                  <button className="btn btn-r" style={{padding:'8px', borderRadius:10, minWidth:36, height:36}} onClick={e=>{e.stopPropagation();deleteVocab(v.id)}}>✕</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
