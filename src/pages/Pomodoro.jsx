import { useState, useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '../store/useStore';
import { playTimerBeep } from '../utils/timerSound';
import { MASTER_TOPICS } from '../data';

const MODES = {
  FOCUS: { label: 'FOCUS', min: 25, color: '#22c55e' },
  SHORT: { label: 'SHORT BREAK', min: 5, color: '#3b82f6' },
  LONG: { label: 'LONG BREAK', min: 15, color: '#3b82f6' },
};

const SUBJECTS = Object.keys(MASTER_TOPICS);

export default function Pomodoro() {
  const { zh_pomodoro_today, setPomoToday, zh_sessions, setSessions, settings, zh_xp, setXP } = useAppStore();
  
  const [mode, setMode] = useState('FOCUS');
  const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.min * 60);
  const [isActive, setIsActive] = useState(false);
  const [pomoCount, setPomoCount] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customMin, setCustomMin] = useState(25);
  const [isCustom, setIsCustom] = useState(false);
  const [showTagging, setShowTagging] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const timerRef = useRef(null);

  const topics = useMemo(() => {
    const subTopics = [];
    const sub = MASTER_TOPICS[selectedSubject];
    if (sub && sub.categories) {
      Object.values(sub.categories).forEach(cat => {
        cat.topics.forEach(t => subTopics.push(t.name));
      });
    }
    return subTopics;
  }, [selectedSubject]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (zh_pomodoro_today === settings.dailyPomoTarget) {
      setShowVictory(true);
      setTimeout(() => setShowVictory(false), 2000);
    }
  }, [zh_pomodoro_today, settings.dailyPomoTarget]);

  const handleComplete = () => {
    setIsActive(false);
    playTimerBeep();

    if (mode === 'FOCUS') {
      const newPomoCount = pomoCount + 1;
      setPomoCount(newPomoCount);
      const newCountToday = zh_pomodoro_today + 1;
      setPomoToday(newCountToday);

      // 10. Log completed pomodoros per subject & +8 XP
      setXP(zh_xp + 8);

      // Auto-log session
      const newSession = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        subject: selectedSubject,
        topic: selectedTopic || 'Pomodoro Session',
        phase: 'Pomodoro',
        duration: isCustom ? customMin : MODES.FOCUS.min,
        mood: null,
        notes: 'Pomodoro',
      };
      setSessions([newSession, ...zh_sessions]);

      setToastMsg(`+8 XP EARNED | Session logged — [${selectedSubject}: ${selectedTopic || 'Untagged'}]`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);

      if (newPomoCount % 4 === 0) {
        switchMode('LONG');
      } else {
        switchMode('SHORT');
      }
    } else {
      switchMode('FOCUS');
    }
  };

  const switchMode = (m) => {
    setIsActive(false);
    setIsCustom(false);
    setMode(m);
    setTimeLeft(MODES[m].min * 60);
    if (m === 'FOCUS') setShowTagging(true);
  };

  const toggleTimer = () => {
    if (!isActive && mode === 'FOCUS') setShowTagging(false);
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (isCustom) {
      setTimeLeft(customMin * 60);
    } else {
      setTimeLeft(MODES[mode].min * 60);
    }
  };

  const skipTimer = () => handleComplete();

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const min = Math.max(1, Math.min(90, customMin));
    setCustomMin(min);
    setIsCustom(true);
    setMode('FOCUS');
    setTimeLeft(min * 60);
    setIsActive(false);
    setShowTagging(true);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const progress = timeLeft / (isCustom ? customMin * 60 : MODES[mode].min * 60);
  const strokeDashoffset = 283 * (1 - progress);

  const dailyTarget = settings.dailyPomoTarget || 8;
  const targetProgress = (zh_pomodoro_today / dailyTarget) * 100;

  return (
    <div className="page-inner fade-in">
      {showVictory && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(255, 215, 0, 0.2)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 2000, pointerEvents: 'none'
        }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: '#ffd700', textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
            🎖 DAILY TARGET MET
          </div>
        </div>
      )}

      {showToast && (
        <div style={{ 
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', 
          background: 'var(--bg2)', padding: '12px 20px', borderRadius: 8, border: '1px solid var(--green)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', gap: 15, alignItems: 'center'
        }}>
          <div style={{ fontSize: 12 }}>{toastMsg}</div>
          <button className="btn" style={{ fontSize: 10, padding: '4px 8px' }}>Edit</button>
        </div>
      )}

      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div className="label-caps" style={{ marginBottom: 20 }}>Tactical Focus Unit</div>
        
        {showTagging && mode === 'FOCUS' && !isActive ? (
          <div className="fade-in" style={{ marginBottom: 30, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <div className="label-caps" style={{ fontSize: 10 }}>Select Objective</div>
            <select 
              className="inp" 
              value={selectedSubject} 
              onChange={(e) => { setSelectedSubject(e.target.value); setSelectedTopic(''); }}
              style={{ width: '100%', maxWidth: 300 }}
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              className="inp" 
              value={selectedTopic} 
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{ width: '100%', maxWidth: 300 }}
            >
              <option value="">Select Topic...</option>
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button className="btn" onClick={() => { setSelectedTopic(''); setShowTagging(false); }} style={{ fontSize: 10, padding: '4px 12px' }}>
              SKIP TAGGING
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: 30, minHeight: 40 }}>
            {mode === 'FOCUS' && (
              <>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{selectedSubject}</div>
                <div style={{ fontSize: 11, color: 'var(--text4)' }}>{selectedTopic || 'Untagged Operation'}</div>
              </>
            )}
          </div>
        )}

        <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 30px' }}>
          <svg width="200" height="200" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg4)" strokeWidth="2" />
            <circle 
              cx="50" cy="50" r="45" fill="none" 
              stroke={MODES[mode].color} 
              strokeWidth="2" 
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
            />
          </svg>
          <div style={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 42, fontWeight: 700, color: 'var(--text)' }}>
              {formatTime(timeLeft)}
            </div>
            {mode === 'FOCUS' && !selectedTopic && !showTagging && (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', fontSize: 8, 
                padding: '2px 6px', borderRadius: 4, display: 'inline-block', marginTop: 5
              }}>
                ⚠ UNTAGGED
              </div>
            )}
          </div>
        </div>

        <div className="label-caps" style={{ color: MODES[mode].color, marginBottom: 10 }}>{mode} PHASE</div>
        <div style={{ fontSize: 12, color: 'var(--text4)', marginBottom: 30 }}>
          {pomoCount % 4} / 4 to long break
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 30 }}>
          <button className="btn" onClick={toggleTimer} style={{ borderColor: 'var(--green)', minWidth: 100 }}>
            {isActive ? 'PAUSE' : 'START'}
          </button>
          <button className="btn" onClick={resetTimer} style={{ borderColor: 'var(--text4)' }}>RESET</button>
          <button className="btn" onClick={skipTimer} style={{ borderColor: 'var(--text4)' }}>SKIP</button>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 30 }}>
          {Object.keys(MODES).map(m => (
            <button 
              key={m} 
              className={`btn ${mode === m && !isCustom ? 'active' : ''}`}
              onClick={() => switchMode(m)}
              style={{ fontSize: 9, padding: '4px 8px' }}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
          <span className="label-caps">Custom:</span>
          <input 
            type="number" className="inp" style={{ width: 60, textAlign: 'center' }} 
            value={customMin} onChange={(e) => setCustomMin(e.target.value)} 
            min="1" max="90"
          />
          <button type="submit" className="btn" style={{ fontSize: 9, padding: '4px 8px' }}>SET</button>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="label-caps">Daily Performance</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>
            {zh_pomodoro_today} / {dailyTarget} 🍅
          </div>
        </div>
        <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${Math.min(100, targetProgress)}%`, 
            background: targetProgress >= 100 ? '#ffd700' : 'var(--green)',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>
    </div>
  );
}
