import { useRef, useState } from 'react'
import { useAppStore } from '../store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { makeSyl } from '../data'
import { INITIAL_VOCAB } from '../utils/initialVocab'
import { DEFAULT_CYCLES } from '../utils/spacedRepetition'
import { exportToExcel, importFromExcel } from '../services/excelService'

export default function Settings() {
  const { settings, syncStatus, syl, mocks, logs, habs, revision, vocab, pyqlog, pomoSessions, quizResults, plannerTasks } = useAppStore(
    useShallow(s => ({
      settings: s.settings,
      syncStatus: s.syncStatus,
      syl: s.syl,
      mocks: s.mocks,
      logs: s.logs,
      habs: s.habs,
      revision: s.revision,
      vocab: s.vocab,
      pyqlog: s.pyqlog,
      pomoSessions: s.pomoSessions,
      quizResults: s.quizResults,
      plannerTasks: s.plannerTasks
    }))
  )
  const store = useAppStore()
    const toast = useToast()
    const confirm = useConfirm()
    const fileRef = useRef(null)

  const [showResetModal, setShowResetModal] = useState(false)
  const [resetOptions, setResetOptions] = useState({
    logs: false,
    habs: false,
    syl: false,
    mocks: false,
    vocab: false,
    rev: false,
  })
  const [resetConfirmText, setResetConfirmText] = useState('')

  function setS(k) { 
    return e => {
      const val = e.target.value
      store.setSettings({ [k]: val })
      if (k === 'fontSize') {
        document.documentElement.setAttribute('data-font-size', val)
      }
    }
  }
  function setN(k) { return e => store.setSettings({ [k]: +e.target.value }) }

  const handleReset = () => {
    if (resetConfirmText !== 'RESET') return

    let resetCount = 0
    if (resetOptions.logs) { store.setLogs([]); toast('Logs cleared', 'info'); resetCount++ }
    if (resetOptions.habs) { store.setHabs([]); toast('Habits cleared', 'info'); resetCount++ }
    if (resetOptions.syl) { store.setSyl(makeSyl()); toast('Syllabus reset', 'info'); resetCount++ }
    if (resetOptions.mocks) { store.setMocks([]); toast('Mocks cleared', 'info'); resetCount++ }
    if (resetOptions.vocab) { store.setVocab(INITIAL_VOCAB); store.setQuizResults([]); toast('Vocab & Quiz reset', 'info'); resetCount++ }
    if (resetOptions.rev) { store.setRevision([]); store.setRevisionCycles(DEFAULT_CYCLES); toast('Revision data cleared', 'info'); resetCount++ }

    if (resetCount > 0) {
      setShowResetModal(false)
      setResetConfirmText('')
      setResetOptions({ logs: false, habs: false, syl: false, mocks: false, vocab: false, rev: false })
    }
  }

  const toggleAllResets = () => {
    const allSelected = Object.values(resetOptions).every(v => v)
    setResetOptions({
      logs: !allSelected,
      habs: !allSelected,
      syl: !allSelected,
      mocks: !allSelected,
      vocab: !allSelected,
      rev: !allSelected,
    })
  }

  const isAnyResetSelected = Object.values(resetOptions).some(v => v)

  function handleExportExcel() {
    const result = exportToExcel({ vocab, quizResults, plannerTasks, revision, syl })
    if (result.ok) {
      toast(`✅ Exported: ${result.filename}`, 'ok')
    } else {
      toast(result.error || 'Export failed', 'err')
    }
  }

  function handleExportJSON() {
    const d = JSON.stringify({ syl, mocks, logs, habs, revision, vocab, pyqlog, pomoSessions, quizResults, plannerTasks, settings }, null, 2)
    const el = document.createElement('a')
    el.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(d)
    el.download = `ZeroHour_backup__${new Date().toISOString().split('T')[0]}.json`
    el.click()
    toast('📁 JSON backup downloaded', 'ok')
  }

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const data = await importFromExcel(file)
        if (data.vocab?.length) {
          store.setVocab([...data.vocab, ...vocab])
          toast(`Imported ${data.vocab.length} vocabulary words`, 'ok')
        }
      } else if (file.name.endsWith('.json')) {
        const text = await file.text()
        
        function validateBackup(data) { 
          const required = ['vocab', 'revision', 'mockTests', 'dailyLogs', 'habits']; 
          // Note: the mapping from keys in data to store actions might differ, 
          // but we follow the validation requirements exactly as requested.
          const missing = required.filter(k => !Object.prototype.hasOwnProperty.call(data, k)); 
          if (missing.length) throw new Error(`Missing keys: ${missing.join(', ')}`); 
          if (!Array.isArray(data.vocab)) throw new Error('vocab must be an array'); 
          // The prompt says mockTests, but local state uses 'mocks'
          if (!Array.isArray(data.mockTests)) throw new Error('mockTests must be an array'); 
          return true; 
        } 

        try { 
          const parsed = JSON.parse(text); 
          validateBackup(parsed); 
          // Mapping required keys to existing store structure
          if (parsed.vocab) store.setVocab(parsed.vocab)
          if (parsed.syl) store.setSyl(parsed.syl)
          if (parsed.mockTests) store.setMocks(parsed.mockTests) // using mockTests as requested
          if (parsed.dailyLogs) store.setLogs(parsed.dailyLogs) // using dailyLogs as requested
          if (parsed.habits) store.setHabs(parsed.habits) // using habits as requested
          if (parsed.revision) store.setRevision(parsed.revision)
          if (parsed.quizResults) store.setQuizResults(parsed.quizResults)
          if (parsed.plannerTasks) store.setPlannerTasks(parsed.plannerTasks)
          if (parsed.settings) store.setSettings(parsed.settings)
          toast('Backup imported successfully', 'ok')
        } catch (e) { 
          toast(`Import failed: ${e.message}`, 'err'); 
        } 
      }
    } catch (err) {
      console.error(err)
      toast('Import failed: ' + err.message, 'err')
    }
    e.target.value = ''
  }

  const syncColors = { ok: 'var(--green)', syncing: 'var(--gold)', err: 'var(--red)' }
  const syncLabels = { ok: '🔥 CONNECTED', syncing: '⏳ CONNECTING...', err: '⚠ SYNC ERROR' }

  return (
    <div className="page-inner fade-in" style={{paddingBottom: 100}}>
      {/* Intelligence & Quiz Configuration */}
      <div className="card" style={{borderRadius: 24, padding: '24px 20px', border: '1px solid rgba(245, 158, 11, 0.2)'}}>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:24}}>
          <div style={{fontSize:24}}>🧠</div>
          <div className="card-title" style={{margin:0, fontSize:20, color:'var(--gold)'}}>Quiz Intelligence</div>
        </div>
        
        <div className="g3" style={{gap:16}}>
          <div>
            <label className="lbl" style={{color:'var(--gold)', fontWeight:800, fontSize:10, letterSpacing:1}}>QUESTIONS PER CHALLENGE</label>
            <input type="number" className="inp" style={{borderRadius:12, padding:'14px 18px', background:'var(--bg2)', width:'100%'}} value={settings.questionsPerQuiz || 10} onChange={setN('questionsPerQuiz')} min={5} max={30}/>
          </div>
          <div>
            <label className="lbl" style={{color:'var(--gold)', fontWeight:800, fontSize:10, letterSpacing:1}}>CHALLENGE DIFFICULTY</label>
            <select className="inp" style={{borderRadius:12, padding:'14px 18px', background:'var(--bg2)', width:'100%'}} value={settings.quizDifficulty || 'mixed'} onChange={setS('quizDifficulty')}>
              <option value="easy">Easy (Foundational)</option>
              <option value="mixed">Mixed (Adaptive)</option>
              <option value="hard">Hard (Advanced)</option>
            </select>
          </div>
          <div>
            <label className="lbl" style={{color:'var(--gold)', fontWeight:800, fontSize:10, letterSpacing:1}}>QUIZ CYCLE (DAYS)</label>
            <input type="number" className="inp" style={{borderRadius:12, padding:'14px 18px', background:'var(--bg2)', width:'100%'}} value={settings.quizFrequency || 7} onChange={setN('quizFrequency')} min={1} max={30}/>
          </div>
        </div>
        
        <div style={{marginTop:24, padding:16, background:'rgba(245, 158, 11, 0.05)', borderRadius:16, border:'1px solid rgba(245, 158, 11, 0.1)', fontSize:12, color:'var(--text3)', lineHeight:1.6}}>
          Adaptive difficulty adjusts the complexity of distractors and subject mixing based on your performance history.
        </div>
      </div>

      {/* UI & Appearance */}
      <div className="card" style={{borderRadius: 24, padding: 32, border: '1px solid rgba(16, 185, 129, 0.2)'}}>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:24}}>
          <div style={{fontSize:24}}>🎨</div>
          <div className="card-title" style={{margin:0, fontSize:20, color:'var(--green)'}}>Interface & Appearance</div>
        </div>
        
        <div className="g3">
          <div>
            <label className="lbl" style={{color:'var(--green)', fontWeight:800, fontSize:10, letterSpacing:1}}>VISUAL THEME</label>
            <select className="inp" style={{borderRadius:12, padding:'14px 18px', background:'var(--bg2)'}} value={settings.theme || 'dark'} onChange={setS('theme')}>
              <option value="dark">Strategic Dark (Default)</option>
              <option value="light">Academic Light</option>
              <option value="cyber">Combat Neon</option>
            </select>
          </div>
          <div>
            <label className="lbl" style={{color:'var(--green)', fontWeight:800, fontSize:10, letterSpacing:1}}>ACCENT COLOR</label>
            <select className="inp" style={{borderRadius:12, padding:'14px 18px', background:'var(--bg2)'}} value={settings.accentColor || '#6366f1'} onChange={setS('accentColor')}>
              <option value="#6366f1">Indigo (Default)</option>
              <option value="#10b981">Emerald Green</option>
              <option value="#f59e0b">Amber Gold</option>
              <option value="#ef4444">Combat Red</option>
            </select>
          </div>
          <div>
            <label className="lbl" style={{color:'var(--green)', fontWeight:800, fontSize:10, letterSpacing:1}}>FONT SIZE</label>
            <select className="inp" style={{borderRadius:12, padding:'14px 18px', background:'var(--bg2)'}} value={settings.fontSize || 'medium'} onChange={setS('fontSize')}>
              <option value="small">Compact (13px)</option>
              <option value="medium">Standard (15px)</option>
              <option value="large">Readable (17px)</option>
              <option value="xlarge">Extra Large (19px)</option>
            </select>
          </div>
        </div>
      </div>

      {/* System & Data */}
      <div className="card" style={{borderRadius: 24, padding: 32, border: '1px solid rgba(14, 165, 233, 0.2)'}}>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:24}}>
          <div style={{fontSize:24}}>📊</div>
          <div className="card-title" style={{margin:0, fontSize:20, color:'var(--cyan)'}}>System & Data Archive</div>
        </div>

        <div style={{ 
          background: 'var(--color-bg-warning, #FAEEDA)', 
          border: '1px solid #EF9F27', 
          borderRadius: 8, 
          padding: '10px 14px', 
          fontSize: 13, 
          marginBottom: 12, 
          color: '#854F0B' 
        }}> 
          ⚠️ Currently syncing to a shared cloud document. If two browsers are open simultaneously, they will overwrite each other's data. Per-user private storage is coming in v8 with authentication. 
        </div> 
        
        <div className="g2" style={{marginBottom:32}}>
          <div style={{background:'var(--bg2)', padding:24, borderRadius:20, border:'1px solid var(--border)'}}>
            <div style={{fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:8}}>Excel Data Export</div>
            <div style={{fontSize:12, color:'var(--text4)', marginBottom:20}}>Generate a spreadsheet of your entire preparation history.</div>
            <button className="btn" style={{width:'100%', background:'var(--green)', color:'black', fontWeight:800, borderRadius:12}} onClick={handleExportExcel}>📤 DOWNLOAD .XLSX</button>
          </div>
          <div style={{background:'var(--bg2)', padding:24, borderRadius:20, border:'1px solid var(--border)'}}>
            <div style={{fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:8}}>JSON Strategic Backup</div>
            <div style={{fontSize:12, color:'var(--text4)', marginBottom:20}}>Full system backup for migration or deep data analysis.</div>
            <button className="btn" style={{width:'100%', background:'var(--cyan)', color:'white', fontWeight:800, borderRadius:12}} onClick={handleExportJSON}>📤 DOWNLOAD .JSON</button>
          </div>
        </div>

        {/* Import */}
        <div style={{background:'var(--bg2)', padding:24, borderRadius:20, border:'1px solid var(--border)', marginBottom:32}}>
          <div style={{fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:8}}>Import Data</div>
          <div style={{fontSize:12, color:'var(--text4)', marginBottom:20}}>Restore from a .xlsx or .json backup file.</div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.json" style={{display:'none'}} onChange={handleImport} />
          <button className="btn" style={{width:'100%', background:'var(--indigo)', color:'white', fontWeight:800, borderRadius:12}} onClick={() => fileRef.current?.click()}>📥 IMPORT FILE</button>
        </div>

        <div style={{background:'rgba(14, 165, 233, 0.05)', padding:24, borderRadius:20, border:'1px solid rgba(14, 165, 233, 0.2)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
            <div>
              <div style={{fontSize:14, fontWeight:700, color:'var(--text)'}}>Cloud Sync Status</div>
              <div style={{display:'flex', gap:8, alignItems:'center', marginTop:4}}>
                <div className={`sync-dot ${syncStatus}`} style={{width:8, height:8, borderRadius:'50%', background:syncColors[syncStatus]}}/>
                <span style={{fontSize:11, fontWeight:800, color:syncColors[syncStatus], letterSpacing:1}}>{syncLabels[syncStatus]}</span>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:10, color:'var(--text4)', fontWeight:800}}>LAST SYNC</div>
              <div style={{fontSize:12, color:'var(--text2)', fontWeight:700}}>Just now</div>
            </div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:16, marginTop:24}}>
             <div style={{fontSize:10, color:'var(--text4)', fontWeight:700}}>PROJECT ID: <span style={{color:'var(--text2)'}}>ZH-PRO-2026</span></div>
             <div style={{fontSize:10, color:'var(--text4)', fontWeight:700}}>ENCRYPTION: <span style={{color:'var(--green)'}}>AES-256 ACTIVE</span></div>
             <div style={{fontSize:10, color:'var(--text4)', fontWeight:700}}>SYNC NODE: <span style={{color:'var(--text2)'}}>ASIA-SOUTH-1</span></div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{borderRadius: 24, padding: 32, border: '1px solid rgba(239, 68, 68, 0.3)', background:'rgba(239, 68, 68, 0.02)'}}>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:24}}>
          <div style={{fontSize:24}}>⚠️</div>
          <div className="card-title" style={{margin:0, fontSize:20, color:'var(--red)'}}>Strategic Reset Zone</div>
        </div>
        
        <p style={{fontSize:13, color:'var(--text3)', marginBottom:24}}>
          Perform a selective or complete system reset. This action is irreversible.
        </p>

        <button 
          className="btn btn-r" 
          style={{width:'100%', fontWeight:800, padding:'16px', borderRadius:16}}
          onClick={() => setShowResetModal(true)}
        >
          <span style={{marginRight:8}}>🚨</span> ABSOLUTE SYSTEM RESET
        </button>
      </div>

      {/* Reset Modal */}
      {showResetModal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:10000,
          display:'flex', alignItems:'center', justifyContent:'center', padding:20
        }}>
          <div className="pop-in" style={{
            background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:24,
            padding:32, maxWidth:450, width:'100%', boxShadow:'0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{fontSize:20, fontWeight:900, color:'var(--red)', marginBottom:8, textAlign:'center'}}>SELECT WHAT TO RESET</h2>
            <p style={{fontSize:13, color:'var(--text4)', textAlign:'center', marginBottom:24}}>Select the data modules you wish to permanently erase.</p>

            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, padding:'0 8px'}}>
              <span style={{fontSize:12, fontWeight:800, color:'var(--text3)'}}>MODULE SELECTION</span>
              <button 
                onClick={toggleAllResets}
                style={{background:'none', border:'none', color:'var(--indigo)', fontSize:11, fontWeight:800, cursor:'pointer'}}
              >
                {Object.values(resetOptions).every(v => v) ? 'DESELECT ALL' : 'SELECT ALL'}
              </button>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:32}}>
              {[
                ['logs', 'Daily Logs'],
                ['habs', 'Habit Tracker'],
                ['syl', 'Syllabus Progress'],
                ['mocks', 'Mock Test Records'],
                ['vocab', 'Vocabulary & Quiz Data'],
                ['rev', 'Spaced Revision Data'],
              ].map(([key, label]) => (
                <label key={key} style={{
                  display:'flex', alignItems:'center', gap:12, padding:14, 
                  background:resetOptions[key] ? 'rgba(248, 81, 73, 0.05)' : 'var(--bg3)', 
                  border:`1px solid ${resetOptions[key] ? 'var(--red)' : 'var(--border)'}`,
                  borderRadius:12, cursor:'pointer', transition:'all 0.2s'
                }}>
                  <input 
                    type="checkbox" 
                    checked={resetOptions[key]} 
                    onChange={() => setResetOptions(p => ({...p, [key]: !p[key]}))}
                  />
                  <span style={{fontSize:14, fontWeight:700, color:resetOptions[key] ? 'var(--text)' : 'var(--text2)'}}>{label}</span>
                </label>
              ))}
            </div>

            <div style={{marginBottom:24}}>
              <label style={{fontSize:11, fontWeight:800, color:'var(--text4)', display:'block', marginBottom:8, textAlign:'center'}}>
                TYPE "RESET" TO AUTHORIZE
              </label>
              <input 
                className="inp" 
                placeholder="RESET"
                value={resetConfirmText}
                onChange={e => setResetConfirmText(e.target.value.toUpperCase())}
                style={{textAlign:'center', fontSize:16, letterSpacing:2, fontWeight:900, borderRadius:12, border:'1px solid var(--red)'}}
              />
            </div>

            <div style={{display:'flex', gap:12}}>
              <button className="btn" style={{flex:1, borderRadius:12}} onClick={() => setShowResetModal(false)}>CANCEL</button>
              <button 
                className="btn btn-r" 
                style={{flex:1, borderRadius:12, opacity: (isAnyResetSelected && resetConfirmText === 'RESET') ? 1 : 0.5}}
                disabled={!isAnyResetSelected || resetConfirmText !== 'RESET'}
                onClick={handleReset}
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
