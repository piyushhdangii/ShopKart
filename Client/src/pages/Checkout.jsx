import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'
import { createPaymentOrder, verifyPayment } from '../services/api'
import './Checkout.css'

const initialForm = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: '',
}

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

export default function Checkout() {
  const navigate = useNavigate()
  const { cartItems, cartLoading, cartError, setCartItems } = useCart()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const itemEntries = useMemo(
    () => cartItems.filter((item) => item.product && item.product._id),
    [cartItems],
  )

  const subtotal = useMemo(
    () => itemEntries.reduce(
      (sum, item) => sum + Number(item.product.price || 0) * Number(item.quantity || 0),
      0,
    ),
    [itemEntries],
  )

  const validateForm = (values) => {
    const nextErrors = {}

    if (!values.fullName.trim()) nextErrors.fullName = 'Full name is required.'
    if (!values.phone.trim()) nextErrors.phone = 'Phone number is required.'
    else if (!/^[0-9+\-\s()]{8,15}$/.test(values.phone.trim())) nextErrors.phone = 'Phone number is invalid.'

    if (!values.addressLine1.trim()) nextErrors.addressLine1 = 'Address is required.'
    if (!values.city.trim()) nextErrors.city = 'City is required.'
    if (!values.state.trim()) nextErrors.state = 'State is required.'
    if (!values.pincode.trim()) nextErrors.pincode = 'Pincode is required.'
    else if (!/^\d{6}$/.test(values.pincode.trim())) nextErrors.pincode = 'Pincode must contain 6 digits.'

    return nextErrors
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: '' }))
  }

  const completePayment = async (order, gatewayResponse) => {
    try {
      await verifyPayment({
        orderId: order._id,
        razorpay_order_id: gatewayResponse?.razorpay_order_id || order.razorpayOrderId,
        razorpay_payment_id: gatewayResponse?.razorpay_payment_id || 'mock_payment_id',
        razorpay_signature: gatewayResponse?.razorpay_signature || 'mock_signature',
        mockMode: gatewayResponse?.mockMode || !gatewayResponse,
      })

      setCartItems([])
      navigate(`/order-success/${order._id}`, { state: { totalAmount: order.totalAmount, status: 'PLACED' } })
    } catch (error) {
      setServerError(error.response?.data?.message || 'Payment verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')

    const nextErrors = validateForm(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    if (itemEntries.length === 0) {
      setServerError('Your cart is empty. Add some items before checkout.')
      return
    }

    setLoading(true)

    try {
      const response = await createPaymentOrder({
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          addressLine1: form.addressLine1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
      })

      const { order, razorpay } = response.data

      if (!razorpay || razorpay.key === 'rzp_test_mock') {
        await completePayment(order, { mockMode: true })
        return
      }

      if (!window.Razorpay) {
        await completePayment(order, { mockMode: true })
        return
      }

      const razorpayCheckout = new window.Razorpay({
        key: razorpay.key,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: 'ShopKart',
        description: `Order #${order._id}`,
        order_id: razorpay.orderId,
        handler: async (paymentResponse) => {
          await completePayment(order, paymentResponse)
        },
        prefill: {
          name: form.fullName,
          contact: form.phone,
        },
        theme: { color: '#ff7f50' },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      })

      razorpayCheckout.open()
    } catch (error) {
      setLoading(false)
      setServerError(error.response?.data?.message || 'Unable to continue with checkout.')
    }
  }

  if (cartLoading) {
    return (
      <>
        <Navbar />
        <main className="checkout-shell">
          <div className="catalogue-message">Loading your checkout...</div>
        </main>
      </>
    )
  }

  if (cartError || itemEntries.length === 0) {
    return (
      <>
        <Navbar />
        <main className="checkout-shell">
          <div className="wishlist-state-box">
            <span className="wishlist-state-icon">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Add items before proceeding to checkout.</p>
            <Link className="product-details-button" to="/products">Continue Shopping</Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="checkout-shell">
        <div className="checkout-page">
          <h1>Checkout</h1>

          {serverError && (
            <div className="alert alert-error" role="alert">
              {serverError}
            </div>
          )}

          <form className="checkout-grid" onSubmit={handleSubmit} noValidate>
            <section className="checkout-card">
              <h2>Shipping Details</h2>

              <div className="field-grid">
                <div className="field-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input id="fullName" name="fullName" value={form.fullName} onChange={handleFieldChange} className={errors.fullName ? 'input-error' : ''} />
                  {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
                </div>

                <div className="field-group">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" value={form.phone} onChange={handleFieldChange} className={errors.phone ? 'input-error' : ''} />
                  {errors.phone && <span className="error-msg">{errors.phone}</span>}
                </div>

                <div className="field-group full-width">
                  <label htmlFor="addressLine1">Address</label>
                  <input id="addressLine1" name="addressLine1" value={form.addressLine1} onChange={handleFieldChange} className={errors.addressLine1 ? 'input-error' : ''} />
                  {errors.addressLine1 && <span className="error-msg">{errors.addressLine1}</span>}
                </div>

                <div className="field-group">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" value={form.city} onChange={handleFieldChange} className={errors.city ? 'input-error' : ''} />
                  {errors.city && <span className="error-msg">{errors.city}</span>}
                </div>

                <div className="field-group">
                  <label htmlFor="state">State</label>
                  <input id="state" name="state" value={form.state} onChange={handleFieldChange} className={errors.state ? 'input-error' : ''} />
                  {errors.state && <span className="error-msg">{errors.state}</span>}
                </div>

                <div className="field-group">
                  <label htmlFor="pincode">Pincode</label>
                  <input id="pincode" name="pincode" value={form.pincode} onChange={handleFieldChange} className={errors.pincode ? 'input-error' : ''} />
                  {errors.pincode && <span className="error-msg">{errors.pincode}</span>}
                </div>
              </div>
            </section>

            <aside className="checkout-card summary-card">
              <h2>Order Summary</h2>

              <div className="summary-list">
                {itemEntries.map((item) => (
                  <div key={item.product._id} className="summary-row">
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <strong>{formatPrice(Number(item.product.price || 0) * Number(item.quantity || 0))}</strong>
                  </div>
                ))}
              </div>

              <div className="summary-total">
                <span>Total</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <button type="submit" className="product-details-button" disabled={loading}>
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </aside>
          </form>
        </div>
      </main>
    </>
  )
}
