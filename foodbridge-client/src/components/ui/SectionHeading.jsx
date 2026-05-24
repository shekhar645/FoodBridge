function SectionHeading({ badge, title, subtitle, align = 'center', id }) {
  const alignClass =
    align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl text-left'

  return (
    <div id={id} className={`mb-12 md:mb-16 ${alignClass}`}>
      {badge && (
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/25 bg-green-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-green-300 sm:text-sm">
          {badge}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">{subtitle}</p>
      )}
    </div>
  )
}

export default SectionHeading
