import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { removeCartItem, updateCartQuantity } from '../services/api'
import { useCart } from '../context/CartContext'
import './Cart.css'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

export default function Cart() {
  const { cartItems, cartLoading, cartError, refreshCart, updateCartItemQuantity, removeCartItem: removeCartLocal, subtotal, cartCount } = useCart()
  const [updatingId, setUpdatingId] = useState(null)
  const [removingId, setRemovingId] = useState(null)

  const items = useMemo(() => cartItems.filter((item) => item.product && item.product._id), [cartItems])

  const handleQuantityChange = async (productId, delta) => {
    const item = items.find((entry) => entry.product._id === productId)
    if (!item) return

    const nextQuantity = Number(item.quantity) + delta
    if (nextQuantity < 1) return

    const maxQuantity = Number(item.product.stock || 0)
    if (nextQuantity > maxQuantity) {
      return
    }

    setUpdatingId(productId)
    try {
      await updateCartQuantity(productId, nextQuantity)
      updateCartItemQuantity(productId, nextQuantity)
      await refreshCart()
    } catch {
      await refreshCart()
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (productId) => {
    setRemovingId(productId)
    try {
      await removeCartItem(productId)
      removeCartLocal(productId)
      await refreshCart()
    } catch {
      await refreshCart()
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <>
      <Navbar />
      <main className="products-main">
        <header className="products-heading">
          <div>
            <p className="products-eyebrow">SHOPKART CART</p>
            <h1>My Cart</h1>
          </div>
          {!cartLoading && !cartError && items.length > 0 && <span className="products-count">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>}
        </header>

        {cartLoading ? (
          <div className="catalogue-message" role="status">Loading your cart...</div>
        ) : cartError ? (
          <div className="wishlist-state-box">
            <span className="wishlist-state-icon">⚠️</span>
            <h2>Unable to load your cart.</h2>
            <p>Try again in a moment.</p>
            <button className="product-details-button" onClick={refreshCart} type="button">Try Again</button>
          </div>
        ) : items.length === 0 ? (
          <div className="wishlist-state-box">
            <span className="wishlist-state-icon">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <Link className="product-details-button" to="/products">Browse Products</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-panel">
              {items.map((item) => {
                const product = item.product
                const isUpdating = updatingId === product._id
                const isRemoving = removingId === product._id

                return (
                  <article className="cart-item" key={product._id}>
                    <Link to={`/products/${product._id}`} className="product-image-link cart-image-link" aria-label={`View ${product.name}`}>
                      <img className="product-card-image" src={product.image} alt={product.name} />
                    </Link>
                    <div className="cart-item-content">
                      <div className="cart-item-header">
                        <h2>{product.name}</h2>
                        <span className="cart-item-price">{formatPrice(product.price * item.quantity)}</span>
                      </div>
                      <div className="cart-controls-row">
                        <div className="qty-controls">
                          <button
                            type="button"
                            className="qty-button"
                            disabled={isUpdating || item.quantity <= 1}
                            onClick={() => handleQuantityChange(product._id, -1)}
                          >
                            −
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-button"
                            disabled={isUpdating || item.quantity >= Number(product.stock || 0)}
                            onClick={() => handleQuantityChange(product._id, 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="remove-cart-button"
                          disabled={isRemoving}
                          onClick={() => handleRemove(product._id)}
                        >
                          {isRemoving ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>

            <aside className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Items</span>
                <strong>{cartCount}</strong>
              </div>
              <div className="summary-row total-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <button type="button" className="product-details-button cart-checkout-button">Proceed to Checkout</button>
            </aside>
          </div>
        )}
      </main>
    </>
  )
}
