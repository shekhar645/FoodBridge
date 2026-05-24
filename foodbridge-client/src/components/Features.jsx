import SectionHeading from './ui/SectionHeading'

const features = [
  {
    id: 'restaurants',
    title: 'For Restaurants',
    desc: 'Turn end-of-day surplus into community goodwill. List pickups in under 2 minutes.',
    points: ['No complex POS integration', 'Pickup time slots', 'Photo upload (Cloudinary later)'],
    gradient: 'from-orange-500 to-amber-600',
    icon: '🍛',
  },
  {
    id: 'ngos',
    title: 'For NGOs & Volunteers',
    desc: 'See verified listings on a map, claim pickups, and coordinate distribution.',
    points: ['Live availability feed', 'Distance sorting', 'Volunteer coordination'],
    gradient: 'from-green-500 to-emerald-600',
    icon: '🚚',
  },
  {
    title: 'For Students & Bachelors',
    desc: 'Affordable or free meals near hostels, PGs, and coaching hubs.',
    points: ['Hostel-friendly listings', 'Night pickup alerts', 'Budget meal filters'],
    gradient: 'from-violet-500 to-purple-600',
    icon: '🎓',
  },
]

function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/[0.03] to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Built for everyone"
          title="One platform, many communities"
          subtitle="FoodBridge is not only donation — it supports students, aspirants, and low-income workers."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              id={f.id}
              className="glass flex flex-col rounded-3xl p-6 sm:p-8 transition duration-300 hover:border-white/20 hover:bg-white/[0.06]"
            >
              <span
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} text-2xl shadow-lg`}
              >
                {f.icon}
              </span>
              <h3 className="mt-6 text-xl font-bold text-white">{f.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              <ul className="mt-6 space-y-2 border-t border-white/10 pt-6">
                {f.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-slate-300">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
