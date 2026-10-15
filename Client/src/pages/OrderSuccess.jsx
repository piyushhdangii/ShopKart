import { Link, useLocation, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './Orders.css'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

export default function OrderSuccess() {
  const { id } = useParams()
  const location = useLocation()
  const totalAmount = location.state?.totalAmount ?? 0

  return (
    <>
      <Navbar />
      <main className="orders-main">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h1>Order Placed Successfully</h1>
          <p><strong>Order ID:</strong> {id}</p>
          <p><strong>Total:</strong> {formatPrice(totalAmount)}</p>
          <p><strong>Status:</strong> PLACED</p>
          <p>Your order has been saved successfully.</p>

          <div className="success-actions">
            <Link className="product-details-button" to={`/orders/${id}`}>
              View My Orders
            </Link>
            <Link className="secondary-button" to="/products">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
