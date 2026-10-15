import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getOrderById } from '../services/api'
import './Orders.css'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

const formatDate = (dateString) =>
  new Date(dateString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

export default function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await getOrderById(id)
        setOrder(response.data.order)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load this order.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="orders-main">
          <div className="catalogue-message">Loading your order...</div>
        </main>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <main className="orders-main">
          <div className="wishlist-state-box">
            <span className="wishlist-state-icon">⚠️</span>
            <h2>Order not found</h2>
            <p>{error || 'This order could not be found.'}</p>
            <Link className="product-details-button" to="/orders">Back to My Orders</Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="orders-main">
        <div className="order-details-card">
          <div className="order-card-header">
            <h2>Order #{order._id.slice(-6)}</h2>
            <span>{formatDate(order.createdAt)}</span>
          </div>

          <div className="order-meta-grid">
            <div>
              <span className="order-label">Status:</span>
              <strong>{order.status}</strong>
            </div>
            <div>
              <span className="order-label">Payment:</span>
              <strong>{order.paymentStatus}</strong>
            </div>
            <div>
              <span className="order-label">Total:</span>
              <strong>{formatPrice(order.totalAmount)}</strong>
            </div>
          </div>

          <div className="shipping-badge">
            <h3>Shipping Address</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
            <p>{order.shippingAddress.pincode}</p>
          </div>

          <div className="order-items-panel">
            <h3>Items</h3>
            {order.items.map((item) => (
              <div key={`${order._id}-${item.product}`} className="order-details-item">
                <div className="order-item-name-group">
                  <span className="order-item-name">{item.name}</span>
                  <span className="order-item-meta">Qty: {item.quantity}</span>
                </div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
