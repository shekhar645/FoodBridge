import SectionHeading from './ui/SectionHeading'

const steps = [
  {
    step: '01',
    title: 'Restaurant lists surplus',
    desc: 'At closing time, upload food name, quantity, pickup window, location, and optional photo.',
    icon: '🏪',
    color: 'from-orange-500/20 to-orange-600/5 border-orange-500/20',
  },
  {
    step: '02',
    title: 'Nearby users get notified',
    desc: 'NGOs, volunteers, and community members see live listings sorted by distance.',
    icon: '📍',
    color: 'from-green-500/20 to-green-600/5 border-green-500/20',
  },
  {
    step: '03',
    title: 'Pickup & distribute',
    desc: 'Verified collectors pick up food on time and serve students, hubs, and families.',
    icon: '🤝',
    color: 'from-emerald-500/20 to-teal-600/5 border-emerald-500/20',
  },
  {
    step: '04',
    title: 'Impact tracked',
    desc: 'Meals saved, waste reduced, and community trust built — visible on dashboards.',
    icon: '📊',
    color: 'from-sky-500/20 to-blue-600/5 border-sky-500/20',
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Simple flow"
          title="How FoodBridge works"
          subtitle="Four steps from restaurant kitchen to someone's dinner plate — designed for speed at night."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((item, index) => (
            <article
              key={item.step}
              className={`glass group relative overflow-hidden rounded-3xl border bg-gradient-to-b p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 ${item.color}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-3xl">{item.icon}</span>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Step {item.step}
              </p>
              <h3 className="mt-2 text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
              <span className="absolute -right-4 -top-4 text-7xl font-black text-white/[0.03]">
                {item.step}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
