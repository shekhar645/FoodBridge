import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const [donations, setDonations] = useState([])
  const [globalStats, setGlobalStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState(user?.city || '')
  const [typeFilter, setTypeFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { status: 'available' }
      if (cityFilter) params.city = cityFilter
      if (typeFilter) params.food_type = typeFilter

      const [dRes, sRes] = await Promise.all([
        api.get('/donations', { params }),
        api.get('/donations/stats'),
      ])
      setDonations(dRes.data.data || [])
      setGlobalStats(sRes.data.data?.global)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [cityFilter, typeFilter])

  useEffect(() => { load() }, [load])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌉</span>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">Hi, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-xs text-gray-400">Find food near you</p>
          </div>
        </div>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">Sign out</button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Global Impact Stats */}
        {globalStats && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 mb-6 text-white shadow-lg">
            <h2 className="font-semibold text-sm opacity-80 mb-3">🌍 FoodBridge Global Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Donations',    value: globalStats.total_donations    || 0 },
                { label: 'Meals Served', value: globalStats.total_meals_served || 0 },
                { label: 'Restaurants',  value: globalStats.active_restaurants || 0 },
                { label: 'NGOs Active',  value: globalStats.active_ngos        || 0 },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs opacity-70 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <input value={cityFilter} onChange={e => setCityFilter(e.target.value)}
            placeholder="Filter by city…" onKeyDown={e => e.key === 'Enter' && load()}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-44" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
            <option value="">All Types</option>
            <option value="veg">🥦 Veg</option>
            <option value="non-veg">🍗 Non-Veg</option>
            <option value="both">🍱 Both</option>
          </select>
          <button onClick={load} className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition">Search</button>
        </div>

        <h2 className="font-semibold text-gray-700 mb-3">
          {cityFilter ? `Available Food in ${cityFilter}` : 'Available Food Near You'}
          <span className="ml-2 text-sm font-normal text-gray-400">({donations.length} listings)</span>
        </h2>

        {loading ? <p className="text-center text-gray-400 py-16">Loading…</p> :
        donations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-3">🍽️</div>
            <p className="text-gray-500 font-medium">No food available right now</p>
            <p className="text-gray-400 text-sm mt-1">Try a different city or check back later</p>
          </div>
        ) : (
          <div className="space-y-3">
            {donations.map(d => (
              <div key={d.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-4">
                  {d.image_url && (
                    <img src={d.image_url} alt={d.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{d.title}</h3>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{d.food_type}</span>
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Available</span>
                    </div>
                    {d.description && <p className="text-sm text-gray-500 mt-1">{d.description}</p>}
                    <p className="text-sm text-gray-500 mt-1">📦 {d.quantity}{d.serves ? ` · feeds ${d.serves} people` : ''}</p>
                    <p className="text-xs text-gray-400 mt-0.5">🍽️ {d.org_name || d.restaurant_name}</p>
                    <p className="text-xs text-gray-400">📍 {d.pickup_address}, {d.city}</p>
                    <p className="text-xs text-orange-500 mt-0.5">⏰ Available until {new Date(d.best_before).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}