import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || !target) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

export default function Home() {
  const [stats, setStats] = useState({ meals_served: 0, restaurants: 0, ngos: 0, cities: 0 });
  const [donations, setDonations] = useState([]);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  const meals       = useCounter(stats.meals_served, 2000, statsVisible);
  const restaurants = useCounter(stats.restaurants,  2000, statsVisible);
  const ngos        = useCounter(stats.ngos,         2000, statsVisible);
  const cities      = useCounter(stats.cities,       2000, statsVisible);

  useEffect(() => {
    // Fetch real stats
    api.get("/donations/public-stats").then(r => {
      const d = r.data.data || {};
      setStats({
        meals_served: d.meals_served || 0,
        restaurants:  d.restaurants  || 0,
        ngos:         d.ngos         || 0,
        cities:       d.cities       || 0,
      });
    }).catch(() => {});

    // Fetch latest 3 donations
    api.get("/donations", { params: { status: "available", limit: 3 } }).then(r => {
      setDonations(r.data.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const timeLeft = (bb) => {
    const diff = new Date(bb) - new Date();
    if (diff <= 0) return "Expired";
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return hrs > 0 ? `${hrs}h ${mins}m left` : `${mins}m left`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #f0fdf4 0%, #ffffff 60%)" }}>
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
            style={{ background: "#dcfce7", color: "#1a8c2e" }}>
            🌱 Fighting Food Waste Together
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
            Surplus Food,<br />
            <span style={{ color: "#1a8c2e" }}>Real Impact</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            FoodBridge connects restaurants with surplus food to NGOs and people in need — reducing waste and fighting hunger, one meal at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/nearby"
              className="px-8 py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-105 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #1a8c2e, #22a83a)" }}>
              🍽️ Find Food Near Me
            </Link>
            <Link to="/register"
              className="px-8 py-4 rounded-2xl font-bold text-base border-2 transition-all hover:scale-105"
              style={{ borderColor: "#1a8c2e", color: "#1a8c2e" }}>
              Join as Restaurant / NGO →
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section ref={statsRef} className="py-16 px-4" style={{ background: "#f0fdf4" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold tracking-widest uppercase mb-10" style={{ color: "#1a8c2e" }}>
            Real Impact — Live from our Database
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: meals,       label: "Meals Served",   icon: "🍱" },
              { value: restaurants, label: "Restaurants",    icon: "🏪" },
              { value: ngos,        label: "NGOs",           icon: "🤝" },
              { value: cities,      label: "Cities",         icon: "🏙️" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-black" style={{ color: "#1a8c2e" }}>
                  {s.value.toLocaleString()}+
                </div>
                <div className="text-xs text-gray-400 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Donations */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#1a8c2e" }}>
                Available Now
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-1">Latest Food Listings</h2>
            </div>
            <Link to="/nearby" className="text-sm font-bold" style={{ color: "#1a8c2e" }}>
              View all →
            </Link>
          </div>

          {donations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🍽️</div>
              <p>No donations available right now. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {donations.map(d => (
                <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">
                      {d.food_type === "veg" ? "🥗" : d.food_type === "non-veg" ? "🍗" : "🍱"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{d.title}</h3>
                      <p className="text-xs text-gray-400 truncate">{d.org_name || d.restaurant_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>📍 {d.city}</span>
                    <span className={timeLeft(d.best_before).includes("m left") && !timeLeft(d.best_before).includes("h") ? "text-orange-500 font-semibold" : ""}>
                      ⏰ {timeLeft(d.best_before)}
                    </span>
                  </div>
                  <Link to="/nearby"
                    className="block mt-4 w-full py-2 rounded-xl text-xs font-bold text-center text-white"
                    style={{ background: "linear-gradient(135deg, #1a8c2e, #22a83a)" }}>
                    Get Directions →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4" style={{ background: "#f8fffe" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-12">How FoodBridge Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🍽️", title: "Restaurant Lists Food", desc: "Surplus food gets listed with pickup time and location" },
              { icon: "🤝", title: "NGO Claims It", desc: "Nearby NGOs see available food and claim it instantly" },
              { icon: "🚗", title: "Food Gets Delivered", desc: "NGO picks up and distributes to people in need" },
            ].map(s => (
              <div key={s.title} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center" style={{ background: "linear-gradient(135deg, #1a8c2e, #22a83a)" }}>
        <h2 className="text-3xl font-black text-white mb-4">Ready to Make a Difference?</h2>
        <p className="text-green-100 mb-8">Join hundreds of restaurants and NGOs already on FoodBridge</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register"
            className="px-8 py-4 rounded-2xl bg-white font-bold text-base transition-all hover:scale-105"
            style={{ color: "#1a8c2e" }}>
            Get Started Free →
          </Link>
          <Link to="/nearby"
            className="px-8 py-4 rounded-2xl font-bold text-base border-2 border-white text-white transition-all hover:scale-105">
            Find Food Near Me
          </Link>
        </div>
      </section>
    </div>
  );
}