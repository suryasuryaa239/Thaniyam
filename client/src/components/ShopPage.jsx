import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, X, SlidersHorizontal, ArrowUpDown, Star, Eye, ShoppingBag, 
  ChevronRight, ChevronLeft, Sparkles, Filter, RotateCcw, AlertCircle, AlertTriangle,
  LayoutGrid, List, Check, Plus, Minus, Flame, Tag, Percent, Truck, Leaf, ShieldCheck
} from 'lucide-react';
import { SHOP_CATEGORIES, ALL_PRODUCTS } from '../data/productsCatalog';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

export default function ShopPage({ 
  onNavigateHome, 
  initialCategory = 'all', 
  onQuickView, 
  onViewProduct,
  onAddToCart,
  searchQuery: initialSearch = '',
  products: productsProp
}) {
  const { products: contextProducts, categories: contextCategories } = useProducts();
  const allProducts = (productsProp || contextProducts || ALL_PRODUCTS).filter((p) => p.isActive !== false);
  const categoriesList = (contextCategories && contextCategories.length > 0) ? contextCategories : SHOP_CATEGORIES;

  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const categoryScrollRef = useRef(null);
  const scrollCategories = (offset) => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('featured');
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'under-150', '150-250', 'above-250'
  const [quickFilter, setQuickFilter] = useState('all'); // 'all' | 'bestsellers' | 'offers' | 'in-stock'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
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

  // Helper to check in-cart quantity
  const getCartQuantity = (productId) => {
    const item = cartItems.find((i) => i.id === productId);
    return item ? item.quantity : 0;
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

      // 4. Quick filter (bestsellers, offers, in-stock)
      let matchesQuick = true;
      if (quickFilter === 'bestsellers') {
        matchesQuick = product.badge === 'Bestseller' || (typeof product.rating === 'number' && product.rating >= 4.9);
      } else if (quickFilter === 'offers') {
        matchesQuick = Boolean(product.originalPrice && product.originalPrice > product.price);
      } else if (quickFilter === 'in-stock') {
        const isOut = (typeof product.stock === 'number' && product.stock <= 0) || product.inStock === false;
        matchesQuick = !isOut;
      }

      return matchesCategory && matchesSearch && matchesPrice && matchesQuick;
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
  }, [allProducts, selectedCategory, searchQuery, priceFilter, quickFilter, sortBy]);

  const activeCategoryObj = categoriesList.find(c => c.id === selectedCategory) || categoriesList[0] || { name: 'All Products', tamilName: 'அனைத்து பொருட்கள்' };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceFilter('all');
    setQuickFilter('all');
    setSortBy('featured');
  };

  const isFiltered = selectedCategory !== 'all' || searchQuery !== '' || priceFilter !== 'all' || quickFilter !== 'all' || sortBy !== 'featured';

  return (
    <div className="shop-page">
      {/* 1. Page Header & Breadcrumbs Banner */}
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

          <div className="shop-tag-badge">
            <Sparkles size={14} />
            <span>100% FARM TO PANTRY • NATIVE SOURCING</span>
          </div>

          <h1 className="shop-main-heading">
            {selectedCategory === 'all' ? 'Authentic Traditional Pantry' : activeCategoryObj.name}
          </h1>
          <p className="shop-tamil-subtitle">
            {activeCategoryObj.tamilName} • நம் மண்ணின் பாரம்பரிய சுவை
          </p>
          <p className="shop-intro-description">
            Explore authentic South Indian traditional foods, unpolished native millets,
            stone-pressed pure oils, and crispy savories handcrafted from ancestral village recipes.
          </p>

          {/* Heritage Trust Badges */}
          <div className="shop-trust-strip">
            <div className="trust-pill">
              <span className="trust-emoji">🪵</span>
              <span>100% Marachekku Cold-Pressed</span>
            </div>
            <div className="trust-pill">
              <span className="trust-emoji">🌾</span>
              <span>Unpolished Native Millets</span>
            </div>
            <div className="trust-pill">
              <span className="trust-emoji">🍯</span>
              <span>Pure Udangudi Karupatti</span>
            </div>
            <div className="trust-pill">
              <span className="trust-emoji">✨</span>
              <span>Zero Artificial Additives</span>
            </div>
            <div className="trust-pill">
              <span className="trust-emoji">🚚</span>
              <span>Free Delivery Above ₹499</span>
            </div>
          </div>
        </div>
      </section>

      <div className="shop-main-layout">
        {/* 2. Visual Category Showcase Bar */}
        <div className="category-showcase-section">
          <div className="category-showcase-header">
            <div className="category-header-title-block">
              <span className="category-micro-label">HERITAGE SELECTIONS</span>
              <h2 className="category-showcase-title">Browse By Category • பாரம்பரிய வகைகள்</h2>
              <span className="category-showcase-subtitle">Choose from artisanal sweets, wood-pressed oils, native grains, and handmade snacks</span>
            </div>
            <div className="category-scroll-arrows">
              <button 
                type="button" 
                className="btn-cat-scroll" 
                onClick={() => scrollCategories(-240)}
                aria-label="Scroll categories left"
                title="Scroll categories left"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                type="button" 
                className="btn-cat-scroll" 
                onClick={() => scrollCategories(240)}
                aria-label="Scroll categories right"
                title="Scroll categories right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="category-cards-scroll" ref={categoryScrollRef} role="tablist" aria-label="Product Categories">
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isSelected}
                  className={`category-visual-card ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <div className="cat-card-thumb-wrap">
                    <img 
                      src={cat.image || '/images/cat-snacks.jpg'} 
                      alt={cat.name} 
                      className="cat-card-thumb" 
                      loading="lazy"
                    />
                    <div className="cat-card-icon-overlay">
                      <span className="cat-card-icon">{cat.icon || '✨'}</span>
                    </div>
                    {isSelected && (
                      <div className="cat-card-active-indicator">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="cat-card-text">
                    <span className="cat-card-name">{cat.name}</span>
                    <span className="cat-card-tamil">{cat.tamilName}</span>
                    <span className="cat-card-count">{categoryCounts[cat.id] || 0} items</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Category Spotlight Hero Banner */}
          {selectedCategory !== 'all' && (
            <div className="category-spotlight-ribbon">
              <div className="spotlight-thumb">
                <img src={activeCategoryObj.image || '/images/cat-snacks.jpg'} alt={activeCategoryObj.name} />
                <span className="spotlight-emoji">{activeCategoryObj.icon || '✨'}</span>
              </div>
              <div className="spotlight-details">
                <div className="spotlight-tag">
                  <span className="spotlight-tag-text">SELECTED CATEGORY</span>
                  <span className="spotlight-count-tag">{categoryCounts[activeCategoryObj.id] || 0} Products</span>
                </div>
                <h3 className="spotlight-title">{activeCategoryObj.name}</h3>
                <span className="spotlight-tamil-title">{activeCategoryObj.tamilName}</span>
                <p className="spotlight-desc">{activeCategoryObj.description || 'Authentic South Indian heritage delicacies crafted from ancestral village recipes.'}</p>
              </div>
              <button
                type="button"
                className="btn-spotlight-all"
                onClick={() => setSelectedCategory('all')}
                title="View all products across all categories"
              >
                <span>View All Products</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
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

          {/* Quick Filter Chips (All, Bestsellers, Offers, In-Stock) */}
          <div className="shop-quick-filters">
            <button
              type="button"
              className={`quick-filter-chip ${quickFilter === 'all' ? 'active' : ''}`}
              onClick={() => setQuickFilter('all')}
            >
              All Items
            </button>
            <button
              type="button"
              className={`quick-filter-chip ${quickFilter === 'bestsellers' ? 'active' : ''}`}
              onClick={() => setQuickFilter(quickFilter === 'bestsellers' ? 'all' : 'bestsellers')}
            >
              <Flame size={13} className="chip-ico-flame" />
              <span>Bestsellers</span>
            </button>
            <button
              type="button"
              className={`quick-filter-chip ${quickFilter === 'offers' ? 'active' : ''}`}
              onClick={() => setQuickFilter(quickFilter === 'offers' ? 'all' : 'offers')}
            >
              <Percent size={13} className="chip-ico-sale" />
              <span>Special Offers</span>
            </button>
            <button
              type="button"
              className={`quick-filter-chip ${quickFilter === 'in-stock' ? 'active' : ''}`}
              onClick={() => setQuickFilter(quickFilter === 'in-stock' ? 'all' : 'in-stock')}
            >
              <Check size={13} />
              <span>In-Stock Only</span>
            </button>
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

            {/* View Mode Switcher (Grid vs List) */}
            <div className="shop-view-toggle" role="group" aria-label="Layout view mode">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
                aria-label="List view"
              >
                <List size={16} />
              </button>
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
            Showing <strong>{filteredAndSortedProducts.length}</strong> of {allProducts.length} traditional products
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
              {quickFilter !== 'all' && (
                <span className="filter-tag">
                  Filter: {quickFilter === 'bestsellers' ? 'Bestsellers' : quickFilter === 'offers' ? 'Offers' : 'In-Stock'}
                  <button onClick={() => setQuickFilter('all')}>×</button>
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

        {/* 5. Product Layout (Grid View vs List View) */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="shop-empty-state">
            <div className="empty-icon-wrap">
              <AlertCircle size={42} className="empty-icon" />
            </div>
            <h3 className="empty-title">No matching traditional products found</h3>
            <p className="empty-description">
              We couldn't find any products matching your current filters
              {searchQuery && ` for "${searchQuery}"`}. Try clearing your search, selecting another category, or expanding the price range.
            </p>
            <button className="btn-primary" onClick={handleResetFilters}>
              <RotateCcw size={16} />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* List View Mode */
          <div className="shop-products-list">
            {filteredAndSortedProducts.map((prod) => {
              const isOutOfStock = (typeof prod.stock === 'number' && prod.stock <= 0) || prod.inStock === false;
              const isLowStock = !isOutOfStock && typeof prod.stock === 'number' && prod.stock <= 5;
              const discountPct = prod.originalPrice && prod.originalPrice > prod.price 
                ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) 
                : null;
              const inCartQty = getCartQuantity(prod.id);

              return (
                <article key={prod.id} className={`shop-list-card ${isOutOfStock ? 'card-out-of-stock' : ''}`}>
                  {/* Left: Image with Badges */}
                  <div 
                    className="shop-list-image-wrap"
                    onClick={() => onViewProduct ? onViewProduct(prod.id) : onQuickView(prod)}
                  >
                    {discountPct && (
                      <span className="badge-discount">{discountPct}% OFF</span>
                    )}
                    {isOutOfStock ? (
                      <span className="product-badge badge-out-of-stock">Sold Out</span>
                    ) : isLowStock ? (
                      <span className="product-badge badge-low-stock">Only {prod.stock} left!</span>
                    ) : prod.badge ? (
                      <span className="product-badge">{prod.badge}</span>
                    ) : null}

                    {imageErrors[prod.id] ? (
                      <div className="fallback-image-placeholder">
                        <span>🌾</span>
                        <p>{prod.name}</p>
                      </div>
                    ) : (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="shop-list-img"
                        loading="lazy"
                        onError={() => handleImageError(prod.id)}
                      />
                    )}
                  </div>

                  {/* Middle: Details */}
                  <div className="shop-list-details">
                    <div className="shop-list-meta">
                      <span className="shop-card-category">{prod.categoryName}</span>
                      <span className="shop-card-weight">• {prod.weight}</span>
                    </div>

                    <h3 
                      className="shop-list-title"
                      onClick={() => onViewProduct ? onViewProduct(prod.id) : onQuickView(prod)}
                    >
                      {prod.name}
                    </h3>
                    <span className="shop-card-tamil">{prod.tamilName}</span>

                    {prod.highlight && (
                      <div className="shop-highlight-pill">
                        <span className="highlight-dot">●</span>
                        <span>{prod.highlight}</span>
                      </div>
                    )}

                    <p className="shop-list-desc">{prod.description}</p>

                    <div className="shop-card-rating">
                      <div className="stars-mini">
                        <Star size={13} fill="#d97706" color="#d97706" />
                        <span className="rating-num">{prod.rating}</span>
                      </div>
                      <span className="rating-count">({prod.reviewsCount} verified reviews)</span>
                    </div>
                  </div>

                  {/* Right: Price & CTA */}
                  <div className="shop-list-actions">
                    <div className="list-price-block">
                      <span className="current-price">₹{prod.price}</span>
                      {prod.originalPrice && (
                        <span className="slashed-price">₹{prod.originalPrice}</span>
                      )}
                      {discountPct && (
                        <span className="save-amount-text">Save ₹{prod.originalPrice - prod.price}</span>
                      )}
                    </div>

                    <div className="list-buttons-group">
                      <button
                        className="btn-card-view"
                        onClick={() => onViewProduct ? onViewProduct(prod.id) : onQuickView(prod)}
                        title="View full details"
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>

                      {isOutOfStock ? (
                        <button
                          className="btn-card-add btn-card-soldout"
                          disabled
                          aria-disabled="true"
                        >
                          Sold Out
                        </button>
                      ) : inCartQty > 0 ? (
                        <div className="card-stepper-btn-group">
                          <button
                            type="button"
                            className="stepper-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (inCartQty <= 1) removeFromCart(prod.id);
                              else updateQuantity(prod.id, inCartQty - 1, prod.stock);
                            }}
                            title="Decrease quantity"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="stepper-qty-display">{inCartQty} in cart</span>
                          <button
                            type="button"
                            className="stepper-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(prod.id, inCartQty + 1, prod.stock);
                            }}
                            disabled={typeof prod.stock === 'number' && inCartQty >= prod.stock}
                            title="Increase quantity"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-card-add"
                          onClick={() => onAddToCart(prod)}
                          aria-label={`Add ${prod.name} to cart`}
                        >
                          <ShoppingBag size={15} />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Grid View Mode */
          <div className="shop-products-grid">
            {filteredAndSortedProducts.map((prod) => {
              const isOutOfStock = (typeof prod.stock === 'number' && prod.stock <= 0) || prod.inStock === false;
              const isLowStock = !isOutOfStock && typeof prod.stock === 'number' && prod.stock <= 5;
              const discountPct = prod.originalPrice && prod.originalPrice > prod.price 
                ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) 
                : null;
              const inCartQty = getCartQuantity(prod.id);

              return (
                <article key={prod.id} className={`shop-product-card ${isOutOfStock ? 'card-out-of-stock' : ''}`}>
                  {/* Badges */}
                  <div className="product-card-badges">
                    {discountPct && (
                      <span className="badge-discount">{discountPct}% OFF</span>
                    )}
                    {isOutOfStock ? (
                      <span className="product-badge badge-out-of-stock">Sold Out</span>
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

                    {/* Product Highlight Pill */}
                    {prod.highlight && (
                      <div className="shop-highlight-pill-mini">
                        <span>{prod.highlight}</span>
                      </div>
                    )}

                    {/* Rating */}
                    <div className="shop-card-rating">
                      <div className="stars-mini">
                        <Star size={13} fill="#d97706" color="#d97706" />
                        <span className="rating-num">{prod.rating}</span>
                      </div>
                      <span className="rating-count">({prod.reviewsCount} reviews)</span>
                    </div>

                    {/* Footer (Price & Add Button / Stepper) */}
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
                          View
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
                        ) : inCartQty > 0 ? (
                          <div className="card-stepper-btn-group">
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (inCartQty <= 1) removeFromCart(prod.id);
                                else updateQuantity(prod.id, inCartQty - 1, prod.stock);
                              }}
                              title="Decrease quantity"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="stepper-qty-display">{inCartQty} in cart</span>
                            <button
                              type="button"
                              className="stepper-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(prod.id, inCartQty + 1, prod.stock);
                              }}
                              disabled={typeof prod.stock === 'number' && inCartQty >= prod.stock}
                              title="Increase quantity"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
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

        {/* 6. Heritage Artisanal Promise Banner */}
        <div className="shop-artisan-seal-banner">
          <div className="seal-badge-icon">🌿</div>
          <div className="seal-info">
            <h3 className="seal-title">Our Heritage Promise • நம் பாரம்பரிய உறுதிமொழி</h3>
            <p className="seal-desc">
              Every item at Thaniyam Treats is prepared strictly following traditional village recipes, sun-dried native agricultural sourcing, and zero artificial preservatives. Real food crafted for real wellbeing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
