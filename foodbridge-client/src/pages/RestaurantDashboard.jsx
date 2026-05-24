import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const STATUS_COLORS = {
  available:  { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Available' },
  claimed:    { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Claimed' },
  picked_up:  { bg: 'bg-gray-100',    text: 'text-gray-600',    label: 'Picked Up' },
  expired:    { bg: 'bg-red-100',     text: 'text-red-600',     label: 'Expired' },
  cancelled:  { bg: 'bg-orange-100',  text: 'text-orange-600',  label: 'Cancelled' },
}

const EMPTY_FORM = {
  title: '', description: '', food_type: 'veg', quantity: '', serves: '',
  pickup_address: '', city: '', pincode: '', best_before: '', image_url: '',
}

export default function RestaurantDashboard() {
  const { user, logout } = useAuth()
  const [tab, setTab]         = useState('donations')
  const [donations, setDonations] = useState([])
  const [stats, setStats]     = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [dRes, sRes, nRes] = await Promise.all([
        api.get('/donations/my'),
        api.get('/donations/stats'),
        api.get('/notifications'),
      ])
      setDonations(dRes.data.data || [])
      setStats(sRes.data.data)
      setNotifications(nRes.data.data || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const update = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const openNew = () => { setForm(EMPTY_FORM); setEditItem(null); setShowForm(true); setError('') }
  const openEdit = (d) => {
    setForm({
      title: d.title, description: d.description || '', food_type: d.food_type,
      quantity: d.quantity, serves: d.serves || '', pickup_address: d.pickup_address,
      city: d.city, pincode: d.pincode || '',
      best_before: d.best_before?.slice(0, 16) || '', image_url: d.image_url || '',
    })
    setEditItem(d)
    setShowForm(true)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      const payload = { ...form, serves: form.serves ? parseInt(form.serves) : undefined }
      if (editItem) {
        await api.patch(`/donations/${editItem.id}`, payload)
        setSuccess('Donation updated!')
      } else {
        await api.post('/donations', payload)
        setSuccess('Donation listed!')
      }
      setShowForm(false)
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed. Try again.')
    } finally { setSubmitting(false) }
  }

  const cancel = async (id) => {
    if (!confirm('Cancel this donation?')) return
    try {
      await api.delete(`/donations/${id}`)
      setSuccess('Donation cancelled.')
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel.')
    }
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
          <span className="text-2xl">🍽️</span>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">{user?.org_name || user?.name}</h1>
            <p className="text-xs text-gray-400">Restaurant Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setTab('notifications')} className="relative p-2 rounded-lg hover:bg-gray-100 transition">
            🔔
            {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unread}</span>}
          </button>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Listed',  value: p.total_listed    || 0, icon: '📋' },
              { label: 'Active Now',    value: p.total_active    || 0, icon: '✅' },
              { label: 'Completed',     value: p.total_completed || 0, icon: '🎯' },
              { label: 'Meals Donated', value: p.meals_donated   || 0, icon: '🍱' },
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
        <div className="flex gap-2 mb-5">
          {[['donations','My Donations'],['notifications','Notifications']].map(([k,v]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab===k ? 'bg-green-500 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {v}{k==='notifications' && unread > 0 ? ` (${unread})` : ''}
            </button>
          ))}
          <button onClick={openNew}
            className="ml-auto px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold shadow transition">
            + New Donation
          </button>
        </div>

        {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}

        {/* Donations Tab */}
        {tab === 'donations' && (
          loading ? <p className="text-center text-gray-400 py-16">Loading…</p> :
          donations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-3">🍱</div>
              <p className="text-gray-500 font-medium">No donations yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "New Donation" to list surplus food</p>
            </div>
          ) : (
            <div className="space-y-3">
              {donations.map(d => {
                const s = STATUS_COLORS[d.status] || STATUS_COLORS.available
                return (
                  <div key={d.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-800">{d.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}>{s.label}</span>
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{d.food_type}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{d.quantity}{d.serves ? ` · serves ${d.serves}` : ''}</p>
                        <p className="text-xs text-gray-400 mt-0.5">📍 {d.city} · ⏰ {new Date(d.best_before).toLocaleString()}</p>
                        {d.claimed_by_name && <p className="text-xs text-blue-600 mt-1">Claimed by: {d.claimed_by_org || d.claimed_by_name}</p>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {d.status === 'available' && <>
                          <button onClick={() => openEdit(d)} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Edit</button>
                          <button onClick={() => cancel(d.id)} className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition">Cancel</button>
                        </>}
                        {d.status === 'claimed' && (
                          <button onClick={() => markPickup(d.id)} className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Confirm Pickup</button>
                        )}
                      </div>
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

      {/* Donation Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Edit Donation' : 'New Donation'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Title *</label>
                  <input required value={form.title} onChange={update('title')} placeholder="e.g. Leftover Biryani"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                  <textarea value={form.description} onChange={update('description')} rows={2} placeholder="Any details about the food…"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Food Type *</label>
                    <select required value={form.food_type} onChange={update('food_type')}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                      <option value="veg">🥦 Veg</option>
                      <option value="non-veg">🍗 Non-Veg</option>
                      <option value="both">🍱 Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Quantity *</label>
                    <input required value={form.quantity} onChange={update('quantity')} placeholder="e.g. 20 meals"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Serves (people)</label>
                    <input type="number" min="1" value={form.serves} onChange={update('serves')} placeholder="e.g. 20"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Best Before *</label>
                    <input required type="datetime-local" value={form.best_before} onChange={update('best_before')}
                      min={new Date().toISOString().slice(0,16)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Pickup Address *</label>
                  <input required value={form.pickup_address} onChange={update('pickup_address')} placeholder="Full address for pickup"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">City *</label>
                    <input required value={form.city} onChange={update('city')} placeholder="e.g. Mumbai"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Pincode</label>
                    <input value={form.pincode} onChange={update('pincode')} placeholder="e.g. 400001"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Image URL</label>
                  <input value={form.image_url} onChange={update('image_url')} placeholder="https://… (optional)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-xl text-sm font-semibold transition">
                    {submitting ? 'Saving…' : editItem ? 'Update' : 'List Donation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}