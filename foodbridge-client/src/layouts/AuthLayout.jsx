import { Link, Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14]">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 mesh-bg" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 grid-pattern opacity-40" />

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        {/* Brand panel — hidden on small phones, visible tablet+ */}
        <aside className="hidden w-full flex-col justify-between border-b border-white/10 bg-gradient-to-br from-green-600/10 via-[#070b14] to-orange-600/10 p-8 sm:flex lg:w-[45%] lg:border-b-0 lg:border-r lg:p-12 xl:w-[42%]">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-orange-500 text-lg font-extrabold text-white shadow-lg shadow-green-500/30">
              F
            </span>
            <span className="text-xl font-bold">
              Food<span className="text-green-400">Bridge</span>
            </span>
          </Link>

          <div className="my-10 max-w-md">
            <h1 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
              Join the movement to{' '}
              <span className="text-gradient-brand">save food</span> and feed communities
            </h1>
            <p className="mt-4 text-slate-400">
              Restaurants, NGOs, volunteers, and students — one platform to reduce waste and
              share meals with dignity.
            </p>
            <ul className="mt-8 space-y-3">
              {['Free to register', 'Role-based dashboards later', 'Secure auth in next phase'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          <p className="text-xs text-slate-600">© FoodBridge · MERN learning project</p>
        </aside>

        {/* Form panel */}
        <main className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6 lg:border-0 lg:px-12 lg:pt-8">
            <Link to="/" className="inline-flex items-center gap-2 sm:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-orange-500 font-bold text-white">
                F
              </span>
              <span className="font-bold">
                Food<span className="text-green-400">Bridge</span>
              </span>
            </Link>
            <Link
              to="/"
              className="ml-auto text-sm font-medium text-slate-400 transition hover:text-white lg:ml-0"
            >
              ← Back to home
            </Link>
          </header>

          <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
            <div className="w-full max-w-md">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AuthLayout
