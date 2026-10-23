import React, { useState } from 'react';
import { Eye, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { FEATURED_PRODUCTS } from '../data/sampleData';

const FILTER_TABS = [
  { id: 'all', label: 'All Specialties' },
  { id: 'traditional-snacks', label: 'Savory Snacks' },
  { id: 'wood-pressed-oils', label: 'Wood-Pressed Oils' },
  { id: 'natural-sweeteners', label: 'Palm Jaggery' },
  { id: 'millet-sweets', label: 'Millet Sweets' },
  { id: 'heritage-podis', label: 'Podis & Masalas' },
  { id: 'millets-grains', label: 'Native Millets' },
];

export default function FeaturedProducts({ onQuickView, onAddToCart, searchQuery, activeCategory, onCategoryChange }) {
  const [selectedTab, setSelectedTab] = useState(activeCategory || 'all');

  const currentTab = activeCategory || selectedTab;

  const handleTabClick = (tabId) => {
    setSelectedTab(tabId);
    if (onCategoryChange) {
      onCategoryChange(tabId);
    }
  };

  // Filter products by selected category tab and search query
  const filteredProducts = FEATURED_PRODUCTS.filter((product) => {
    const matchesTab = currentTab === 'all' || product.category === currentTab;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tamilName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <section id="featured-products" className="products-section">
      <div className="section-header text-center">
        <span className="section-tag">MOST POPULAR</span>
        <h2 className="section-title">Featured Traditional Delights</h2>
        <p className="section-subtitle">
          Pure South Indian snacks, unpolished grains, and authentic pantry staples freshly made in small batches.
        </p>

        {/* Filter Tabs */}
        <div className="filter-tabs-container">
          <div className="filter-tabs" role="tablist" aria-label="Product category filters">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={currentTab === tab.id}
                className={`filter-tab-btn ${currentTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="no-products-found">
          <p>No products found matching "<strong>{searchQuery}</strong>".</p>
          <button className="btn-secondary" onClick={() => handleTabClick('all')}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((prod) => (
            <article key={prod.id} className="product-card">
              {/* Product Badge */}
              {prod.badge && (
                <span className="product-badge">{prod.badge}</span>
              )}

              {/* Product Image Frame */}
              <div className="product-image-frame" onClick={() => onQuickView(prod)}>
                <img 
                  src={prod.image} 
                  alt={prod.name} 
                  className="product-card-img"
                  loading="lazy"
                />
                <button 
                  className="quick-view-overlay-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickView(prod);
                  }}
                  aria-label={`Quick view ${prod.name}`}
                >
                  <Eye size={16} />
                  <span>Quick View</span>
                </button>
              </div>

              {/* Product Body */}
              <div className="product-body">
                <div className="product-meta">
                  <span className="product-cat-name">{prod.categoryName}</span>
                  <span className="product-weight-tag">{prod.weight}</span>
                </div>

                <h3 className="product-title" onClick={() => onQuickView(prod)}>
                  {prod.name}
                </h3>
                <span className="product-tamil-sub">{prod.tamilName}</span>

                {/* Rating */}
                <div className="product-rating-row">
                  <div className="stars-mini">
                    <Star size={13} fill="#d97706" color="#d97706" />
                    <span className="rating-num">{prod.rating}</span>
                  </div>
                  <span className="rating-count">({prod.reviewsCount})</span>
                </div>

                {/* Price and Add button */}
                <div className="product-card-footer">
                  <div className="price-group">
                    <span className="current-price">₹{prod.price}</span>
                    {prod.originalPrice && (
                      <span className="slashed-price">₹{prod.originalPrice}</span>
                    )}
                  </div>

                  <button 
                    className="btn-add-cart"
                    onClick={() => onAddToCart(prod)}
                    aria-label={`Add ${prod.name} to cart`}
                  >
                    <ShoppingBag size={16} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Sample Data Disclaimer footnote as per instructions */}
      <div className="dev-data-note">
        <Sparkles size={14} />
        <span>Development Preview: Displaying curated traditional South Indian catalog items.</span>
      </div>
    </section>
  );
}
