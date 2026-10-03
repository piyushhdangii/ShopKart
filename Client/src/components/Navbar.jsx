import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logoutCustomer } from '../services/api'
import './Navbar.css'

export default function Navbar({ customerName }) {
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logoutCustomer()
    } catch {
      // even if request fails, clear local state and redirect
    } finally {
      navigate('/login')
    }
  }

  return (
    <nav className="navbar">
      <Link to="/products" className="navbar-brand">
        <span>🛒</span> ShopKart
      </Link>

      <div className="navbar-right">
        {customerName && (
          <span className="navbar-user">
            Hi, <strong>{customerName.split(' ')[0]}</strong>
          </span>
        )}
        <button
          className="btn-logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? 'Logging out…' : 'Logout'}
        </button>
      </div>
    </nav>
  )
}
