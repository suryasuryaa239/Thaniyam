import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Star, ShoppingBag, ShieldCheck, Check, 
  Truck, Sparkles, ArrowLeft, AlertCircle, RefreshCw, Eye 
} from 'lucide-react';
import { getProductById, getRelatedProducts } from '../data/productsCatalog';

export default function ProductDetailsPage({ 
  productId, 
  onNavigateHome, 
  onNavigateShop, 
  onNavigateCategory, 
  onViewProduct, 
  onAddToCart 
}) {
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fetch product data (using mock module with simulated network resilience)
  useEffect(() => {
    setLoading(true);
    setSelectedImageIndex(0);
    setQuantity(1);
    setImageError(false);

    // Simulated async fetch to reflect realistic loading state
    const timer = setTimeout(() => {
      const found = getProductById(productId);
      setProduct(found);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 120);

    return () => clearTimeout(timer);
  }, [productId]);

  const handleAdd = () => {
    if (!product) return;
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="product-details-page">
        <div className="product-details-container">
          <div className="details-skeleton-grid">
            <div className="skeleton-image-box">
              <div className="skeleton-pulse skeleton-img"></div>
              <div className="skeleton-thumbnails">
                <div className="skeleton-pulse skeleton-thumb"></div>
                <div className="skeleton-pulse skeleton-thumb"></div>
                <div className="skeleton-pulse skeleton-thumb"></div>
              </div>
            </div>
            <div className="skeleton-info-box">
              <div className="skeleton-pulse skeleton-tag"></div>
              <div className="skeleton-pulse skeleton-title"></div>
              <div className="skeleton-pulse skeleton-rating"></div>
              <div className="skeleton-pulse skeleton-price"></div>
              <div className="skeleton-pulse skeleton-desc"></div>
              <div className="skeleton-pulse skeleton-btn"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Not Found State (Invalid product ID)
  if (!product) {
    return (
      <div className="product-details-page">
        <div className="product-details-container">
          <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
            <button className="breadcrumb-link" onClick={onNavigateHome}>Home</button>
            <ChevronRight size={14} className="breadcrumb-sep" />
            <button className="breadcrumb-link" onClick={() => onNavigateShop('all')}>Shop</button>
            <ChevronRight size={14} className="breadcrumb-sep" />
            <span className="breadcrumb-current">Product Not Found</span>
          </nav>

          <div className="product-not-found-card">
            <div className="empty-icon-wrap">
              <AlertCircle size={44} className="empty-icon" />
            </div>
            <h1 className="not-found-heading">Traditional Item Not Found</h1>
            <p className="not-found-text">
              We couldn't locate the product you requested (ID: <code>{productId}</code>). 
              The item may be out of seasonal batch or the link might be expired.
            </p>
            <button className="btn-primary" onClick={() => onNavigateShop('all')}>
              <ArrowLeft size={16} />
              <span>Explore All Products</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const galleryImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const currentMainImage = galleryImages[selectedImageIndex] || product.image;
  const relatedProducts = getRelatedProducts(product.id, product.category, 4);

  return (
    <div className="product-details-page">
      <div className="product-details-container">
        {/* Breadcrumb Navigation: Home → Shop → Category → Product */}
        <nav className="breadcrumbs product-breadcrumbs" aria-label="Breadcrumb navigation">
          <button className="breadcrumb-link" onClick={onNavigateHome}>Home</button>
          <ChevronRight size={14} className="breadcrumb-sep" />
          <button className="breadcrumb-link" onClick={() => onNavigateShop('all')}>Shop</button>
          <ChevronRight size={14} className="breadcrumb-sep" />
          <button 
            className="breadcrumb-link" 
            onClick={() => onNavigateCategory(product.category)}
          >
            {product.categoryName}
          </button>
          <ChevronRight size={14} className="breadcrumb-sep" />
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Main Product Showcase Section */}
        <section className="product-showcase-grid">
          {/* Gallery Column */}
          <div className="product-gallery-column">
            {/* Primary Large Image Frame */}
            <div className="main-image-frame">
              {product.badge && (
                <span className="product-badge showcase-badge">{product.badge}</span>
              )}

              {imageError ? (
                <div className="fallback-image-placeholder detail-fallback">
                  <span style={{ fontSize: '3rem' }}>🌾</span>
                  <p>{product.name}</p>
                </div>
              ) : (
                <img
                  src={currentMainImage}
                  alt={`${product.name} - view ${selectedImageIndex + 1}`}
                  className="showcase-main-img"
                  onError={() => setImageError(true)}
                />
              )}
            </div>

            {/* Thumbnails Row */}
            {galleryImages.length > 1 && (
              <div className="gallery-thumbnails-strip" role="group" aria-label="Product image thumbnails">
                {galleryImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    className={`gallery-thumb-btn ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setImageError(false);
                    }}
                    aria-label={`Select product image ${index + 1}`}
                    aria-current={selectedImageIndex === index ? 'true' : 'false'}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="thumb-img" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Column */}
          <div className="product-info-column">
            {/* Category Tag & Package Weight */}
            <div className="product-header-meta">
              <button 
                className="category-pill-link"
                onClick={() => onNavigateCategory(product.category)}
              >
                {product.categoryName}
              </button>
              <span className="net-weight-badge">Net Wt: {product.weight}</span>
            </div>

            {/* Title & Tamil Subtitle */}
            <h1 className="product-headline">{product.name}</h1>
            <p className="product-tamil-headline">{product.tamilName}</p>

            {/* Ratings & Verified Count */}
            <div className="product-reviews-row">
              <div className="stars-group">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#d97706" color="#d97706" />
                ))}
              </div>
              <span className="rating-score">{product.rating}</span>
              <span className="rating-divider">•</span>
              <span className="reviews-text">{product.reviewsCount} verified customer reviews</span>
            </div>

            {/* Price Box */}
            <div className="product-price-box">
              <div className="price-display">
                <span className="currency-symbol">₹</span>
                <span className="primary-price">{product.price}</span>
                {product.originalPrice && (
                  <span className="slashed-original-price">₹{product.originalPrice}</span>
                )}
              </div>
              <span className="tax-inclusive-tag">Inclusive of all taxes</span>
            </div>

            {/* Stock Availability */}
            <div className="stock-status-pill">
              <span className="stock-indicator-dot"></span>
              <strong>Availability:</strong>
              <span>In Stock (Fresh Small-Batch)</span>
            </div>

            {/* Description */}
            <div className="product-description-block">
              <h3 className="subheading">About This Traditional Treat</h3>
              <p className="description-text">{product.description}</p>
            </div>

            {/* Traditional Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="product-ingredients-block">
                <h3 className="subheading">Pure Traditional Ingredients</h3>
                <div className="ingredients-pill-list">
                  {product.ingredients.map((item, idx) => (
                    <span key={idx} className="ingredient-pill-tag">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase Controls (Quantity + Add to Cart) */}
            <div className="purchase-controls-card">
              <div className="quantity-selector-group">
                <label className="qty-label">Quantity</label>
                <div className="qty-control-box">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="qty-number" aria-live="polite">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className={`btn-primary purchase-add-btn ${added ? 'btn-success' : ''}`}
                onClick={handleAdd}
              >
                {added ? (
                  <>
                    <Check size={20} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    <span>Add to Cart • ₹{product.price * quantity}</span>
                  </>
                )}
              </button>
            </div>

            {/* Traditional Trust Strip */}
            <div className="product-trust-strip">
              <div className="trust-cell">
                <ShieldCheck size={18} className="trust-icon" />
                <div>
                  <strong>Zero Preservatives</strong>
                  <p>100% Native ingredients</p>
                </div>
              </div>
              <div className="trust-cell">
                <Truck size={18} className="trust-icon" />
                <div>
                  <strong>Freshly Dispatched</strong>
                  <p>Safe Pan-India delivery</p>
                </div>
              </div>
              <div className="trust-cell">
                <Sparkles size={18} className="trust-icon" />
                <div>
                  <strong>Generational Recipes</strong>
                  <p>Village crafted taste</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section">
            <div className="section-header">
              <span className="section-tag">SIMILAR SPECIALTIES</span>
              <h2 className="section-title">You May Also Relish</h2>
              <p className="section-subtitle">
                Explore more handcrafted traditional food from our {product.categoryName} collection.
              </p>
            </div>

            <div className="related-products-grid">
              {relatedProducts.map((relProd) => (
                <article key={relProd.id} className="shop-product-card">
                  {relProd.badge && (
                    <span className="product-badge">{relProd.badge}</span>
                  )}
                  <div 
                    className="shop-card-image-frame"
                    onClick={() => onViewProduct(relProd.id)}
                  >
                    <img
                      src={relProd.image}
                      alt={relProd.name}
                      className="shop-card-img"
                      loading="lazy"
                    />
                    <button
                      className="shop-quick-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewProduct(relProd.id);
                      }}
                    >
                      <Eye size={15} />
                      <span>View</span>
                    </button>
                  </div>

                  <div className="shop-card-content">
                    <div className="shop-card-meta">
                      <span className="shop-card-category">{relProd.categoryName}</span>
                      <span className="shop-card-weight">{relProd.weight}</span>
                    </div>

                    <h3 
                      className="shop-card-title"
                      onClick={() => onViewProduct(relProd.id)}
                    >
                      {relProd.name}
                    </h3>
                    <span className="shop-card-tamil">{relProd.tamilName}</span>

                    <div className="shop-card-footer">
                      <div className="price-group">
                        <span className="current-price">₹{relProd.price}</span>
                      </div>
                      <button
                        className="btn-card-view"
                        onClick={() => onViewProduct(relProd.id)}
                      >
                        View Product
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
