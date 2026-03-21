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

  return (
    <div style={{
      background:'var(--bg2)',
      borderBottom:'1px solid var(--border)',
      padding:'0 14px',
      height:'var(--hdr-h)',
      display:'flex',alignItems:'center',justifyContent:'space-between',
      flexShrink:0,position:'relative',zIndex:50,
      paddingTop:'var(--safe-top)',
    }}>
      <div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:20,color:'var(--green)',letterSpacing:2,lineHeight:1.3}}>
          🎖 DEFENCECENTRE AI
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div className={`sync-dot ${syncStatus}`} title={syncStatus==='ok'?'Synced ✓':syncStatus==='syncing'?'Syncing...':'Sync error'}/>
        <div style={{textAlign:'right',fontFamily:"'Share Tech Mono',monospace",fontSize:20,color:'var(--red)'}}>
          <div>{dateStr}</div>
          <div style={{fontSize:20,color:'var(--blue, var(--cyan))' }}>{timeStr}</div>
        </div>
      </div>
    </div>
  )
}
