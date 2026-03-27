import { useState, useEffect, useRef } from 'react'
import { auth, db } from '../firebase'
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAppStore } from '../store/useStore'
import { useToast } from '../Toast'
import { SIMULATOR_QUESTIONS } from '../data/simulatorQuestions'
import { ENHANCED_PYQ_BANK } from '../data/enhancedPyqBank'
import { playTimerEndBeep } from '../utils/timerSound'

const MODES = [
  { id: 'cds-en', label: 'CDS English', questions: 100, time: 120, subject: 'English' },
  { id: 'cds-gk', label: 'CDS GK', questions: 100, time: 120, subject: 'GK' },
  { id: 'cds-mt', label: 'CDS Maths', questions: 100, time: 120, subject: 'Maths' },
  { id: 'afcat',  label: 'AFCAT', questions: 100, time: 120, subject: 'Mixed' },
  { id: 'ai-mock', label: 'AI Dynamic Mock', questions: 100, time: 120, subject: 'AI', isAI: true },
  { id: 'custom', label: 'Custom Challenge', questions: 50, time: 60, subject: 'Mixed' }
]

export default function Simulator() {
  const user = auth.currentUser
  const toast = useToast()
  const store = useAppStore()
  const [view, setView] = useState('lobby') // lobby, rules, exam, result
  const [mode, setMode] = useState(MODES[0])
  const [session, setSession] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState({})
  const [marked, setMarked] = useState(new Set())
  const [dynamicMock, setDynamicMock] = useState(null)
  const timerRef = useRef(null)

  // Load dynamic mock if it exists
  useEffect(() => {
    const loadMock = async () => {
      try {
        const m = await import('../data/dynamic_mock_test.json');
        if (m && m.default && m.default.questions) {
          setDynamicMock(m.default);
          console.log('Dynamic mock loaded successfully');
        } else {
          console.log('Dynamic mock file is empty or invalid format');
        }
      } catch (err) {
        console.log('Dynamic mock not found or error loading:', err.message);
      }
    };
    loadMock();
  }, [])

  // ── Hooks (Must be top-level) ──

  // Timer logic
  useEffect(() => {
    if (view !== 'exam' || !session) return

    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id)
          playTimerEndBeep()
          endSimulation()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [view, session])

  // Keyboard shortcuts
  useEffect(() => {
    if (view !== 'exam' || !session) return

    const handler = e => {
      const key = e.key.toUpperCase()
      if (['A','B','C','D'].includes(key)) {
        setResponses(prev => ({ ...prev, [currentIndex]: key }))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [view, session, currentIndex])

  function startSimulation() {
    let selected = []
    
    if (mode.id === 'ai-mock') {
      // Advanced randomized generation from 500+ question bank
      const pool = [...ENHANCED_PYQ_BANK]
      
      // Adaptive Difficulty Logic:
      // Distribution: 20% Hard, 50% Medium, 30% Easy
      const hardCount = Math.floor(mode.questions * 0.2)
      const medCount = Math.floor(mode.questions * 0.5)
      const easyCount = mode.questions - (hardCount + medCount)

      const hards = pool.filter(q => q.difficulty === 'hard').sort(() => 0.5 - Math.random()).slice(0, hardCount)
      const meds = pool.filter(q => q.difficulty === 'medium').sort(() => 0.5 - Math.random()).slice(0, medCount)
      const easys = pool.filter(q => q.difficulty === 'easy').sort(() => 0.5 - Math.random()).slice(0, easyCount)
      
      selected = [...hards, ...meds, ...easys].sort(() => 0.5 - Math.random())
    } else {
      // Randomly sample questions from legacy bank
      const pool = SIMULATOR_QUESTIONS.filter(q => mode.subject === 'Mixed' || q.subject === mode.subject)
      const shuffled = [...pool].sort(() => 0.5 - Math.random())
      selected = shuffled.slice(0, mode.questions)
    }

    const newSession = {
      mode,
      questions: selected,
      startTime: Date.now()
    }
    
    setSession(newSession)
    setCurrentIndex(0)
    setResponses({})
    setMarked(new Set())
    setTimeLeft(mode.time * 60)
    setView('exam')
    
    // Hide main navigation
    document.body.classList.add('simulator-active')
  }

  function endSimulation() {
    document.body.classList.remove('simulator-active')
    if (timerRef.current) clearInterval(timerRef.current)

    // Calculate score
    let correct = 0, wrong = 0, unattempted = 0
    const questions = session.questions

    questions.forEach((q, i) => {
      const res = responses[i]
      if (!res) unattempted++
      else if (res === q.correct) correct++
      else wrong++
    })

    const score = (correct * 1) - (wrong * 0.33)
    const timeTaken = Math.round((Date.now() - session.startTime) / 1000)

    const result = {
      id: Date.now(),
      date: new Date().toISOString(),
      mode: session.mode.label,
      score: parseFloat(score.toFixed(2)),
      correct, wrong, unattempted,
      total: questions.length,
      timeTaken
    }

    // Save to Firestore
    if (user) {
      addDoc(collection(db, 'users', user.uid, 'simulatorResults'), {
        ...result,
        timestamp: serverTimestamp()
      })
    }

    setSession(s => ({ ...s, result }))
    setView('result')
  }

  // ── Render Views ──

  // Lobby View
  if (view === 'lobby') {
    return (
      <div className="page-inner fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px', paddingTop: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', fontFamily: "'Orbitron', sans-serif" }}>EXAM SIMULATOR</h1>
          <p style={{ color: 'var(--text4)', fontSize: '14px' }}>Battle-tested environment for UPSC standard preparation.</p>
        </div>

        <div className="g3" style={{ gap: '20px', marginBottom: '40px' }}>
          {MODES.map(m => (
            <button 
              key={m.id}
              onClick={() => setMode(m)}
              style={{
                padding: '32px 24px', borderRadius: '24px', textAlign: 'left',
                border: `1px solid ${mode.id === m.id ? 'var(--indigo)' : 'var(--border)'}`,
                background: mode.id === m.id ? 'rgba(99,102,241,0.1)' : 'var(--bg2)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                opacity: m.isAI && !dynamicMock ? 0.6 : 1
              }}
            >
              {mode.id === m.id && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--indigo)' }} />}
              <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: mode.id === m.id ? 'var(--text)' : 'var(--text2)' }}>
                {m.label} {m.isAI && <span style={{ fontSize: '10px', background: 'var(--indigo)', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>AI POWERED</span>}
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text4)', fontWeight: '700' }}>
                <span>{m.questions} QS</span>
                <span>•</span>
                <span>{m.time} MIN</span>
                {m.isAI && !dynamicMock && <span style={{ color: 'var(--red)' }}>• NOT GENERATED</span>}
              </div>
            </button>
          ))}
        </div>

        <button 
          className="btn btn-c" 
          style={{ width: '100%', padding: '20px', borderRadius: '16px', fontSize: '16px', fontWeight: '900' }}
          onClick={() => setView('rules')}
        >
          SELECT MISSION
        </button>
      </div>
    )
  }

  // Rules View
  if (view === 'rules') {
    return (
      <div className="page-inner fade-in" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '60px' }}>
        <div className="card" style={{ padding: '40px', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', color: 'var(--indigo)', fontFamily: "'Orbitron', sans-serif" }}>ENGAGEMENT RULES</h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text2)', fontSize: '14px', listStyle: 'none', padding: 0 }}>
            <li>• <strong>Negative Marking:</strong> -0.33 for every incorrect response.</li>
            <li>• <strong>Reward:</strong> +1.00 for every correct response.</li>
            <li>• <strong>Time:</strong> Mission auto-terminates when clock reaches zero.</li>
            <li>• <strong>Review:</strong> You can mark questions for later review via the palette.</li>
            <li>• <strong>Keyboard:</strong> Use A, B, C, D keys for rapid response selection.</li>
          </ul>
          <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => setView('lobby')}>BACK</button>
            <button className="btn btn-c" style={{ flex: 2 }} onClick={startSimulation}>BEGIN SIMULATION</button>
          </div>
        </div>
      </div>
    )
  }

  // Exam View
  if (view === 'exam' && session) {
    const q = session.questions[currentIndex]
    const currentRes = responses[currentIndex]
    const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 10000, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ height: '70px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'var(--bg2)' }}>
          <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: "'Orbitron', sans-serif" }}>ZEROHOUR SIMULATOR</div>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text4)', fontWeight: '800' }}>REMAINING</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: timeLeft < 600 ? 'var(--red)' : 'var(--indigo)', fontFamily: "'JetBrains Mono', monospace" }}>{formatTime(timeLeft)}</div>
            </div>
            <button className="btn btn-r" onClick={() => { if(window.confirm('Terminate mission? Data will not be saved.')) { document.body.classList.remove('simulator-active'); setView('lobby'); } }}>EXIT</button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Main Question Area */}
          <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '700px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text4)' }}>QUESTION {currentIndex + 1} / {session.questions.length}</span>
                <button 
                  className={`btn ${marked.has(currentIndex) ? 'btn-c' : ''}`} 
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                  onClick={() => {
                    const newMarked = new Set(marked)
                    if (newMarked.has(currentIndex)) newMarked.delete(currentIndex)
                    else newMarked.add(currentIndex)
                    setMarked(newMarked)
                  }}
                >
                  {marked.has(currentIndex) ? '★ MARKED' : '☆ MARK FOR REVIEW'}
                </button>
              </div>

              <div style={{ fontSize: '22px', fontWeight: '800', lineHeight: 1.4, marginBottom: '24px' }}>{q.question}</div>
              
              {q.type && (
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '10px', background: 'var(--bg3)', padding: '4px 10px', borderRadius: '4px', color: 'var(--indigo)', fontWeight: '900', textTransform: 'uppercase' }}>
                    {q.type} Question
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['A','B','C','D'].map((key, i) => (
                  <button 
                    key={key}
                    onClick={() => setResponses(prev => ({ ...prev, [currentIndex]: key }))}
                    style={{
                      padding: '20px', borderRadius: '16px', textAlign: 'left', fontSize: '16px', fontWeight: '700',
                      border: `1px solid ${currentRes === key ? 'var(--indigo)' : 'var(--border)'}`,
                      background: currentRes === key ? 'rgba(99,102,241,0.1)' : 'var(--bg3)',
                      color: currentRes === key ? 'var(--text)' : 'var(--text2)',
                      display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.1s'
                    }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{key}</div>
                    {q.options[i]}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px' }}>
                <button className="btn" disabled={currentIndex === 0} onClick={() => setCurrentIndex(i => i - 1)}>PREVIOUS</button>
                {currentIndex === session.questions.length - 1 ? (
                  <button className="btn btn-c" onClick={endSimulation}>FINISH MISSION</button>
                ) : (
                  <button className="btn btn-c" onClick={() => setCurrentIndex(i => i + 1)}>NEXT QUESTION</button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Palette */}
          <div style={{ width: '320px', borderLeft: '1px solid var(--border)', background: 'var(--bg2)', padding: '24px', overflowY: 'auto' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text4)', marginBottom: '20px', textTransform: 'uppercase' }}>Navigation Palette</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {session.questions.map((_, i) => {
                const res = responses[i]
                const isMarked = marked.has(i)
                let bg = 'var(--bg3)', border = 'var(--border)', color = 'var(--text4)'
                
                if (res && isMarked) { bg = 'var(--indigo)'; color = 'white'; }
                else if (res) { bg = 'var(--green)'; color = 'black'; }
                else if (isMarked) { bg = 'var(--gold)'; color = 'black'; }
                
                return (
                  <button 
                    key={i} 
                    onClick={() => setCurrentIndex(i)}
                    style={{
                      height: '40px', borderRadius: '8px', border: `1px solid ${currentIndex === i ? 'var(--text)' : border}`,
                      background: bg, color, fontSize: '11px', fontWeight: '800'
                    }}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Result View
  if (view === 'result' && session?.result) {
    const { result } = session
    return (
      <div className="page-inner fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
        <div className="card" style={{ padding: '60px 40px', borderRadius: '32px', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--indigo)', letterSpacing: '3px', marginBottom: '24px' }}>MISSION DEBRIEF</div>
          <div style={{ fontSize: '80px', fontWeight: '900', color: 'var(--text)', lineHeight: 1 }}>{result.score}<span style={{ fontSize: '24px', color: 'var(--text4)' }}>PTS</span></div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text3)', marginTop: '16px' }}>{result.mode} · {Math.floor(result.timeTaken/60)}m {result.timeTaken%60}s</div>
          
          <div className="g3 keep" style={{ gap: '16px', marginTop: '48px' }}>
            <div style={{ background: 'var(--bg3)', padding: '24px', borderRadius: '20px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--green)' }}>{result.correct}</div>
              <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text4)' }}>CORRECT</div>
            </div>
            <div style={{ background: 'var(--bg3)', padding: '24px', borderRadius: '20px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--red)' }}>{result.wrong}</div>
              <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text4)' }}>INCORRECT</div>
            </div>
            <div style={{ background: 'var(--bg3)', padding: '24px', borderRadius: '20px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text3)' }}>{result.unattempted}</div>
              <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text4)' }}>SKIPPED</div>
            </div>
          </div>

          <button className="btn btn-c" style={{ width: '100%', marginTop: '48px' }} onClick={() => setView('lobby')}>RETURN TO COMMAND CENTER</button>
        </div>

        {/* AI Insight Section for Result */}
        {session.mode.isAI && (
          <div className="card" style={{ padding: '40px', borderRadius: '32px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '24px', fontFamily: "'Orbitron', sans-serif" }}>PREDICTIVE PERFORMANCE ANALYSIS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {session.questions.map((q, i) => {
                const isCorrect = responses[i] === q.correct_answer
                if (isCorrect) return null // Only show explanations for mistakes or unattempted
                return (
                  <div key={i} style={{ padding: '24px', borderRadius: '20px', background: 'var(--bg3)', borderLeft: '4px solid var(--red)' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '12px', color: 'var(--text2)' }}>QUESTION {i + 1} • {q.topic}</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>{q.question}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text4)', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', lineHeight: 1.6 }}>
                      <strong style={{ color: 'var(--indigo)', display: 'block', marginBottom: '8px' }}>AI EXPLANATION:</strong>
                      {q.explanation || "No detailed explanation available for this PYQ."}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
