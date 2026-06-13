import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { DEFAULT_CDS_SYLLABUS, SUBJECT_COLORS } from '../data';

const SUBJECTS = [
  'Physics', 'Chemistry', 'Biology',
  'Polity', 'Geography', 'Economics',
  'History-Ancient', 'History-Medieval', 'History-Modern'
];

export default function SyllabusSetup({ onNav }) {
  const { zh_weeklyTimetable, setWeeklyTimetable } = useAppStore(
    useShallow(s => ({
      zh_weeklyTimetable: s.zh_weeklyTimetable,
      setWeeklyTimetable: s.setWeeklyTimetable
    }))
  );

  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [syllabusData, setSyllabusData] = useState({});

  // Initialize/Load local state from store
  useEffect(() => {
    if (zh_weeklyTimetable?.subjectSyllabus) {
      setSyllabusData(zh_weeklyTimetable.subjectSyllabus);
    } else {
      setSyllabusData(DEFAULT_CDS_SYLLABUS);
    }
  }, [zh_weeklyTimetable]);

  const activeSyllabus = syllabusData[selectedSubject] || [];

  const handleTopicChange = (phaseIndex, topicIndex, value) => {
    const updated = { ...syllabusData };
    const subjectList = [...(updated[selectedSubject] || [])];
    const phaseList = [...(subjectList[phaseIndex] || ['', '', ''])];
    phaseList[topicIndex] = value;
    subjectList[phaseIndex] = phaseList;
    updated[selectedSubject] = subjectList;
    setSyllabusData(updated);
  };

  const handleAddPhase = () => {
    const updated = { ...syllabusData };
    const subjectList = [...(updated[selectedSubject] || [])];
    subjectList.push(['', '', '']);
    updated[selectedSubject] = subjectList;
    setSyllabusData(updated);
  };

  const handleDeletePhase = (phaseIndex) => {
    const updated = { ...syllabusData };
    const subjectList = [...(updated[selectedSubject] || [])];
    subjectList.splice(phaseIndex, 1);
    updated[selectedSubject] = subjectList;
    setSyllabusData(updated);
  };

  const handleMovePhase = (phaseIndex, direction) => {
    const updated = { ...syllabusData };
    const subjectList = [...(updated[selectedSubject] || [])];
    const newIndex = phaseIndex + direction;
    if (newIndex < 0 || newIndex >= subjectList.length) return;
    
    // Swap
    const temp = subjectList[phaseIndex];
    subjectList[phaseIndex] = subjectList[newIndex];
    subjectList[newIndex] = temp;
    
    updated[selectedSubject] = subjectList;
    setSyllabusData(updated);
  };

  const handleResetToDefault = () => {
    if (window.confirm(`Reset syllabus for ${selectedSubject} to system default?`)) {
      const updated = { ...syllabusData };
      updated[selectedSubject] = DEFAULT_CDS_SYLLABUS[selectedSubject];
      setSyllabusData(updated);
    }
  };

  const handleSave = () => {
    const updatedTimetable = {
      ...(zh_weeklyTimetable || {}),
      subjectSyllabus: syllabusData
    };
    setWeeklyTimetable(updatedTimetable);
    alert('Operational syllabus configurations committed to database successfully!');
    if (onNav) onNav('planner');
  };

  const color = SUBJECT_COLORS[selectedSubject] || '#22c55e';

  return (
    <div className="page-inner fade-in" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, flexWrap: 'wrap', gap: 15 }}>
        <div>
          <h1 className="card-title" style={{ marginBottom: 5 }}>TACTICAL SYLLABUS EDITOR</h1>
          <p style={{ color: 'var(--text4)', fontSize: 11 }}>Reconfigure ordered phases and topic loadout lists.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={() => onNav && onNav('planner')}>
            ◀ BACK TO PLANNER
          </button>
          <button className="btn btn-g" onClick={handleSave}>
            💾 COMMIT CONFIGS
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="card" style={{ padding: 15, marginBottom: 20, display: 'flex', gap: 15, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text4)' }}>SELECT COMBAT SECTOR (SUBJECT)</span>
          <select 
            className="inp" 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ 
              borderColor: color, 
              color: '#fff', 
              background: 'var(--bg3)', 
              minWidth: 200,
              boxShadow: `0 0 8px ${color}22` 
            }}
          >
            {SUBJECTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ flexGrow: 1 }} />

        <button className="btn btn-red" onClick={handleResetToDefault} style={{ fontSize: 11 }}>
          ⚠️ REVERT TO DEFAULT
        </button>
      </div>

      {/* Phase List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        {activeSyllabus.map((phaseTopics, phaseIdx) => (
          <div 
            key={phaseIdx} 
            className="card" 
            style={{ 
              padding: 20, 
              borderLeft: `4px solid ${color}`,
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="badge" style={{ background: color, color: '#000', fontWeight: 'bold' }}>
                  PHASE {phaseIdx + 1}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                  ({phaseTopics.filter(Boolean).length} of 3 topics set)
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: 5 }}>
                <button 
                  className="btn" 
                  style={{ padding: '4px 8px', fontSize: 10 }} 
                  disabled={phaseIdx === 0}
                  onClick={() => handleMovePhase(phaseIdx, -1)}
                >
                  ▲ UP
                </button>
                <button 
                  className="btn" 
                  style={{ padding: '4px 8px', fontSize: 10 }} 
                  disabled={phaseIdx === activeSyllabus.length - 1}
                  onClick={() => handleMovePhase(phaseIdx, 1)}
                >
                  ▼ DOWN
                </button>
                <button 
                  className="btn btn-red" 
                  style={{ padding: '4px 8px', fontSize: 10 }}
                  onClick={() => handleDeletePhase(phaseIdx)}
                >
                  🗑 DELETE
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {[0, 1, 2].map(topicIdx => (
                <div key={topicIdx} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text4)' }}>TOPIC {topicIdx + 1}</label>
                  <input
                    type="text"
                    className="inp"
                    placeholder={`e.g. Topic ${topicIdx + 1}`}
                    value={phaseTopics[topicIdx] || ''}
                    onChange={(e) => handleTopicChange(phaseIdx, topicIdx, e.target.value)}
                    style={{ background: 'var(--bg3)', border: '1px solid var(--bg4)' }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {activeSyllabus.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text4)' }}>
            No phases configured for this subject. Add a new phase below.
          </div>
        )}

        <button 
          className="btn" 
          onClick={handleAddPhase}
          style={{ 
            border: '2px dashed var(--bg4)', 
            background: 'rgba(255,255,255,0.02)', 
            padding: 15,
            fontSize: 12,
            fontWeight: 'bold',
            marginTop: 10
          }}
        >
          ➕ ADD STRATEGIC PHASE (3 TOPICS)
        </button>
      </div>
    </div>
  );
}
