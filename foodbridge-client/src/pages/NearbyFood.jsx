import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/axios";

const FOOD_EMOJI = { veg: "🥗", "non-veg": "🍗", both: "🍱" };

// Live countdown hook — ticks every second
function useCountdown(best_before) {
  const [timeLeft, setTimeLeft] = useState(() => calcTime(best_before));

  function calcTime(bb) {
    const diff = new Date(bb) - new Date();
    if (diff <= 0) return null;
    const hrs  = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return { hrs, mins, secs, diff };
  }

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTime(best_before)), 1000);
    return () => clearInterval(id);
  }, [best_before]);

  return timeLeft;
}

function CountdownBadge({ best_before }) {
  const t = useCountdown(best_before);
  if (!t) return <span className="text-red-500 font-semibold text-xs">⛔ Expired</span>;
  const urgent     = t.diff < 60 * 60 * 1000;
  const veryUrgent = t.diff < 15 * 60 * 1000;
  const color = veryUrgent ? "#ef4444" : urgent ? "#f97316" : "#1a8c2e";
  const display = t.hrs > 0 ? `${t.hrs}h ${t.mins}m ${t.secs}s` : `${t.mins}m ${t.secs}s`;
  return (
    <span style={{ color, fontVariantNumeric: "tabular-nums" }} className="font-semibold text-xs">
      ⏰ {display} left
    </span>
  );
}

