import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../services/api'
import Navbar from '../components/Navbar'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then((res) => {
        setCustomer(res.data.authenticatedUser)
      })
      .catch(() => {
        navigate('/login')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading your profile…</p>
      </div>
    )
  }

  if (!customer) return null

  const initials = customer.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <Navbar customerName={customer.fullName} />

      <main className="home-main">
        <div className="welcome-banner">
          <h2>
            Welcome back, <span>{customer.fullName.split(' ')[0]}</span>! 👋
          </h2>
          <p>Great to see you. Here&apos;s your account overview.</p>
        </div>

        <div className="profile-card">
          <div className="avatar">{initials}</div>

          <div className="profile-info">
            <h3>Account Details</h3>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">👤 Full Name</span>
                <span className="info-value">{customer.fullName}</span>
              </div>

              <div className="info-item">
                <span className="info-label">📧 Email</span>
                <span className="info-value">{customer.email}</span>
              </div>

              <div className="info-item">
                <span className="info-label">📱 Phone</span>
                <span className="info-value">{customer.phone}</span>
              </div>

              <div className="info-item">
                <span className="info-label">🆔 Customer ID</span>
                <span className="info-value mono">{customer._id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder shopping section */}
        <div className="shop-teaser">
          <h3>Ready to shop?</h3>
          <p>Explore thousands of products from top brands — all in one place.</p>
          <button className="btn-shop" onClick={() => navigate('/products')}>
            Browse Products 🛍️
          </button>
        </div>
      </main>
    </>
  )
}
