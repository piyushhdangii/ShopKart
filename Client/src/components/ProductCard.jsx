import { Link } from 'react-router-dom'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

export default function ProductCard({ product }) {
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
        <Link className="product-details-button" to={`/products/${product._id}`}>
          View Details
        </Link>
      </div>
    </article>
  )
}