import SectionHeading from './ui/SectionHeading'

const audiences = [
  { label: 'UPSC hubs', emoji: '📚', desc: 'Coaching centers & aspirant PGs' },
  { label: 'NEET / JEE hostels', emoji: '🏥', desc: 'Late-night meals after study' },
  { label: 'Hostel students', emoji: '🛏️', desc: 'Campus & private hostels' },
  { label: 'Bachelors & PGs', emoji: '🏠', desc: 'Low-cost dinner options' },
  { label: 'Low-income workers', emoji: '👷', desc: 'Dignified food access' },
  { label: 'Poor families', emoji: '❤️', desc: 'NGO-led distribution' },
]

function Audience() {
  return (
    <section id="community" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Unique to FoodBridge"
          title="More than a donation app"
          subtitle="Search nearby food by location — built for India's student and aspirant communities."
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {audiences.map((item) => (
            <div
              key={item.label}
              className="glass group flex flex-col items-center rounded-2xl p-4 text-center transition duration-300 hover:-translate-y-1 hover:border-green-500/30 sm:rounded-3xl sm:p-5"
            >
              <span className="text-2xl transition duration-300 group-hover:scale-110 sm:text-3xl">
                {item.emoji}
              </span>
              <p className="mt-3 text-xs font-bold text-white sm:text-sm">{item.label}</p>
              <p className="mt-1 hidden text-[11px] text-slate-500 sm:block">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Audience
