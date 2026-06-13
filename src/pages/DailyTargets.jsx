import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { SUBJECT_COLORS, getDayName } from '../data';
import { getTodayStr, calculateDailySummary } from '../utils/tacticalEngine';

export default function DailyTargets({ onNav }) {
  const { 
    zh_weeklyTimetable,
    zh_dailyChecklist, setDailyChecklist,
    zh_dailySummaries, setDailySummaries,
    settings, profile
  } = useAppStore(
    useShallow(s => ({
      zh_weeklyTimetable: s.zh_weeklyTimetable,
      zh_dailyChecklist: s.zh_dailyChecklist,
      setDailyChecklist: s.setDailyChecklist,
      zh_dailySummaries: s.zh_dailySummaries,
      setDailySummaries: s.setDailySummaries,
      settings: s.settings,
      profile: s.profile
    }))
  );

  const today = getTodayStr();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEODReview, setIsEODReview] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [customTaskMins, setCustomTaskMins] = useState(30);

  // Initialize checklist for today if it doesn't exist
  useEffect(() => {
    if (!zh_weeklyTimetable) return;
    if (!zh_dailyChecklist[today]) {
      const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayDate = new Date();
      const dayName = dayMap[todayDate.getDay()];
      const dayIndex = todayDate.getDay();
      
      // Check if using new array-based structure or old object-based
      const daySlotData = Array.isArray(zh_weeklyTimetable.dailySlots) 
        ? (zh_weeklyTimetable.dailySlots[dayIndex] || {}) 
        : (zh_weeklyTimetable.dailySlots[dayName] || {});
      
      const newChecklist = {
        maths: null,
        english: null,
        economics: null,
        subjects: {},
        custom: [],
        revision: null,
        pyq: null,
        currentAffairs: null,
        mock: null,
      };
      
      // Handle new structure first
      if (Array.isArray(daySlotData.slots)) {
        daySlotData.slots.forEach((slot, idx) => {
          const subjectName = slot.subject;
          if (!subjectName) return;
          
          // Check if it's a core subject or other
          if (subjectName === 'Maths' || subjectName === 'Mathematics') {
            newChecklist.maths = { done: false, duration: slot.duration || 180 };
          } else if (subjectName === 'English') {
            newChecklist.english = { done: false, duration: slot.duration || 60, topics: [] };
          } else {
            // For other subjects, add to subjects with some default topics if available
            const currentPhase = zh_weeklyTimetable.subjectRotationTracker?.[subjectName] || 1;
            const syllabus = zh_weeklyTimetable.subjectSyllabus?.[subjectName] || [];
            const topics = syllabus[currentPhase - 1] || [];
            newChecklist.subjects[subjectName] = {};
            topics.forEach(topic => {
              newChecklist.subjects[subjectName][topic] = { understood: false, onepager: false };
            });
          }
        });
      } else {
        // Handle old structure
        newChecklist.maths = daySlotData.maths ? { done: false, duration: daySlotData.maths.duration } : null;
        newChecklist.english = daySlotData.english ? { done: false, duration: daySlotData.english.duration, topics: daySlotData.english.topics || [] } : null;
        newChecklist.economics = daySlotData.economics ? { done: false, duration: daySlotData.economics.duration, topics: daySlotData.economics.topics || [] } : null;
        newChecklist.revision = daySlotData.revision ? { done: false, duration: daySlotData.revision.duration } : null;
        newChecklist.pyq = daySlotData.pyq ? { done: false, duration: daySlotData.pyq.duration } : null;
        newChecklist.currentAffairs = daySlotData.currentAffairs ? { done: false, range: daySlotData.currentAffairs.range || '', months: daySlotData.currentAffairs.months || {} } : null;
        newChecklist.mock = daySlotData.mock ? { done: false } : null;

        const subjectsList = daySlotData.subjects || [];
        subjectsList.forEach((sub, slotIdx) => {
          const overrideSub = zh_weeklyTimetable.overrides?.[dayName]?.[slotIdx];
          const finalSubjectName = overrideSub || sub.name;
          const currentPhase = zh_weeklyTimetable.subjectRotationTracker?.[finalSubjectName] || 1;
          const syllabus = zh_weeklyTimetable.subjectSyllabus?.[finalSubjectName] || [];
          const topics = syllabus[currentPhase - 1] || [];

          newChecklist.subjects[finalSubjectName] = {};
          topics.forEach(topic => {
            newChecklist.subjects[finalSubjectName][topic] = { understood: false, onepager: false };
          });
        });
      }

      setDailyChecklist({
        ...zh_dailyChecklist,
        [today]: newChecklist
      });
    }
  }, [zh_dailyChecklist, zh_weeklyTimetable, today, setDailyChecklist]);

  // Current day's checklist
  const checklist = zh_dailyChecklist[today] || null;

  // Calculate estimated minutes for today's checklist
  const totalEstimatedMinutes = useMemo(() => {
    if (!checklist) return 0;
    let mins = 0;
    if (checklist.maths) mins += checklist.maths.duration || 0;
    if (checklist.english) mins += checklist.english.duration || 0;
    if (checklist.economics) mins += checklist.economics.duration || 0;
    if (checklist.revision) mins += checklist.revision.duration || 0;
    if (checklist.pyq) mins += checklist.pyq.duration || 0;
    
    // Add custom tasks
    if (checklist.custom) {
      checklist.custom.forEach(t => { mins += t.estimated_minutes || 0; });
    }

    // Add subject slots (give each subject a nominal 60 minutes)
    if (checklist.subjects) {
      mins += Object.keys(checklist.subjects).length * 60;
    }

    return mins;
  }, [checklist]);

  const maxMinutes = (settings.maxStudyHours || 8) * 60;

  // Add a custom target
  const handleAddCustomTask = (e) => {
    e.preventDefault();
    if (!checklist) return;

    const newTask = {
      id: `custom_${Date.now()}`,
      title: customTaskTitle,
      done: false,
      estimated_minutes: parseInt(customTaskMins) || 30
    };

    const updatedChecklist = {
      ...checklist,
      custom: [...(checklist.custom || []), newTask]
    };

    setDailyChecklist({
      ...zh_dailyChecklist,
      [today]: updatedChecklist
    });

    setCustomTaskTitle('');
    setCustomTaskMins(30);
    setShowAddForm(false);
  };

  // Toggle helpers
  const toggleMaths = () => {
    if (!checklist) return;
    setDailyChecklist({
      ...zh_dailyChecklist,
      [today]: {
        ...checklist,
        maths: { ...checklist.maths, done: !checklist.maths.done }
      }
    });
  };

  const toggleEconomics = () => {
    if (!checklist) return;
    setDailyChecklist({
      ...zh_dailyChecklist,
      [today]: {
        ...checklist,
        economics: { ...checklist.economics, done: !checklist.economics.done }
      }
    });
  };
  
  const toggleEnglish = () => {
    if (!checklist) return;
    setDailyChecklist({
      ...zh_dailyChecklist,
      [today]: {
        ...checklist,
        english: { ...checklist.english, done: !checklist.english.done }
      }
    });
  };

  const toggleGSSubState = (subjectName, topicName, subStateKey) => {
    if (!checklist) return;
    const subjectData = { ...checklist.subjects[subjectName] };
    const topicData = { ...subjectData[topicName] };
    topicData[subStateKey] = !topicData[subStateKey];
    subjectData[topicName] = topicData;

    setDailyChecklist({
      ...zh_dailyChecklist,
      [today]: {
        ...checklist,
        subjects: {
          ...checklist.subjects,
          [subjectName]: subjectData
        }
      }
    });
  };

  const toggleCustomTask = (id) => {
    if (!checklist) return;
    const updatedCustom = checklist.custom.map(t => 
      t.id === id ? { ...t, done: !t.done } : t
    );
    setDailyChecklist({
      ...zh_dailyChecklist,
      [today]: { ...checklist, custom: updatedCustom }
    });
  };

  const removeCustomTask = (id) => {
    if (!checklist) return;
    const updatedCustom = checklist.custom.filter(t => t.id !== id);
    setDailyChecklist({
      ...zh_dailyChecklist,
      [today]: { ...checklist, custom: updatedCustom }
    });
  };

  const toggleExtra = (key) => {
    if (!checklist) return;
    setDailyChecklist({
      ...zh_dailyChecklist,
      [today]: {
        ...checklist,
        [key]: { ...checklist[key], done: !checklist[key].done }
      }
    });
  };

  // Calculate completion statistics
  const stats = useMemo(() => {
    if (!checklist) return { total: 0, completed: 0, rate: 0 };
    let total = 0;
    let completed = 0;

    if (checklist.maths) {
      total += 1;
      if (checklist.maths.done) completed += 1;
    }
    if (checklist.english) {
      total += 1;
      if (checklist.english.done) completed += 1;
    }
    if (checklist.economics) {
      total += 1;
      if (checklist.economics.done) completed += 1;
    }
    if (checklist.revision) {
      total += 1;
      if (checklist.revision.done) completed += 1;
    }
    if (checklist.pyq) {
      total += 1;
      if (checklist.pyq.done) completed += 1;
    }
    if (checklist.currentAffairs) {
      total += 1;
      if (checklist.currentAffairs.done) completed += 1;
    }
    if (checklist.mock) {
      total += 1;
      if (checklist.mock.done) completed += 1;
    }

    if (checklist.custom) {
      checklist.custom.forEach(t => {
        total += 1;
        if (t.done) completed += 1;
      });
    }

    if (checklist.subjects) {
      Object.keys(checklist.subjects).forEach(subName => {
        const topicsObj = checklist.subjects[subName];
        Object.keys(topicsObj).forEach(topic => {
          total += 2; // Understood & Onepager
          if (topicsObj[topic].understood) completed += 1;
          if (topicsObj[topic].onepager) completed += 1;
        });
      });
    }

    return {
      total,
      completed,
      rate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [checklist]);

  const finishEODReview = () => {
    const summary = {
      date: today,
      total_objectives: stats.total,
      completed_objectives: stats.completed,
      completion_rate: stats.rate,
      study_hours: totalEstimatedMinutes / 60,
      xp_earned: Math.round(stats.rate * 0.3) // Base XP scaled with rate
    };
    
    // Add to summaries list
    setDailySummaries([...zh_dailySummaries, summary]);
    setShowSummary(true);
    setIsEODReview(false);
  };

  const getEncouragement = (rate) => {
    if (rate >= 100) return "Exceptional performance, Commander. Tactical objectives fully secured.";
    if (rate >= 80) return "Strong execution. Most objectives met. Maintain momentum.";
    if (rate >= 50) return "Mission partially successful. Evaluate blockers and adjust for tomorrow.";
    return "Operational setback detected. Deferring objectives. Rest and regroup.";
  };

  if (!checklist) {
    return (
      <div className="page-inner" style={{ textAlign: 'center', padding: 40 }}>
        Loading daily tactical matrix...
      </div>
    );
  }

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, flexWrap: 'wrap', gap: 15 }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: 5 }}>DAILY TARGET BRIEFING</h1>
          <p style={{ color: 'var(--text4)', fontSize: 11 }}>Complete checklist tasks auto-populated from your Weekly Timetable.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={() => onNav('planner')}>WEEK PLANNER</button>
          {!isEODReview && !showSummary && (
            <button className="btn btn-g" onClick={() => setShowAddForm(true)}>+ ADD CUSTOM TASK</button>
          )}
        </div>
      </div>

      {/* Progress Capacity Bar */}
      <div className="card" style={{ marginBottom: 20, padding: '15px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 11 }}>
          <span className="label-caps">DAILY CAPACITY BUDGET</span>
          <span>{Math.round(totalEstimatedMinutes / 60 * 10) / 10}h / {settings.maxStudyHours}h Cap</span>
        </div>
        <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${Math.min(100, (totalEstimatedMinutes / maxMinutes) * 100)}%`, 
            background: totalEstimatedMinutes > maxMinutes ? 'var(--red)' : 'var(--indigo)',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Main Checklist Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        
        {/* Core slots: Maths, English, & Economics */}
        {(checklist.maths || checklist.english || checklist.economics) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3 className="label-caps" style={{ fontSize: 10, color: 'var(--text4)' }}>CORE TIMETABLE SLOTS</h3>
            
            {checklist.maths && (
              <div className="card" style={{ borderLeft: `4px solid ${SUBJECT_COLORS['Maths']}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: checklist.maths.done ? 0.6 : 1 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, textDecoration: checklist.maths.done ? 'line-through' : 'none' }}>
                    MATHEMATICS CORE STUDY
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 4 }}>⏱ Target: {checklist.maths.duration} mins</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-g" style={{ padding: '5px 10px', fontSize: 10 }} onClick={toggleMaths}>
                    {checklist.maths.done ? '✓ COMPLETED' : 'MARK DONE'}
                  </button>
                  <button className="btn" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => onNav('session_logger')}>
                    📋 LOG SESSION
                  </button>
                </div>
              </div>
            )}
            
            {checklist.english && (
              <div className="card" style={{ borderLeft: `4px solid ${SUBJECT_COLORS['English'] || '#8b5cf6'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: checklist.english.done ? 0.6 : 1 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, textDecoration: checklist.english.done ? 'line-through' : 'none' }}>
                    ENGLISH FOCUS SLOT
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 4 }}>⏱ Target: {checklist.english.duration} mins</div>
                  {checklist.english.topics && checklist.english.topics.map(t => (
                    <span key={t} className="badge" style={{ background: 'rgba(255,255,255,0.05)', fontSize: 9, marginTop: 5, display: 'inline-block' }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-g" style={{ padding: '5px 10px', fontSize: 10 }} onClick={toggleEnglish}>
                    {checklist.english.done ? '✓ COMPLETED' : 'MARK DONE'}
                  </button>
                  <button className="btn" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => onNav('session_logger')}>
                    📋 LOG SESSION
                  </button>
                </div>
              </div>
            )}

            {checklist.economics && (
              <div className="card" style={{ borderLeft: `4px solid ${SUBJECT_COLORS['Economics']}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: checklist.economics.done ? 0.6 : 1 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, textDecoration: checklist.economics.done ? 'line-through' : 'none' }}>
                    ECONOMICS FOCUS SLOT
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 4 }}>⏱ Target: {checklist.economics.duration} mins</div>
                  {checklist.economics.topics && checklist.economics.topics.map(t => (
                    <span key={t} className="badge" style={{ background: 'rgba(255,255,255,0.05)', fontSize: 9, marginTop: 5, display: 'inline-block' }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-g" style={{ padding: '5px 10px', fontSize: 10 }} onClick={toggleEconomics}>
                    {checklist.economics.done ? '✓ COMPLETED' : 'MARK DONE'}
                  </button>
                  <button className="btn" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => onNav('session_logger')}>
                    📋 LOG SESSION
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GS Subjects */}
        {Object.keys(checklist.subjects).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3 className="label-caps" style={{ fontSize: 10, color: 'var(--text4)' }}>GS TIMETABLE SLOTS</h3>
            
            {Object.keys(checklist.subjects).map(subName => {
              const subColor = SUBJECT_COLORS[subName] || '#22c55e';
              const topics = checklist.subjects[subName];
              
              return (
                <div key={subName} className="card" style={{ borderLeft: `4px solid ${subColor}`, padding: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontWeight: 800, color: '#fff', fontSize: 12 }}>{subName.toUpperCase()}</span>
                    <button className="btn" style={{ padding: '3px 8px', fontSize: 9 }} onClick={() => onNav('session_logger')}>
                      📋 LOG {subName.toUpperCase()}
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.keys(topics).map(topicName => {
                      const topicState = topics[topicName];
                      return (
                        <div key={topicName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg3)', padding: 10, borderRadius: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', maxWidth: '60%' }}>{topicName}</span>
                          <div style={{ display: 'flex', gap: 10 }}>
                            {/* Understood Checkbox */}
                            <button 
                              onClick={() => toggleGSSubState(subName, topicName, 'understood')}
                              className="btn" 
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: 9, 
                                background: topicState.understood ? `${subColor}25` : 'transparent',
                                border: `1px solid ${topicState.understood ? subColor : 'var(--border)'}`,
                                color: topicState.understood ? subColor : 'var(--text3)'
                              }}
                            >
                              {topicState.understood ? '✓ Understood' : '☐ Understood'}
                            </button>
                            {/* One pager Checkbox */}
                            <button 
                              onClick={() => toggleGSSubState(subName, topicName, 'onepager')}
                              className="btn" 
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: 9, 
                                background: topicState.onepager ? `${subColor}25` : 'transparent',
                                border: `1px solid ${topicState.onepager ? subColor : 'var(--border)'}`,
                                color: topicState.onepager ? subColor : 'var(--text3)'
                              }}
                            >
                              {topicState.onepager ? '✓ One-Pager' : '☐ One-Pager'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Extras: Saturday / Sunday */}
        {(checklist.revision || checklist.pyq || checklist.currentAffairs || checklist.mock) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3 className="label-caps" style={{ fontSize: 10, color: 'var(--text4)' }}>WEEKEND EXTRAS & REVIEWS</h3>
            
            {checklist.revision && (
              <div className="card" style={{ borderLeft: '4px solid #fbbf24', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: checklist.revision.done ? 0.6 : 1 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, textDecoration: checklist.revision.done ? 'line-through' : 'none' }}>
                    WEEKLY ROLLUP REVISION
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 4 }}>⏱ Scope: Week's topics | Target: {checklist.revision.duration} mins</div>
                </div>
                <button className="btn btn-g" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => toggleExtra('revision')}>
                  {checklist.revision.done ? '✓ DONE' : 'MARK DONE'}
                </button>
              </div>
            )}

            {checklist.pyq && (
              <div className="card" style={{ borderLeft: '4px solid #8b5cf6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: checklist.pyq.done ? 0.6 : 1 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, textDecoration: checklist.pyq.done ? 'line-through' : 'none' }}>
                    PREVIOUS YEAR QUESTIONS (PYQ)
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 4 }}>⏱ Target: {checklist.pyq.duration} mins</div>
                </div>
                <button className="btn btn-g" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => toggleExtra('pyq')}>
                  {checklist.pyq.done ? '✓ DONE' : 'MARK DONE'}
                </button>
              </div>
            )}

            {checklist.currentAffairs && (
              <div className="card" style={{ borderLeft: '4px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: checklist.currentAffairs.done ? 0.6 : 1 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, textDecoration: checklist.currentAffairs.done ? 'line-through' : 'none' }}>
                    CURRENT AFFAIRS (CA) LOGGER
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 4 }}>Range: {checklist.currentAffairs.range || 'Monthly'} | Source: YouTube</div>
                </div>
                <button className="btn btn-g" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => toggleExtra('currentAffairs')}>
                  {checklist.currentAffairs.done ? '✓ DONE' : 'MARK DONE'}
                </button>
              </div>
            )}

            {checklist.mock && (
              <div className="card" style={{ borderLeft: '4px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: checklist.mock.done ? 0.6 : 1 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, textDecoration: checklist.mock.done ? 'line-through' : 'none' }}>
                    TACTICAL FULL MOCK TEST
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 4 }}>Requires timed, silent exam conditions.</div>
                </div>
                <button className="btn btn-g" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => toggleExtra('mock')}>
                  {checklist.mock.done ? '✓ DONE' : 'MARK DONE'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Custom Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 className="label-caps" style={{ fontSize: 10, color: 'var(--text4)' }}>CUSTOM TASKS</h3>
          
          {checklist.custom && checklist.custom.map(t => (
            <div key={t.id} className="card" style={{ borderLeft: '4px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: t.done ? 0.6 : 1 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
                <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 4 }}>⏱ Estimated: {t.estimated_minutes} mins</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-g" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => toggleCustomTask(t.id)}>
                  {t.done ? '✓ COMPLETED' : 'MARK DONE'}
                </button>
                <button className="btn btn-red" style={{ padding: '5px 10px', fontSize: 10 }} onClick={() => removeCustomTask(t.id)}>
                  REMOVE
                </button>
              </div>
            </div>
          ))}

          {(!checklist.custom || checklist.custom.length === 0) && (
            <div style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--text4)', paddingLeft: 10 }}>
              No custom targets configured for today.
            </div>
          )}
        </div>
      </div>

      {/* Add Custom Task Form */}
      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card fade-in" style={{ maxWidth: 450, width: '100%' }}>
            <div className="label-caps" style={{ marginBottom: 25 }}>Configure Custom Target</div>
            <form onSubmit={handleAddCustomTask} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div>
                <label className="label-caps" style={{ fontSize: 9, display: 'block', marginBottom: 5 }}>Task Title</label>
                <input 
                  className="inp" 
                  style={{ width: '100%' }} 
                  value={customTaskTitle} 
                  onChange={e => setCustomTaskTitle(e.target.value)} 
                  placeholder="e.g. Solve 50 algebra questions from last year" 
                  required 
                />
              </div>
              <div>
                <label className="label-caps" style={{ fontSize: 9, display: 'block', marginBottom: 5 }}>Estimated Time (Min)</label>
                <input 
                  type="number" 
                  className="inp" 
                  style={{ width: '100%' }} 
                  value={customTaskMins} 
                  onChange={e => setCustomTaskMins(e.target.value)} 
                  required 
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>CANCEL</button>
                <button type="submit" className="btn btn-g" style={{ flex: 1 }}>ADD TASK</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End of Day Review Initiate */}
      {!isEODReview && !showSummary && (
        <div style={{ marginTop: 40 }}>
          <button className="btn btn-c" style={{ width: '100%', padding: 15, fontWeight: 'bold' }} onClick={() => setIsEODReview(true)}>
            🚨 INITIATE END-OF-DAY REVIEW
          </button>
        </div>
      )}

      {/* EOD Review Active Banner */}
      {isEODReview && (
        <div className="card" style={{ marginTop: 40, border: '1px solid var(--amber)', background: 'rgba(245,158,11,0.02)', padding: 20 }}>
          <h3 style={{ color: 'var(--amber)', fontWeight: 'bold', marginBottom: 10 }}>EOD REVIEW IN PROGRESS</h3>
          <p style={{ fontSize: 11, color: 'var(--text4)', marginBottom: 20 }}>Verify all task completions. Once finalized, these results will be logged permanently in your Performance record.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => setIsEODReview(false)}>CANCEL REVIEW</button>
            <button className="btn btn-g" style={{ flex: 1, fontWeight: 'bold' }} onClick={finishEODReview}>FINALIZE MISSION REPORT</button>
          </div>
        </div>
      )}

      {/* Day Summary Report Modal */}
      {showSummary && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card fade-in" style={{ maxWidth: 400, width: '100%', textAlign: 'center', padding: 30 }}>
            <div className="label-caps" style={{ marginBottom: 20 }}>Daily Debrief Report</div>
            <div style={{ fontSize: 44, fontWeight: 900, color: 'var(--green)', marginBottom: 10 }}>
              {Math.round(stats.rate)}%
            </div>
            <div className="label-caps" style={{ fontSize: 10, color: 'var(--text4)', marginBottom: 25 }}>
              Task Completion Rate ({stats.completed} of {stats.total} secured)
            </div>
            <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text3)', lineHeight: 1.5, marginBottom: 30 }}>
              "{getEncouragement(stats.rate)}"
            </p>
            <button className="btn btn-g" style={{ width: '100%' }} onClick={() => setShowSummary(false)}>DISMISS REPORT</button>
          </div>
        </div>
      )}
    </div>
  );
}
