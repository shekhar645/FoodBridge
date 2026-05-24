import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const STATUS_COLORS = {
  available:  { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Available' },
  claimed:    { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Claimed' },
  picked_up:  { bg: 'bg-gray-100',    text: 'text-gray-600',    label: 'Collected' },
  expired:    { bg: 'bg-red-100',     text: 'text-red-600',     label: 'Expired' },
  cancelled:  { bg: 'bg-orange-100',  text: 'text-orange-600',  label: 'Cancelled' },
}

export default function NgoDashboard() {
  const { user, logout } = useAuth()
  const [tab, setTab]           = useState('browse')
  const [available, setAvailable]   = useState([])
  const [myClaims, setMyClaims]     = useState([])
  const [notifications, setNotifications] = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [cityFilter, setCityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [claiming, setClaiming] = useState(null)
  const [success, setSuccess]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (cityFilter) params.city = cityFilter
      if (typeFilter) params.food_type = typeFilter

      const [aRes, cRes, sRes, nRes] = await Promise.all([
        api.get('/donations', { params }),
        api.get('/donations/claimed'),
        api.get('/donations/stats'),
        api.get('/notifications'),
      ])
      setAvailable(aRes.data.data || [])
      setMyClaims(cRes.data.data || [])
      setStats(sRes.data.data)
      setNotifications(nRes.data.data || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [cityFilter, typeFilter])

  useEffect(() => { load() }, [load])

  const claim = async (id) => {
    setClaiming(id)
    try {
      await api.patch(`/donations/${id}/claim`, { notes: '' })
      setSuccess('Donation claimed! Go to "My Claims" to confirm pickup.')
      load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim.')
    } finally { setClaiming(null) }
  }

  const markPickup = async (id) => {
    try {
      await api.patch(`/donations/${id}/pickup`)
      setSuccess('Pickup confirmed!')
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed.')
    }
  }

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`)
    setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: true } : x))
  }

  const unread = notifications.filter(n => !n.is_read).length
  const p = stats?.personal || {}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤝</span>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">{user?.org_name || user?.name}</h1>
            <p className="text-xs text-gray-400">NGO Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setTab('notifications')} className="relative p-2 rounded-lg hover:bg-gray-100 transition">
            🔔
            {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unread}</span>}
          </button>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">Sign out</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Claimed',   value: p.total_claimed    || 0, icon: '📦' },
              { label: 'Collected',       value: p.total_collected  || 0, icon: '✅' },
              { label: 'Meals Collected', value: p.meals_collected  || 0, icon: '🍱' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold text-gray-800">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[['browse','Browse Food'],['claims','My Claims'],['notifications','Notifications']].map(([k,v]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab===k ? 'bg-green-500 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {v}{k==='notifications' && unread > 0 ? ` (${unread})` : ''}
            </button>
          ))}
        </div>

        {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}

        {/* Browse Tab */}
        {tab === 'browse' && (
          <>
            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap">
              <input value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                placeholder="Filter by city…" onKeyDown={e => e.key === 'Enter' && load()}
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-44" />
              <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value) }}
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="">All Types</option>
                <option value="veg">🥦 Veg</option>
                <option value="non-veg">🍗 Non-Veg</option>
                <option value="both">🍱 Both</option>
              </select>
              <button onClick={load} className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition">Search</button>
            </div>

            {loading ? <p className="text-center text-gray-400 py-16">Loading…</p> :
            available.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-3">🍽️</div>
                <p className="text-gray-500 font-medium">No donations available right now</p>
                <p className="text-gray-400 text-sm mt-1">Try changing city or food type filter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {available.map(d => (
                  <div key={d.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-800">{d.title}</h3>
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{d.food_type}</span>
                        </div>
                        {d.description && <p className="text-sm text-gray-500 mt-1">{d.description}</p>}
                        <p className="text-sm text-gray-500 mt-1">📦 {d.quantity}{d.serves ? ` · serves ${d.serves} people` : ''}</p>
                        <p className="text-xs text-gray-400 mt-0.5">🍽️ {d.org_name || d.restaurant_name}</p>
                        <p className="text-xs text-gray-400">📍 {d.city} · ⏰ Before {new Date(d.best_before).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">📞 {d.restaurant_phone} · 🏠 {d.pickup_address}</p>
                      </div>
                      <button onClick={() => claim(d.id)} disabled={claiming === d.id}
                        className="flex-shrink-0 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm font-semibold rounded-xl transition">
                        {claiming === d.id ? 'Claiming…' : 'Claim'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* My Claims Tab */}
        {tab === 'claims' && (
          loading ? <p className="text-center text-gray-400 py-16">Loading…</p> :
          myClaims.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-3">📦</div>
              <p className="text-gray-500 font-medium">No claims yet</p>
              <p className="text-gray-400 text-sm mt-1">Browse available donations and claim one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myClaims.map(d => {
                const s = STATUS_COLORS[d.status] || STATUS_COLORS.available
                return (
                  <div key={d.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-800">{d.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}>
                            {d.claim_status === 'picked_up' ? 'Collected' : d.claim_status || s.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">📦 {d.quantity}</p>
                        <p className="text-xs text-gray-400 mt-0.5">🍽️ {d.org_name || d.restaurant_name} · 📞 {d.restaurant_phone}</p>
                        <p className="text-xs text-gray-400">📍 {d.pickup_address}, {d.city}</p>
                        <p className="text-xs text-gray-300 mt-0.5">Claimed: {new Date(d.claimed_at).toLocaleString()}</p>
                      </div>
                      {d.status === 'claimed' && d.claim_status !== 'picked_up' && (
                        <button onClick={() => markPickup(d.id)}
                          className="flex-shrink-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition">
                          Mark Collected
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* Notifications Tab */}
        {tab === 'notifications' && (
          notifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-3">🔔</div>
              <p className="text-gray-400">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${n.is_read ? 'bg-white border-gray-100 opacity-70' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📢</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{n.title}</p>
                      <p className="text-gray-500 text-sm mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-300 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                    {!n.is_read && <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}