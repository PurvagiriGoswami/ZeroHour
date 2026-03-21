import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { formatDate } from '../utils/dateUtils'

export default function Header() {
  const { state } = useStore()
  const { syncStatus } = state
  const [time, setTime] = useState(new Date())

  useEffect(()=>{
    const t = setInterval(()=>setTime(new Date()), 1000)
    return ()=>clearInterval(t)
  },[])

  const dateStr = formatDate(time)
  const timeStr = time.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})

  const syncColors = { ok:'var(--green)', syncing:'var(--gold)', err:'var(--red)' }

  return (
    <div style={{
      background:'var(--bg2)',
      borderBottom:'1px solid var(--border)',
      padding:'0 12px',
      height:'var(--hdr-h)',
      display:'flex',
      alignItems:'center',
      justifyContent:'space-between',
      flexShrink:0,
      position:'relative',
      zIndex:50,
      paddingTop:'var(--safe-top)',
      gap:8,
    }}>
      {/* Brand */}
      <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
        <span style={{fontSize:20,lineHeight:1,flexShrink:0}}>🎖</span>
        <div style={{fontFamily:"'Share Tech Mono',monospace",color:'var(--green)',letterSpacing:1.5,lineHeight:1.3,minWidth:0}}>
          <div className="hdr-title">ZEROHOUR</div>
          <div className="hdr-sub">PREPARE SMART, PERFORM AT ZERO HOUR.</div>
        </div>
      </div>

      {/* Right: sync + clock */}
      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:5,padding:'5px 9px',
          background:'var(--bg4)',border:`1px solid ${syncColors[syncStatus]}44`,borderRadius:6}}>
          <div className={`sync-dot ${syncStatus}`}/>
          <span className="hdr-sync-label" style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,
            color:syncColors[syncStatus],letterSpacing:1}}>
            {syncStatus==='ok'?'SYNC':syncStatus==='syncing'?'...':'ERR'}
          </span>
        </div>
        <div style={{textAlign:'right',fontFamily:"'Share Tech Mono',monospace"}}>
          <div className="hdr-time" style={{color:'var(--gold)',letterSpacing:1,lineHeight:1.2}}>{timeStr}</div>
          <div className="hdr-date" style={{color:'var(--text4)',letterSpacing:.5}}>{dateStr}</div>
        </div>
      </div>
    </div>
  )
}
