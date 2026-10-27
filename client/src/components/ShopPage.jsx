import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, X, SlidersHorizontal, ArrowUpDown, Star, Eye, ShoppingBag, 
  ChevronRight, Sparkles, Filter, RotateCcw, AlertCircle, AlertTriangle 
} from 'lucide-react';
import { SHOP_CATEGORIES, ALL_PRODUCTS } from '../data/productsCatalog';
import { useProducts } from '../context/ProductContext';

export default function ShopPage({ 
  onNavigateHome, 
  initialCategory = 'all', 
  onQuickView, 
  onViewProduct,
  onAddToCart,
  searchQuery: initialSearch = '',
  products: productsProp
}) {
  const { products: contextProducts } = useProducts();
  const allProducts = (productsProp || contextProducts || ALL_PRODUCTS).filter((p) => p.isActive !== false);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('featured');
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'under-150', '150-250', 'above-250'
  const [imageErrors, setImageErrors] = useState({});

  // Synchronize category filter if navigation passed a new initialCategory
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Synchronize search query if navbar search changed
  useEffect(() => {
    setSearchQuery(initialSearch || '');
  }, [initialSearch]);

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  // Calculate category counts dynamically
  const categoryCounts = useMemo(() => {
    const counts = { all: allProducts.length };
    allProducts.forEach((prod) => {
      counts[prod.category] = (counts[prod.category] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // 1. Category filter
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      // 2. Search query filter
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        product.name.toLowerCase().includes(query) ||
        (product.tamilName && product.tamilName.toLowerCase().includes(query)) ||
        (product.categoryName && product.categoryName.toLowerCase().includes(query)) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.ingredients && product.ingredients.some(ing => ing.toLowerCase().includes(query)));

      // 3. Price filter
      let matchesPrice = true;
      if (priceFilter === 'under-150') {
        matchesPrice = product.price < 150;
      } else if (priceFilter === '150-250') {
        matchesPrice = product.price >= 150 && product.price <= 250;
      } else if (priceFilter === 'above-250') {
        matchesPrice = product.price > 250;
      }

      return matchesCategory && matchesSearch && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.price - b.price;
      } else if (sortBy === 'price-high') {
        return b.price - a.price;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0; // 'featured' retains natural catalog order
    });
  }, [selectedCategory, searchQuery, priceFilter, sortBy]);

  const activeCategoryObj = SHOP_CATEGORIES.find(c => c.id === selectedCategory) || SHOP_CATEGORIES[0];

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceFilter('all');
    setSortBy('featured');
  };

  const isFiltered = selectedCategory !== 'all' || searchQuery !== '' || priceFilter !== 'all' || sortBy !== 'featured';

  return (
    <div className="shop-page">
      {/* 1. Page Header & Breadcrumbs */}
      <section className="shop-header-banner">
        <div className="shop-header-container">
          <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
            <button className="breadcrumb-link" onClick={onNavigateHome}>
              Home
            </button>
            <ChevronRight size={14} className="breadcrumb-sep" />
            <button 
              className={`breadcrumb-link ${selectedCategory === 'all' ? 'current' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              Shop
            </button>
            {selectedCategory !== 'all' && (
              <>
                <ChevronRight size={14} className="breadcrumb-sep" />
                <span className="breadcrumb-current">{activeCategoryObj.name}</span>
              </>
            )}
          </nav>

          <h1 className="shop-main-heading">
            {selectedCategory === 'all' ? 'Shop All Traditional Foods' : activeCategoryObj.name}
          </h1>
          <p className="shop-tamil-subtitle">{activeCategoryObj.tamilName}</p>
          <p className="shop-intro-description">
            Explore authentic South Indian traditional foods, unpolished native millets,
            stone-pressed pure oils, and crispy savories handcrafted from ancestral village recipes.
          </p>
        </div>
      </section>

      <div className="shop-main-layout">
        {/* 2. Category Navigation Chips */}
        <div className="category-chips-bar" role="tablist" aria-label="Categories">
          {SHOP_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={selectedCategory === cat.id}
              className={`cat-chip-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span>{cat.name}</span>
              <span className="chip-count">({categoryCounts[cat.id] || 0})</span>
            </button>
          ))}
        </div>

        {/* 3. Search & Filter Control Bar */}
        <div className="shop-controls-bar">
          {/* Search Box */}
          <div className="shop-search-box">
            <Search size={18} className="shop-search-icon" />
            <input
              type="text"
              className="shop-search-input"
              placeholder="Search products by name, millet, or ingredient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
            {searchQuery && (
              <button 
                className="shop-search-clear" 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filters & Sorting Controls */}
          <div className="shop-filters-group">
            {/* Price Filter Dropdown */}
            <div className="control-select-wrap">
              <label htmlFor="price-filter" className="control-label">
                <Filter size={14} /> Price:
              </label>
              <select
                id="price-filter"
                className="shop-select"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <option value="all">All Prices</option>
                <option value="under-150">Under ₹150</option>
                <option value="150-250">₹150 – ₹250</option>
                <option value="above-250">Above ₹250</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="control-select-wrap">
              <label htmlFor="sort-by" className="control-label">
                <ArrowUpDown size={14} /> Sort:
              </label>
              <select
                id="sort-by"
                className="shop-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {/* Reset Filters button */}
            {isFiltered && (
              <button 
                className="btn-reset-filters" 
                onClick={handleResetFilters}
                title="Reset all active filters"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. Active Filter Tags / Result Count */}
        <div className="shop-results-status">
          <span className="results-count-text">
            Showing <strong>{filteredAndSortedProducts.length}</strong> of {ALL_PRODUCTS.length} traditional products
          </span>
          {isFiltered && (
            <div className="active-filter-tags">
              {selectedCategory !== 'all' && (
                <span className="filter-tag">
                  Category: {activeCategoryObj.name}
                  <button onClick={() => setSelectedCategory('all')}>×</button>
                </span>
              )}
              {searchQuery && (
                <span className="filter-tag">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>×</button>
                </span>
              )}
              {priceFilter !== 'all' && (
                <span className="filter-tag">
                  Price: {priceFilter === 'under-150' ? '< ₹150' : priceFilter === '150-250' ? '₹150 - ₹250' : '> ₹250'}
                  <button onClick={() => setPriceFilter('all')}>×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* 5. Product Grid (Responsive: 4 columns desktop, 2 tablet, 1 mobile) */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="shop-empty-state">
            <div className="empty-icon-wrap">
              <AlertCircle size={42} className="empty-icon" />
            </div>
            <h3 className="empty-title">No matching traditional products found</h3>
            <p className="empty-description">
              We couldn't find any products matching your current filters
              {searchQuery && ` for "${searchQuery}"`}. Try clearing your search or expanding the price range.
            </p>
            <button className="btn-primary" onClick={handleResetFilters}>
              <RotateCcw size={16} />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="shop-products-grid">
            {filteredAndSortedProducts.map((prod) => {
              const isOutOfStock = (typeof prod.stock === 'number' && prod.stock <= 0) || prod.inStock === false;
              const isLowStock = !isOutOfStock && typeof prod.stock === 'number' && prod.stock <= 5;

              return (
                <article key={prod.id} className={`shop-product-card ${isOutOfStock ? 'card-out-of-stock' : ''}`}>
                  {/* Badges */}
                  <div className="product-card-badges">
                    {isOutOfStock ? (
                      <span className="product-badge badge-out-of-stock">கையிருப்பு இல்லை • Sold Out</span>
                    ) : isLowStock ? (
                      <span className="product-badge badge-low-stock">Only {prod.stock} left!</span>
                    ) : prod.badge ? (
                      <span className="product-badge">{prod.badge}</span>
                    ) : null}
                  </div>

                  {/* Product Image Frame */}
                  <div 
                    className="shop-card-image-frame"
                    onClick={() => onViewProduct ? onViewProduct(prod.id) : onQuickView(prod)}
                  >
                    {imageErrors[prod.id] ? (
                      <div className="fallback-image-placeholder">
                        <span>🌾</span>
                        <p>{prod.name}</p>
                      </div>
                    ) : (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="shop-card-img"
                        loading="lazy"
                        onError={() => handleImageError(prod.id)}
                      />
                    )}
                    <button
                      className="shop-quick-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickView(prod);
                      }}
                      aria-label={`Quick view ${prod.name}`}
                    >
                      <Eye size={15} />
                      <span>Quick View</span>
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="shop-card-content">
                    <div className="shop-card-meta">
                      <span className="shop-card-category">{prod.categoryName}</span>
                      <span className="shop-card-weight">{prod.weight}</span>
                    </div>

                    <h3 
                      className="shop-card-title"
                      onClick={() => onViewProduct ? onViewProduct(prod.id) : onQuickView(prod)}
                    >
                      {prod.name}
                    </h3>
                    <span className="shop-card-tamil">{prod.tamilName}</span>

                    {/* Rating */}
                    <div className="shop-card-rating">
                      <div className="stars-mini">
                        <Star size={13} fill="#d97706" color="#d97706" />
                        <span className="rating-num">{prod.rating}</span>
                      </div>
                      <span className="rating-count">({prod.reviewsCount} reviews)</span>
                    </div>

                    {/* Footer (Price & Add Button) */}
                    <div className="shop-card-footer">
                      <div className="price-group">
                        <span className="current-price">₹{prod.price}</span>
                        {prod.originalPrice && (
                          <span className="slashed-price">₹{prod.originalPrice}</span>
                        )}
                      </div>

                      <div className="card-actions-group">
                        <button
                          className="btn-card-view"
                          onClick={() => onViewProduct ? onViewProduct(prod.id) : onQuickView(prod)}
                          title="View full product details"
                        >
                          View Product
                        </button>
                        {isOutOfStock ? (
                          <button
                            className="btn-card-add btn-card-soldout"
                            disabled
                            aria-disabled="true"
                            title="This item is currently out of stock"
                          >
                            <span>Sold Out</span>
                          </button>
                        ) : (
                          <button
                            className="btn-card-add"
                            onClick={() => onAddToCart(prod)}
                            aria-label={`Add ${prod.name} to cart`}
                          >
                            <ShoppingBag size={15} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* 6. Explicit Mock Data & Upcoming API Notice */}
        <div className="shop-datasource-banner">
          <Sparkles size={16} className="datasource-icon" />
          <div className="datasource-text">
            <strong>Development Notice:</strong> Displaying 18 authentic items from the separated catalog module (<code>client/src/data/productsCatalog.js</code>). 
            Live backend REST endpoints (<code>GET /api/products</code> and <code>GET /api/categories</code>) will be connected in Step 5.
          </div>
        </div>
      </div>
    </div>
  );
}
