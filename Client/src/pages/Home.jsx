import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import { getMe, getProducts, getWishlist } from '../services/api'
import './Home.css'
import './Products.css'

const categoryIcon = (category) => {
  const value = category.toLowerCase()
  if (value.includes('electronic')) return '🎧'
  if (value.includes('cloth') || value.includes('fashion')) return '👕'
  if (value.includes('home')) return '🪴'
  if (value.includes('beauty')) return '🧴'
  if (value.includes('foot') || value.includes('sport')) return '👟'
  if (value.includes('accessor')) return '⌚'
  if (value.includes('book')) return '📚'
  return '✦'
}

export default function Home() {
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [products, setProducts] = useState([])
  const [wishlistIds, setWishlistIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(false)

  useEffect(() => {
    let currentRequest = true

    const loadHome = async () => {
      try {
        const profileResponse = await getMe()
        if (!currentRequest) return
        setCustomer(profileResponse.data.authenticatedUser)
      } catch {
        if (currentRequest) navigate('/login')
        return
      } finally {
        if (currentRequest) setLoading(false)
      }

      const [productsResponse, wishlistResponse] = await Promise.allSettled([
        getProducts(),
        getWishlist(),
      ])

      if (currentRequest) {
        if (productsResponse.status === 'fulfilled') {
          setProducts(productsResponse.value.data.products)
        } else {
          setProductsError(true)
        }

        if (wishlistResponse.status === 'fulfilled') {
          setWishlistIds(wishlistResponse.value.data.wishlist.map((product) => product._id))
        }
        setProductsLoading(false)
      }
    }

    loadHome()
    return () => {
      currentRequest = false
    }
  }, [navigate])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Getting your shop ready…</p>
      </div>
    )
  }

  if (!customer) return null

  const categories = [...new Set(products.map((product) => product.category))]
  const featuredProducts = products.slice(0, 5)
  const heroProduct = products[0]
  const secondHeroProduct = products[1]
  const firstName = customer.fullName.split(' ')[0]

  const browseCategory = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`)
  }

  return (
    <div className="home-page">
      <Navbar customerName={customer.fullName} />

      <main className="home-main">
        <section className="home-hero">
          <div className="hero-copy">
            <span className="hero-eyebrow"><span aria-hidden="true">✦</span> A little something new</span>
            <h1>Discover the best products for you.</h1>
            <p>Explore thoughtful finds for your home, your style, and everything in between.</p>
            <div className="hero-actions">
              <button className="home-button home-button-primary" onClick={() => navigate('/products')}>
                Shop now <span aria-hidden="true">→</span>
              </button>
              <button className="home-button home-button-secondary" onClick={() => navigate('/products')}>
                Explore the collection
              </button>
            </div>
            <div className="hero-note">
              <span className="hero-note-icon" aria-hidden="true">✓</span>
              <span>Easy browsing. Secure checkout. Shop at your pace.</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Featured products">
            {heroProduct ? (
              <>
                <div className="hero-product-main">
                  <img src={heroProduct.image} alt={heroProduct.name} />
                </div>
                {secondHeroProduct && (
                  <div className="hero-product-secondary">
                    <img src={secondHeroProduct.image} alt={secondHeroProduct.name} />
                  </div>
                )}
                <div className="hero-product-label">
                  <span>Picked for you</span>
                  <strong>{heroProduct.name}</strong>
                </div>
              </>
            ) : (
              <div className="hero-art-empty" aria-hidden="true">
                <span>🛍️</span>
                <span>Something good is waiting</span>
              </div>
            )}
            <span className="hero-art-sparkle sparkle-one" aria-hidden="true">✳</span>
            <span className="hero-art-sparkle sparkle-two" aria-hidden="true">✦</span>
          </div>
        </section>

        <section className="home-benefits" aria-label="Shopping highlights">
          <div className="benefit-item">
            <span className="benefit-icon" aria-hidden="true">✦</span>
            <span><strong>Find your favorites</strong><small>A collection worth exploring</small></span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon" aria-hidden="true">♧</span>
            <span><strong>Checkout with confidence</strong><small>Secure payment options</small></span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon" aria-hidden="true">♡</span>
            <span><strong>Save what you love</strong><small>Keep picks on your wishlist</small></span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon" aria-hidden="true">⌕</span>
            <span><strong>Shop your way</strong><small>Search and browse with ease</small></span>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-heading">
            <div>
              <span className="section-kicker">Find your thing</span>
              <h2>Shop by category</h2>
            </div>
            <button className="home-text-link" onClick={() => navigate('/products')}>
              View all categories <span aria-hidden="true">→</span>
            </button>
          </div>
          {productsLoading ? (
            <p className="home-empty-note" role="status">Loading categories…</p>
          ) : categories.length > 0 ? (
            <div className="category-grid">
              {categories.slice(0, 6).map((category) => {
                const categoryProduct = products.find((product) => product.category === category)
                return (
                  <button
                    className="category-tile"
                    key={category}
                    onClick={() => browseCategory(category)}
                  >
                    <span className="category-art">
                      {categoryProduct?.image ? (
                        <img src={categoryProduct.image} alt="" />
                      ) : (
                        <span aria-hidden="true">{categoryIcon(category)}</span>
                      )}
                    </span>
                    <span className="category-name">{category}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="home-empty-note">New categories are on their way.</p>
          )}
        </section>

        <section className="home-section">
          <div className="home-section-heading">
            <div>
              <span className="section-kicker">A few good picks</span>
              <h2>Featured products</h2>
            </div>
            <button className="home-text-link" onClick={() => navigate('/products')}>
              View all products <span aria-hidden="true">→</span>
            </button>
          </div>

          {productsError ? (
            <p className="home-empty-note home-error" role="alert">
              We couldn&apos;t load the products just now. Please try the collection again in a moment.
            </p>
          ) : productsLoading ? (
            <p className="home-empty-note" role="status">Loading featured products…</p>
          ) : featuredProducts.length > 0 ? (
            <div className="home-products-grid">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isWishlisted={wishlistIds.includes(product._id)}
                  onWishlistChange={(productId, added) => {
                    setWishlistIds((currentIds) => (
                      added
                        ? [...new Set([...currentIds, productId])]
                        : currentIds.filter((id) => id !== productId)
                    ))
                  }}
                  compact
                />
              ))}
            </div>
          ) : (
            <p className="home-empty-note">We&apos;re getting the collection ready. Check back soon.</p>
          )}
        </section>

        <section className="home-promo">
          <div className="promo-copy">
            <span className="section-kicker">Your next favorite is out there</span>
            <h2>Good finds.<br />Just around the corner.</h2>
            <p>Take a look through the collection and find something that feels just right.</p>
            <button className="home-button home-button-primary" onClick={() => navigate('/products')}>
              Explore products <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="promo-art" aria-hidden="true">
            {secondHeroProduct ? (
              <img src={secondHeroProduct.image} alt="" />
            ) : (
              <span>🌿</span>
            )}
            <span className="promo-art-badge">Made for<br />your everyday</span>
          </div>
        </section>

        <section className="home-closing">
          <span className="closing-mark" aria-hidden="true">✳</span>
          <div>
            <h2>Make room for a little delight.</h2>
            <p>Save your favorites, fill your cart, and enjoy discovering ShopKart.</p>
          </div>
          <button className="home-text-link" onClick={() => navigate('/wishlist')}>
            Visit your wishlist <span aria-hidden="true">→</span>
          </button>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-brand">
          <button className="footer-brand-link" onClick={() => navigate('/home')}>
            <span aria-hidden="true">▣</span> ShopKart
          </button>
          <p>Your one-stop shop for quality products and everyday finds.</p>
        </div>
        <div className="footer-column">
          <strong>Quick links</strong>
          <button onClick={() => navigate('/home')}>Home</button>
          <button onClick={() => navigate('/products')}>Shop products</button>
          <button onClick={() => navigate('/wishlist')}>Wishlist</button>
        </div>
        <div className="footer-column">
          <strong>Your account</strong>
          <button onClick={() => navigate('/orders')}>My orders</button>
          <button onClick={() => navigate('/cart')}>Shopping cart</button>
          <span className="footer-account-name">Shopping with {firstName}</span>
        </div>
        <div className="footer-newsletter">
          <strong>Ready for a little inspiration?</strong>
          <p>Explore the latest additions to the ShopKart collection.</p>
          <button className="home-button home-button-primary" onClick={() => navigate('/products')}>
            Browse products <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} ShopKart</span>
          <span>Made for the joy of finding something good.</span>
        </div>
      </footer>
    </div>
  )
}
