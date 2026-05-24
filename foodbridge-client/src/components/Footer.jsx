const footerLinks = {
  Product: [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Community', href: '#community' },
  ],
  Roles: [
    { label: 'Restaurants', href: '#restaurants' },
    { label: 'NGOs', href: '#ngos' },
    { label: 'Volunteers', href: '/register' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Safety', href: '#' },
  ],
}

function Footer() {
  return (
    <footer id="footer" className="border-t border-white/10 bg-black/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-orange-500 font-bold text-white">
                F
              </span>
              <span className="text-lg font-bold">
                Food<span className="text-green-400">Bridge</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Connecting surplus food with people who need it — students, NGOs, families, and
              communities across India.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                {title}
              </h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-green-400"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500 sm:text-sm">
            © {new Date().getFullYear()} FoodBridge. Built with MERN — learning project.
          </p>
          <p className="text-xs text-slate-600">
            Backend · MongoDB · JWT auth — coming in next lessons
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
