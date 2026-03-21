import { useRef } from 'react'
import { useStore } from '../store'
import { useAppStore } from '../store/useStore'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { makeSyl } from '../data'
import { exportToExcel, importFromExcel } from '../services/excelService'

export default function Settings() {
  const { state } = useStore()
  const toast = useToast()
  const confirm = useConfirm()
  const { settings, syncStatus, syl, mocks, logs, habs, revision, vocab, pyqlog, pomoSessions, quizResults, plannerTasks } = state
  const store = useAppStore()
  const fileRef = useRef(null)

  function setS(k) { return e => store.setSettings({ [k]: e.target.value }) }
  function setN(k) { return e => store.setSettings({ [k]: +e.target.value }) }

  function handleExportExcel() {
    try {
      const filename = exportToExcel({ vocab, quizResults, plannerTasks, revision, syl })
      toast(`✅ Exported: ${filename}`, 'ok')
    } catch (e) {
      console.error(e)
      toast('Export failed', 'err')
    }
  }

  function handleExportJSON() {
    const d = JSON.stringify({ syl, mocks, logs, habs, revision, vocab, pyqlog, pomoSessions, quizResults, plannerTasks, settings }, null, 2)
    const el = document.createElement('a')
    el.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(d)
    el.download = `DefenceCentre_backup_${new Date().toISOString().split('T')[0]}.json`
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
        const data = JSON.parse(text)
        if (data.vocab) store.setVocab(data.vocab)
        if (data.syl) store.setSyl(data.syl)
        if (data.mocks) store.setMocks(data.mocks)
        if (data.logs) store.setLogs(data.logs)
        if (data.habs) store.setHabs(data.habs)
        if (data.revision) store.setRevision(data.revision)
        if (data.quizResults) store.setQuizResults(data.quizResults)
        if (data.plannerTasks) store.setPlannerTasks(data.plannerTasks)
        if (data.settings) store.setSettings(data.settings)
        toast('✅ Data imported from JSON', 'ok')
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
    <div className="page-inner fade-in">
      {/* Profile */}
      <div className="card">
        <div className="card-title">👤 PROFILE</div>
        <div className="g2" style={{marginBottom:14}}>
          <div><label className="lbl">YOUR NAME</label><input className="inp" value={settings.name || ''} onChange={setS('name')}/></div>
          <div><label className="lbl">TARGET EXAM</label>
            <select className="inp" value={settings.targetExam || 'CDS'} onChange={setS('targetExam')}>
              <option>CDS</option><option>AFCAT</option><option>NDA</option><option>CDS + AFCAT</option>
            </select>
          </div>
        </div>
        <div className="g3" style={{marginBottom:14}}>
          <div><label className="lbl">DAILY STUDY GOAL (hrs)</label>
            <input type="number" className="inp" value={settings.dailyStudyGoal || 6} onChange={setN('dailyStudyGoal')} min={1} max={16}/></div>
          <div><label className="lbl">AFCAT DATE</label><input type="date" className="inp" value={settings.afcatDate || ''} onChange={setS('afcatDate')}/></div>
          <div><label className="lbl">TARGET IMA (/300)</label><input type="number" className="inp" value={settings.targetIMA || 160} onChange={setN('targetIMA')}/></div>
        </div>
        <div className="g3" style={{marginBottom:16}}>
          <div><label className="lbl">TARGET AFA (/300)</label><input type="number" className="inp" value={settings.targetAFA || 175} onChange={setN('targetAFA')}/></div>
          <div><label className="lbl">TARGET AFCAT (/300)</label><input type="number" className="inp" value={settings.targetAFCAT || 170} onChange={setN('targetAFCAT')}/></div>
          <div></div>
        </div>
        <button className="btn btn-g" onClick={() => toast('Settings auto-saved ✓','ok')}>💾 SAVE</button>
      </div>

      {/* Quiz Settings */}
      <div className="card">
        <div className="card-title" style={{color:'var(--gold)'}}>🧠 QUIZ SETTINGS</div>
        <div className="g3" style={{marginBottom:12}}>
          <div>
            <label className="lbl">QUESTIONS PER QUIZ</label>
            <input type="number" className="inp" value={settings.questionsPerQuiz || 10} onChange={setN('questionsPerQuiz')} min={5} max={30}/>
          </div>
          <div>
            <label className="lbl">DIFFICULTY</label>
            <select className="inp" value={settings.quizDifficulty || 'mixed'} onChange={setS('quizDifficulty')}>
              <option value="easy">Easy</option>
              <option value="mixed">Mixed</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="lbl">QUIZ FREQUENCY (days)</label>
            <input type="number" className="inp" value={settings.quizFrequency || 7} onChange={setN('quizFrequency')} min={1} max={30}/>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <div className="card-title" style={{color:'var(--cyan)'}}>📊 DATA MANAGEMENT</div>
        <div className="g2" style={{marginBottom:12}}>
          <div>
            <div className="lbl" style={{marginBottom:10, color:'var(--text2)', fontSize:10}}>Export as Excel (.xlsx)</div>
            <button className="btn btn-g" style={{width:'100%'}} onClick={handleExportExcel}>📤 EXPORT EXCEL</button>
          </div>
          <div>
            <div className="lbl" style={{marginBottom:10, color:'var(--text2)', fontSize:10}}>Export as JSON backup</div>
            <button className="btn btn-c" style={{width:'100%'}} onClick={handleExportJSON}>📤 EXPORT JSON</button>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <div className="lbl" style={{marginBottom:10, color:'var(--text2)', fontSize:10}}>Import data (.xlsx or .json)</div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.json" onChange={handleImport} style={{display:'none'}}/>
          <button className="btn btn-y" style={{width:'100%'}} onClick={() => fileRef.current?.click()}>📥 IMPORT DATA</button>
        </div>
      </div>

      {/* Security */}
      <div className="card" style={{borderColor:'#39ff1422', background:'#001a00'}}>
        <div className="card-title" style={{color:'var(--green)'}}>🔒 SECURITY & SYNC</div>
        <div style={{display:'flex', gap:10, alignItems:'center', marginBottom:12}}>
          <div className={`sync-dot ${syncStatus}`}/>
          <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:syncColors[syncStatus] || 'var(--text4)'}}>
            {syncLabels[syncStatus] || 'NOT CONNECTED'}
          </span>
        </div>
        <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:'var(--text4)', lineHeight:2.2}}>
          <div>PROJECT: <span style={{color:'var(--text2)'}}>defence-centre-ai</span></div>
          <div>API KEYS: <span style={{color:'var(--green)'}}>🔒 HIDDEN</span></div>
          <div>DEVICES: <span style={{color:'var(--text2)'}}>laptop · iPhone · iPad</span></div>
          <div>AUTO-SYNC: <span style={{color:'var(--green)'}}>enabled — 1.2s after every save</span></div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{borderColor:'#ff333344', background:'#0a0000'}}>
        <div className="card-title" style={{color:'var(--red)'}}>⚠ DANGER ZONE</div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:12}}>
          {[
            ['CLEAR LOGS', () => confirm('CLEAR LOGS','Delete all log entries?',() => { store.setLogs([]); toast('Logs cleared','info') })],
            ['CLEAR MOCKS', () => confirm('CLEAR MOCKS','Delete all mocks?',() => { store.setMocks([]); toast('Mocks cleared','info') })],
            ['CLEAR QUIZ HISTORY', () => confirm('CLEAR QUIZ','Delete all quiz results?',() => { store.setQuizResults([]); toast('Quiz history cleared','info') })],
            ['CLEAR PLANNER', () => confirm('CLEAR PLANNER','Delete all planner tasks?',() => { store.setPlannerTasks([]); toast('Planner cleared','info') })],
            ['RESET SYLLABUS', () => confirm('RESET SYLLABUS','Reset all syllabus progress?',() => { store.setSyl(makeSyl()); toast('Syllabus reset','warn') })],
            ['DELETE VOCAB ONLY', () => confirm('DELETE VOCABULARY','Delete all vocab words?',() => { store.clearVocab(); toast('Vocabulary deleted','warn') })],
          ].map(([l, fn]) => (
            <button key={l} className="btn btn-r" style={{fontSize:8, padding:'6px 10px'}} onClick={fn}>{l}</button>
          ))}
        </div>
        <button className="btn btn-r" style={{borderColor:'#ff0000', background:'#300000', width:'100%', padding:12, fontSize:11}}
          onClick={() => confirm('⚠ RESET ALL DATA','Delete EVERY log, mock, quiz, vocab, planner, habit, progress? THIS IS PERMANENT.',() => {
            store.clearAllData()
            toast('All data cleared','warn', 4000)
          },'DELETE ALL', true)}>⚠ RESET ENTIRE APP</button>
      </div>

      {/* App Info */}
      <div className="card">
        <div className="card-title" style={{color:'var(--text4)'}}>ℹ APP INFO</div>
        <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:'var(--text5)', lineHeight:2.2}}>
          <div style={{color:'var(--text3)'}}>VERSION: 6.0 — DefenceCentre AI</div>
          <div>STACK: React + Vite + Zustand + Recharts + Tailwind</div>
          <div>STORAGE: Firebase (cloud) + localStorage (offline)</div>
          <div>EXPORT: SheetJS (Excel .xlsx)</div>
          <div style={{marginTop:8, color:'var(--text4)'}}>Keys 1–0 navigate tabs. Swipe left/right on mobile.</div>
        </div>
      </div>
    </div>
  )
}
