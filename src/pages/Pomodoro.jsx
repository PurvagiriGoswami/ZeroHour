import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useStore';
import { playTimerBeep } from '../utils/timerSound';

const MODES = {
  FOCUS: { label: 'FOCUS', min: 25, color: '#22c55e' },
  SHORT: { label: 'SHORT BREAK', min: 5, color: '#3b82f6' },
  LONG: { label: 'LONG BREAK', min: 15, color: '#3b82f6' },
};

const SUBJECTS = ['Mathematics', 'English', 'GK / GA', 'Science', 'AFCAT', 'SSB'];

export default function Pomodoro() {
  const { zh_pomodoro_today, setPomoToday, zh_sessions, setSessions } = useAppStore();
  
  const [mode, setMode] = useState('FOCUS');
  const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.min * 60);
  const [isActive, setIsActive] = useState(false);
  const [pomoCount, setPomoCount] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [customMin, setCustomMin] = useState(25);
  const [isCustom, setIsCustom] = useState(false);

  const timerRef = useRef(null);

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

  const handleComplete = () => {
    setIsActive(false);
    playTimerBeep();

    if (mode === 'FOCUS') {
      const newPomoCount = pomoCount + 1;
      setPomoCount(newPomoCount);
      setPomoToday(zh_pomodoro_today + 1);

      // Auto-log session
      const newSession = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        subject: selectedSubject,
        topic: 'Pomodoro Session',
        phase: 'Pomodoro Session',
        duration: isCustom ? customMin : MODES.FOCUS.min,
        notes: `Completed ${mode} session`,
      };
      setSessions([newSession, ...zh_sessions]);

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
  };

  const toggleTimer = () => setIsActive(!isActive);

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
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const progress = timeLeft / (isCustom ? customMin * 60 : MODES[mode].min * 60);
  const strokeDashoffset = 283 * (1 - progress);

  return (
    <div className="page-inner fade-in">
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div className="label-caps" style={{ marginBottom: 20 }}>Tactical Focus Unit</div>
        
        <div style={{ marginBottom: 30 }}>
          <select 
            className="inp" 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ width: '100%', maxWidth: 300, textAlign: 'center' }}
          >
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

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
            fontSize: 42, fontWeight: 700, color: 'var(--text)'
          }}>
            {formatTime(timeLeft)}
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

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="label-caps">Daily Performance</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>
          {zh_pomodoro_today} <span style={{ fontSize: 16 }}>🍅 today</span>
        </div>
      </div>
    </div>
  );
}
