import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import { getProducts, getWishlist } from '../services/api'
import './Products.css'

export default function Products() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [result, setResult] = useState({ key: null, products: [], error: false })
  const [wishlistIds, setWishlistIds] = useState([])
  const requestKey = JSON.stringify([search.trim(), category])

  useEffect(() => {
    getWishlist()
      .then((res) => {
        setWishlistIds(res.data.wishlist.map((p) => p._id))
      })
      .catch(() => {
        // user may not be logged in; wishlist toggle will still work per-card
      })
  }, [])

  useEffect(() => {
    let currentRequest = true

    getProducts({ search: search.trim(), category })
      .then((response) => {
        if (currentRequest) {
          setResult({ key: requestKey, products: response.data.products, error: false })
        }
      })
      .catch(() => {
        if (currentRequest) setResult({ key: requestKey, products: [], error: true })
      })

    return () => {
      currentRequest = false
    }
  }, [search, category, requestKey])

  const loading = result.key !== requestKey
  const error = !loading && result.error
  const products = loading ? [] : result.products

  return (
    <>
      <Navbar />
      <main className="products-main">
        <header className="products-heading">
          <div>
            <p className="products-eyebrow">SHOPKART COLLECTION</p>
            <h1>Find your next favorite.</h1>
          </div>
          {!loading && !error && <span className="products-count">{products.length} products</span>}
        </header>

        <SearchBar
          search={search}
          category={category}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />

        {loading ? (
          <div className="catalogue-message" role="status">Loading products...</div>
        ) : error ? (
          <div className="catalogue-message catalogue-error" role="alert">
            Something went wrong while loading products.
          </div>
        ) : products.length === 0 ? (
          <div className="catalogue-message">No products found.</div>
        ) : (
          <section className="product-grid" aria-label="Products">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isWishlisted={wishlistIds.includes(product._id)}
              />
            ))}
          </section>
        )}
      </main>
    </>
  )
}