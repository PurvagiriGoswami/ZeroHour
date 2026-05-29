export function EmptyState({ icon, title, cta, onAction }) { 
   return ( 
     <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-tertiary)' }}> 
       <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div> 
       <p style={{ fontSize: 15, marginBottom: 16 }}>{title}</p> 
       {cta && <button onClick={onAction} className="btn btn-c">{cta}</button>} 
     </div> 
   ); 
 } 
