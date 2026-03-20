import { useStore } from '../store'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { makeSyl, DEFAULT_FORMULAS, td } from '../data'
import { FIREBASE_UID } from '../firebase'

export default function Settings() {
  const { state, act } = useStore()
  const toast = useToast()
  const confirm = useConfirm()
  const { settings, syncStatus, syl, mocks, logs, habs, errs, revision, vocab, formulas, pyqlog, pomoSessions } = state

  function save() { toast('Settings saved ✓','ok') }
  function setS(k) { return e => act({ type:'SET_SETTINGS', settings:{ [k]:e.target.value } }) }
  function setN(k) { return e => act({ type:'SET_SETTINGS', settings:{ [k]:+e.target.value } }) }

  function exportData() {
    const d = JSON.stringify({ syl,mocks,logs,habs,errs,revision,vocab,formulas,pyqlog,pomoSessions,settings },null,2)
    try {
      navigator.clipboard.writeText(d).then(()=>toast('✅ Data copied to clipboard!','ok')).catch(()=>download(d))
    } catch { download(d) }
  }
  function download(d) {
    const el=document.createElement('a')
    el.href='data:application/json;charset=utf-8,'+encodeURIComponent(d)
    el.download=`defence_backup_${td()}.json`; el.click()
    toast('📁 Backup downloaded','ok')
  }

  const syncColors = { ok:'var(--green)', syncing:'var(--gold)', err:'var(--red)' }
  const syncLabels = { ok:'🔥 FIREBASE CONNECTED', syncing:'⏳ CONNECTING...', err:'⚠ SYNC ERROR' }

  return (
    <div className="page-inner fade-in">
      <div className="card">
        <div className="card-title">⚙ SETTINGS & PREFERENCES</div>
        <div className="g2" style={{marginBottom:14}}>
          <div><label className="lbl">YOUR NAME</label><input className="inp" value={settings.name} onChange={setS('name')}/></div>
          <div><label className="lbl">AFCAT DATE</label><input type="date" className="inp" value={settings.afcatDate||''} onChange={setS('afcatDate')}/></div>
        </div>
        <div className="g3" style={{marginBottom:16}}>
          <div><label className="lbl">TARGET IMA/INA (/300)</label><input type="number" className="inp" value={settings.targetIMA} onChange={setN('targetIMA')}/></div>
          <div><label className="lbl">TARGET AFA (/300)</label><input type="number" className="inp" value={settings.targetAFA} onChange={setN('targetAFA')}/></div>
          <div><label className="lbl">TARGET AFCAT (/300)</label><input type="number" className="inp" value={settings.targetAFCAT} onChange={setN('targetAFCAT')}/></div>
        </div>
        <button className="btn btn-g" onClick={save}>💾 SAVE SETTINGS</button>
      </div>

      <div className="card" style={{borderColor:'#39ff1422',background:'#001a00'}}>
        <div className="card-title" style={{color:'var(--cyan)'}}>☁ CLOUD SYNC — CROSS DEVICE</div>
        <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:10}}>
          <div className={`sync-dot ${syncStatus}`}/>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:syncColors[syncStatus]||'var(--text4)'}}>
            {syncLabels[syncStatus]||'NOT CONNECTED'}
          </span>
        </div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text4)',marginBottom:14,lineHeight:2}}>
          <div>PROJECT: <span style={{color:'var(--text2)'}}>defence-command</span></div>
          <div>SYNC KEY: <span style={{color:'var(--text2)'}}>{FIREBASE_UID}</span></div>
          <div>DEVICES: <span style={{color:'var(--text2)'}}>laptop · iPhone · iPad</span></div>
          <div>AUTO-SYNC: <span style={{color:'var(--green)'}}>enabled — 1.2s after every save</span></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{color:'var(--gold)'}}>📊 DATA MANAGEMENT</div>
        <div className="g2">
          <div>
            <div className="lbl" style={{marginBottom:10,color:'var(--text2)',fontSize:10}}>Export all data as JSON file</div>
            <button className="btn btn-g" onClick={exportData}>📤 EXPORT ALL DATA</button>
          </div>
          <div>
            <div className="lbl" style={{marginBottom:10,color:'var(--red)',fontSize:10}}>DANGER ZONE — irreversible</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
              {[
                ['CLEAR LOGS',   ()=>confirm('CLEAR LOGS','Delete all log entries?',()=>{ act({type:'SET_LOGS',logs:[]}); toast('Logs cleared','info') })],
                ['CLEAR MOCKS',  ()=>confirm('CLEAR MOCKS','Delete all mocks?',()=>{ act({type:'SET_MOCKS',mocks:[]}); toast('Mocks cleared','info') })],
                ['CLEAR ERRORS', ()=>confirm('CLEAR ERRORS','Delete all errors?',()=>{ act({type:'SET_ERRS',errs:[]}); toast('Errors cleared','info') })],
                ['RESET SYL',    ()=>confirm('RESET SYLLABUS','Reset all syllabus progress?',()=>{ act({type:'SET_SYL',syl:makeSyl()}); toast('Syllabus reset','warn') })],
              ].map(([l,fn])=>(
                <button key={l} className="btn btn-r" style={{fontSize:9,padding:'6px 10px'}} onClick={fn}>{l}</button>
              ))}
            </div>
            <button className="btn btn-r" style={{borderColor:'#ff0000',background:'#300000',width:'100%',padding:10}}
              onClick={()=>confirm('⚠ RESET ALL DATA','Delete EVERY log, mock, error, habit, progress? PERMANENT.',()=>{
                act({type:'SET_LOGS',logs:[]}); act({type:'SET_MOCKS',mocks:[]})
                act({type:'SET_ERRS',errs:[]}); act({type:'SET_HABS',habs:[]})
                act({type:'SET_REVISION',revision:[]}); act({type:'SET_VOCAB',vocab:[]})
                act({type:'SET_FORMULAS',formulas:DEFAULT_FORMULAS})
                act({type:'SET_PYQLOG',pyqlog:[]}); act({type:'SET_POMO_SESSIONS',pomoSessions:[]})
                act({type:'SET_SYL',syl:makeSyl()})
                toast('All data cleared','warn',4000)
              },'DELETE ALL',true)}>⚠ RESET ALL DATA</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{color:'var(--text4)'}}>ℹ APP INFO</div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text5)',lineHeight:2.2}}>
          <div style={{color:'var(--text3)'}}>VERSION: 5.0 — React + Firebase</div>
          <div>STORAGE: Firestore (cloud) + localStorage (offline cache)</div>
          <div>HOSTING: Netlify (npm run build → dist/)</div>
          <div>BUILT FOR: Purva — CDS I / AFCAT / CDS II / CDS 2027</div>
          <div style={{marginTop:8,color:'var(--text4)'}}>Keys 1–0 navigate tabs. Swipe left/right on mobile.</div>
        </div>
      </div>
    </div>
  )
}
