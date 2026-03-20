import { useStore } from '../store'
import { getRevDue, td } from '../utils'
import { SUBC } from '../data'

const RC = ['#ffd700','#00d4ff','#39ff14']
const SUBS = ['Maths','English','GS']

export default function Revision() {
  const { state, act } = useStore()
  const { syl, revision } = state

  const rDone = [0,0,0]
  SUBS.forEach((sub,ri)=>{
    syl.filter(t=>t.sub===sub).forEach(t=>{
      const rv=revision.find(r=>r.topicId===t.id)||{}
      if(rv.r1Done) rDone[ri]++
    })
  })
  const total = 36

  const overdueCt = syl.filter(t=>{
    const rv=revision.find(r=>r.topicId===t.id)||{}
    return getRevDue(t,rv)
  }).length

  function toggleRev(topicId, r) {
    const ex = revision.find(rv=>rv.topicId===topicId)||{topicId}
    const newVal = !ex[`r${r}Done`]
    const up = {...ex,[`r${r}Done`]:newVal}
    if(newVal){
      up[`r${r}Date`]=td()
      if(r>=2){ up.r1Done=true; if(!up.r1Date)up.r1Date=td() }
      if(r>=3){ up.r2Done=true; if(!up.r2Date)up.r2Date=td() }
    } else {
      delete up[`r${r}Date`]
      if(r===1){ up.r2Done=false; delete up.r2Date; up.r3Done=false; delete up.r3Date }
      if(r===2){ up.r3Done=false; delete up.r3Date }
    }
    act({ type:'SET_REVISION', revision:[...revision.filter(rv=>rv.topicId!==topicId),up] })
  }

  return (
    <div className="page-inner fade-in">
      <div className="card">
        <div className="card-title">🔄 3-ROUND REVISION CYCLE</div>
        <div className="g3 keep">
          {[['R1','First Study'],['R2','+3 Weeks'],['R3','Pre-Exam Sprint']].map(([rnd,desc],i)=>(
            <div key={rnd} style={{textAlign:'center',padding:14,border:`1px solid ${RC[i]}22`,borderRadius:5}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:28,color:RC[i]}}>{rDone[i]}/{total}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text4)',marginTop:3}}>{rnd}</div>
              <div style={{fontSize:12,color:'var(--text4)'}}>{desc}</div>
              <div className="pb" style={{marginTop:6}}>
                <div className="pf" style={{width:`${Math.round(rDone[i]/total*100)}%`,background:RC[i]}}/>
              </div>
            </div>
          ))}
        </div>
        {overdueCt>0&&(
          <div style={{marginTop:12,padding:10,background:'var(--yldim)',border:'1px solid #ffd70033',borderRadius:3,fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:'var(--gold)'}}>
            ⚠ {overdueCt} topics due for revision
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">📋 TOPIC REVISION LOG
          <span style={{fontSize:9,color:'var(--gold)'}}>Smart due: confidence + priority</span>
        </div>
        {SUBS.map((sub,si)=>{
          const color = {Maths:'#ffd700',English:'#00d4ff',GS:'#39ff14'}[sub]
          return (
            <div key={sub} style={{marginBottom:12}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color,letterSpacing:2,padding:'9px 12px',borderBottom:'1px solid var(--border)',background:'var(--bg2)'}}>
                ▶ {sub.toUpperCase()}
              </div>
              {syl.filter(t=>t.sub===sub).map(t=>{
                const rv=revision.find(r=>r.topicId===t.id)||{}
                const due=getRevDue(t,rv)
                return (
                  <div key={t.id} style={{display:'flex',alignItems:'center',gap:8,padding:'9px 12px',borderBottom:'1px solid var(--border3)',flexWrap:'wrap'}}>
                    <span style={{flex:1,fontSize:13,color:due?'var(--gold)':'var(--text)',minWidth:100}}>
                      {t.topic}
                      {due&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--gold)',marginLeft:6}}>⚠ {due.round} DUE</span>}
                    </span>
                    {[1,2,3].map(r=>(
                      <button key={r} onClick={()=>toggleRev(t.id,r)} style={{
                        padding:'5px 12px',borderRadius:3,
                        border:`1px solid ${rv[`r${r}Done`]?RC[r-1]:`${RC[r-1]}33`}`,
                        background:rv[`r${r}Done`]?['#2a1f00','#001a2a','#0d3320'][r-1]:'transparent',
                        color:rv[`r${r}Done`]?RC[r-1]:'var(--text4)',
                        cursor:'pointer',fontFamily:"'Share Tech Mono',monospace",fontSize:9,
                        transition:'all .12s',minWidth:48,minHeight:36
                      }}>R{r}{rv[`r${r}Done`]?' ✓':''}</button>
                    ))}
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
