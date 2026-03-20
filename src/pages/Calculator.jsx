import { useState } from 'react'
import { useStore } from '../store'
import { calcNM } from '../utils'

export default function Calculator() {
  const { state } = useStore()
  const { settings } = state
  const [mode, setMode] = useState('cds')
  const [vals, setVals] = useState({ maths_att:'',maths_cor:'',eng_att:'',eng_cor:'',gs_att:'',gs_cor:'',afcat_att:'',afcat_cor:'' })
  const set = k => e => setVals(p=>({...p,[k]:e.target.value}))

  const isCDS = mode==='cds'
  const m = vals.maths_att ? calcNM(+vals.maths_att||0, +vals.maths_cor||0, 100) : null
  const e = vals.eng_att   ? calcNM(+vals.eng_att||0,   +vals.eng_cor||0,   100) : null
  const g = vals.gs_att    ? calcNM(+vals.gs_att||0,    +vals.gs_cor||0,    100) : null
  const a = vals.afcat_att ? calcNM(+vals.afcat_att||0, +vals.afcat_cor||0, 300, 1) : null
  const totalRaw = isCDS ? ((m?.raw||0)+(e?.raw||0)+(g?.raw||0)) : (a?.raw||0)
  const pct = totalRaw>0 ? Math.round(Math.abs(totalRaw)/300*100) : 0

  function ScoreRow({ label, sc, color }) {
    if(!sc) return null
    const pass = sc.raw>=20
    return (
      <div style={{background:'var(--bg4)',border:`1px solid ${color}22`,borderRadius:4,padding:14,marginBottom:10}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <span style={{fontSize:14,color,fontWeight:600}}>{label}</span>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            {isCDS&&<span className="tag" style={{background:pass?'#0d3320':'var(--rdim)',border:`1px solid ${pass?'#39ff1433':'#ff333333'}`,color:pass?'var(--green)':'var(--red)'}}>
              {pass?'PASS ✓':'FAIL ✗'} (min 20)
            </span>}
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:26,color:sc.raw>=40?'var(--green)':sc.raw>=20?'var(--gold)':'var(--red)'}}>{sc.raw}</span>
          </div>
        </div>
        <div style={{display:'flex',gap:16,marginTop:10,flexWrap:'wrap'}}>
          {[['Att',sc.attempted,'var(--text)'],['✓ Correct',sc.correct,'var(--green)'],['✗ Wrong',sc.wrong,'var(--red)'],['Accuracy',`${sc.acc}%`,sc.acc>=70?'var(--green)':sc.acc>=50?'var(--gold)':'var(--red)']].map(([l,v,c])=>(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:15,color:c}}>{v}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:'var(--text4)'}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function InputBlock({ keyName, label, color, max=100 }) {
    return (
      <div className="card" style={{borderColor:`${color}22`,marginBottom:0}}>
        <div className="card-title" style={{color,marginBottom:10}}>{label}</div>
        <div className="g2">
          <div><label className="lbl">ATTEMPTED (/{max})</label>
            <input type="number" min={0} max={max} className="inp" placeholder="0" value={vals[`${keyName}_att`]} onChange={set(`${keyName}_att`)}/>
          </div>
          <div><label className="lbl">CORRECT</label>
            <input type="number" min={0} max={max} className="inp" placeholder="0" value={vals[`${keyName}_cor`]} onChange={set(`${keyName}_cor`)}/>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-inner fade-in">
      <div className="card">
        <div className="card-title">📊 NEGATIVE MARKING CALCULATOR
          <span style={{color:'var(--text4)',fontSize:9}}>−⅓ per wrong (CDS)</span>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
          <button className={`btn${mode==='cds'?' btn-g':''}`} style={{padding:'8px 16px'}} onClick={()=>setMode('cds')}>⚡ CDS (3 papers)</button>
          <button className={`btn${mode==='afcat'?' btn-g':''}`} style={{padding:'8px 16px'}} onClick={()=>setMode('afcat')}>✈ AFCAT</button>
        </div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:'var(--text5)',padding:10,background:'var(--bg4)',border:'1px solid var(--border)',borderRadius:3,marginBottom:14,lineHeight:1.8}}>
          {isCDS ? 'CDS: 3 papers × 100 marks. Min 20/100 per paper required. −⅓ mark for each wrong answer.'
                 : 'AFCAT: 3 marks per correct, 1 mark deducted per wrong. Total /300.'}
        </div>
      </div>

      {isCDS ? (
        <div className="g3" style={{marginBottom:12}}>
          <InputBlock keyName="maths" label="⚡ MATHS /100"   color="#ffd700"/>
          <InputBlock keyName="eng"   label="⚡ ENGLISH /100" color="#00d4ff"/>
          <InputBlock keyName="gs"    label="⚡ GS /100"      color="#39ff14"/>
        </div>
      ) : (
        <div style={{marginBottom:12}}>
          <InputBlock keyName="afcat" label="✈ AFCAT /300" color="#bf80ff" max={100}/>
        </div>
      )}

      <ScoreRow label="⚡ MATHS"   sc={m} color="#ffd700"/>
      <ScoreRow label="⚡ ENGLISH" sc={e} color="#00d4ff"/>
      <ScoreRow label="⚡ GS"      sc={g} color="#39ff14"/>
      <ScoreRow label="✈ AFCAT"   sc={a} color="#bf80ff"/>

      {isCDS && (m||e||g) && (
        <div className="card" style={{borderColor:'#39ff1444',background:'#030f03',textAlign:'center'}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:'var(--text4)',letterSpacing:2,marginBottom:8}}>TOTAL CDS SCORE</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:48,color:totalRaw>=settings.targetIMA?'var(--green)':totalRaw>=120?'var(--gold)':'var(--red)'}}>
            {Math.round(totalRaw)}/300
          </div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:12,color:'var(--text3)',marginTop:3}}>
            {pct}% · Target: {settings.targetIMA}+
          </div>
          <div style={{marginTop:12,padding:12,background:'var(--bg4)',borderRadius:3,fontFamily:"'Share Tech Mono',monospace",fontSize:13}}>
            {totalRaw>=settings.targetAFA
              ? <span style={{color:'var(--gold)'}}>✈ AFA CUTOFF MET</span>
              : totalRaw>=settings.targetIMA
              ? <span style={{color:'var(--green)'}}>⚡ IMA/INA CUTOFF MET</span>
              : <span style={{color:'var(--red)'}}>⚠ BELOW TARGET — KEEP DRILLING</span>}
          </div>
        </div>
      )}
    </div>
  )
}
