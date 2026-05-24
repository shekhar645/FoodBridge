import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    name:    user?.name    || "",
    phone:   user?.phone   || "",
    city:    user?.city    || "",
    org_name: user?.org_name || "",
  });
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async () => {
    setSaving(true); setError(""); setSuccess(false);
    try {
      const { data } = await api.patch("/auth/profile", form);
      // Update localStorage with new user data
      const updated = { ...user, ...form };
      localStorage.setItem("user", JSON.stringify(updated));
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = { restaurant: "🍽️ Restaurant", ngo: "🤝 NGO", user: "🙋 User" };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 pb-16">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white mx-auto mb-3"
            style={{ background: "linear-gradient(135deg, #1a8c2e, #22a83a)" }}>
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-black text-gray-900">{user?.name}</h1>
          <span className="text-sm text-gray-400">{roleLabel[user?.role] || user?.role}</span>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-bold text-gray-800 text-lg">Edit Profile</h2>

          {[
            { label: "Full Name", name: "name", placeholder: "Your name" },
            { label: "Phone Number", name: "phone", placeholder: "+91 XXXXX XXXXX" },
            { label: "City", name: "city", placeholder: "Mumbai" },
            ...(user?.role !== "user" ? [{ label: "Organisation Name", name: "org_name", placeholder: "Your org / restaurant name" }] : []),
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{f.label}</label>
              <input
                name={f.name}
                value={form[f.name] || ""}
                onChange={handle}
                placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-xl border-2 text-sm text-gray-800 outline-none transition-all"
                style={{ borderColor: "#e5e7eb" }}
                onFocus={e => e.target.style.borderColor = "#1a8c2e"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
          ))}

          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email (cannot change)</label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-3 rounded-xl border-2 text-sm text-gray-400 bg-gray-50"
              style={{ borderColor: "#e5e7eb" }}
            />
          </div>

          {error   && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-green-600 text-sm bg-green-50 px-4 py-2 rounded-lg">✅ Profile updated successfully!</p>}

          <button
            onClick={save}
            disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: saving ? "#9ca3af" : "linear-gradient(135deg, #1a8c2e, #22a83a)" }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}