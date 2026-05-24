import { Link } from 'react-router-dom'

const variants = {
  primary:
    'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-orange-500 hover:shadow-orange-500/40',
  secondary:
    'border border-white/15 bg-white/5 text-white backdrop-blur hover:border-white/25 hover:bg-white/10',
  green:
    'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:from-green-400 hover:to-emerald-500',
  ghost: 'text-slate-300 hover:bg-white/5 hover:text-white',
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3.5 text-base rounded-2xl',
  lg: 'px-8 py-4 text-base rounded-2xl',
}

function Button({
  children,
  href,
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 font-semibold transition-all duration-300 active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button
