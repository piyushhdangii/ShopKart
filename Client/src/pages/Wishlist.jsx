import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import WishlistCard from '../components/WishlistCard'
import { getWishlist } from '../services/api'
import './Wishlist.css'

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchWishlist = () => {
    setLoading(true)
    setError(false)
    getWishlist()
      .then((res) => {
        setWishlist(res.data.wishlist)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const handleRemoved = (productId) => {
    setWishlist((prev) => prev.filter((p) => p._id !== productId))
  }

  return (
    <>
      <Navbar />
      <main className="wishlist-main">
        <header className="wishlist-heading">
          <div>
            <p className="products-eyebrow">YOUR COLLECTION</p>
            <h1>My Wishlist</h1>
          </div>
          {!loading && !error && wishlist.length > 0 && (
            <span className="products-count">{wishlist.length} product{wishlist.length !== 1 ? 's' : ''} saved</span>
          )}
        </header>

        {loading ? (
          <div className="catalogue-message" role="status">Loading your wishlist...</div>
        ) : error ? (
          <div className="wishlist-state-box">
            <span className="wishlist-state-icon">⚠️</span>
            <h2>Something went wrong</h2>
            <p>We couldn't load your wishlist.</p>
            <button className="product-details-button" onClick={fetchWishlist}>
              Try Again
            </button>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="wishlist-state-box">
            <span className="wishlist-state-icon">❤️</span>
            <h2>Your wishlist is empty</h2>
            <p>Save products you love and find them here later.</p>
            <Link className="product-details-button" to="/products">
              Browse Products
            </Link>
          </div>
        ) : (
          <section className="product-grid" aria-label="Wishlist">
            {wishlist.map((product) => (
              <WishlistCard key={product._id} product={product} onRemoved={handleRemoved} />
            ))}
          </section>
        )}
      </main>
    </>
  )
}
