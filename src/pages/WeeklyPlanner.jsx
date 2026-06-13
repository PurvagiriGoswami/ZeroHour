import React, { useState, useMemo, useEffect } from 'react'
import { useAppStore } from '../store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { MASTER_TOPICS, SUBJECT_COLORS } from '../data'
import { getTodayISO, getISOWeek } from '../utils/dateUtils'

// Flatten MASTER_TOPICS into a simple subject -> topics map
const syllabusTopics = Object.fromEntries(
  Object.entries(MASTER_TOPICS).map(([subject, data]) => [
    subject,
    Object.values(data.categories).flatMap(cat => cat.topics.map(t => t.name))
  ])
)
// Also add the subjects mentioned in the prompt
const allSubjects = ['Maths', 'English', 'GK', 'PYQ', 'Mock', 'Revision', 'Free']

// Day order as per the prompt
const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function WeeklyPlanner({ onConfirm, onClose, isStandalonePrompt = false }) {
  const {
    weeklyPlan,
    weeklyPlanOverrides,
    exams,
    addWeeklyTarget,
    editWeeklyTarget,
    removeWeeklyTarget,
    overrideWeeklyTopic
  } = useAppStore(
    useShallow(s => ({
      weeklyPlan: s.weeklyPlan,
      weeklyPlanOverrides: s.weeklyPlanOverrides,
      exams: s.exams,
      addWeeklyTarget: s.addWeeklyTarget,
      editWeeklyTarget: s.editWeeklyTarget,
      removeWeeklyTarget: s.removeWeeklyTarget,
      overrideWeeklyTopic: s.overrideWeeklyTopic
    }))
  )

  // Get current week's ISO week and year
  const [viewingDate, setViewingDate] = useState(getTodayISO())
  const viewingWeek = getISOWeek(viewingDate)
  const viewingYear = new Date(viewingDate).getFullYear()

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null) // { day, item }
  const [modalData, setModalData] = useState({
    subject: 'Maths',
    topic: '',
    targetMinutes: 90,
    examTag: null,
    recurring: true
  })

  // Generate week dates
  const weekDates = useMemo(() => {
    const date = new Date(viewingDate + 'T00:00:00')
    const day = date.getDay() // 0 is Sunday
    const monday = new Date(date)
    monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
    
    const dates = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      dates.push({
        dayAbbr: dayOrder[i],
        fullDate: d.toLocaleDateString('en-CA'),
        displayDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        isToday: d.toLocaleDateString('en-CA') === getTodayISO(),
        isPast: d < new Date(getTodayISO() + 'T00:00:00')
      })
    }
    return dates
  }, [viewingDate])

  // Helper to get overridden topic for a plan item
  const getResolvedTopic = (day, item) => {
    const date = weekDates.find(d => d.dayAbbr === day)?.fullDate
    if (!date) return item.topic
    const weekNum = getISOWeek(date)
    const key = `${date.slice(0, 4)}-W${weekNum}:${item.id}`
    return weeklyPlanOverrides[key] || item.topic
  }

  // Open modal to add/edit item
  const openAddModal = (day) => {
    setEditingItem({ day, item: null })
    setModalData({
      subject: 'Maths',
      topic: '',
      targetMinutes: 90,
      examTag: null,
      recurring: true
    })
    setShowModal(true)
  }

  const openEditModal = (day, item) => {
    setEditingItem({ day, item })
    setModalData({
      subject: item.subject,
      topic: item.topic,
      targetMinutes: item.targetMinutes,
      examTag: item.examTag,
      recurring: true
    })
    setShowModal(true)
  }

  const handleSaveModal = () => {
    if (editingItem.item) {
      // Edit existing
      editWeeklyTarget(editingItem.day, editingItem.item.id, modalData)
    } else {
      // Add new
      if (modalData.recurring) {
        addWeeklyTarget(editingItem.day, modalData)
      } else {
        // Non-recurring: add directly to dailyTargets via store action
        const { addAdHocTarget } = useAppStore.getState()
        const date = weekDates.find(d => d.dayAbbr === editingItem.day)?.fullDate
        if (date) {
          addAdHocTarget(date, { ...modalData, adHoc: true })
        }
      }
    }
    setShowModal(false)
  }

  // Handle week navigation
  const navigateWeek = (delta) => {
    const newDate = new Date(viewingDate + 'T00:00:00')
    newDate.setDate(newDate.getDate() + delta * 7)
    setViewingDate(newDate.toLocaleDateString('en-CA'))
  }

  return (
    <div className={isStandalonePrompt ? "" : "page-inner fade-in"} style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: '5px' }}>Weekly Planner</h1>
          <p style={{ color: 'var(--text4)', fontSize: '14px' }}>
            Week of {weekDates[0]?.displayDate} – {weekDates[6]?.displayDate}
          </p>
        </div>
        {!isStandalonePrompt && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn" onClick={() => navigateWeek(-1)}>← Prev</button>
            <button className="btn" onClick={() => navigateWeek(1)}>Next →</button>
          </div>
        )}
      </div>

      {/* Week Grid */}
      <div className="card" style={{ padding: '20px', overflowX: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(160px, 1fr))',
          gap: '15px'
        }}>
          {/* Day Headers */}
          {weekDates.map(({ dayAbbr, displayDate, isToday, isPast }) => (
            <div key={dayAbbr} style={{
              textAlign: 'center',
              padding: '12px 8px',
              borderBottom: isToday ? '2px solid var(--accent)' : '2px solid var(--border)',
              background: isToday ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
              borderRadius: '8px 8px 0 0'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '900', color: isToday ? 'var(--accent)' : 'var(--text)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {dayAbbr}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text4)', marginTop: '4px' }}>{displayDate}</div>
              {isToday && <div style={{ fontSize: '10px', color: 'var(--accent)', marginTop: '2px' }}>● TODAY</div>}
            </div>
          ))}

          {/* Day Columns */}
          {weekDates.map(({ dayAbbr, fullDate, isToday, isPast }) => {
            const items = weeklyPlan[dayAbbr] || []
            return (
              <div key={dayAbbr} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '5px'
              }}>
                {/* Items */}
                {items.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item, idx) => {
                  const topic = getResolvedTopic(dayAbbr, item)
                  const color = SUBJECT_COLORS[item.subject] || 'var(--accent)'
                  return (
                    <div
                      key={item.id}
                      className="card"
                      style={{
                        padding: '12px',
                        borderLeft: `4px solid ${color}`,
                        background: 'var(--bg3)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => openEditModal(dayAbbr, item)}
                    >
                      <div style={{ fontWeight: '900', fontSize: '12px', color: 'var(--text)' }}>
                        {item.subject}
                      </div>
                      {topic && <div style={{ fontSize: '11px', color: 'var(--text4)', margin: '4px 0' }}>{topic}</div>}
                      <div style={{ fontSize: '11px', color: 'var(--text4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⏱ {item.targetMinutes} mins
                      </div>
                      {item.examTag && (
                        <span style={{ fontSize: '10px', background: `${SUBJECT_COLORS[item.subject]}20`, padding: '2px 6px', borderRadius: '4px', marginTop: '6px', display: 'inline-block' }}>
                          {exams.find(e => e.id === item.examTag)?.label || item.examTag}
                        </span>
                      )}
                    </div>
                  )
                })}

                {/* Add Button */}
                <button
                  className="btn"
                  style={{
                    fontSize: '11px',
                    padding: '8px 12px',
                    width: '100%',
                    background: isToday ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg3)',
                    borderColor: isToday ? 'rgba(34, 197, 94, 0.3)' : 'var(--border)',
                    color: isToday ? 'var(--accent)' : 'var(--text3)',
                    fontWeight: '800'
                  }}
                  onClick={() => openAddModal(dayAbbr)}
                >
                  + Add Target
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Standalone Prompt Buttons */}
      {isStandalonePrompt && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="btn" style={{ flex: 1 }} onClick={onClose}>Skip for Today</button>
          <button className="btn btn-g" style={{ flex: 1 }} onClick={() => { localStorage.setItem('zh_last_plan_date', new Date().toISOString().split('T')[0]); onConfirm?.(); }}>Finish Planning</button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: '0',
          background: 'rgba(0,0,0, 0.8)',
          zIndex: '3000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card fade-in" style={{ maxWidth: '420px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '900' }}>
                {editingItem.item ? 'Edit Target' : 'Add Target'}
              </h3>
              <button className="btn" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Subject */}
              <div>
                <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Subject</label>
                <select
                  className="inp"
                  value={modalData.subject}
                  onChange={(e) => setModalData({ ...modalData, subject: e.target.value, topic: '' })}
                >
                  {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Topic</label>
                <input
                  type="text"
                  className="inp"
                  list={`topics-${modalData.subject}`}
                  value={modalData.topic}
                  onChange={(e) => setModalData({ ...modalData, topic: e.target.value })}
                />
                <datalist id={`topics-${modalData.subject}`}>
                  {(syllabusTopics[modalData.subject] || []).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </datalist>
              </div>

              {/* Duration */}
              <div>
                <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Duration (minutes)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[30, 45, 60, 90, 120].map(mins => (
                    <button
                      key={mins}
                      className="btn"
                      style={{ flex: 1, fontSize: '11px', padding: '6px' }}
                      onClick={() => setModalData({ ...modalData, targetMinutes: mins })}
                    >
                      {mins}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Tag */}
              {exams.length > 0 && (
                <div>
                  <label className="label-caps" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Exam Tag (optional)</label>
                  <select
                    className="inp"
                    value={modalData.examTag || ''}
                    onChange={(e) => setModalData({ ...modalData, examTag: e.target.value || null })}
                  >
                    <option value="">None</option>
                    {exams.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                  </select>
                </div>
              )}

              {/* Recurring Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="recurring"
                  checked={modalData.recurring}
                  onChange={(e) => setModalData({ ...modalData, recurring: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="recurring" style={{ fontSize: '13px', color: 'var(--text)' }}>
                  Recurring (repeats weekly)
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-g" style={{ flex: 1 }} onClick={handleSaveModal}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
