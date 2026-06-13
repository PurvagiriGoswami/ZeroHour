import React, { useState } from 'react'
import { useAppStore } from '../store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { SUBJECT_COLORS } from '../data'
import { getTodayISO } from '../utils/dateUtils'
import { getCurrentTime } from '../utils/helpers'

export default function SessionLog() {
  const {
    sessionLog,
    dailyTargets,
    updateSessionLog,
    addManualSession,
    removeSession
  } = useAppStore(
    useShallow(s => ({
      sessionLog: s.sessionLog,
      dailyTargets: s.dailyTargets,
      updateSessionLog: s.updateSessionLog,
      addManualSession: s.addManualSession,
      removeSession: s.removeSession
    }))
  )

  const [viewingDate, setViewingDate] = useState(getTodayISO())
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [formData, setFormData] = useState({
    subject: 'Maths',
    topic: '',
    startTime: getCurrentTime(),
    endTime: null,
    actualMinutes: 60,
    questionsAttempted: 0,
    questionsCorrect: 0,
    notes: '',
    mood: 3
  })

  const today = getTodayISO()
  const isToday = viewingDate === today
  const sessions = sessionLog[viewingDate] || []
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.actualMinutes || 0), 0)
  const totalHours = (totalMinutes / 60).toFixed(1)

  // Navigate dates
  const navigateDay = (delta) => {
    const newDate = new Date(viewingDate + 'T00:00:00')
    newDate.setDate(newDate.getDate() + delta)
    setViewingDate(newDate.toLocaleDateString('en-CA'))
  }

  // Format date for display
  const displayDate = new Date(viewingDate + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Open edit modal
  const openEditModal = (session) => {
    setEditingSession(session)
    setFormData({
      subject: session.subject,
      topic: session.topic || '',
      startTime: session.startTime || getCurrentTime(),
      endTime: session.endTime || null,
      actualMinutes: session.actualMinutes || 60,
      questionsAttempted: session.questionsAttempted || 0,
      questionsCorrect: session.questionsCorrect || 0,
      notes: session.notes || '',
      mood: session.mood || 3
    })
    setShowAddModal(true)
  }

  // Open add modal
  const openAddModal = () => {
    setEditingSession(null)
    setFormData({
      subject: 'Maths',
      topic: '',
      startTime: getCurrentTime(),
      endTime: null,
      actualMinutes: 60,
      questionsAttempted: 0,
      questionsCorrect: 0,
      notes: '',
      mood: 3
    })
    setShowAddModal(true)
  }

  // Handle save
  const handleSave = () => {
    if (editingSession) {
      updateSessionLog(viewingDate, editingSession.id, formData)
    } else {
      addManualSession(viewingDate, formData)
    }
    setShowAddModal(false)
  }

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: '5px' }}>Session Log</h1>
          <p style={{ color: 'var(--text4)', fontSize: '14px' }}>{displayDate} • {totalHours} hrs</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={() => navigateDay(-1)}>← Yesterday</button>
          <button className="btn" onClick={() => navigateDay(1)}>Tomorrow →</button>
        </div>
      </div>

      {/* Sessions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sessions.map((session) => {
          const color = SUBJECT_COLORS[session.subject] || 'var(--accent)'
          const accuracy = session.questionsAttempted ? Math.round((session.questionsCorrect / session.questionsAttempted) * 100) : null

          return (
            <div
              key={session.id}
              className="card"
              style={{
                padding: '15px',
                borderLeft: `4px solid ${color}`,
                background: session.autoCreated ? 'var(--bg3)' : 'linear-gradient(135deg, var(--bg3), rgba(34,197,94,0.03))'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text)' }}>{session.subject}</span>
                    {session.autoCreated && <span style={{ fontSize: '10px', background: 'var(--bg4)', padding: '2px 6px', borderRadius: '4px' }}>AUTO</span>}
                  </div>
                  {session.topic && <div style={{ fontSize: '12px', color: 'var(--text4)', marginBottom: '4px' }}>{session.topic}</div>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: 'var(--text4)' }}>
                    {session.startTime && session.endTime && <span>{session.startTime} - {session.endTime}</span>}
                    <span>⏱ {session.actualMinutes} mins</span>
                    {accuracy !== null && <span style={{ color: accuracy >= 70 ? 'var(--green)' : 'var(--red)', fontWeight: '700' }}>{accuracy}% accuracy</span>}
                  </div>
                  {session.notes && <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '6px', background: 'var(--bg4)', padding: '8px', borderRadius: '4px' }}>{session.notes}</div>}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn" style={{ fontSize: '11px', padding: '6px 10px' }} onClick={() => openEditModal(session)}>Edit</button>
                  <button className="btn" style={{ fontSize: '11px', padding: '6px 10px', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => removeSession(viewingDate, session.id)}>Delete</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Manual Session Button */}
      {isToday && (
        <button
          className="btn"
          style={{ width: '100%', marginTop: '20px', fontSize: '13px' }}
          onClick={openAddModal}
        >
          + Add Manual Session
        </button>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: '0',
          background: 'rgba(0,0,0,0.8)',
          zIndex: '3000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflow: 'auto'
        }}>
          <div className="card fade-in" style={{ maxWidth: '480px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '900' }}>{editingSession ? 'Edit Session' : 'Add Session'}</h3>
              <button className="btn" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Subject</label>
                <select className="inp" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}>
                  {['Maths', 'English', 'GK', 'PYQ', 'Mock', 'Revision', 'Free'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Topic</label>
                <input type="text" className="inp" value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Start Time</label>
                  <input type="time" className="inp" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>End Time</label>
                  <input type="time" className="inp" value={formData.endTime || ''} onChange={(e) => setFormData({ ...formData, endTime: e.target.value || null })} />
                </div>
              </div>

              <div>
                <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Minutes</label>
                <input type="number" className="inp" value={formData.actualMinutes} onChange={(e) => setFormData({ ...formData, actualMinutes: parseInt(e.target.value) || 60 })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Attempted</label>
                  <input type="number" className="inp" value={formData.questionsAttempted} onChange={(e) => setFormData({ ...formData, questionsAttempted: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Correct</label>
                  <input type="number" className="inp" value={formData.questionsCorrect} onChange={(e) => setFormData({ ...formData, questionsCorrect: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div>
                <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Notes</label>
                <textarea className="inp" rows="3" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-g" style={{ flex: 1 }} onClick={handleSave}>{editingSession ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
