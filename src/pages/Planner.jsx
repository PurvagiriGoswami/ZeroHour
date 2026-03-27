import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { useAppStore } from '../store/useStore'
import { useToast } from '../Toast'
import { SUBC } from '../data'
import { getDueVocab } from '../utils/spacedRepetition'
import { today, formatDate } from '../utils/dateUtils'

export default function Planner() {
  const { state } = useStore()
  const { syl, revision, vocab, quizResults, plannerTasks, settings } = state
  const setPlannerTasks = useAppStore(s => s.setPlannerTasks)
  const toast = useToast()

  const td = today()
  const [showAdd, setShowAdd] = useState(false)
  const [newTask, setNewTask] = useState({ subject: 'GS', topic: '', priority: 'medium' })

  // Get today's tasks
  const todayTasks = useMemo(() => {
    return (plannerTasks || []).filter(t => t.date === td)
  }, [plannerTasks, td])

  // Generate daily study plan
  function generateDailyPlan() {
    const tasks = []

    // 1. Revision Due items
    syl.filter(t => t.status === 'Done').forEach(t => {
      const rv = revision.find(r => r.topicId === t.id) || {}
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
              reason: `R${round} Revision Due`,
              priority: 'high',
              type: 'revision',
              completed: false,
            })
          }
          break
        }
      }
    })

    // 2. Vocab revision due
    const dueVocab = getDueVocab(vocab)
    if (dueVocab.length > 0) {
      tasks.push({
        id: `vocab-rev-${td}`,
        date: td,
        subject: 'English',
        topic: `Vocabulary Revision (${dueVocab.length} words)`,
        reason: 'Spaced Repetition Due',
        priority: 'medium',
        type: 'vocab_revision',
        completed: false,
      })
    }

    // 3. Not-started high priority topics
    syl.filter(t => t.status === 'Not Started' && t.pri === 'H')
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .forEach(t => {
        tasks.push({
          id: `study-${t.id}`,
          date: td,
          subject: t.sub,
          topic: t.topic,
          reason: 'High Priority Topic',
          priority: 'medium',
          type: 'study',
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

  function addTask() {
    if (!newTask.topic.trim()) { toast('Enter a topic', 'warn'); return }
    const task = {
      id: `custom-${Date.now()}`,
      date: td,
      subject: newTask.subject,
      topic: newTask.topic,
      reason: 'User Created Task',
      priority: newTask.priority,
      type: 'custom',
      completed: false,
    }
    setPlannerTasks([...plannerTasks, task])
    setNewTask({ subject: 'GS', topic: '', priority: 'medium' })
    setShowAdd(false)
    toast('Task added to your plan', 'ok')
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
  const typeEmojis = { revision: '🔄', weakness: '🔴', vocab_revision: '📖', study: '📚', continue: '▶', custom: '🎯' }

  return (
    <div className="page-inner fade-in">
      <div className="g3 keep" style={{marginBottom:16, gap:12}}>
        {[
          ['TODAY', totalCount, 'var(--cyan)'],
          ['DONE', completedCount, 'var(--green)'],
          ['PENDING', totalCount - completedCount, totalCount - completedCount > 0 ? 'var(--gold)' : 'var(--green)'],
        ].map(([l,v,c]) => (
          <div key={l} className="card" style={{textAlign:'center', padding:'16px 10px', marginBottom:0, borderColor:`${c}33`, borderRadius:16, flex:'1 1 80px', minWidth:80}}>
            <div style={{fontSize:24, fontWeight:800, color:c}}>{v}</div>
            <div style={{fontSize:9, fontWeight:700, color:'var(--text4)', marginTop:4, textTransform:'uppercase', letterSpacing:0.5}}>{l}</div>
          </div>
        ))}
      </div>

      {totalCount > 0 && (
        <div style={{marginBottom:24, background:'var(--bg2)', padding:16, borderRadius:16, border:'1px solid var(--border)'}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:700, color:'var(--text2)', marginBottom:8, textTransform:'uppercase', letterSpacing:1}}>
            <span>Daily Progress</span>
            <span style={{color:'var(--green)'}}>{progress}%</span>
          </div>
          <div className="pb" style={{height:8, background:'var(--bg4)'}}><div className="pf" style={{width:`${progress}%`, background:'var(--green)', borderRadius:4}}/></div>
        </div>
      )}

      <div style={{display:'flex', gap:12, marginBottom:24, flexWrap:'wrap'}}>
        <button className="btn btn-g" style={{flex:1, padding:'14px 24px', borderRadius:12, fontWeight:800, fontSize:13}} onClick={generateDailyPlan}>
          🧠 AUTO-GENERATE TODAY'S PLAN
        </button>
        <button className="btn" style={{flex:1, padding:'14px 24px', borderRadius:12, fontWeight:800, fontSize:13, background:'var(--indigo)', color:'white'}} onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✕ CLOSE' : '➕ CREATE MANUAL TASK'}
        </button>
      </div>

      {showAdd && (
        <div className="card pop-in" style={{marginBottom:24, padding:24, borderRadius:20, border:'1px solid var(--indigo)'}}>
          <div className="card-title" style={{fontSize:18, marginBottom:20}}>Create Custom Task</div>
          <div className="g3" style={{marginBottom:20}}>
            <div>
              <label className="lbl" style={{fontSize:10, fontWeight:700, color:'var(--text4)', marginBottom:6}}>SUBJECT</label>
              <select className="inp" style={{borderRadius:10}} value={newTask.subject} onChange={e => setNewTask({...newTask, subject: e.target.value})}>
                {Object.keys(SUBC).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl" style={{fontSize:10, fontWeight:700, color:'var(--text4)', marginBottom:6}}>TOPIC</label>
              <input className="inp" style={{borderRadius:10}} placeholder="What will you study?" value={newTask.topic} onChange={e => setNewTask({...newTask, topic: e.target.value})} />
            </div>
            <div>
              <label className="lbl" style={{fontSize:10, fontWeight:700, color:'var(--text4)', marginBottom:6}}>PRIORITY</label>
              <select className="inp" style={{borderRadius:10}} value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
          <button className="btn btn-g" style={{padding:'12px 24px', borderRadius:12, fontWeight:800}} onClick={addTask}>ADD TO PLAN ↵</button>
        </div>
      )}

      {/* Today's Tasks */}
      <div className="card" style={{borderRadius:20, padding:24}}>
        <div className="card-title" style={{fontSize:18, color:'var(--cyan)', marginBottom:20}}>
          📋 Today's Study Plan — {formatDate(new Date())}
        </div>
        {todayTasks.length === 0 ? (
          <div className="empty" style={{padding:'40px 0'}}>
            <div style={{fontSize:48, marginBottom:16}}>📝</div>
            <div>No tasks planned for today.</div>
            <div style={{fontSize:13, color:'var(--text4)', marginTop:8}}>Use auto-generate or create manual tasks to get started.</div>
          </div>
        ) : (
          todayTasks.map(task => (
            <div key={task.id} style={{
              padding:'16px 0', 
              borderBottom:'1px solid var(--border2)', 
              display:'flex', 
              gap:16, 
              alignItems:'center', 
              opacity:task.completed?0.6:1,
              transition: 'all 0.2s ease'
            }}>
              <div style={{
                width:24, height:24, borderRadius:6, border:`2px solid ${task.completed ? 'var(--green)' : 'var(--border3)'}`,
                display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                background: task.completed ? 'rgba(16,185,129,0.1)' : 'transparent',
                color: 'var(--green)', fontSize:14, fontWeight:900, flexShrink:0
              }} onClick={() => toggleTask(task.id)}>
                {task.completed && '✓'}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:4, flexWrap:'wrap'}}>
                  <span style={{fontSize:11, fontWeight:800, color:SUBC[task.subject]||'var(--text3)', textTransform:'uppercase', letterSpacing:1}}>{task.subject}</span>
                  <span style={{fontSize:10, padding:'2px 8px', borderRadius:6, background:priorityColors[task.priority]+'20', color:priorityColors[task.priority], fontWeight:800, textTransform:'uppercase'}}>{task.priority}</span>
                </div>
                <div style={{fontSize:16, fontWeight:700, color:task.completed?'var(--text4)':'var(--text2)', textDecoration:task.completed?'line-through':'none'}}>{typeEmojis[task.type]||'🎯'} {task.topic}</div>
                <div style={{fontSize:11, color:'var(--text5)', marginTop:4, fontWeight:600}}>{task.reason}</div>
              </div>
              <button className="btn btn-r" style={{padding:'8px', borderRadius:10, minWidth:36, height:36}} onClick={() => removeTask(task.id)}>✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
