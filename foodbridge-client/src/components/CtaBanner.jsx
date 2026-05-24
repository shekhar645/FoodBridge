import Button from './ui/Button'

function CtaBanner() {
  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-green-600/20 via-slate-900 to-orange-600/20 p-8 sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-green-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-orange-500/25 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-4xl">
              Ready to save food and feed your city?
            </h2>
            <p className="mt-4 text-sm text-slate-300 sm:text-lg">
              Join as a restaurant, NGO, volunteer, or community member. Free to start.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Button to="/register" variant="primary" size="lg" className="w-full sm:w-auto">
                Create free account
              </Button>
              <Button href="#how-it-works" variant="secondary" size="lg" className="w-full sm:w-auto">
                See how it works
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CtaBanner
