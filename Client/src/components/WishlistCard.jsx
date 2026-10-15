import { useState } from 'react'
import { Link } from 'react-router-dom'
import { addToCart, removeFromWishlist } from '../services/api'
import { useCart } from '../context/CartContext'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

export default function WishlistCard({ product, onRemoved }) {
  const [removing, setRemoving] = useState(false)
  const [cartState, setCartState] = useState('idle')
  const [actionError, setActionError] = useState('')
  const { cartItems, addCartItem, refreshCart } = useCart()
  const inCart = cartItems.some((item) => item.product?._id === product._id)

  const handleRemove = async () => {
    if (removing) return
    setRemoving(true)
    setActionError('')
    try {
      await removeFromWishlist(product._id)
      onRemoved(product._id)
    } catch {
      setActionError('Could not remove this item. Please try again.')
      setRemoving(false)
    }
  }

  const handleAddToCart = async () => {
    if (cartState === 'saving' || product.stock === 0) return
    setCartState('saving')
    setActionError('')
    try {
      await addToCart(product._id)
      addCartItem(product._id)
      await refreshCart()
      setCartState('idle')
    } catch {
      setActionError('Could not add this item to your cart. Please try again.')
      setCartState('idle')
    }
  }

  return (
    <article className="wishlist-card">
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
        {actionError && <p className="wishlist-action-error" role="alert">{actionError}</p>}
        <div className="product-card-actions">
          <Link className="product-details-button" to={`/products/${product._id}`}>
            View Details
          </Link>
          <button
            className="product-details-button wishlist-add-button"
            onClick={handleAddToCart}
            disabled={cartState === 'saving' || product.stock === 0}
            type="button"
          >
            {cartState === 'saving' ? 'Adding…' : inCart ? 'Add another' : 'Add to cart'}
          </button>
          <button
            className="wishlist-btn wishlisted"
            onClick={handleRemove}
            disabled={removing}
            type="button"
          >
            {removing ? 'Removing…' : '♥ Remove'}
          </button>
        </div>
      </div>
    </article>
  )
}
