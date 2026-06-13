import React, { useState, useEffect } from 'react'
import { useAppStore } from '../store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { SUBJECT_COLORS } from '../data'
import { getTodayISO } from '../utils/dateUtils'

export default function DailyTargets() {
  const {
    dailyTargets,
    sessionLog,
    derived_todayCompletion,
    updateDailyTargetStatus,
    addAdHocTarget
  } = useAppStore(
    useShallow(s => ({
      dailyTargets: s.dailyTargets,
      sessionLog: s.sessionLog,
      derived_todayCompletion: s.derived_todayCompletion,
      updateDailyTargetStatus: s.updateDailyTargetStatus,
      addAdHocTarget: s.addAdHocTarget
    }))
  )

  const [viewingDate, setViewingDate] = useState(getTodayISO())
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTargetData, setNewTargetData] = useState({
    subject: 'Maths',
    topic: '',
    targetMinutes: 60,
    examTag: null
  })

  const today = getTodayISO()
  const isToday = viewingDate === today
  const targets = dailyTargets[viewingDate] || []

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

  // Calculate completion
  const actionable = targets.filter(t => t.status !== 'skipped')
  const doneCount = targets.filter(t => t.status === 'done').length
  const completion = actionable.length ? Math.round((doneCount / actionable.length) * 100) : 0

  // Add ad-hoc target
  const handleAddAdHoc = () => {
    addAdHocTarget(viewingDate, newTargetData)
    setShowAddModal(false)
    setNewTargetData({
      subject: 'Maths',
      topic: '',
      targetMinutes: 60,
      examTag: null
    })
  }

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: '5px' }}>Daily Targets</h1>
          <p style={{ color: 'var(--text4)', fontSize: '14px' }}>{displayDate}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={() => navigateDay(-1)}>← Yesterday</button>
          <button className="btn" onClick={() => navigateDay(1)}>Tomorrow →</button>
        </div>
      </div>

      {/* Completion Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '15px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700' }}>Completion</span>
          <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent)' }}>{completion}%</span>
        </div>
        <div style={{
          height: '8px',
          background: 'var(--bg4)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${completion}%`,
            background: 'var(--accent)',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Targets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {targets.map((target) => {
          const color = SUBJECT_COLORS[target.subject] || 'var(--accent)'
          const session = target.sessionLogId ? (sessionLog[viewingDate] || []).find(s => s.id === target.sessionLogId) : null

          return (
            <div
              key={target.id}
              className="card"
              style={{
                padding: '15px',
                borderLeft: target.status === 'in_progress' ? `4px solid var(--accent)` : target.status === 'done' ? `4px solid var(--green)` : target.status === 'skipped' ? '4px solid var(--text4)' : `4px solid ${color}`,
                background: target.status === 'skipped' ? 'var(--bg4)' : 'var(--bg3)',
                opacity: target.status === 'skipped' ? '0.6' : '1'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text)' }}>
                      {target.subject}
                    </span>
                    {target.adHoc && <span style={{ fontSize: '10px', background: 'var(--bg4)', padding: '2px 6px', borderRadius: '4px' }}>AD-HOC</span>}
                    {target.status === 'in_progress' && <span style={{ fontSize: '10px', background: 'rgba(34,197,94,0.15)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>● ACTIVE</span>}
                    {target.status === 'done' && <span style={{ fontSize: '10px', background: 'rgba(34,197,94,0.15)', color: 'var(--green)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>✓ DONE</span>}
                    {target.status === 'skipped' && <span style={{ fontSize: '10px', background: 'var(--bg4)', color: 'var(--text4)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>⊘ SKIPPED</span>}
                  </div>
                  {target.topic && <div style={{ fontSize: '12px', color: 'var(--text4)', marginBottom: '4px' }}>{target.topic}</div>}
                  <div style={{ fontSize: '11px', color: 'var(--text4)' }}>
                    ⏱ {target.targetMinutes} mins
                    {target.status === 'done' && target.completedMinutes && ` • ${target.completedMinutes} mins completed`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {isToday && target.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-g"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        onClick={() => updateDailyTargetStatus(viewingDate, target.id, 'in_progress')}
                      >
                        Start
                      </button>
                      <button
                        className="btn"
                        style={{ fontSize: '11px', padding: '6px 10px', borderColor: 'var(--text4)', color: 'var(--text4)' }}
                        onClick={() => updateDailyTargetStatus(viewingDate, target.id, 'skipped')}
                      >
                        Skip
                      </button>
                    </>
                  )}
                  {isToday && target.status === 'in_progress' && (
                    <>
                      <button
                        className="btn btn-g"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                        onClick={() => updateDailyTargetStatus(viewingDate, target.id, 'done')}
                      >
                        Done
                      </button>
                      <button
                        className="btn"
                        style={{ fontSize: '11px', padding: '6px 10px', borderColor: 'var(--text4)', color: 'var(--text4)' }}
                        onClick={() => updateDailyTargetStatus(viewingDate, target.id, 'skipped')}
                      >
                        Skip
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Ad-Hoc Button */}
      {isToday && (
        <button
          className="btn"
          style={{ width: '100%', marginTop: '20px', fontSize: '13px' }}
          onClick={() => setShowAddModal(true)}
        >
          + Add Ad-Hoc Target
        </button>
      )}

      {/* Add Ad-Hoc Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: '0',
          background: 'rgba(0,0,0,0.8)',
          zIndex: '3000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card fade-in" style={{ maxWidth: '420px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '900' }}>Add Ad-Hoc Target</h3>
              <button className="btn" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Subject</label>
                <select
                  className="inp"
                  value={newTargetData.subject}
                  onChange={(e) => setNewTargetData({ ...newTargetData, subject: e.target.value })}
                >
                  {['Maths', 'English', 'GK', 'PYQ', 'Mock', 'Revision', 'Free'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Topic</label>
                <input
                  type="text"
                  className="inp"
                  value={newTargetData.topic}
                  onChange={(e) => setNewTargetData({ ...newTargetData, topic: e.target.value })}
                />
              </div>

              <div>
                <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Duration (minutes)</label>
                <input
                  type="number"
                  className="inp"
                  value={newTargetData.targetMinutes}
                  onChange={(e) => setNewTargetData({ ...newTargetData, targetMinutes: parseInt(e.target.value) || 60 })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-g" style={{ flex: 1 }} onClick={handleAddAdHoc}>Add Target</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
