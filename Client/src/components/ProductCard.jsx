import { useState } from 'react'
import { Link } from 'react-router-dom'
import { addToCart, toggleWishlistItem } from '../services/api'
import { useCart } from '../context/CartContext'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

export default function ProductCard({ product, isWishlisted: initialWishlisted = false }) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [wishlistStatus, setWishlistStatus] = useState('idle')
  const [cartStatus, setCartStatus] = useState('idle')
  const { cartItems, addCartItem, refreshCart } = useCart()

  const inCart = cartItems.some((item) => item.product?._id === product._id)

  const handleWishlistToggle = async () => {
    if (wishlistStatus === 'saving') return
    setWishlistStatus('saving')
    try {
      const res = await toggleWishlistItem(product._id)
      setWishlisted(res.data.added)
      setWishlistStatus('idle')
    } catch {
      setWishlistStatus('error')
      setTimeout(() => setWishlistStatus('idle'), 2500)
    }
  }

  const handleAddToCart = async () => {
    if (cartStatus === 'saving' || product.stock === 0) return
    setCartStatus('saving')
    try {
      await addToCart(product._id)
      addCartItem(product._id)
      await refreshCart()
      setCartStatus('idle')
    } catch {
      setCartStatus('error')
      setTimeout(() => setCartStatus('idle'), 2000)
    }
  }

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-image-link" aria-label={`View ${product.name}`}>
        <img className="product-card-image" src={product.image} alt={product.name} />
      </Link>
      <div className="product-card-content">
        <span className="product-category">{product.category}</span>
        <h2>{product.name}</h2>
        <p className="product-card-price">{formatPrice(product.price)}</p>
        <p className={`product-stock ${product.stock === 0 ? 'out-of-stock' : ''}`}>
          {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
        </p>
        <div className="product-card-actions">
          <Link className="product-details-button" to={`/products/${product._id}`}>
            View Details
          </Link>
          <button
            className="product-details-button secondary-button"
            onClick={handleAddToCart}
            disabled={cartStatus === 'saving' || product.stock === 0}
            type="button"
          >
            {cartStatus === 'saving' ? 'Adding...' : inCart ? 'Add Another' : 'Add to Cart'}
          </button>
          <button
            className={`wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
            onClick={handleWishlistToggle}
            disabled={wishlistStatus === 'saving'}
            type="button"
          >
            {wishlistStatus === 'saving'
              ? '⏳ Saving...'
              : wishlistStatus === 'error'
                ? '⚠ Try again'
                : wishlisted
                  ? '♥ Remove from Wishlist'
                  : '♡ Add to Wishlist'}
          </button>
        </div>
      </div>
    </article>
  )
}