import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { useAppStore } from '../store/useStore'
import { useToast } from '../Toast'
import { getSynonyms, getAntonyms, IDIOMS_AND_PHRASES } from '../utils/vocabEngine'

export default function Quiz() {
  const { state } = useStore()
  const { vocab, quizResults, settings } = state
  const setQuizResults = useAppStore(s => s.setQuizResults)
  const toast = useToast()

  const [quizState, setQuizState] = useState(null) // null = not started
  const [selectedOption, setSelectedOption] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const questionsPerQuiz = settings.questionsPerQuiz || 10

  // Check if quiz is due (every 7 days from first vocab entry)
  const quizDue = useMemo(() => {
    if (vocab.length < 4) return false
    if (quizResults.length === 0) return true
    const lastQuiz = quizResults[quizResults.length - 1]
    if (!lastQuiz?.date) return true
    const daysSince = Math.floor((Date.now() - new Date(lastQuiz.date).getTime()) / 86400000)
    return daysSince >= (settings.quizFrequency || 7)
  }, [vocab, quizResults, settings.quizFrequency])

  // Generate quiz questions
  function generateQuestions() {
    const questions = []
    const vocabWords = [...vocab].sort(() => Math.random() - 0.5)

    // Type 1: Synonym questions
    vocabWords.slice(0, Math.ceil(questionsPerQuiz * 0.3)).forEach(w => {
      const syns = w.synonyms?.length ? w.synonyms : getSynonyms(w.word)
      if (syns.length === 0) return
      const correct = syns[Math.floor(Math.random() * syns.length)]
      const wrongs = generateWrongOptions(correct, vocabWords, 'synonym')
      if (wrongs.length < 3) return
      questions.push({
        type: 'synonym', subject: 'English', topic: 'Synonyms',
        question: `Choose the SYNONYM of "${w.word}"`,
        options: shuffle([correct, ...wrongs.slice(0, 3)]),
        correct, word: w.word,
      })
    })

    // Type 2: Antonym questions
    vocabWords.slice(0, Math.ceil(questionsPerQuiz * 0.3)).forEach(w => {
      const ants = w.antonyms?.length ? w.antonyms : getAntonyms(w.word)
      if (ants.length === 0) return
      const correct = ants[Math.floor(Math.random() * ants.length)]
      const wrongs = generateWrongOptions(correct, vocabWords, 'antonym')
      if (wrongs.length < 3) return
      questions.push({
        type: 'antonym', subject: 'English', topic: 'Antonyms',
        question: `Choose the ANTONYM of "${w.word}"`,
        options: shuffle([correct, ...wrongs.slice(0, 3)]),
        correct, word: w.word,
      })
    })

    // Type 3: Meaning questions
    vocabWords.slice(0, Math.ceil(questionsPerQuiz * 0.2)).forEach(w => {
      if (!w.meaning) return
      const otherMeanings = vocabWords.filter(v => v.id !== w.id && v.meaning).map(v => v.meaning)
      if (otherMeanings.length < 3) return
      const wrongs = shuffle(otherMeanings).slice(0, 3)
      questions.push({
        type: 'meaning', subject: 'English', topic: 'Vocabulary',
        question: `What is the meaning of "${w.word}"?`,
        options: shuffle([w.meaning, ...wrongs]),
        correct: w.meaning, word: w.word,
      })
    })

    // Type 4: Idioms & Phrases
    const shuffledIdioms = shuffle([...IDIOMS_AND_PHRASES])
    shuffledIdioms.slice(0, Math.ceil(questionsPerQuiz * 0.2)).forEach(idiom => {
      questions.push({
        type: 'idiom', subject: 'English', topic: 'Idioms & Phrases',
        question: `What does "${idiom.phrase}" mean?`,
        options: shuffle([...idiom.options]),
        correct: idiom.options[0], // First option is always correct in our data
        word: idiom.phrase,
      })
    })

    return shuffle(questions).slice(0, questionsPerQuiz)
  }

  function generateWrongOptions(correct, vocabWords, type) {
    const options = new Set()
    vocabWords.forEach(w => {
      if (options.size >= 5) return
      const words = type === 'synonym' ? (w.synonyms || []) : (w.antonyms || [])
      words.forEach(s => {
        if (s !== correct && s !== '') options.add(s)
      })
    })
    // Fallback: use word names
    if (options.size < 3) {
      vocabWords.forEach(w => {
        if (w.word !== correct) options.add(w.word)
      })
    }
    return [...options].sort(() => Math.random() - 0.5)
  }

  function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  function startQuiz() {
    const questions = generateQuestions()
    if (questions.length < 4) {
      toast('Need at least 4 vocab words with synonyms/antonyms to generate quiz', 'warn')
      return
    }
    setQuizState({
      questions,
      currentIndex: 0,
      score: 0,
      answers: [],
      startTime: Date.now(),
    })
    setSelectedOption(null)
    setShowResult(false)
  }

  function selectOption(option) {
    if (selectedOption !== null) return // Already selected
    setSelectedOption(option)
  }

  function nextQuestion() {
    if (!quizState || selectedOption === null) return
    const q = quizState.questions[quizState.currentIndex]
    const isCorrect = selectedOption === q.correct
    const newAnswers = [...quizState.answers, {
      question: q.question, word: q.word, type: q.type,
      subject: q.subject, topic: q.topic,
      selected: selectedOption, correct: q.correct, isCorrect,
    }]
    const newScore = isCorrect ? quizState.score + 1 : quizState.score
    const nextIdx = quizState.currentIndex + 1

    if (nextIdx >= quizState.questions.length) {
      // Quiz complete
      const result = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        score: newScore,
        totalQuestions: quizState.questions.length,
        answers: newAnswers,
        timeTaken: Math.round((Date.now() - quizState.startTime) / 1000),
        type: 'Weekly Vocab Quiz',
      }
      setQuizResults([...quizResults, result])
      setQuizState({ ...quizState, answers: newAnswers, score: newScore, currentIndex: nextIdx, completed: true, result })
      setShowResult(true)
      toast(`Quiz completed! Score: ${newScore}/${quizState.questions.length}`, newScore / quizState.questions.length >= 0.7 ? 'ok' : 'warn')
    } else {
      setQuizState({ ...quizState, currentIndex: nextIdx, score: newScore, answers: newAnswers })
      setSelectedOption(null)
    }
  }

  // ── Quiz Complete Screen ──
  if (showResult && quizState?.completed) {
    const { result } = quizState
    const pct = Math.round(result.score / result.totalQuestions * 100)
    const wrongAnswers = result.answers.filter(a => !a.isCorrect)
    return (
      <div className="page-inner fade-in">
        <div className="card" style={{borderColor: pct >= 70 ? '#39ff1444' : '#ff333344', background: pct >= 70 ? '#001a00' : '#1a0000'}}>
          <div className="card-title" style={{color: pct >= 70 ? 'var(--green)' : 'var(--red)', fontSize: 12}}>
            {pct >= 80 ? '🎯 EXCELLENT!' : pct >= 60 ? '👍 GOOD EFFORT!' : '📚 NEEDS IMPROVEMENT'}
          </div>
          <div style={{textAlign:'center', padding:'20px 0'}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize: 56, color: pct >= 70 ? 'var(--green)' : 'var(--red)', lineHeight: 1}}>
              {result.score}/{result.totalQuestions}
            </div>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize: 12, color:'var(--text4)', marginTop: 8}}>
              ACCURACY: {pct}% · TIME: {result.timeTaken}s
            </div>
          </div>
          <div style={{display:'flex', gap: 8, marginTop: 16, flexWrap:'wrap'}}>
            {[
              ['Correct', result.score, 'var(--green)'],
              ['Wrong', result.totalQuestions - result.score, 'var(--red)'],
              ['Accuracy', `${pct}%`, pct >= 70 ? 'var(--green)' : 'var(--gold)'],
            ].map(([l,v,c]) => (
              <div key={l} style={{flex:1, textAlign:'center', padding:'12px 8px', background:'var(--bg4)', border:'1px solid var(--border)', borderRadius:5}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize: 22, color:c}}>{v}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize: 8, color:'var(--text4)', marginTop:4}}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {wrongAnswers.length > 0 && (
          <div className="card" style={{borderColor:'#ff333333'}}>
            <div className="card-title" style={{color:'var(--red)'}}>❌ REVIEW MISTAKES ({wrongAnswers.length})</div>
            {wrongAnswers.map((a, i) => (
              <div key={i} style={{padding:'10px 0', borderBottom:'1px solid var(--border3)'}}>
                <div style={{fontSize:13, color:'var(--text)', marginBottom:4}}>{a.question}</div>
                <div style={{fontSize:12}}>
                  <span style={{color:'var(--red)'}}>Your answer: {a.selected}</span>
                  <span style={{margin:'0 8px', color:'var(--text4)'}}>·</span>
                  <span style={{color:'var(--green)'}}>Correct: {a.correct}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="btn btn-g" style={{width:'100%', padding:14, fontSize:12}} onClick={() => { setShowResult(false); setQuizState(null) }}>
          ← BACK TO QUIZ HOME
        </button>
      </div>
    )
  }

  // ── Active Quiz Screen ──
  if (quizState && !quizState.completed) {
    const q = quizState.questions[quizState.currentIndex]
    const progress = ((quizState.currentIndex) / quizState.questions.length) * 100
    return (
      <div className="page-inner fade-in">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:'var(--cyan)', letterSpacing:2}}>
            🧠 QUIZ — Q{quizState.currentIndex + 1}/{quizState.questions.length}
          </div>
          <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:'var(--green)'}}>
            SCORE: {quizState.score}/{quizState.currentIndex}
          </div>
        </div>
        <div className="pb" style={{marginBottom:20}}>
          <div className="pf" style={{width:`${progress}%`, background:'var(--cyan)', transition:'width .3s'}}/>
        </div>

        <div className="card" style={{borderColor:'#00d4ff33', background:'#00101a'}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:'var(--text4)', marginBottom:8, letterSpacing:1.5}}>
            {q.type.toUpperCase()} · {q.topic}
          </div>
          <div style={{fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:24, lineHeight:1.5}}>
            {q.question}
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {q.options.map((opt, i) => {
              let bg = 'var(--bg4)', border = 'var(--border)', color = 'var(--text)'
              if (selectedOption !== null) {
                if (opt === q.correct) { bg = '#0d3320'; border = '#39ff14'; color = '#39ff14' }
                else if (opt === selectedOption && opt !== q.correct) { bg = '#2a0a0a'; border = '#ff3333'; color = '#ff3333' }
              } else if (opt === selectedOption) { bg = '#001a2a'; border = '#00d4ff'; color = '#00d4ff' }
              return (
                <button key={i} onClick={() => selectOption(opt)} style={{
                  padding:'14px 16px', borderRadius:6, border:`1px solid ${border}`,
                  background:bg, color, cursor: selectedOption !== null ? 'default' : 'pointer',
                  fontFamily:"'Rajdhani', sans-serif", fontSize:15, textAlign:'left',
                  transition:'all .15s', display:'flex', alignItems:'center', gap:10,
                }}>
                  <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:12, color:'var(--text4)', minWidth:20}}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{display:'flex', gap:10, marginTop:16}}>
          <button className="btn btn-r" style={{padding:'12px 20px'}} onClick={() => { setQuizState(null); setSelectedOption(null) }}>
            ✕ EXIT
          </button>
          {selectedOption !== null && (
            <button className="btn btn-g" style={{flex:1, padding:'12px 20px', fontSize:12}} onClick={nextQuestion}>
              {quizState.currentIndex + 1 >= quizState.questions.length ? '🏁 FINISH QUIZ' : 'NEXT →'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Quiz Home Screen ──
  const lastQuiz = quizResults.length > 0 ? quizResults[quizResults.length - 1] : null
  const avgScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((s, q) => s + (q.totalQuestions > 0 ? q.score / q.totalQuestions * 100 : 0), 0) / quizResults.length)
    : 0

  return (
    <div className="page-inner fade-in">
      <div className="g3 keep" style={{marginBottom:12}}>
        {[
          ['QUIZZES', quizResults.length, 'var(--cyan)'],
          ['AVG SCORE', quizResults.length > 0 ? `${avgScore}%` : '—', avgScore >= 70 ? 'var(--green)' : avgScore > 0 ? 'var(--gold)' : 'var(--text4)'],
          ['VOCAB', vocab.length, 'var(--green)'],
        ].map(([l,v,c]) => (
          <div key={l} className="card" style={{textAlign:'center', padding:14, marginBottom:0, borderColor:`${c}22`}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:26, color:c}}>{v}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:'var(--text4)', marginTop:4}}>{l}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{borderColor: quizDue ? '#ffd70044' : '#39ff1422', background: quizDue ? '#0d0d00' : '#001a00'}}>
        <div className="card-title" style={{color: quizDue ? 'var(--gold)' : 'var(--cyan)'}}>
          {quizDue ? '🔔 WEEKLY QUIZ DUE' : '🧠 VOCABULARY QUIZ'}
        </div>
        <div style={{textAlign:'center', padding:'16px 0'}}>
          {quizDue && (
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:'var(--gold)', marginBottom:12, animation:'pulse 2s infinite'}}>
              ⚠ Your weekly vocab quiz is due! Test your knowledge.
            </div>
          )}
          <div style={{fontSize:14, color:'var(--text3)', marginBottom:16}}>
            {vocab.length >= 4
              ? `Generate ${questionsPerQuiz} MCQs from your ${vocab.length} vocabulary words`
              : 'Add at least 4 vocabulary words to start a quiz'
            }
          </div>
          <button className="btn btn-g" style={{padding:'14px 28px', fontSize:13}} onClick={startQuiz}
            disabled={vocab.length < 4}>
            🧠 START QUIZ
          </button>
        </div>
      </div>

      {/* Past Quiz Results */}
      {quizResults.length > 0 && (
        <div className="card">
          <div className="card-title">📊 PAST RESULTS ({quizResults.length})</div>
          {[...quizResults].reverse().slice(0, 10).map((qr, i) => {
            const pct = qr.totalQuestions > 0 ? Math.round(qr.score / qr.totalQuestions * 100) : 0
            return (
              <div key={i} className="sr" style={{flexWrap:'wrap', gap:6}}>
                <span style={{fontSize:12, color:'var(--text3)'}}>
                  {new Date(qr.date).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}
                </span>
                <span style={{fontFamily:"'Share Tech Mono',monospace", color: pct >= 70 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)', fontSize:12}}>
                  {qr.score}/{qr.totalQuestions} · {pct}%
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
