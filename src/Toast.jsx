import { useState, useCallback, createContext, useContext } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'ok', dur = 3000) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), dur)
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{
        position:'fixed', top:16, right:16, zIndex:9999,
        display:'flex', flexDirection:'column', gap:8,
        pointerEvents:'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} onClick={() => setToasts(x => x.filter(i => i.id !== t.id))}
            style={{
              fontFamily:"'Share Tech Mono',monospace", fontSize:10,
              padding:'11px 14px', borderRadius:4, letterSpacing:1,
              pointerEvents:'all', cursor:'pointer', maxWidth:300,
              animation:'toastIn .3s ease forwards',
              ...(t.type==='ok'   ? {background:'#0d3a0d',border:'1px solid #39ff14',color:'#39ff14'} :
                  t.type==='err'  ? {background:'#2a0a0a',border:'1px solid #ff3333',color:'#ff3333'} :
                  t.type==='warn' ? {background:'#2a1f00',border:'1px solid #ffd700',color:'#ffd700'} :
                                    {background:'#001a2a',border:'1px solid #00d4ff',color:'#00d4ff'})
            }}
          >{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
