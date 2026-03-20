import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { useToast } from '../Toast'
import { useConfirm } from '../Modal'
import { BarChart } from '../Charts'
import { td } from '../utils'

export default function Pomodoro() {
  const { state, act } = useStore()
  const toast = useToast()
  const confirm = useConfirm()
  const { pomoSessions } = state

  const [mode, setMode]         = useState('work')
  const [running, setRunning]   = useState(false)
  const [elapsed, setElapsed]   = useState(0)
  const [workMins, setWorkMins] = useState(25)
  const [breakMins,setBreakMins]= useState(5)
  const [label, setLabel]       = useState('')
  const timerRef = useRef(null)

  const today = td()
  const todaySess = pomoSessions.filter(s=>s.date===today)
  const todayMins = todaySess.filter(s=>s.type==='work').reduce((a,s)=>a+s.mins,0)
  const totalH = Math.floor(todayMins/60), totalM = todayMins%60

  const allDays = {}
  pomoSessions.filter(s=>s.type==='work').forEach(s=>{ allDays[s.date]=(allDays[s.date]||0)+s.mins })
  const last7 = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i))
    const ds=d.toISOString().split('T')[0]
    return {label:['S','M','T','W','T','F','S'][d.getDay()],value:Math.round((allDays[ds]||0)/60*10)/10,max:8}
  })

  const totalSecs = (mode==='work'?workMins:breakMins)*60
  const remain = Math.max(0, totalSecs - elapsed)
  const mm = String(Math.floor(remain/60)).padStart(2,'0')
  const ss = String(remain%60).padStart(2,'0')
  const pct = elapsed/totalSecs
  const circ = 2*Math.PI*44
  const dash = Math.max(0,pct*circ)
  const col = mode==='work'?'#39ff14':'#00d4ff'

  useEffect(()=>{
    if(!running){ clearInterval(timerRef.current); return }
    timerRef.current = setInterval(()=>{
      setElapsed(prev=>{
        const next = prev + 1
        if(next >= totalSecs){
          clearInterval(timerRef.current)
          setRunning(false)
          const wasWork = mode==='work'
          const newSession = {
            id:Date.now(), date:td(),
            time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}),
            type:mode, mins:wasWork?workMins:breakMins, label
          }
          // Use functional update pattern via ref to avoid stale closure on pomoSessions
          act({ type:'SET_POMO_SESSIONS', pomoSessions:[newSession, ...pomoSessions] })
          toast(wasWork?'🎯 Focus done! Take a break.':'☕ Break done! Back to work.','ok',4000)
          setElapsed(0)
          setMode(m=>m==='work'?'break':'work')
          return 0
        }
        return next
      })
    },1000)
    return ()=>clearInterval(timerRef.current)
  },[running, totalSecs, mode, workMins, breakMins, label, pomoSessions, act, toast])

  function start()  { setRunning(true)  }
  function pause()  { setRunning(false) }
  function reset()  { setRunning(false); setElapsed(0) }
  function switchMode() { setRunning(false); setElapsed(0); setMode(m=>m==='work'?'break':'work') }

  function deleteSess(id) {
    confirm('DELETE SESSION','Remove this session?',()=>{
      act({ type:'SET_POMO_SESSIONS', pomoSessions:pomoSessions.filter(s=>s.id!==id) })
    })
  }

  return (
    <div className="page-inner fade-in">
      <div className="card" style={{textAlign:'center'}}>
        <div className="card-title">⏱ POMODORO FOCUS TIMER</div>
        <div style={{display:'inline-block',position:'relative',marginBottom:18}}>
          <svg viewBox="0 0 100 100" width={200} height={200}>
            <circle cx={50} cy={50} r={44} fill="none" stroke="#0d1f0d" strokeWidth={6}/>
            <circle cx={50} cy={50} r={44} fill="none" stroke={col} strokeWidth={6}
              strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
              strokeLinecap="round" transform="rotate(-90 50 50)"
              style={{transition:'stroke-dasharray .9s,stroke .3s'}}/>
            <text x={50} y={44} textAnchor="middle" fill={col} fontSize={20}
              fontFamily="Share Tech Mono,monospace" fontWeight="bold">{mm}:{ss}</text>
            <text x={50} y={60} textAnchor="middle" fill="#3a5a3a" fontSize={9}
              fontFamily="Share Tech Mono,monospace">{mode==='work'?'FOCUS':'BREAK'}</text>
            <text x={50} y={73} textAnchor="middle" fill="#2a4a2a" fontSize={7}
              fontFamily="Share Tech Mono,monospace">{running?'▶ RUNNING':'◼ PAUSED'}</text>
          </svg>
        </div>

        <div style={{marginBottom:14,maxWidth:320,margin:'0 auto 14px'}}>
          <label className="lbl" style={{textAlign:'left'}}>SESSION LABEL (optional)</label>
          <input className="inp" placeholder="e.g. Maths — Number System" value={label} onChange={e=>setLabel(e.target.value)}/>
        </div>

        <div style={{display:'flex',justifyContent:'center',gap:10,marginBottom:16,flexWrap:'wrap'}}>
          <button className={`btn ${running?'btn-r':'btn-g'}`} style={{fontSize:13,padding:'12px 24px',minWidth:110}}
            onClick={running?pause:start}>{running?'⏸ PAUSE':'▶ START'}</button>
          <button className="btn" style={{padding:'12px 18px'}} onClick={reset}>↺ RESET</button>
          <button className="btn btn-y" style={{padding:'12px 18px'}} onClick={switchMode}>
            {mode==='work'?'→ BREAK':'→ FOCUS'}
          </button>
        </div>

        <div style={{display:'flex',justifyContent:'center',gap:20,marginBottom:18,flexWrap:'wrap'}}>
          <div><label className="lbl">FOCUS (min)</label>
            <input type="number" min={1} max={90} className="inp" style={{width:90,textAlign:'center'}} value={workMins}
              onChange={e=>{setWorkMins(+e.target.value);if(!running)setElapsed(0)}}/>
          </div>
          <div><label className="lbl">BREAK (min)</label>
            <input type="number" min={1} max={30} className="inp" style={{width:90,textAlign:'center'}} value={breakMins}
              onChange={e=>{setBreakMins(+e.target.value);if(!running)setElapsed(0)}}/>
          </div>
        </div>

        <div style={{display:'inline-block',background:'var(--bg4)',border:'1px solid var(--border)',borderRadius:4,padding:'14px 28px',marginBottom:14}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:32,color:'var(--green)'}}>{totalH}h {totalM}m</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text4)'}}>
            FOCUSED TODAY · {todaySess.filter(s=>s.type==='work').length} sessions
          </div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-title">📋 TODAY'S SESSIONS</div>
          {todaySess.length===0 ? <div className="empty">// NO SESSIONS TODAY</div> : todaySess.slice(0,12).map(s=>(
            <div key={s.id} style={{display:'flex',gap:8,padding:'6px 0',borderBottom:'1px solid var(--border3)',fontFamily:"'Share Tech Mono',monospace",fontSize:10,alignItems:'center'}}>
              <span style={{color:s.type==='work'?'var(--green)':'var(--cyan)'}}>{s.type==='work'?'●':'○'}</span>
              <span style={{color:'var(--text4)'}}>{s.time}</span>
              <span style={{color:'var(--text2)'}}>{s.mins} min {s.type}</span>
              <span style={{color:'var(--text3)',flex:1,fontSize:11}}>{s.label||''}</span>
              <button className="btn btn-r" style={{padding:'3px 8px',fontSize:8}} onClick={()=>deleteSess(s.id)}>✕</button>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">📊 HOURS/DAY — LAST 7</div>
          <BarChart data={last7} colors={['#39ff14']} h={50}/>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'var(--text5)',marginTop:6,textAlign:'center'}}>bars = hours focused</div>
        </div>
      </div>
    </div>
  )
}
