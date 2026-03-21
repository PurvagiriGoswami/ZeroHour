import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { useAppStore } from '../store/useStore'
import { useToast } from '../Toast'
import { SUBC, SUBTOTALS } from '../data'
import { getWeaknessLevel } from '../utils/weaknessEngine'
import { getDueVocab } from '../utils/spacedRepetition'
import { today, formatDate } from '../utils/dateUtils'

export default function Planner() {
  const { state } = useStore()
  const { syl, revision, vocab, quizResults, plannerTasks, mocks, settings } = state
  const setPlannerTasks = useAppStore(s => s.setPlannerTasks)
  const toast = useToast()

  const td = today()

  // Get today's tasks
  const todayTasks = useMemo(() => {
    return plannerTasks.filter(t => t.date === td)
  }, [plannerTasks, td])

  // Generate daily study plan
  function generateDailyPlan() {
    const tasks = []

    // 1. Revision Due items (highest priority)
    syl.filter(t => t.status === 'Done').forEach(t => {
      const rv = revision.find(r => r.topicId === t.id) || {}
      // Simple check: if topic is done and has pending revisions
      for (let round = 1; round <= 4; round++) {
        if (!rv[`r${round}Done`]) {
          const prevDate = round > 1 ? rv[`r${round-1}Date`] : t.lastStudied
          if (!prevDate) continue
          const elapsed = Math.floor((Date.now() - new Date(prevDate).getTime()) / 86400000)
          const days = [1, 3, 7, 15][round - 1]
          if (elapsed >= days) {
            tasks.push({
              id: `rev-${t.id}-R${round}`,
              date: td,
              subject: t.sub,
              topic: t.topic,
              reason: `R${round} Revision Overdue (${elapsed - days}d late)`,
              priority: 'high',
              type: 'revision',
              completed: false,
            })
          }
          break
        }
      }
    })

    // 2. Weak topics from quiz results (if accuracy < 60)
    if (quizResults.length > 0) {
      const topicScores = {}
      quizResults.forEach(qr => {
        (qr.answers || []).forEach(a => {
          const topic = a.topic || 'General'
          if (!topicScores[topic]) topicScores[topic] = { correct: 0, total: 0 }
          topicScores[topic].total++
          if (a.isCorrect) topicScores[topic].correct++
        })
      })
      Object.entries(topicScores)
        .filter(([_, s]) => s.total > 0 && s.correct / s.total < 0.6)
        .sort(([, a], [, b]) => a.correct / a.total - b.correct / b.total)
        .slice(0, 3)
        .forEach(([topic, s]) => {
          const acc = Math.round(s.correct / s.total * 100)
          tasks.push({
            id: `weak-${topic}`,
            date: td,
            subject: 'English',
            topic: topic,
            reason: `Weak Area (${acc}% accuracy)`,
            priority: 'high',
            type: 'weakness',
            completed: false,
          })
        })
    }

    // 3. Vocab revision due
    const dueVocab = getDueVocab(vocab)
    if (dueVocab.length > 0) {
      tasks.push({
        id: `vocab-rev-${td}`,
        date: td,
        subject: 'English',
        topic: `Vocabulary Revision (${dueVocab.length} words)`,
        reason: 'Spaced Revision Due',
        priority: 'medium',
        type: 'vocab_revision',
        completed: false,
      })
    }

    // 4. Not-started high priority topics
    syl.filter(t => t.status === 'Not Started' && t.pri === 'H')
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .forEach(t => {
        tasks.push({
          id: `study-${t.id}`,
          date: td,
          subject: t.sub,
          topic: t.topic,
          reason: 'High Priority — Not Started',
          priority: 'medium',
          type: 'study',
          completed: false,
        })
      })

    // 5. In-progress topics to continue
    syl.filter(t => t.status === 'In Progress')
      .slice(0, 2)
      .forEach(t => {
        tasks.push({
          id: `continue-${t.id}`,
          date: td,
          subject: t.sub,
          topic: t.topic,
          reason: 'Continue In-Progress Topic',
          priority: 'low',
          type: 'continue',
          completed: false,
        })
      })

    // Limit to reasonable daily load
    const finalTasks = tasks.slice(0, settings.dailyStudyGoal || 6)

    // Merge with existing (don't duplicate)
    const existing = plannerTasks.filter(t => t.date !== td)
    setPlannerTasks([...existing, ...finalTasks])
    toast(`Generated ${finalTasks.length} tasks for today`, 'ok')
  }

  function toggleTask(taskId) {
    const updated = plannerTasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    )
    setPlannerTasks(updated)
  }

  function removeTask(taskId) {
    setPlannerTasks(plannerTasks.filter(t => t.id !== taskId))
  }

  const completedCount = todayTasks.filter(t => t.completed).length
  const totalCount = todayTasks.length
  const progress = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0

  const priorityColors = { high: 'var(--red)', medium: 'var(--gold)', low: 'var(--green)' }
  const priorityBg = { high: '#2a0a0a', medium: '#2a1f00', low: '#0d3320' }
  const typeEmojis = { revision: '🔄', weakness: '🔴', vocab_revision: '📖', study: '📚', continue: '▶' }

  return (
    <div className="page-inner fade-in">
      <div className="g3 keep" style={{marginBottom:12}}>
        {[
          ['TODAY', totalCount, 'var(--cyan)'],
          ['DONE', completedCount, 'var(--green)'],
          ['PENDING', totalCount - completedCount, totalCount - completedCount > 0 ? 'var(--gold)' : 'var(--green)'],
        ].map(([l,v,c]) => (
          <div key={l} className="card" style={{textAlign:'center', padding:14, marginBottom:0, borderColor:`${c}22`}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:26, color:c}}>{v}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:'var(--text4)', marginTop:4}}>{l}</div>
          </div>
        ))}
      </div>

      {totalCount > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{display:'flex', justifyContent:'space-between', fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:'var(--text4)', marginBottom:4}}>
            <span>DAILY PROGRESS</span>
            <span style={{color:'var(--green)'}}>{progress}%</span>
          </div>
          <div className="pb"><div className="pf" style={{width:`${progress}%`, background:'var(--green)'}}/></div>
        </div>
      )}

      <div style={{display:'flex', gap:8, marginBottom:16, flexWrap:'wrap'}}>
        <button className="btn btn-g" style={{flex:1, padding:'12px 16px'}} onClick={generateDailyPlan}>
          🧠 GENERATE TODAY'S PLAN
        </button>
      </div>

      {/* Today's Tasks */}
      <div className="card">
        <div className="card-title" style={{color:'var(--cyan)'}}>
          📋 TODAY'S STUDY PLAN — {formatDate(new Date())}
        </div>
        {todayTasks.length === 0 ? (
          <div className="empty">// CLICK "GENERATE" TO CREATE TODAY'S PLAN</div>
        ) : (
          todayTasks.map(task => (
            <div key={task.id} style={{
              padding:'12px', marginBottom:8, borderRadius:6,
              border:`1px solid ${task.completed ? '#39ff1433' : 'var(--border)'}`,
              background: task.completed ? '#0d3320' : 'var(--bg4)',
              display:'flex', gap:10, alignItems:'flex-start',
              opacity: task.completed ? 0.7 : 1,
              transition: 'all .2s',
            }}>
              <input type="checkbox" checked={task.completed}
                onChange={() => toggleTask(task.id)}
                style={{marginTop:4}}/>
              <div style={{flex:1}}>
                <div style={{display:'flex', gap:6, alignItems:'center', flexWrap:'wrap', marginBottom:4}}>
                  <span style={{fontSize:14}}>{typeEmojis[task.type] || '📌'}</span>
                  <span style={{color: SUBC[task.subject] || 'var(--text)', fontFamily:"'Share Tech Mono',monospace", fontSize:9}}>
                    {task.subject}
                  </span>
                  <span style={{fontSize:14, fontWeight:600, color: task.completed ? 'var(--text3)' : 'var(--text)',
                    textDecoration: task.completed ? 'line-through' : 'none'}}>
                    {task.topic}
                  </span>
                </div>
                <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
                  <span className="tag" style={{
                    background: priorityBg[task.priority], border:`1px solid ${priorityColors[task.priority]}33`,
                    color: priorityColors[task.priority]
                  }}>
                    {task.priority.toUpperCase()}
                  </span>
                  <span style={{fontSize:11, color:'var(--text4)'}}>{task.reason}</span>
                </div>
              </div>
              <button className="btn btn-r" style={{padding:'4px 8px', fontSize:8, minHeight:28}}
                onClick={() => removeTask(task.id)}>✕</button>
            </div>
          ))
        )}
      </div>

      {/* Past Plans */}
      {plannerTasks.filter(t => t.date !== td).length > 0 && (
        <div className="card" style={{borderColor:'var(--border3)'}}>
          <div className="card-title" style={{color:'var(--text4)'}}>📅 PAST PLANS</div>
          {(() => {
            const pastDates = [...new Set(plannerTasks.filter(t => t.date !== td).map(t => t.date))].sort().reverse().slice(0, 5)
            return pastDates.map(date => {
              const dayTasks = plannerTasks.filter(t => t.date === date)
              const done = dayTasks.filter(t => t.completed).length
              return (
                <div key={date} className="sr" style={{flexWrap:'wrap', gap:6}}>
                  <span style={{fontSize:12, color:'var(--text3)'}}>{formatDate(date)}</span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11,
                    color: done === dayTasks.length ? 'var(--green)' : 'var(--gold)'}}>
                    {done}/{dayTasks.length} completed
                  </span>
                </div>
              )
            })
          })()}
        </div>
      )}
    </div>
  )
}
