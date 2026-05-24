import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [stats, setStats]       = useState({});
  const [donations, setDonations] = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, donRes] = await Promise.all([
        api.get("/donations/public-stats"),
        api.get("/donations", { params: { limit: 50 } }),
      ]);
      setStats(statsRes.data.data || {});
      setDonations(donRes.data.data || []);
    } catch {}
    setLoading(false);
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const statusColor = {
    available: "#1a8c2e",
    claimed:   "#f97316",
    picked_up: "#3b82f6",
    expired:   "#9ca3af",
    cancelled: "#ef4444",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
            style={{ background: "linear-gradient(135deg, #1a8c2e, #22a83a)" }}>
            A
          </div>
          <div>
            <div className="font-bold text-gray-900">{user?.name}</div>
            <div className="text-xs text-gray-400">Admin Dashboard</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors font-medium">
          Sign out
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {[
            { id: "overview",  label: "📊 Overview" },
            { id: "donations", label: "🍱 All Donations" },
            { id: "links",     label: "🔗 Quick Links" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === t.id ? "#1a8c2e" : "white",
                color:      tab === t.id ? "white"   : "#6b7280",
                border:     `1.5px solid ${tab === t.id ? "#1a8c2e" : "#e5e7eb"}`
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4 animate-pulse">📊</div>
            <div>Loading data…</div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Meals Served",   value: stats.meals_served || 0, icon: "🍱", color: "#1a8c2e" },
                    { label: "Restaurants",    value: stats.restaurants  || 0, icon: "🏪", color: "#3b82f6" },
                    { label: "NGOs",           value: stats.ngos         || 0, icon: "🤝", color: "#f97316" },
                    { label: "Cities",         value: stats.cities       || 0, icon: "🏙️", color: "#8b5cf6" },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100">
                      <div className="text-2xl mb-2">{s.icon}</div>
                      <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Donation status breakdown */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-800 mb-4">Donation Status Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {["available","claimed","picked_up","expired","cancelled"].map(s => {
                      const count = donations.filter(d => d.status === s).length;
                      return (
                        <div key={s} className="text-center p-4 rounded-xl bg-gray-50">
                          <div className="text-2xl font-black" style={{ color: statusColor[s] }}>{count}</div>
                          <div className="text-xs text-gray-400 mt-1 capitalize">{s.replace("_"," ")}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Donations Tab */}
            {tab === "donations" && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800">All Donations ({donations.length})</h3>
                  <button onClick={loadAll}
                    className="text-xs px-3 py-1.5 rounded-lg border text-gray-500 hover:bg-gray-50">
                    🔄 Refresh
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["ID","Title","Restaurant","City","Type","Status","Best Before"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {donations.map(d => (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-400 text-xs">#{d.id}</td>
                          <td className="px-4 py-3 font-medium text-gray-800 max-w-32 truncate">{d.title}</td>
                          <td className="px-4 py-3 text-gray-500 max-w-32 truncate">{d.org_name || d.restaurant_name}</td>
                          <td className="px-4 py-3 text-gray-500">{d.city}</td>
                          <td className="px-4 py-3 text-gray-500 capitalize">{d.food_type}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                              style={{ background: statusColor[d.status] || "#9ca3af" }}>
                              {d.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {new Date(d.best_before).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quick Links Tab */}
            {tab === "links" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Restaurant Dashboard", path: "/restaurant", icon: "🍽️", desc: "View as restaurant" },
                  { label: "NGO Dashboard",        path: "/ngo",        icon: "🤝", desc: "View as NGO" },
                  { label: "User Dashboard",       path: "/dashboard",  icon: "🙋", desc: "View as user" },
                  { label: "Find Food",            path: "/nearby",     icon: "📍", desc: "Public food map" },
                  { label: "Profile",              path: "/profile",    icon: "👤", desc: "Edit your profile" },
                  { label: "Home Page",            path: "/",           icon: "🏠", desc: "Public home page" },
                ].map(l => (
                  <Link key={l.path} to={l.path}
                    className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all hover:-translate-y-0.5">
                    <div className="text-3xl mb-3">{l.icon}</div>
                    <div className="font-bold text-gray-800">{l.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{l.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}