import { useState, createContext, useContext, useCallback } from 'react'

const ModalCtx = createContext(null)

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null)

  const confirm = useCallback((title, msg, onOk, okLabel = 'CONFIRM', danger = true) => {
    setModal({ title, msg, onOk, okLabel, danger })
  }, [])

  const close = () => setModal(null)

  return (
    <ModalCtx.Provider value={confirm}>
      {children}
      {modal && (
        <div onClick={close} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.8)',
          zIndex:9998, display:'flex', alignItems:'center', justifyContent:'center', padding:16
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:'#0a140a', border:'1px solid #1a3a1a', borderRadius:6,
            padding:24, maxWidth:360, width:'100%',
            animation:'slideUp .2s ease'
          }}>
            <h3 style={{fontFamily:"'Share Tech Mono',monospace",fontSize:12,letterSpacing:2,color:'#39ff14',marginBottom:12}}>
              {modal.title}
            </h3>
            <p style={{fontSize:14,color:'#7ab07a',marginBottom:18,lineHeight:1.6}}>{modal.msg}</p>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className="btn" onClick={close}>CANCEL</button>
              <button className={`btn ${modal.danger ? 'btn-r' : 'btn-g'}`} onClick={() => { close(); modal.onOk() }}>
                {modal.okLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalCtx.Provider>
  )
}

export const useConfirm = () => useContext(ModalCtx)
