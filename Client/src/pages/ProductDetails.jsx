import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getProduct } from '../services/api'
import './Products.css'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

export default function ProductDetails() {
  const { id } = useParams()
  const [result, setResult] = useState({ id: null, product: null, error: false })
  const [addedProductId, setAddedProductId] = useState(null)

  useEffect(() => {
    let currentRequest = true

    getProduct(id)
      .then((response) => {
        if (currentRequest) setResult({ id, product: response.data.product, error: false })
      })
      .catch(() => {
        if (currentRequest) setResult({ id, product: null, error: true })
      })

    return () => {
      currentRequest = false
    }
  }, [id])

  const loading = result.id !== id
  const error = !loading && result.error
  const product = loading ? null : result.product
  const added = addedProductId === id

  return (
    <>
      <Navbar />
      <main className="product-detail-main">
        <Link to="/products" className="back-to-products">← Back to products</Link>
        {loading ? (
          <div className="catalogue-message" role="status">Loading product...</div>
        ) : error ? (
          <div className="catalogue-message catalogue-error" role="alert">
            Something went wrong while loading this product.
          </div>
        ) : product ? (
          <article className="product-detail">
            <div className="product-detail-image-wrap">
              <img src={product.image} alt={product.name} className="product-detail-image" />
            </div>
            <div className="product-detail-copy">
              <span className="product-category">{product.category}</span>
              <h1>{product.name}</h1>
              <p className="product-detail-price">{formatPrice(product.price)}</p>
              <p className="product-description">{product.description}</p>
              <p className={`product-stock ${product.stock === 0 ? 'out-of-stock' : ''}`}>
                {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
              </p>
              <button
                className="product-details-button add-to-cart-button"
                type="button"
                disabled={product.stock === 0}
                onClick={() => setAddedProductId(id)}
              >
                {added ? 'Added to Cart' : 'Add to Cart'}
              </button>
            </div>
          </article>
        ) : null}
      </main>
    </>
  )
}