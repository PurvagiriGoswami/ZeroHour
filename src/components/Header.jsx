import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { formatDate } from '../utils/dateUtils'

export default function Header({ onNav }) {
  const { state } = useStore()
  const { syncStatus } = state
  const [time, setTime] = useState(new Date())

  useEffect(()=>{
    const t = setInterval(()=>setTime(new Date()), 1000)
    return ()=>clearInterval(t)
  },[])

  const dateStr = formatDate(time)
  const timeStr = time.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})

  return (
    <div className="glass" style={{
      borderBottom:'1px solid rgba(0,255,195,0.15)',
      padding:'0 24px',
      height:'var(--hdr-h)',
      display:'flex',alignItems:'center',justifyContent:'space-between',
      flexShrink:0,position:'relative',zIndex:50,
      paddingTop:'var(--safe-top)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
    }}>
      <div 
        onClick={() => onNav?.('dash')}
        style={{display:'flex', flexDirection:'column', justifyContent:'center', cursor:'pointer', userSelect:'none', transition:'transform 0.2s'}}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div className="text-glow" style={{fontFamily:"'Share Tech Mono',monospace",fontSize:26,color:'var(--green)',letterSpacing:3,lineHeight:1, fontWeight:'800'}}>
          ZEROHOUR
        </div>
        <div style={{fontSize:10, color:'var(--text3)', letterSpacing:1.5, marginTop:6, textTransform:'uppercase', fontWeight:600, opacity: 0.8}}>
          PREPARE SMART. PERFORM AT ZERO HOUR.
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:24}}>
        <div style={{display:'flex', alignItems:'center', gap:8, background:'rgba(0,0,0,0.2)', padding:'4px 12px', borderRadius:20, border:'1px solid rgba(0,255,195,0.1)'}}>
          <div className={`sync-dot ${syncStatus}`} title={syncStatus==='ok'?'Synced ✓':syncStatus==='syncing'?'Syncing...':'Sync error'}/>
          <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:'var(--text4)', letterSpacing:1}}>SYSTEM: <span style={{color:syncStatus==='ok'?'var(--green)':'var(--gold)'}}>{syncStatus==='ok'?'NOMINAL':'SYNCING'}</span></span>
        </div>
        
        <div className="digital-clock" style={{display:'flex', flexDirection:'column', alignItems:'flex-end', minWidth:160}}>
          <div style={{fontSize:12, color:'var(--text3)', opacity:0.7, marginBottom:2}}>{dateStr}</div>
          <div style={{fontSize:22, fontWeight:'bold', letterSpacing:2}}>{timeStr}</div>
        </div>
      </div>
    </div>
  )
}
