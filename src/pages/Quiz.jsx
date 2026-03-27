import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { useAppStore } from '../store/useStore'
import { useToast } from '../Toast'
import { generateQuiz } from '../utils/vocabEngine'

export default function Quiz() {
  const { state } = useStore()
  const { quizResults = [], settings = {} } = state || {}
  const setQuizResults = useAppStore(s => s.setQuizResults)
  const toast = useToast()

  const [session, setSession] = useState({
    active: false,
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [],
    startTime: null,
    completed: false,
    result: null,
    showExplanation: false
  })
  
  const [selectedOption, setSelectedOption] = useState(null)

  const startQuiz = () => {
    const difficulty = settings.quizDifficulty || 'mixed'
    const count = settings.questionsPerQuiz || 10
    const qs = generateQuiz(count, difficulty)
    
    if (!qs || qs.length === 0) {
      toast('Error generating quiz. Please try again.', 'err')
      return
    }

    setSession({
      active: true,
      questions: qs,
      currentIndex: 0,
      score: 0,
      answers: [],
      startTime: Date.now(),
      completed: false,
      result: null,
      showExplanation: false
    })
    setSelectedOption(null)
  }

  const handleOptionSelect = (opt) => {
    if (session.showExplanation) return
    setSelectedOption(opt)
    setSession(s => ({ ...s, showExplanation: true }))
  }

  const nextQuestion = () => {
    const q = session.questions[session.currentIndex]
    const isCorrect = selectedOption === q.correct
    const newAnswers = [...session.answers, {
      ...q, selected: selectedOption, isCorrect
    }]
    const newScore = isCorrect ? session.score + 1 : session.score
    const nextIdx = session.currentIndex + 1

    if (nextIdx >= session.questions.length) {
      const res = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        score: newScore,
        totalQuestions: session.questions.length,
        answers: newAnswers,
        timeTaken: Math.round((Date.now() - session.startTime) / 1000),
        type: 'Daily Challenge'
      }
      setQuizResults([...quizResults, res])
      setSession(s => ({ ...s, completed: true, result: res, active: false }))
    } else {
      setSession(s => ({ ...s, currentIndex: nextIdx, score: newScore, answers: newAnswers, showExplanation: false }))
      setSelectedOption(null)
    }
  }

  if (!session.active && !session.completed) {
    return (
      <div className="page-inner fade-in" style={{maxWidth:600, margin:'0 auto', textAlign:'center', paddingTop:80}}>
        <div style={{fontSize:64, marginBottom:24}}>🎯</div>
        <h1 style={{fontSize:32, fontWeight:900, marginBottom:16, fontFamily:"'Orbitron', sans-serif"}}>DAILY CHALLENGE</h1>
        <p style={{color:'var(--text3)', marginBottom:40, lineHeight:1.6}}>
          Test your vocabulary and English proficiency with UPSC-standard questions. 
          Each challenge is adaptive based on your performance.
        </p>
        <div className="card" style={{padding:32, marginBottom:40, border:'1px solid var(--border)'}}>
          <div className="g2 keep">
            <div style={{textAlign:'left'}}>
              <div style={{fontSize:10, fontWeight:800, color:'var(--text4)', letterSpacing:1}}>DIFFICULTY</div>
              <div style={{fontSize:14, fontWeight:700, color:'var(--indigo)'}}>{settings.quizDifficulty?.toUpperCase() || 'MIXED'}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:10, fontWeight:800, color:'var(--text4)', letterSpacing:1}}>QUESTIONS</div>
              <div style={{fontSize:14, fontWeight:700, color:'var(--text)'}}>{settings.questionsPerQuiz || 10}</div>
            </div>
          </div>
        </div>
        <button className="btn btn-c" style={{width:'100%', padding:20, borderRadius:16, fontSize:16, fontWeight:900}} onClick={startQuiz}>
          BEGIN MISSION
        </button>
      </div>
    )
  }

  if (session.completed && session.result) {
    const { result } = session
    const pct = Math.round(result.score / result.totalQuestions * 100)
    return (
      <div className="page-inner fade-in" style={{maxWidth:800, margin:'0 auto'}}>
        <div className="card" style={{borderRadius:32, padding:'48px 32px', textAlign:'center', background:'var(--bg2)', border:`2px solid ${pct >= 70 ? 'var(--green)' : 'var(--red)'}`, position:'relative', overflow:'hidden', marginBottom:32}}>
          <div style={{fontSize:12, fontWeight:800, color: pct >= 70 ? 'var(--green)' : 'var(--red)', letterSpacing:2, marginBottom:24, textTransform:'uppercase'}}>
            {pct >= 80 ? '🎖️ MISSION ACCOMPLISHED' : pct >= 60 ? '⚡ SOLID PROGRESS' : '📚 STRATEGIC REVIEW NEEDED'}
          </div>
          <div style={{fontSize:80, fontWeight:900, color:'var(--text)', lineHeight:1}}>{result.score}<span style={{fontSize:32, color:'var(--text4)'}}>/ {result.totalQuestions}</span></div>
          <div style={{fontSize:16, fontWeight:700, color:'var(--text3)', marginTop:16}}>Accuracy: {pct}% · Time: {result.timeTaken}s</div>
          <button className="btn btn-c" style={{marginTop:40, width:'100%'}} onClick={startQuiz}>RETAKE CHALLENGE</button>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          {result.answers.map((ans, i) => (
            <div key={i} className="card" style={{padding:24, border:`1px solid ${ans.isCorrect ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)'}`}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
                <span style={{fontSize:10, fontWeight:800, color:'var(--text4)'}}>QUESTION {i+1}</span>
                <span style={{fontSize:10, fontWeight:800, color: ans.isCorrect ? 'var(--green)' : 'var(--red)'}}>{ans.isCorrect ? 'CORRECT' : 'INCORRECT'}</span>
              </div>
              <div style={{fontSize:15, fontWeight:700, marginBottom:16}}>{ans.question}</div>
              <div style={{fontSize:13, color:'var(--text3)', background:'var(--bg3)', padding:16, borderRadius:12, borderLeft:`4px solid ${ans.isCorrect ? 'var(--green)' : 'var(--red)'}`}}>
                <strong>Explanation:</strong> {ans.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const q = session.questions[session.currentIndex]
  return (
    <div className="page-inner fade-in" style={{maxWidth:700, margin:'0 auto'}}>
      <div style={{marginBottom:32}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <span style={{fontSize:12, fontWeight:800, color:'var(--text4)', letterSpacing:1}}>QUESTION {session.currentIndex + 1} OF {session.questions.length}</span>
          <span style={{fontSize:12, fontWeight:800, color:'var(--indigo)'}}>SCORE: {session.score}</span>
        </div>
        <div style={{height:6, background:'var(--bg3)', borderRadius:3, overflow:'hidden'}}>
          <div style={{height:'100%', background:'var(--indigo)', width:`${((session.currentIndex + 1) / session.questions.length) * 100}%`, transition:'width 0.3s ease'}} />
        </div>
      </div>

      <div className="card" style={{padding:40, borderRadius:24, border:'1px solid var(--border)', marginBottom:24}}>
        <div style={{fontSize:20, fontWeight:800, marginBottom:32, lineHeight:1.4}}>{q.question}</div>
        
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {q.options.map((opt, i) => {
            let state = 'default'
            if (session.showExplanation) {
              if (opt === q.correct) state = 'correct'
              else if (opt === selectedOption) state = 'wrong'
              else state = 'dim'
            } else if (opt === selectedOption) {
              state = 'selected'
            }

            const styles = {
              default: { background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text2)' },
              selected: { background:'rgba(99,102,241,0.1)', border:'1px solid var(--indigo)', color:'var(--text)' },
              correct: { background:'rgba(63,185,80,0.1)', border:'1px solid var(--green)', color:'var(--green)' },
              wrong: { background:'rgba(248, 81, 73, 0.1)', border:'1px solid var(--red)', color:'var(--red)' },
              dim: { background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text4)', opacity:0.5 }
            }

            return (
              <button
                key={i}
                onClick={() => handleOptionSelect(opt)}
                disabled={session.showExplanation}
                style={{
                  ...styles[state],
                  padding:18, borderRadius:16, textAlign:'left', fontSize:15, fontWeight:700,
                  transition:'all 0.2s ease', cursor: session.showExplanation ? 'default' : 'pointer',
                  display:'flex', alignItems:'center', gap:12
                }}
              >
                <div style={{
                  width:24, height:24, borderRadius:'50%', background:'rgba(255,255,255,0.05)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:10
                }}>{String.fromCharCode(65 + i)}</div>
                {opt}
              </button>
            )
          })}
        </div>

        {session.showExplanation && (
          <div className="fade-in" style={{marginTop:32, padding:24, background:'var(--bg3)', borderRadius:20, borderLeft:'4px solid var(--indigo)'}}>
            <div style={{fontSize:11, fontWeight:800, color:'var(--text4)', marginBottom:8, textTransform:'uppercase'}}>Explanation</div>
            <div style={{fontSize:14, color:'var(--text2)', lineHeight:1.5}}>{q.explanation}</div>
            <button className="btn btn-c" style={{marginTop:24, width:'100%'}} onClick={nextQuestion}>
              {session.currentIndex === session.questions.length - 1 ? 'FINISH CHALLENGE' : 'NEXT QUESTION'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
