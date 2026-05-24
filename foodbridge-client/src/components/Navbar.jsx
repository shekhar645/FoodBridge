import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Find Food", path: "/nearby" },
    { label: "How It Works", path: "/#how" },
    { label: "About", path: "/#about" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/logo.png"
              alt="FoodBridge Logo"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <span className="hidden items-center gap-1 text-xl font-bold" style={{ display: "none" }}>
              <span style={{ color: "#1a8c2e" }}>Food</span>
              <span style={{ color: "#1e293b" }}>Bridge</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? "text-green-700 bg-green-50"
                    : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-green-700 transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-5 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:opacity-90 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #1a8c2e, #22a83a)" }}>
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.path} onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg">
              {link.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-gray-100 mt-3">
            <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-center border border-gray-200 rounded-xl text-gray-700">
              Log In
            </Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-center text-white rounded-xl" style={{ background: "#1a8c2e" }}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}