import { useMemo } from 'react'
import { useStore } from '../store'
import { HABITS } from '../data'
import { BarChart } from '../Charts'
import { td } from '../utils'

export default function Habits() {
  const { state, act } = useStore()
  const { habs } = state
  const today = td()
  const te = habs.find(h=>h.date===today)||{date:today}
  const done = HABITS.filter(h=>te[h.i]).length

  const last30 = useMemo(()=>Array.from({length:30},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(29-i))
    const ds=d.toISOString().split('T')[0]
    const e=habs.find(h=>h.date===ds)||{}
    return {ds,count:HABITS.filter(h=>e[h.i]).length}
  }),[habs])

  const weekData = useMemo(()=>Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i))
    const ds=d.toISOString().split('T')[0]
    const e=habs.find(h=>h.date===ds)||{}
    return {label:['S','M','T','W','T','F','S'][d.getDay()],value:HABITS.filter(h=>e[h.i]).length,max:6}
  }),[habs])

  function toggleHabit(hid) {
    const ex = habs.find(h=>h.date===today)||{date:today}
    act({type:'SET_HABS', habs:[...habs.filter(h=>h.date!==today),{...ex,[hid]:!ex[hid]}]})
  }
  function saveHabFocus(val) {
    const ex = habs.find(h=>h.date===today)||{date:today}
    act({type:'SET_HABS', habs:[...habs.filter(h=>h.date!==today),{...ex,focus:val}]})
  }
  function saveHabNote(val) {
    const ex = habs.find(h=>h.date===today)||{date:today}
    act({type:'SET_HABS', habs:[...habs.filter(h=>h.date!==today),{...ex,notes:val}]})
  }

  const habStats = HABITS.map(h=>{
    const total7 = last30.slice(-7).filter(d=>{
      const e=habs.find(hb=>hb.date===d.ds)||{}; return e[h.i]
    }).length
    return {h,total7}
  })

  return (
    <div className="page-inner fade-in">
      <div className="card">
        <div className="card-title">
          🔥 TODAY — {today}
          <span style={{color:done===6?'var(--gold)':done>=4?'var(--green)':'var(--text4)',fontSize:10}}>
            {done}/6 HABITS{done===6?' ⭐ PERFECT':done>=4?' ✓ GOOD':''}
          </span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
          {HABITS.map(h=>(
            <div key={h.i} onClick={()=>toggleHabit(h.i)} style={{
              background:te[h.i]?'#0d3320':'var(--bg4)',
              border:`1px solid ${te[h.i]?'var(--green)':'var(--border)'}`,
              borderRadius:5,padding:'16px 8px',cursor:'pointer',
              textAlign:'center',transition:'all .15s',userSelect:'none',
              minHeight:80,display:'flex',flexDirection:'column',alignItems:'center',
              justifyContent:'center',gap:5,
              boxShadow:te[h.i]?'0 0 8px #39ff1422':'none'
            }}>
              <div style={{fontSize:26}}>{h.e}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:te[h.i]?'var(--green)':'var(--text4)'}}>
                {te[h.i]?'✓ ':''}{h.l.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:10,alignItems:'flex-end',flexWrap:'wrap'}}>
          <div className="f1">
            <label className="lbl">FOCUS SCORE: <span style={{color:'var(--green)',fontSize:12}}>{te.focus||3}/5</span></label>
            <input type="range" min={1} max={5} defaultValue={te.focus||3} onChange={e=>saveHabFocus(+e.target.value)}/>
          </div>
          <div className="f1">
            <label className="lbl">NOTES</label>
            <input className="inp" placeholder="Streak comment..." defaultValue={te.notes||''} onBlur={e=>saveHabNote(e.target.value)}/>
          </div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-title">📊 30-DAY HEATMAP</div>
          <div style={{lineHeight:1}}>
            {last30.map(d=>{
              const c=d.count>=5?'#0d3a0d':d.count>=3?'#1a3a0a':d.count>0?'#2a1f00':'#0a0a0a'
              const b=d.count>=5?'#39ff14':d.count>=3?'#7ab07a':d.count>0?'#ffd70044':'#0d1f0d'
              return <div key={d.ds} title={`${d.ds}: ${d.count}/6`} style={{width:18,height:18,background:c,border:`1px solid ${b}`,borderRadius:2,display:'inline-block',margin:1,cursor:'default',transition:'transform .1s'}}
                onMouseOver={e=>e.target.style.transform='scale(1.3)'} onMouseOut={e=>e.target.style.transform='scale(1)'}/>
            })}
          </div>
          <div style={{display:'flex',gap:12,fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'var(--text4)',marginTop:10}}>
            {[['5-6','#0d3a0d','#39ff14'],['3-4','#1a3a0a','#7ab07a'],['1-2','#2a1f00','#ffd70044']].map(([l,bg,b])=>(
              <span key={l} style={{display:'flex',alignItems:'center',gap:4}}>
                <span style={{display:'inline-block',width:10,height:10,background:bg,border:`1px solid ${b}`}}/>
                {l}
              </span>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">📈 WEEKLY HABITS</div>
          <BarChart data={weekData} colors={['#ffd700','#00d4ff','#39ff14','#bf80ff','#ffd700','#00d4ff','#39ff14']} h={40}/>
          <div style={{marginTop:14}}>
            {habStats.map(({h,total7})=>(
              <div key={h.i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid var(--border3)'}}>
                <span style={{fontSize:14,color:'var(--text)'}}>{h.e} {h.l}</span>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div className="pb" style={{width:70,margin:0}}>
                    <div className="pf" style={{width:`${Math.round(total7/7*100)}%`,background:'var(--green)'}}/>
                  </div>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:'var(--green)'}}>{total7}/7</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
