import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getOrders } from '../services/api'
import './Orders.css'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await getOrders()
        setOrders(response.data.orders || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load your orders.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  return (
    <>
      <Navbar />
      <main className="orders-main">
        <header className="products-heading">
          <div>
            <p className="products-eyebrow">ACTIVE ORDERS</p>
            <h1>My Orders</h1>
          </div>
        </header>

        {loading ? (
          <div className="catalogue-message">Loading your orders...</div>
        ) : error ? (
          <div className="wishlist-state-box">
            <span className="wishlist-state-icon">⚠️</span>
            <h2>Unable to load orders.</h2>
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="wishlist-state-box">
            <span className="wishlist-state-icon">🛍️</span>
            <h2>You have not placed any orders yet.</h2>
            <p>Start shopping to create your first purchase.</p>
            <Link className="product-details-button" to="/products">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article key={order._id} className="order-card">
                <div className="order-card-header">
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <span>{formatDate(order.createdAt)}</span>
                </div>

                <div className="order-items-preview">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={`${order._id}-${item.product}`} className="order-item-line">
                      {item.name} × {item.quantity}
                    </div>
                  ))}
                  {order.items.length > 3 && <div className="order-item-line">+{order.items.length - 3} more items</div>}
                </div>

                <div className="order-card-footer">
                  <div>
                    <span className="order-label">Total:</span>
                    <strong>{formatPrice(order.totalAmount)}</strong>
                  </div>
                  <div>
                    <span className="order-label">Status:</span>
                    <strong>{order.status}</strong>
                  </div>
                </div>

                <Link className="product-details-button" to={`/orders/${order._id}`}>
                  View Details
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
