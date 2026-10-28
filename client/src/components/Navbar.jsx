import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingBag, Menu, X, ArrowRight, Heart, ChevronDown, PackageSearch } from 'lucide-react';
import { CATEGORIES } from '../data/sampleData';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({
  currentView,
  cartCount,
  onCartClick,
  searchQuery,
  onSearchChange,
  onNavigate,
  onNavigateCategory,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);
  const { wishlistIds } = useWishlist();
  const { lang, toggleLang, t } = useLanguage();

  useEffect(() => {
    const onDocClick = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleNavClick = (view, sectionId) => {
    setMobileMenuOpen(false);
    setCatOpen(false);
    onNavigate(view, sectionId);
  };

  const handleCategoryClick = (catId) => {
    setMobileMenuOpen(false);
    setCatOpen(false);
    onNavigateCategory(catId);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) handleNavClick('shop');
  };

  const searchForm = (idSuffix) => (
    <form className="search-pill" onSubmit={handleSearchSubmit} role="search">
      <Search size={17} className="search-pill-icon" aria-hidden="true" />
      <input
        id={`site-search-${idSuffix}`}
        type="search"
        className="search-pill-input"
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchPlaceholder')}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </form>
  );

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <button
          className="mobile-menu-btn"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <a
          href="#home"
          className="brand-logo"
          onClick={(e) => { e.preventDefault(); handleNavClick('home', 'home'); }}
        >
          <div className="logo-symbol"><span>🌿</span></div>
          <div className="logo-text-group">
            <span className="logo-title">Thaniyam</span>
            <span className="logo-subtitle">Heritage Foods</span>
          </div>
        </a>

        <nav className="desktop-nav" aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <a
                href="#home"
                className={currentView === 'home' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavClick('home', 'home'); }}
              >
                {t('home')}
              </a>
            </li>
            <li>
              <a
                href="#shop"
                className={currentView === 'shop' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavClick('shop'); }}
              >
                {t('shop')}
              </a>
            </li>
            <li className="nav-dropdown" ref={catRef}>
              <button
                type="button"
                className={`nav-dropdown-trigger ${catOpen ? 'open' : ''}`}
                aria-haspopup="true"
                aria-expanded={catOpen}
                onClick={() => setCatOpen((o) => !o)}
              >
                {t('categories')} <ChevronDown size={15} />
              </button>
              {catOpen && (
                <ul className="nav-dropdown-menu">
                  {CATEGORIES.map((cat) => (
                    <li key={cat.id}>
                      <button type="button" onClick={() => handleCategoryClick(cat.id)}>
                        {lang === 'ta' ? cat.tamilName : cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <a
                href="#our-story"
                onClick={(e) => { e.preventDefault(); handleNavClick('home', 'our-story'); }}
              >
                {t('ourStory')}
              </a>
            </li>
          </ul>
        </nav>

        <div className="navbar-actions">
          <div className="search-desktop">{searchForm('desktop')}</div>

          <button
            className="action-icon-btn"
            aria-label={`Wishlist with ${wishlistIds.length} items`}
            onClick={() => handleNavClick('wishlist')}
          >
            <Heart size={20} />
            {wishlistIds.length > 0 && <span className="cart-badge">{wishlistIds.length}</span>}
          </button>

          <button
            className="action-icon-btn cart-btn"
            aria-label={`Shopping cart with ${cartCount} items`}
            onClick={onCartClick}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button
            type="button"
            className="lang-toggle"
            onClick={toggleLang}
            aria-label={lang === 'en' ? 'Switch to Tamil' : 'Switch to English'}
            title={lang === 'en' ? 'தமிழ்' : 'English'}
          >
            <span className={`lang-opt ${lang === 'ta' ? 'on' : ''}`}>த</span>
            <span className={`lang-opt ${lang === 'en' ? 'on' : ''}`}>E</span>
          </button>

          <button
            type="button"
            className={`pill-cta ${currentView === 'track-order' ? 'active' : ''}`}
            onClick={() => handleNavClick('track-order')}
          >
            <PackageSearch size={16} />
            <span className="pill-cta-text">{t('trackOrder')}</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="mobile-drawer" aria-label="Mobile Navigation">
          <div className="mobile-search">{searchForm('mobile')}</div>
          <ul className="mobile-nav-links">
            <li>
              <a
                href="#home"
                className={currentView === 'home' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavClick('home', 'home'); }}
              >
                {t('home')}
              </a>
            </li>
            <li>
              <a
                href="#shop"
                className={currentView === 'shop' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavClick('shop'); }}
              >
                {t('shop')} <ArrowRight size={16} />
              </a>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat.id} className="mobile-sub-item">
                <a
                  href={`#/shop?category=${cat.id}`}
                  onClick={(e) => { e.preventDefault(); handleCategoryClick(cat.id); }}
                >
                  {lang === 'ta' ? cat.tamilName : cat.name}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#our-story"
                onClick={(e) => { e.preventDefault(); handleNavClick('home', 'our-story'); }}
              >
                {t('ourStory')}
              </a>
            </li>
            <li>
              <a
                href="#cart"
                className={currentView === 'cart' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavClick('cart'); }}
              >
                Cart {cartCount > 0 && `(${cartCount})`} <ArrowRight size={16} />
              </a>
            </li>
            <li>
              <a
                href="#track-order"
                className={currentView === 'track-order' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavClick('track-order'); }}
              >
                {t('trackOrder')} <ArrowRight size={16} />
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
