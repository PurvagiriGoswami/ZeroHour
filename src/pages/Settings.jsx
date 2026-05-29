import { useRef, useState } from 'react'
import { useAppStore } from '../store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { useToast } from '../Toast'
import { exportToExcel } from '../services/excelService'

export default function Settings() {
  const { settings, syncStatus, zh_sessions, zh_topicMap, zh_mocks, zh_weeklyChecks } = useAppStore(
    useShallow(s => ({
      settings: s.settings,
      syncStatus: s.syncStatus,
      zh_sessions: s.zh_sessions,
      zh_topicMap: s.zh_topicMap,
      zh_mocks: s.zh_mocks,
      zh_weeklyChecks: s.zh_weeklyChecks,
    }))
  )
  const store = useAppStore()
  const toast = useToast()
  const fileRef = useRef(null)

  const [showResetModal, setShowResetModal] = useState(false)
  const [resetOptions, setResetOptions] = useState({
    sessions: false,
    topics: false,
    mocks: false,
    sitrep: false,
  })
  const [resetConfirmText, setResetConfirmText] = useState('')

  function setS(k) { 
    return e => {
      const val = e.target.value
      store.setSettings({ [k]: val })
    }
  }

  const handleReset = () => {
    if (resetConfirmText !== 'RESET') return

    if (resetOptions.sessions) { store.setSessions([]); toast('Sessions cleared', 'info') }
    if (resetOptions.topics) { store.setTopicMap({}); toast('Topic map reset', 'info') }
    if (resetOptions.mocks) { store.setZhMocks([]); toast('Mocks cleared', 'info') }
    if (resetOptions.sitrep) { store.setWeeklyChecks([]); toast('SITREP history cleared', 'info') }

    setShowResetModal(false)
    setResetConfirmText('')
    setResetOptions({ sessions: false, topics: false, mocks: false, sitrep: false })
  }

  const toggleAllResets = () => {
    const allSelected = Object.values(resetOptions).every(v => v)
    setResetOptions({
      sessions: !allSelected,
      topics: !allSelected,
      mocks: !allSelected,
      sitrep: !allSelected,
    })
  }

  const isAnyResetSelected = Object.values(resetOptions).some(v => v)

  function handleExportExcel() {
    const result = exportToExcel({ zh_sessions, zh_topicMap, zh_mocks, zh_weeklyChecks })
    if (result.ok) {
      toast(`✅ Exported: ${result.filename}`, 'ok')
    } else {
      toast(result.error || 'Export failed', 'err')
    }
  }

  function handleExportJSON() {
    const d = JSON.stringify({ zh_sessions, zh_topicMap, zh_mocks, zh_weeklyChecks, settings }, null, 2)
    const el = document.createElement('a')
    el.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(d)
    el.download = `ZeroHour_Backup_${new Date().toISOString().split('T')[0]}.json`
    el.click()
    toast('📁 JSON backup downloaded', 'ok')
  }

  const syncColors = { ok: '#22c55e', syncing: '#f59e0b', err: '#ef4444' }
  const syncLabels = { ok: 'CONNECTED', syncing: 'SYNCING...', err: 'OFFLINE' }

  return (
    <div className="page-inner fade-in" style={{paddingBottom: 100}}>
      <div className="card" style={{ marginBottom: 30 }}>
        <h1 className="card-title">SYSTEM SETTINGS</h1>
        <p style={{ color: 'var(--text4)', fontSize: 12 }}>Configure your tactical environment.</p>
      </div>

      <div className="card">
        <div className="label-caps" style={{ marginBottom: 20 }}>Visual Configuration</div>
        <div className="g2">
          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: 8 }}>Accent Color</label>
            <select className="inp" value={settings.accentColor} onChange={setS('accentColor')}>
              <option value="#22c55e">Green (Default)</option>
              <option value="#3b82f6">Blue</option>
              <option value="#f59e0b">Amber</option>
              <option value="#ef4444">Red</option>
            </select>
          </div>
          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: 8 }}>Font Size</label>
            <select className="inp" value={settings.fontSize} onChange={setS('fontSize')}>
              <option value="small">Compact</option>
              <option value="medium">Standard</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="label-caps" style={{ marginBottom: 20 }}>Data Operations</div>
        <div className="g2" style={{ marginBottom: 20 }}>
          <button className="btn" style={{ width: '100%' }} onClick={handleExportExcel}>EXPORT EXCEL</button>
          <button className="btn" style={{ width: '100%' }} onClick={handleExportJSON}>EXPORT JSON BACKUP</button>
        </div>
        
        <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="label-caps" style={{ fontSize: 10 }}>Sync Status</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: syncColors[syncStatus] }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: syncColors[syncStatus] }}>{syncLabels[syncStatus]}</span>
              </div>
            </div>
            <button className="btn" style={{ fontSize: 10 }} onClick={() => store.clearAllData()}>PURGE ALL DATA</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ borderColor: 'var(--red)', background: 'rgba(239, 68, 68, 0.02)' }}>
        <div className="label-caps" style={{ color: 'var(--red)', marginBottom: 15 }}>Danger Zone</div>
        <button className="btn" style={{ width: '100%', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => setShowResetModal(true)}>
          SELECTIVE MODULE RESET
        </button>
      </div>

      {showResetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card pop-in" style={{ maxWidth: 400, width: '100%' }}>
            <h2 className="label-caps" style={{ color: 'var(--red)', marginBottom: 20, textAlign: 'center' }}>Reset Modules</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                ['sessions', 'Study Sessions'],
                ['topics', 'Topic Map'],
                ['mocks', 'Mock Records'],
                ['sitrep', 'Weekly SITREP'],
              ].map(([k, l]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'var(--bg3)', borderRadius: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={resetOptions[k]} onChange={() => setResetOptions(p => ({ ...p, [k]: !p[k] }))} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{l}</span>
                </label>
              ))}
            </div>
            <input 
              className="inp" placeholder='Type "RESET" to confirm' 
              style={{ width: '100%', textAlign: 'center', marginBottom: 20 }}
              value={resetConfirmText} onChange={e => setResetConfirmText(e.target.value.toUpperCase())}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setShowResetModal(false)}>CANCEL</button>
              <button 
                className="btn" style={{ flex: 1, borderColor: 'var(--red)', color: 'var(--red)', opacity: (isAnyResetSelected && resetConfirmText === 'RESET') ? 1 : 0.5 }}
                disabled={!isAnyResetSelected || resetConfirmText !== 'RESET'}
                onClick={handleReset}
              >
                RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
