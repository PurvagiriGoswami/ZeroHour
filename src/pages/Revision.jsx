import { useState, useMemo } from 'react'
import { useAppStore } from '../store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { useToast } from '../Toast'
import { SUBC } from '../data'
import { DEFAULT_CYCLES } from '../utils/spacedRepetition'
import { today, formatDate, daysSince } from '../utils/dateUtils'
import { EmptyState } from '../components/EmptyState'

const SUBS = ['Maths','English','GS','AFCAT']

export default function Revision() {
  const { syl, revision, revisionCycles } = useAppStore(
    useShallow(s => ({
      syl: s.syl,
      revision: s.revision,
      revisionCycles: s.revisionCycles
    }))
  )
  const setRevision = useAppStore(s => s.setRevision)
  const setRevisionCycles = useAppStore(s => s.setRevisionCycles)
  const toast = useToast()

  const [newCycleDays, setNewCycleDays] = useState(30)

  const td = today()
  const cycleCount = revisionCycles.length

  // Count completions per cycle
  const cycleCounts = useMemo(() => {
    return revisionCycles.map((_, ci) => {
      let count = 0
      syl.filter(t => t.sub !== 'AFCAT').forEach(t => {
        const rv = revision.find(r => r.topicId === t.id) || {}
        if (rv[`r${ci + 1}Done`]) count++
      })
      return count
    })
  }, [syl, revision, revisionCycles])

  const total = syl.filter(t => t.sub !== 'AFCAT').length

  // Due topics
  const overdueCt = useMemo(() => {
    let count = 0
    syl.filter(t => t.status === 'Done').forEach(t => {
      const rv = revision.find(r => r.topicId === t.id) || {}
      for (let i = 0; i < revisionCycles.length; i++) {
        if (!rv[`r${i + 1}Done`]) {
          const prevDate = i > 0 ? rv[`r${i}Date`] : (rv.r1Date || t.lastStudied)
          if (prevDate && daysSince(prevDate) >= revisionCycles[i].days) count++
          break
        }
      }
    })
    return count
  }, [syl, revision, revisionCycles])

  function toggleRev(topicId, round) {
    const ex = revision.find(rv => rv.topicId === topicId) || { topicId }
    const newVal = !ex[`r${round}Done`]
    const up = { ...ex }

    if (newVal) {
      up[`r${round}Done`] = true
      up[`r${round}Date`] = td
      // Auto-complete previous rounds
      for (let i = 1; i < round; i++) {
        up[`r${i}Done`] = true
        if (!up[`r${i}Date`]) up[`r${i}Date`] = td
      }
    } else {
      up[`r${round}Done`] = false
      delete up[`r${round}Date`]
      // Clear subsequent rounds
      for (let i = round + 1; i <= cycleCount; i++) {
        up[`r${i}Done`] = false
        delete up[`r${i}Date`]
      }
    }

    setRevision([...revision.filter(rv => rv.topicId !== topicId), up])
  }

  function addCycle() {
    const nextId = `R${revisionCycles.length + 1}`
    setRevisionCycles([...revisionCycles, { id: nextId, days: newCycleDays, label: `${nextId} — ${newCycleDays} Days` }])
    toast(`Added cycle ${nextId} (${newCycleDays} days)`, 'ok')
  }

  function removeCycle(index) {
    if (revisionCycles.length <= 2) {
      toast('Must have at least 2 revision cycles', 'warn')
      return
    }
    const updated = revisionCycles.filter((_, i) => i !== index)
    setRevisionCycles(updated)
    toast('Cycle removed', 'info')
  }

  function updateCycleDays(index, days) {
    const updated = revisionCycles.map((c, i) =>
      i === index ? { ...c, days: Math.max(1, parseInt(days) || 1), label: `${c.id} — ${days} Days` } : c
    )
    setRevisionCycles(updated)
  }

  const RC = ['#ffd700','#00d4ff','#39ff14','#bf80ff','#ff8888','#ff3333']

  return (
    <div className="page-inner fade-in">
      {/* Cycle Overview */}
      <div className="card">
        <div className="card-title">🔄 SPACED REVISION SYSTEM</div>
        <div style={{display:'grid', gridTemplateColumns:`repeat(${Math.min(cycleCount, 4)}, 1fr)`, gap:8, marginBottom:12}}>
          {revisionCycles.map((cycle, i) => (
            <div key={i} style={{textAlign:'center', padding:12, border:`1px solid ${RC[i % RC.length]}22`, borderRadius:5}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:26, color:RC[i % RC.length]}}>
                {cycleCounts[i]}/{total}
              </div>
              <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:'var(--text4)', marginTop:3}}>
                {cycle.id}
              </div>
              <div style={{fontSize:11, color:'var(--text4)'}}>{cycle.days} day{cycle.days > 1 ? 's' : ''}</div>
              <div className="pb" style={{marginTop:6}}>
                <div className="pf" style={{width:`${total > 0 ? Math.round(cycleCounts[i]/total*100) : 0}%`, background:RC[i % RC.length]}}/>
              </div>
            </div>
          ))}
        </div>
        {overdueCt > 0 && (
          <div style={{padding:10, background:'var(--yldim)', border:'1px solid #ffd70033', borderRadius:3,
            fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:'var(--gold)'}}>
            ⚠ {overdueCt} topics due for revision
          </div>
        )}
      </div>

      {/* Cycle Management */}
      <div className="card">
        <div className="card-title" style={{color:'var(--cyan)'}}>⚙ MANAGE CYCLES</div>
        {revisionCycles.map((cycle, i) => (
          <div key={i} style={{display:'flex', gap:8, alignItems:'center', marginBottom:8, flexWrap:'wrap'}}>
            <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:RC[i % RC.length], minWidth:30}}>
              {cycle.id}
            </span>
            <input type="number" className="inp" style={{width:80, padding:'6px 8px', fontSize:13}}
              value={cycle.days} onChange={e => updateCycleDays(i, e.target.value)} min={1} />
            <span style={{fontSize:11, color:'var(--text4)'}}>days</span>
            {i >= 4 && (
              <button className="btn btn-r" style={{padding:'4px 8px', fontSize:8, minHeight:28}}
                onClick={() => removeCycle(i)}>✕</button>
            )}
          </div>
        ))}
        <div style={{display:'flex', gap:8, alignItems:'center', marginTop:12, flexWrap:'wrap'}}>
          <input type="number" className="inp" style={{width:80, padding:'6px 8px', fontSize:13}}
            value={newCycleDays} onChange={e => setNewCycleDays(parseInt(e.target.value) || 30)} min={1} />
          <span style={{fontSize:11, color:'var(--text4)'}}>days</span>
          <button className="btn btn-g" style={{fontSize:9, padding:'6px 14px'}} onClick={addCycle}>
            ➕ ADD CYCLE
          </button>
        </div>
      </div>

      {/* Topic Revision Log */}
      <div className="card">
        <div className="card-title">📋 TOPIC REVISION LOG
          <span style={{fontSize:9, color:'var(--gold)'}}>Smart due: spaced repetition</span>
        </div>
        {revision.length === 0 ? (
          <EmptyState 
            icon="🔄" 
            title="No revision data yet. Complete topics in the Course Map to start your spaced repetition journey." 
            cta="GO TO COURSE MAP" 
            onAction={() => window.dispatchEvent(new CustomEvent('nav', { detail: 'syl' }))} 
          />
        ) : SUBS.filter(s => s !== 'AFCAT').map(sub => {
          const color = SUBC[sub]
          return (
            <div key={sub} style={{marginBottom:12}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color, letterSpacing:2,
                padding:'9px 12px', borderBottom:'1px solid var(--border)', background:'var(--bg2)'}}>
                ▶ {sub.toUpperCase()}
              </div>
              {syl.filter(t => t.sub === sub).map(t => {
                const rv = revision.find(r => r.topicId === t.id) || {}

                // Check which round is due
                let dueRound = null
                for (let i = 0; i < revisionCycles.length; i++) {
                  if (!rv[`r${i+1}Done`] && t.status === 'Done') {
                    const prevDate = i > 0 ? rv[`r${i}Date`] : (rv.r1Date || t.lastStudied)
                    if (prevDate && daysSince(prevDate) >= revisionCycles[i].days) {
                      dueRound = i + 1
                    }
                    break
                  }
                }

                return (
                  <div key={t.id} style={{display:'flex', alignItems:'center', gap:8, padding:'9px 12px',
                    borderBottom:'1px solid var(--border3)', flexWrap:'wrap'}}>
                    <span style={{flex:1, fontSize:13, color: dueRound ? 'var(--gold)' : 'var(--text)', minWidth:100}}>
                      {t.topic}
                      {dueRound && (
                        <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:'var(--gold)', marginLeft:6}}>
                          ⚠ R{dueRound} DUE
                        </span>
                      )}
                    </span>
                    {revisionCycles.map((cycle, ci) => {
                      const round = ci + 1
                      const done = rv[`r${round}Done`]
                      return (
                        <button key={round} onClick={() => toggleRev(t.id, round)} style={{
                          padding:'5px 10px', borderRadius:3,
                          border:`1px solid ${done ? RC[ci % RC.length] : `${RC[ci % RC.length]}33`}`,
                          background: done ? ['#2a1f00','#001a2a','#0d3320','#1a0030','#2a0a0a','#1a0a0a'][ci % 6] : 'transparent',
                          color: done ? RC[ci % RC.length] : 'var(--text4)',
                          cursor:'pointer', fontFamily:"'Share Tech Mono',monospace", fontSize:9,
                          transition:'all .12s', minWidth:42, minHeight:32,
                        }}>
                          {cycle.id}{done ? ' ✓' : ''}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
