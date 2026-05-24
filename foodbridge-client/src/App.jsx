import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute       from './components/auth/ProtectedRoute'

import Home                from './pages/Home'
import Login               from './pages/Login'
import Register            from './pages/Register'
import NearbyFood          from './pages/NearbyFood'
import RestaurantDashboard from './pages/RestaurantDashboard'
import NgoDashboard        from './pages/NgoDashboard'
import UserDashboard       from './pages/UserDashboard'
import ProfilePage         from './pages/ProfilePage'
import AdminDashboard      from './pages/AdminDashboard'
import Navbar              from './components/Navbar'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/nearby']

function Layout() {
  const location = useLocation()
  const showNavbar = PUBLIC_ROUTES.includes(location.pathname)

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/nearby"   element={<NearbyFood />} />

        {/* Protected */}
        <Route path="/dashboard"  element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/restaurant" element={<ProtectedRoute><RestaurantDashboard /></ProtectedRoute>} />
        <Route path="/ngo"        element={<ProtectedRoute><NgoDashboard /></ProtectedRoute>} />
        <Route path="/profile"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/admin"      element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  )
}