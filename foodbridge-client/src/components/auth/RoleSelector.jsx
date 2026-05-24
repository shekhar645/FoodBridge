const roles = [
  { id: 'restaurant', label: 'Restaurant', emoji: '🏪', desc: 'List surplus food' },
  { id: 'ngo', label: 'NGO', emoji: '🤝', desc: 'Collect & distribute' },
  { id: 'volunteer', label: 'Volunteer', emoji: '🚚', desc: 'Help pickups' },
  { id: 'community', label: 'Student / Community', emoji: '🎓', desc: 'Find nearby meals' },
]

function RoleSelector({ value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-3 block text-sm font-medium text-slate-300">
        I am joining as <span className="text-orange-400">*</span>
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {roles.map((role) => {
          const selected = value === role.id
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onChange(role.id)}
              className={`rounded-2xl border p-3 text-left transition duration-200 sm:p-4 ${
                selected
                  ? 'border-green-500/50 bg-green-500/10 ring-2 ring-green-500/30'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              <span className="text-xl sm:text-2xl">{role.emoji}</span>
              <p className="mt-2 text-xs font-bold text-white sm:text-sm">{role.label}</p>
              <p className="mt-0.5 hidden text-[11px] text-slate-500 sm:block">{role.desc}</p>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default RoleSelector