function FoodCard({ d, userLocation, onExpired }) {
  const t = useCountdown(d.best_before);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (!t && !expiredRef.current) {
      expiredRef.current = true;
      setTimeout(() => onExpired(d.id), 2000);
    }
  }, [t, d.id, onExpired]);

  const urgent     = t && t.diff < 60 * 60 * 1000;
  const veryUrgent = t && t.diff < 15 * 60 * 1000;

  // Build Google Maps directions URL
  const getDirectionsUrl = () => {
    const destination = encodeURIComponent(
      `${d.pickup_address}, ${d.city}${d.pincode ? " " + d.pincode : ""}`
    );
    if (userLocation) {
      const { lat, lng } = userLocation;
      return `https://www.google.com/maps/dir/${lat},${lng}/${destination}`;
    }
    // If no GPS, just search the destination
    return `https://www.google.com/maps/search/${destination}`;
  };

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      style={{ opacity: !t ? 0.5 : 1 }}
    >
      {/* Card top */}
      <div
        className="h-32 flex items-center justify-center text-6xl relative"
        style={{ background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)" }}
      >
        {d.image_url
          ? <img src={d.image_url} alt={d.title} className="h-full w-full object-cover"
              onError={e => { e.target.style.display = "none"; }}
            />
          : <span>{FOOD_EMOJI[d.food_type] || "🍱"}</span>
        }

        <span
          className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white whitespace-nowrap"
          style={{ color: "#1a8c2e" }}
        >
          {d.food_type === "non-veg" ? "Non-Veg" : d.food_type === "both" ? "Veg + Non-Veg" : "Veg"}
        </span>

        {veryUrgent && (
          <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white animate-pulse">
            🔥 Last chance!
          </span>
        )}
        {urgent && !veryUrgent && (
          <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-500 text-white">
            ⚡ Expiring soon!
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{d.title}</h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{d.org_name || d.restaurant_name}</p>
            {d.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{d.description}</p>}
          </div>
          {d.serves && (
            <div className="text-right shrink-0">
              <div className="text-lg font-black" style={{ color: "#1a8c2e" }}>{d.serves}</div>
              <div className="text-xs text-gray-400">meals</div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mb-3">
          <span>📍 {d.city}</span>
          <span>📦 {d.quantity}</span>
          <CountdownBadge best_before={d.best_before} />
        </div>

        {/* Pickup address */}
        <div className="text-xs text-gray-400 mb-4 truncate">
          🏠 {d.pickup_address}
          {d.restaurant_phone && <span> · 📞 {d.restaurant_phone}</span>}
        </div>

        {/* Two buttons */}
        <div className="flex gap-2">
          {/* Contact button */}
          <a
            href={`tel:${d.restaurant_phone}`}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all duration-200 text-white"
            style={{
              background: t ? "linear-gradient(135deg, #1a8c2e, #22a83a)" : "#9ca3af",
              pointerEvents: t ? "auto" : "none"
            }}
          >
            📞 Contact
          </a>

          {/* Directions button */}
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all duration-200 border-2"
            style={{
              color: t ? "#1a8c2e" : "#9ca3af",
              borderColor: t ? "#1a8c2e" : "#9ca3af",
              background: "white",
              pointerEvents: t ? "auto" : "none"
            }}
            title={userLocation ? "Get directions from your location" : "View on Google Maps"}
          >
            🗺️ {userLocation ? "Directions" : "View Map"}
          </a>
        </div>

        {/* GPS status hint */}
        {!userLocation && t && (
          <p className="text-xs text-gray-300 text-center mt-2">
            Allow location for turn-by-turn directions
          </p>
        )}
      </div>
    </div>
  );
}

export default function NearbyFood() {
  const [donations, setDonations]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [cities, setCities]         = useState([]);
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [locStatus, setLocStatus]   = useState("idle"); // idle | asking | granted | denied

  // Ask for GPS on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus("granted");
      },
      () => setLocStatus("denied"),
      { timeout: 10000 }
    );
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { status: "available" };
      if (cityFilter) params.city = cityFilter;
      if (typeFilter) params.food_type = typeFilter;

      const res  = await api.get("/donations", { params });
      const data = res.data.data || [];
      setDonations(data);

      const uniqueCities = [...new Set(data.map(d => d.city).filter(Boolean))];
      setCities(uniqueCities);
    } catch {
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, [cityFilter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleExpired = useCallback((id) => {
    setDonations(prev => prev.filter(d => d.id !== id));
  }, []);

  const filtered = donations.filter(d =>
    !search ||
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.restaurant_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.org_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: "#f8fffe" }}>
      {/* Header */}
      <div className="pt-20 pb-8 px-4" style={{ background: "linear-gradient(160deg, #f0fdf4, #ffffff)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#1a8c2e" }}>Live Near You</span>
            <h1 className="text-3xl font-black text-gray-900 mt-1">Available Food</h1>
            <p className="text-gray-400 text-sm mt-1">
              {loading
                ? "Loading…"
                : `${filtered.length} donation${filtered.length !== 1 ? "s" : ""} available right now`}
            </p>

            {/* Location status banner */}
            {locStatus === "asking" && (
              <div className="mt-3 flex items-center gap-2 text-xs text-blue-500 bg-blue-50 px-3 py-2 rounded-lg w-fit">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Getting your location for directions…
              </div>
            )}
            {locStatus === "granted" && (
              <div className="mt-3 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg w-fit">
                📍 Location found — directions will show distance from you
              </div>
            )}
            {locStatus === "denied" && (
              <div className="mt-3 text-xs text-orange-500 bg-orange-50 px-3 py-2 rounded-lg w-fit">
                📍 Location not shared — directions will open Google Maps only
              </div>
            )}
          </div>

          {/* Search + city filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                placeholder="Search restaurants or food type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-white text-gray-900 placeholder-gray-300 outline-none transition-all text-sm"
                style={{ borderColor: "#e5e7eb" }}
                onFocus={e => e.target.style.borderColor = "#1a8c2e"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 bg-white text-gray-700 text-sm outline-none"
              style={{ borderColor: "#e5e7eb" }}
            >
              <option value="">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Food type pills */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {[["", "All"], ["veg", "🥦 Veg"], ["non-veg", "🍗 Non-Veg"], ["both", "🍱 Both"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setTypeFilter(val)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={{
                  background:   typeFilter === val ? "#1a8c2e" : "white",
                  color:        typeFilter === val ? "white" : "#6b7280",
                  border:       `1.5px solid ${typeFilter === val ? "#1a8c2e" : "#e5e7eb"}`
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4 animate-pulse">🍽️</div>
            <div className="font-semibold">Loading available food…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <div className="font-semibold">No donations found</div>
            <div className="text-sm mt-1">Try a different search or city filter</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
            {filtered.map(d => (
              <FoodCard
                key={d.id}
                d={d}
                userLocation={userLocation}
                onExpired={handleExpired}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}