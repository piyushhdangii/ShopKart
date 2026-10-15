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

export default function ProductCard({
  product,
  isWishlisted: initialWishlisted = false,
  onWishlistChange,
  compact = false,
}) {
  const [wishlistedOverride, setWishlistedOverride] = useState(null)
  const [wishlistStatus, setWishlistStatus] = useState('idle')
  const [cartStatus, setCartStatus] = useState('idle')
  const { cartItems, addCartItem, refreshCart } = useCart()

  const inCart = cartItems.some((item) => item.product?._id === product._id)
  const wishlisted = wishlistedOverride ?? initialWishlisted

  const handleWishlistToggle = async () => {
    if (wishlistStatus === 'saving') return
    setWishlistStatus('saving')
    try {
      const res = await toggleWishlistItem(product._id)
      setWishlistedOverride(res.data.added)
      onWishlistChange?.(product._id, res.data.added)
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
    <article className={`product-card${compact ? ' product-card-compact' : ''}`}>
      <Link to={`/products/${product._id}`} className="product-image-link" aria-label={`View ${product.name}`}>
        <img className="product-card-image" src={product.image} alt={product.name} />
      </Link>
      {compact && (
        <button
          className={`compact-wishlist-btn${wishlisted ? ' wishlisted' : ''}`}
          onClick={handleWishlistToggle}
          disabled={wishlistStatus === 'saving'}
          type="button"
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          title={wishlistStatus === 'error' ? 'Could not update wishlist. Try again.' : undefined}
        >
          {wishlistStatus === 'saving' ? '…' : wishlisted ? '♥' : '♡'}
        </button>
      )}
      <div className="product-card-content">
        {!compact && <span className="product-category">{product.category}</span>}
        <h2>{product.name}</h2>
        <p className="product-card-price">{formatPrice(product.price)}</p>
        {!compact && (
          <p className={`product-stock ${product.stock === 0 ? 'out-of-stock' : ''}`}>
            {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
          </p>
        )}
        <div className="product-card-actions">
          {!compact && (
            <Link className="product-details-button" to={`/products/${product._id}`}>
              View Details
            </Link>
          )}
          <button
            className={`product-details-button secondary-button${compact ? ' compact-add-button' : ''}`}
            onClick={handleAddToCart}
            disabled={cartStatus === 'saving' || product.stock === 0}
            type="button"
          >
            {cartStatus === 'saving' ? 'Adding...' : inCart ? 'Add Another' : 'Add to Cart'}
          </button>
          {!compact && (
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
          )}
        </div>
      </div>
    </article>
  )
}