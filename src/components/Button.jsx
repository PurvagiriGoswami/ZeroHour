export default function Button({ children, variant = 'default', onClick, style, className = '', disabled, ...props }) {
  const variantClass = {
    default: '',
    green: 'btn-g',
    red: 'btn-r',
    yellow: 'btn-y',
    cyan: 'btn-c',
    purple: 'btn-p'
  }[variant] || ''

  return (
    <button
      className={`btn ${variantClass} ${className}`}
      onClick={onClick}
      style={style}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
