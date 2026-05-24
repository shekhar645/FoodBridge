import Button from './ui/Button'

const stats = [
  { value: '2.5K+', label: 'Meals saved' },
  { value: '120+', label: 'Restaurants' },
  { value: '40+', label: 'NGO partners' },
]

const previewFood = [
  { name: 'Veg biryani tray', qty: '12 portions', time: '9:30 PM', dist: '1.2 km', hot: true },
  { name: 'Sandwich packs', qty: '20 units', time: '10:00 PM', dist: '0.8 km', hot: false },
  { name: 'Dal + rice', qty: '8 portions', time: '10:15 PM', dist: '2.1 km', hot: true },
]

const avatars = ['R', 'N', 'V', 'S']

function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          {/* Copy */}
          <div className="animate-fade-up">
            <p className="mb-5 inline-flex flex-wrap items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300 sm:text-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
              Live in 12+ cities · Zero food waste mission
            </p>

            <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-[3.5rem]">
              Bridge the gap between{' '}
              <span className="text-gradient-brand">surplus food</span> and hungry plates
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:mt-6 sm:text-lg">
              Restaurants list tonight&apos;s leftovers. NGOs, volunteers, students, and
              communities pick up nearby — fast, dignified, and free or low-cost.
            </p>

            {/* Location search — UI preview (maps API later) */}
            <div className="mt-8 animate-fade-up-delay-1">
              <label htmlFor="location-search" className="sr-only">
                Search food near you
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <div className="glass flex flex-1 items-center gap-3 rounded-2xl px-4 py-3.5">
                  <svg className="h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    id="location-search"
                    type="text"
                    placeholder="Enter area — Koramangala, Hostel, UPSC hub..."
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none sm:text-base"
                    readOnly
                  />
                </div>
                <Button to="/register" variant="primary" size="md" className="shrink-0 sm:px-8">
                  Search food
                </Button>
              </div>
              <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                Google Maps integration coming in a later lesson
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
              <Button to="/register" variant="primary" size="md">
                Find food near me
              </Button>
              <Button href="#restaurants" variant="secondary" size="md">
                Donate as restaurant
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/10 pt-8 sm:mt-10">
              <div className="flex -space-x-2">
                {avatars.map((letter, i) => (
                  <span
                    key={letter}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#070b14] bg-gradient-to-br from-slate-600 to-slate-700 text-xs font-bold text-white"
                    style={{ zIndex: avatars.length - i }}
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <p className="text-sm text-slate-400">
                <span className="font-semibold text-white">800+ volunteers</span> active this week
              </p>
            </div>

            {/* Stats — responsive grid */}
            <dl className="mt-8 grid grid-cols-3 gap-3 sm:gap-6">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="glass rounded-2xl px-3 py-4 text-center sm:px-4 sm:py-5 sm:text-left"
                >
                  <dt className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">{item.value}</dt>
                  <dd className="mt-0.5 text-[10px] leading-tight text-slate-400 sm:mt-1 sm:text-sm">
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Preview card */}
          <div className="relative animate-fade-up-delay-2 lg:animate-float">
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-green-500/30 via-transparent to-orange-500/30 blur-2xl" />
            <div className="glass-strong relative overflow-hidden rounded-[1.75rem] p-5 sm:p-7">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-green-500/20 blur-3xl" />

              <div className="relative mb-6 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white sm:text-xl">Tonight&apos;s pickups</h2>
                  <p className="text-xs text-slate-400 sm:text-sm">Updated 2 min ago</p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                  Live
                </span>
              </div>

              <ul className="relative space-y-3">
                {previewFood.map((food) => (
                  <li
                    key={food.name}
                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-3.5 transition duration-300 hover:border-green-500/40 hover:bg-slate-900/70 sm:p-4"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-orange-500/20 text-lg">
                      🍽️
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-white">{food.name}</p>
                        {food.hot && (
                          <span className="rounded-md bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-orange-300">
                            Fresh
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 sm:text-sm">
                        {food.qty} · Pickup {food.time}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-400 sm:text-sm">
                      {food.dist}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="relative mt-5 flex items-center justify-between rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3">
                <p className="text-xs text-slate-500 sm:text-sm">Preview data — MongoDB + API next</p>
                <span className="text-xs font-medium text-green-400">View all →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
