import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logoutCustomer } from '../services/api'
import { useCart } from '../context/CartContext'
import './Navbar.css'

export default function Navbar({ customerName }) {
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const { cartCount } = useCart()

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
        <Link to="/home" className="navbar-link">Home</Link>
        <Link to="/products" className="navbar-link">Products</Link>
        <Link to="/wishlist" className="navbar-link">Wishlist</Link>
        <Link to="/orders" className="navbar-link">My Orders</Link>
        <Link to="/cart" className="navbar-link cart-link">
          Cart {cartCount > 0 ? `(${cartCount})` : ''}
        </Link>
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
