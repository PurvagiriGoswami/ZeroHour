export default function Card({ title, titleColor = 'var(--green)', children, style, className = '', ...props }) {
  return (
    <div className={`card ${className}`} style={style} {...props}>
      {title && (
        <div className="card-title" style={{ color: titleColor }}>
          {title}
        </div>
      )}
      {children}
    </div>
  )
}
