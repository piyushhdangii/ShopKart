export default function SearchBar({ search, category, onSearchChange, onCategoryChange }) {
  return (
    <div className="product-filters">
      <label className="product-search">
        <span className="visually-hidden">Search products</span>
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search products..."
        />
      </label>

      <label className="category-filter">
        <span className="visually-hidden">Filter by category</span>
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Books">Books</option>
          <option value="Home">Home</option>
        </select>
      </label>
    </div>
  )
}