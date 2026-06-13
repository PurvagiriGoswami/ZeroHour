import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { SUBJECT_COLORS } from '../data';

// Full list of possible subjects
const ALL_SUBJECTS = [
  'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology',
  'Polity', 'Geography', 'Economics', 'History-Ancient', 
  'History-Medieval', 'History-Modern', 'Reasoning', 'Revision', 
  'PYQ', 'Mock Test', 'Current Affairs'
];

// Day names
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeeklyPlanner({ onNav }) {
  const { 
    zh_weeklyTimetable, 
    setWeeklyTimetable,
    settings,
    setSettings
  } = useAppStore(
    useShallow(s => ({
      zh_weeklyTimetable: s.zh_weeklyTimetable,
      setWeeklyTimetable: s.setWeeklyTimetable,
      settings: s.settings,
      setSettings: s.setSettings
    }))
  );

  // Local state for modal
  const [editingSlot, setEditingSlot] = useState(null); // { dayIndex, slotIndex }
  const [tempSlot, setTempSlot] = useState({ subject: 'Mathematics', duration: 60 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDayIndex, setAddDayIndex] = useState(0);

  // Derive current week dates
  const weekDates = useMemo(() => {
    const d = new Date();
    const currentDay = d.getDay();
    const diff = d.getDate() - currentDay;
    const startOfWeek = new Date(d.setDate(diff));
    
    return DAY_NAMES.map((_, idx) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + idx);
      return {
        dayName: DAY_NAMES[idx],
        dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: new Date().toDateString() === date.toDateString()
      };
    });
  }, []);

  // Ensure timetable is initialized
  const getSafeTimetable = () => {
    if (!Array.isArray(zh_weeklyTimetable.dailySlots)) {
      return {
        ...zh_weeklyTimetable,
        dailySlots: DAY_NAMES.map(() => ({ slots: [] }))
      };
    }
    return zh_weeklyTimetable;
  };

  const safeTimetable = getSafeTimetable();

  // Add a slot to a specific day
  const addSlot = (dayIndex, subject = 'Mathematics', duration = 60) => {
    const updatedTimetable = { ...safeTimetable };
    if (!updatedTimetable.dailySlots[dayIndex]) {
      updatedTimetable.dailySlots[dayIndex] = { slots: [] };
    }
    if (!Array.isArray(updatedTimetable.dailySlots[dayIndex].slots)) {
      updatedTimetable.dailySlots[dayIndex].slots = [];
    }
    updatedTimetable.dailySlots[dayIndex].slots.push({ subject, duration });
    setWeeklyTimetable(updatedTimetable);
  };

  // Remove a slot from a specific day
  const removeSlot = (dayIndex, slotIndex) => {
    const updatedTimetable = { ...safeTimetable };
    updatedTimetable.dailySlots[dayIndex].slots.splice(slotIndex, 1);
    setWeeklyTimetable(updatedTimetable);
  };

  // Save slot changes
  const saveSlot = () => {
    if (!editingSlot) return;
    const updatedTimetable = { ...safeTimetable };
    updatedTimetable.dailySlots[editingSlot.dayIndex].slots[editingSlot.slotIndex] = { ...tempSlot };
    setWeeklyTimetable(updatedTimetable);
    setEditingSlot(null);
  };

  // Open add modal
  const openAddModal = (dayIndex) => {
    setAddDayIndex(dayIndex);
    setTempSlot({ subject: 'Mathematics', duration: 60 });
    setShowAddModal(true);
  };

  // Save added slot
  const saveAddSlot = () => {
    addSlot(addDayIndex, tempSlot.subject, tempSlot.duration);
    setShowAddModal(false);
  };

  // Reset entire week
  const resetWeek = () => {
    if (window.confirm('Are you sure you want to reset the entire timetable?')) {
      const cleanTimetable = {
        ...safeTimetable,
        dailySlots: DAY_NAMES.map(() => ({ slots: [] }))
      };
      setWeeklyTimetable(cleanTimetable);
    }
  };

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, flexWrap: 'wrap', gap: 15 }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: 5 }}>WEEKLY OPERATIONAL TIMETABLE</h1>
          <p style={{ color: 'var(--text4)', fontSize: 11 }}>
            Build your perfect study schedule, then use it daily in Daily Targets
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-g" onClick={() => onNav('targets')}>
            🎯 Daily Targets
          </button>
          <button className="btn" onClick={resetWeek}>
            🔄 Reset Week
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: 15,
          minWidth: 800
        }}>
          {/* Day Headers */}
          {weekDates.map(({ dayName, dateStr, isToday }) => (
            <div key={dayName} style={{ 
              textAlign: 'center', 
              padding: 10, 
              borderBottom: isToday ? '2px solid var(--green)' : '2px solid var(--border)',
              background: isToday ? 'rgba(34, 197, 94, 0.05)' : 'transparent'
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: isToday ? 'var(--green)' : '#fff' }}>
                {dayName.toUpperCase()}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text4)' }}>{dateStr}</div>
            </div>
          ))}
          
          {/* Day Columns */}
          {weekDates.map(({ dayName, isToday }, dayIndex) => (
            <div key={dayName} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 10,
              padding: 5
            }}>
              {/* Add Slot Button */}
              <button 
                className="btn" 
                style={{ 
                  fontSize: 10, 
                  padding: '6px 10px',
                  width: '100%',
                  background: isToday ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg3)',
                  borderColor: isToday ? 'var(--green)' : 'var(--border)'
                }}
                onClick={() => openAddModal(dayIndex)}
              >
                + Add Slot
              </button>

              {/* Slots */}
              {safeTimetable.dailySlots[dayIndex]?.slots?.map((slot, slotIndex) => {
                const subColor = SUBJECT_COLORS[slot.subject] || '#22c55e';
                return (
                  <div 
                    key={slotIndex}
                    className="card" 
                    style={{ 
                      padding: 12, 
                      borderLeft: `4px solid ${subColor}`,
                      background: 'var(--bg3)',
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5
                    }}
                    onClick={() => {
                      setEditingSlot({ dayIndex, slotIndex });
                      setTempSlot({ ...slot });
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 11, color: '#fff' }}>
                      {slot.subject.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text4)' }}>
                      ⏱ {slot.duration} mins
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 5 }}>
                      <button 
                        className="btn" 
                        style={{ 
                          padding: '3px 6px', 
                          fontSize: 9,
                          background: 'rgba(239, 68, 68, 0.1)',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                          color: 'var(--red)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSlot(dayIndex, slotIndex);
                        }}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.8)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: 20
        }}>
          <div className="card fade-in" style={{ maxWidth: 400, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Add Study Slot</h3>
              <button className="btn" style={{ padding: '4px 8px', fontSize: 10 }} onClick={() => setShowAddModal(false)}>
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div>
                <label className="label-caps" style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>
                  Subject
                </label>
                <select 
                  className="inp" 
                  value={tempSlot.subject} 
                  onChange={(e) => setTempSlot({ ...tempSlot, subject: e.target.value })}
                >
                  {ALL_SUBJECTS.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-caps" style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>
                  Duration (minutes)
                </label>
                <input 
                  type="number" 
                  className="inp" 
                  value={tempSlot.duration} 
                  onChange={(e) => setTempSlot({ ...tempSlot, duration: parseInt(e.target.value) || 60 })}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button className="btn" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-g" style={{ flex: 1 }} onClick={saveAddSlot}>
                  Add Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.8)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: 20
        }}>
          <div className="card fade-in" style={{ maxWidth: 400, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Edit Slot</h3>
              <button className="btn" style={{ padding: '4px 8px', fontSize: 10 }} onClick={() => setEditingSlot(null)}>
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div>
                <label className="label-caps" style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>
                  Subject
                </label>
                <select 
                  className="inp" 
                  value={tempSlot.subject} 
                  onChange={(e) => setTempSlot({ ...tempSlot, subject: e.target.value })}
                >
                  {ALL_SUBJECTS.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-caps" style={{ fontSize: 10, display: 'block', marginBottom: 8 }}>
                  Duration (minutes)
                </label>
                <input 
                  type="number" 
                  className="inp" 
                  value={tempSlot.duration} 
                  onChange={(e) => setTempSlot({ ...tempSlot, duration: parseInt(e.target.value) || 60 })}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button className="btn" style={{ flex: 1 }} onClick={() => setEditingSlot(null)}>
                  Cancel
                </button>
                <button className="btn btn-g" style={{ flex: 1 }} onClick={saveSlot}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
