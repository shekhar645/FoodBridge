function FormInput({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  hint,
}) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-orange-400"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 transition focus:border-green-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-green-500/20 sm:text-base"
      />
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export default FormInput
