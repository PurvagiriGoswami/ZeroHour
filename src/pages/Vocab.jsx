import { useState } from 'react'
import { useStore } from '../store'
import { useAppStore } from '../store/useStore'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { createVocabEntry } from '../utils/vocabEngine'
import { getVocabRevisionStatus } from '../utils/spacedRepetition'
import { formatDate, today } from '../utils/dateUtils'

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
    ['TOTAL', vocab.length, 'var(--cyan)'],
    ['LEARNED', vocab.filter(v=>v.learned).length, 'var(--green)'],
    ['IMPORTANT', vocab.filter(v=>v.isImportant).length, 'var(--gold)'],
  ]

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

      {/* Search & Filters */}
      <div style={{marginBottom:12}}>
        <input className="inp" placeholder="🔍 Search words..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{marginBottom:8}} />
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {['All',...TAGS].map(t=>(
              <button key={t} className={`btn${filter===t?' btn-g':''}`} style={{fontSize:9,padding:'5px 12px'}} onClick={()=>setFilter(t)}>{t}</button>
            ))}
            <button className={`btn${showImportant?' btn-y':''}`} style={{fontSize:9,padding:'5px 12px'}} onClick={()=>setShowImportant(!showImportant)}>⭐ Important</button>
          </div>
        </div>
      </div>

      {/* Add Word Form */}
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
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'var(--text4)',marginTop:8}}>
          ℹ Synonyms & antonyms auto-generated from built-in dictionary
        </div>
      </div>

      {/* Word Bank */}
      <div className="card">
        <div className="card-title">📖 WORD BANK ({filtered.length}{filter!=='All'||showImportant||search?' filtered':''})</div>
        {filtered.length===0 ? <div className="empty">// NO WORDS {search?'MATCHING':'YET'}</div> : filtered.map(v=>{
          const revStatus = getVocabRevisionStatus(v, revisionCycles)
          return (
            <div key={v.id} style={{padding:'14px 0',borderBottom:'1px solid var(--border3)'}}>
              <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:7,alignItems:'center',flexWrap:'wrap',marginBottom:5}}>
                    <span style={{fontSize:18,fontWeight:700,color:'var(--cyan)'}}>{v.word}</span>
                    <span className="tag" style={{background:'#00d4ff11',border:'1px solid #00d4ff33',color:'var(--cyan)'}}>{v.tag}</span>
                    {v.isImportant&&<span style={{cursor:'pointer'}} onClick={()=>toggleImportant(v.id)}>⭐</span>}
                    {v.learned&&<span className="tag" style={{background:'#0d3320',border:'1px solid #39ff1433',color:'var(--green)'}}>LEARNED ✓</span>}
                    {revStatus?.isDue&&(
                      <span className="tag" style={{background:'#2a1f00',border:'1px solid #ffd70033',color:'var(--gold)',animation:'pulse 2s infinite'}}>
                        {revStatus.currentCycle} DUE
                      </span>
                    )}
                  </div>
                  <div style={{fontSize:14,color:'var(--text)',marginBottom:4}}>{v.meaning}</div>
                  {v.example&&<div style={{fontSize:12,color:'var(--text3)',fontStyle:'italic',marginBottom:6}}>"{v.example}"</div>}

                  {/* Synonyms & Antonyms */}
                  <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:6}}>
                    {v.synonyms?.length > 0 && (
                      <div>
                        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'var(--green)',letterSpacing:1}}>SYN: </span>
                        <span style={{fontSize:12,color:'var(--text3)'}}>{v.synonyms.join(', ')}</span>
                      </div>
                    )}
                    {v.antonyms?.length > 0 && (
                      <div>
                        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'var(--red)',letterSpacing:1}}>ANT: </span>
                        <span style={{fontSize:12,color:'var(--text3)'}}>{v.antonyms.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Revision info */}
                  {v.revisionDates?.length > 0 && (
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'var(--text4)',marginTop:6}}>
                      REVISIONS: {v.revisionDates.length} · LAST: {formatDate(v.revisionDates[v.revisionDates.length-1])}
                    </div>
                  )}
                  {v.createdAt && (
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'var(--text4)',marginTop:2}}>
                      ADDED: {formatDate(v.createdAt)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{display:'flex',flexDirection:'column',gap:5,flexShrink:0}}>
                  <button className="btn btn-y" style={{padding:'5px 8px',fontSize:8,minHeight:28}} onClick={()=>toggleImportant(v.id)} title="Toggle Important">
                    {v.isImportant?'★':'☆'}
                  </button>
                  <button className={`btn ${v.learned?'btn-r':'btn-g'}`} style={{padding:'5px 8px',fontSize:8,minHeight:28}} onClick={()=>toggleLearned(v.id)}>
                    {v.learned?'UNLEARN':'LEARNED'}
                  </button>
                  {revStatus?.isDue && (
                    <button className="btn btn-c" style={{padding:'5px 8px',fontSize:8,minHeight:28}} onClick={()=>markRevisionDone(v.id)}>
                      {revStatus.currentCycle} ✓
                    </button>
                  )}
                  <button className="btn btn-r" style={{padding:'5px 8px',fontSize:8,minHeight:28}} onClick={()=>deleteVocab(v.id)}>✕</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
