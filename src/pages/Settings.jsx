import { useRef, useState, useMemo } from 'react'
import { useAppStore } from '../store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { useToast } from '../Toast'
import { exportToExcel } from '../services/excelService'
import { DEFAULT_CDS_TIMETABLE } from '../data'
import { getTodayStr } from '../utils/tacticalEngine'

export default function Settings() {
  const { 
    settings, syncStatus, zh_sessions, zh_topicMap, zh_mocks, zh_weeklyChecks,
    zh_examList, setExamList, zh_weeklyTimetable, setWeeklyTimetable
  } = useAppStore(
    useShallow(s => ({
      settings: s.settings,
      syncStatus: s.syncStatus,
      zh_sessions: s.zh_sessions,
      zh_topicMap: s.zh_topicMap,
      zh_mocks: s.zh_mocks,
      zh_weeklyChecks: s.zh_weeklyChecks,
      zh_examList: s.zh_examList,
      setExamList: s.setExamList,
      zh_weeklyTimetable: s.zh_weeklyTimetable,
      setWeeklyTimetable: s.setWeeklyTimetable
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
    revision: false,
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
    if (resetOptions.revision) {
      // Assuming revision queue is derived from zh_topicMap, 
      // but if there's a specific key, reset it. 
      // For now, if we reset topics, revision is reset.
      toast('Revision Queue reset (via Topic Map)', 'info')
    }

    setShowResetModal(false)
    setResetConfirmText('')
    setResetOptions({ sessions: false, topics: false, mocks: false, sitrep: false, revision: false })
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
    const d = JSON.stringify({ 
      zh_sessions, zh_topicMap, zh_mocks, zh_weeklyChecks, settings
    }, null, 2)
    const el = document.createElement('a')
    el.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(d)
    el.download = `ZeroHour_Backup_${new Date().toISOString().split('T')[0]}.json`
    el.click()
    toast('📁 JSON backup downloaded', 'ok')
  }

  const handleExamNameChange = (id, name) => {
    const updated = zh_examList.map(e => e.id === id ? { ...e, name } : e);
    setExamList(updated);
  };

  const handleExamDateChange = (id, date) => {
    const updated = zh_examList.map(e => e.id === id ? { ...e, date } : e);
    setExamList(updated);
  };

  const handleExamActiveChange = (id, active) => {
    const updated = zh_examList.map(e => e.id === id ? { ...e, active } : e);
    setExamList(updated);
  };

  const handleAddCustomExam = () => {
    const newExam = {
      id: `custom_${Date.now()}`,
      name: 'Custom Exam',
      date: '',
      active: true,
      isSystem: false
    };
    setExamList([...zh_examList, newExam]);
  };

  const handleRemoveCustomExam = (id) => {
    const updated = zh_examList.filter(e => e.id !== id);
    setExamList(updated);
  };

  const today = getTodayStr();
  const sortedExamList = useMemo(() => {
    const allExams = [...(zh_examList || [])];
    const examsWithDates = allExams
      .filter(e => e.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const examsWithoutDates = allExams.filter(e => !e.date);
    return [...examsWithDates, ...examsWithoutDates];
  }, [zh_examList]);

  const handleTemplateChange = (e) => {
    const value = e.target.value;
    if (value === 'cds-prep-v1') {
      if (window.confirm("Switch to standard CDS template? This will replace your current weekly schedule.")) {
        setWeeklyTimetable({
          ...zh_weeklyTimetable,
          templateId: 'cds-prep-v1',
          dailySlots: DEFAULT_CDS_TIMETABLE.dailySlots
        });
      }
    } else if (value === 'capf-prep-v1') {
      if (window.confirm("Switch to standard CAPF template? This will replace your current weekly schedule.")) {
        const capfSlots = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
          const base = zh_weeklyTimetable.dailySlots[day] || {};
          capfSlots[day] = { ...base };
          if (capfSlots[day].maths) {
            capfSlots[day].maths = { ...capfSlots[day].maths, label: 'Maths PYQ (CDS/AFCAT/CAPF)' };
          }
          if (day === 'monday' || day === 'wednesday' || day === 'friday') {
            capfSlots[day].capfPaper2 = {
              duration: 90,
              components: ['Comprehension', 'English', 'Logical/Analytical Reasoning', 'Numerical Ability']
            };
          }
          if (day === 'tuesday' || day === 'thursday') {
            capfSlots[day].englishPYQ = { duration: 45 };
          }
        });
        setWeeklyTimetable({
          ...zh_weeklyTimetable,
          templateId: 'capf-prep-v1',
          dailySlots: capfSlots
        });
      }
    }
  };

  const handleSubjectTargetChange = (sub, val) => {
    store.setSettings({
      subjectTargets: { ...settings.subjectTargets, [sub]: parseInt(val) || 0 }
    })
  }

  const toggleOffDay = (day) => {
    const current = settings.offDays || []
    const next = current.includes(day) 
      ? current.filter(d => d !== day)
      : [...current, day]
    store.setSettings({ offDays: next })
  }

  const syncColors = { ok: '#22c55e', syncing: '#f59e0b', err: '#ef4444' }
  const syncLabels = { ok: 'CONNECTED', syncing: 'SYNCING...', err: 'OFFLINE' }

  return (
    <div className="page-inner fade-in" style={{paddingBottom: 100}}>
      <div className="card" style={{ marginBottom: 30 }}>
        <h1 className="card-title">SYSTEM SETTINGS</h1>
        <p style={{ color: 'var(--text4)', fontSize: 12 }}>Configure your tactical environment.</p>
      </div>

      {/* ── EXAM TIMELINE MANAGER (DYNAMIC) ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="label-caps">DYNAMIC EXAM TIMELINE MANAGER</div>
          <button className="btn btn-g" style={{ padding: '4px 10px', fontSize: 10 }} onClick={handleAddCustomExam}>
            ➕ ADD CUSTOM EXAM
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sortedExamList.map(ex => (
            <div key={ex.id} className="card" style={{ padding: 12, background: 'var(--bg3)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Active Toggle */}
              <input 
                type="checkbox" 
                checked={ex.active} 
                onChange={(e) => handleExamActiveChange(ex.id, e.target.checked)} 
                style={{ cursor: 'pointer' }}
              />
              
              {/* Exam Name Input */}
              <div style={{ flex: 2, minWidth: 150 }}>
                {ex.isSystem ? (
                  <span style={{ fontWeight: 'bold', fontSize: 13, color: '#fff' }}>{ex.name} <span style={{ fontSize: 9, color: 'var(--text4)' }}>(SYSTEM)</span></span>
                ) : (
                  <input 
                    type="text" 
                    className="inp" 
                    style={{ fontSize: 12, padding: '4px 8px' }} 
                    value={ex.name} 
                    onChange={(e) => handleExamNameChange(ex.id, e.target.value)} 
                  />
                )}
              </div>

              {/* Exam Date Input */}
              <div style={{ flex: 2, minWidth: 120 }}>
                <input 
                  type="date" 
                  className="inp" 
                  style={{ fontSize: 12, padding: '4px 8px' }} 
                  value={ex.date || ''} 
                  onChange={(e) => handleExamDateChange(ex.id, e.target.value)} 
                />
              </div>

              {/* Days Remaining Label */}
              {ex.date && (
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text3)' }}>
                  {Math.max(0, Math.ceil((new Date(ex.date) - new Date(today)) / (1000 * 60 * 60 * 24)))}d left
                </div>
              )}

              {/* Remove Button for Custom Exams */}
              {!ex.isSystem && (
                <button 
                  className="btn btn-red" 
                  style={{ padding: '4px 8px', fontSize: 10 }}
                  onClick={() => handleRemoveCustomExam(ex.id)}
                >
                  🗑 Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── TIMETABLE TEMPLATE SELECTOR ── */}
      <div className="card">
        <div className="label-caps" style={{ marginBottom: 15 }}>WEEKLY TIMETABLE TEMPLATE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <select 
            className="inp"
            value={zh_weeklyTimetable?.templateId || 'cds-prep-v1'}
            onChange={handleTemplateChange}
            style={{ width: '100%', maxWidth: 350 }}
          >
            <option value="cds-prep-v1">CDS Prep Template v1</option>
            <option value="capf-prep-v1">CAPF Prep Template v1</option>
          </select>
          <span style={{ fontSize: 10, color: 'var(--text4)' }}>
            Note: Switching templates re-maps daily core slots, revisions, and exam-specific checkpoints.
          </span>
        </div>
      </div>

      {/* ── STUDY PREFERENCES ── */}
      <div className="card">
        <div className="label-caps" style={{ marginBottom: 20 }}>STUDY PREFERENCES</div>
        <div className="g2">
          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: 8 }}>Daily Pomo Target</label>
            <input 
              type="number" className="inp" 
              value={settings.dailyPomoTarget || 8} onChange={setS('dailyPomoTarget')} 
            />
          </div>
          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: 8 }}>Max Study Hours (Cap)</label>
            <input 
              type="number" className="inp" 
              value={settings.maxStudyHours || 8} onChange={setS('maxStudyHours')} 
            />
          </div>
        </div>
        <div className="g2" style={{ marginTop: 20 }}>
          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: 8 }}>EOD Review Time</label>
            <input 
              type="time" className="inp" 
              value={settings.eodReviewTime || '22:00'} onChange={setS('eodReviewTime')} 
            />
          </div>
          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: 8 }}>Morning Reminder</label>
            <input 
              type="time" className="inp" 
              value={settings.morningReminderTime || '08:00'} onChange={setS('morningReminderTime')} 
            />
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
            <label className="label-caps" style={{ display: 'block', marginBottom: 8 }}>Off Days</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <button 
                  key={day} 
                  className={`btn ${settings.offDays?.includes(day) ? 'btn-g' : ''}`}
                  style={{ padding: '4px 8px', fontSize: 10 }}
                  onClick={() => toggleOffDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
        </div>
      </div>

      {/* ── ANALYTICS CONFIG ── */}
      <div className="card">
        <div className="label-caps" style={{ marginBottom: 20 }}>ANALYTICS CONFIG</div>
        <div className="g2" style={{ marginBottom: 20 }}>
          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: 8 }}>CDS Estimated Cutoff</label>
            <input 
              type="number" className="inp" 
              value={settings.cdsCutoff || 160} onChange={setS('cdsCutoff')} 
            />
          </div>
        </div>
        <div className="label-caps" style={{ fontSize: 10, marginBottom: 10 }}>Recommended Time % per Subject</div>
        <div className="g3">
          {Object.entries(settings.subjectTargets || {}).map(([sub, target]) => (
            <div key={sub}>
              <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>{sub}</label>
              <input 
                type="number" className="inp" 
                value={target} onChange={e => handleSubjectTargetChange(sub, e.target.value)} 
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: Object.values(settings.subjectTargets || {}).reduce((a,b)=>a+b,0) === 100 ? 'var(--green)' : 'var(--red)' }}>
          Total: {Object.values(settings.subjectTargets || {}).reduce((a,b)=>a+b,0)}% (Must be 100%)
        </div>
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
                ['topics', 'Topic Map / Revision Q'],
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
