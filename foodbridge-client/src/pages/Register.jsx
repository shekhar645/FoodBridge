import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  { value: 'user', label: '🙋 User', desc: 'Find food near you' },
  { value: 'restaurant', label: '🍽️ Restaurant', desc: 'Donate surplus food' },
  { value: 'ngo', label: '🤝 NGO', desc: 'Claim & distribute food' },
]

export default function Register() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'user', org: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const dashboardFor = (role) => {
    if (role === 'restaurant') return '/restaurant'
    if (role === 'ngo') return '/ngo'
    return '/dashboard'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password,
        phone: form.phone, role: form.role,
        ...(form.role !== 'user' && { org_name: form.org }),
        ...(form.city && { city: form.city }),
      }
      const user = await register(payload)
      navigate(dashboardFor(user.role), { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed.')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 pt-20 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌉</div>
          <h1 className="text-2xl font-bold text-gray-800">Join FoodBridge</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        <div className="flex items-center mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 2 && <div className={`flex-1 h-1 mx-2 rounded ${step > 1 ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">{error}</div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a…</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button key={r.value} type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${form.role === r.value ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                    <div className="text-lg">{r.label.split(' ')[0]}</div>
                    <div className="text-xs font-medium text-gray-700 mt-1">{r.label.split(' ').slice(1).join(' ')}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" required value={form.name} onChange={update('name')} placeholder="Your full name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={update('email')} placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
            </div>
            <button type="button" disabled={!form.name || !form.email}
              onClick={() => { setError(''); setStep(2) }}
              className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all">
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required value={form.password} onChange={update('password')}
                placeholder="Min. 8 characters" minLength={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" required value={form.phone} onChange={update('phone')}
                placeholder="10-digit e.g. 9876543210" pattern="[0-9]{10}" title="Enter 10-digit phone number"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
            </div>
            {form.role !== 'user' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {form.role === 'restaurant' ? 'Restaurant Name' : 'NGO Name'}
                </label>
                <input type="text" required value={form.org} onChange={update('org')}
                  placeholder={form.role === 'restaurant' ? 'e.g. Green Leaf Cafe' : 'e.g. Helping Hands NGO'}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={form.city} onChange={update('city')} placeholder="e.g. Mumbai"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setError(''); setStep(1) }}
                className="flex-1 py-3 border border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition">
                ← Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold rounded-xl transition-all shadow-md">
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating…</span> : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}