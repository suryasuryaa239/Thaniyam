import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, ShoppingBag, Menu, X, ArrowRight, Heart, 
  ChevronDown, ChevronRight, PackageSearch, Sparkles 
} from 'lucide-react';
import { CATEGORIES } from '../data/sampleData';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../context/ProductContext';

const CATEGORY_IMAGE_MAP = {
  'dosa-mix': '/images/products/chola-milagu-dosa-mix-sorghum-pepper-dosa-mix.jpg',
  'puttu-mix': '/images/products/poongar-rice-kozhukattai-idiyappam-flour.jpg',
  'kanji-mix': '/images/products/karuppu-kavuni-kanji.jpg',
  'health-mix': '/images/products/karuppu-kavuni-nutrition-mix.jpg',
  'heritage-podis': '/images/products/paruppu-podi-lentil-spice-powder.jpg',
  'pongal-mix': '/images/products/siruthaniya-pongal-mix-multi-millet-pongal-mix.jpg',
  'traditional-snacks': '/images/cat-snacks.jpg',
  'wood-pressed-oils': '/images/cat-oils.jpg',
  'natural-sweeteners': '/images/cat-jaggery.jpg',
  'kali-mix': '/images/products/ulundhu-kali.jpg',
  'tea-mix': '/images/products/sukku-malli-coffee-herbal-coffee-mix.jpg',
  'daily-needs': '/images/products/himalayan-rock-crtstals.jpg',
  'beauty-care': '/images/products/nalangu-maavu-herbal-bath-powder.jpg',
  'chapati-mix': '/images/products/multi-millet-chapati-mix.jpg',
  'millets-grains': '/images/cat-millets.jpg',
  'millet-sweets': '/images/prod-laddu.jpg',
};

const CATEGORY_ICON_MAP = {
  'dosa-mix': '🥞',
  'puttu-mix': '🍚',
  'kanji-mix': '🥣',
  'health-mix': '🥛',
  'heritage-podis': '🌶️',
  'pongal-mix': '🍲',
  'traditional-snacks': '🥨',
  'wood-pressed-oils': '🫒',
  'natural-sweeteners': '🍯',
  'kali-mix': '🍯',
  'tea-mix': '☕',
  'daily-needs': '🧂',
  'beauty-care': '🌿',
  'chapati-mix': '🫓',
  'millets-grains': '🌾',
  'millet-sweets': '🍬',
};

const CATEGORY_TAG_MAP = {
  'dosa-mix': 'Crisp & Wholesome',
  'puttu-mix': 'Steamed & Soft',
  'kanji-mix': 'Restorative Porridge',
  'health-mix': 'Sprouted Multigrain',
  'heritage-podis': 'Stone-Ground Blends',
  'pongal-mix': 'Comforting Breakfast',
  'traditional-snacks': 'Wood-Pressed Crisp',
  'wood-pressed-oils': 'Cold-Pressed Vaagai',
  'natural-sweeteners': 'Pure Udangudi Karupatti',
  'kali-mix': 'Cooling & Strengthening',
  'tea-mix': 'Herbal Wellness Brew',
  'daily-needs': 'Pure Mineral & Sweet',
  'beauty-care': 'Chemical-Free Herbal',
  'chapati-mix': 'High-Fiber Rotis',
  'millets-grains': 'Unpolished & Native',
  'millet-sweets': 'Palm Jaggery Delights',
};

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
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const catRef = useRef(null);
  const { wishlistIds } = useWishlist();
  const { lang, toggleLang, t } = useLanguage();
  const { categories: dynamicCategories } = useProducts();

  const activeCategories = (dynamicCategories && dynamicCategories.length > 0)
    ? dynamicCategories.filter((c) => c.id !== 'all')
    : CATEGORIES;

  useEffect(() => {
    const onDocClick = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleNavClick = (view, sectionId) => {
    setMobileMenuOpen(false);
    setMobileCatOpen(false);
    setCatOpen(false);
    onNavigate(view, sectionId);
  };

  const handleCategoryClick = (catId) => {
    setMobileMenuOpen(false);
    setMobileCatOpen(false);
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
          onClick={() => {
            setMobileMenuOpen((o) => {
              if (o) setMobileCatOpen(false);
              return !o;
            });
          }}
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
            <li 
              className="nav-dropdown" 
              ref={catRef}
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button
                type="button"
                className={`nav-dropdown-trigger ${catOpen ? 'open' : ''}`}
                aria-haspopup="true"
                aria-expanded={catOpen}
                onClick={() => setCatOpen((o) => !o)}
              >
                <span>{t('categories')}</span>
                <ChevronDown size={14} className={`nav-chevron ${catOpen ? 'rotated' : ''}`} />
              </button>

              {catOpen && (
                <div className="nav-dropdown-panel" role="menu">
                  {/* Dropdown Header */}
                  <div className="nav-dropdown-header">
                    <div className="nav-dropdown-header-info">
                      <span className="dropdown-header-icon">🌿</span>
                      <div>
                        <span className="dropdown-header-title">Heritage Collections</span>
                        <span className="dropdown-header-tamil">நம் பாரம்பரிய அங்காடி பிரிவுகள்</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="dropdown-view-all-btn"
                      onClick={() => handleNavClick('shop')}
                    >
                      <span>Explore Shop</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  {/* Category Items List */}
                  <div className="nav-dropdown-list">
                    {activeCategories.map((cat) => {
                      const catImage = cat.image || CATEGORY_IMAGE_MAP[cat.id] || '/images/cat-snacks.jpg';
                      const catIcon = cat.icon || CATEGORY_ICON_MAP[cat.id] || '🌾';
                      const catTag = CATEGORY_TAG_MAP[cat.id] || 'Pure Traditional';

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          className="nav-cat-item-btn"
                          onClick={() => handleCategoryClick(cat.id)}
                          role="menuitem"
                        >
                          <div className="nav-cat-thumb-box">
                            <img
                              src={catImage}
                              alt={cat.name}
                              className="nav-cat-thumb-img"
                              loading="lazy"
                            />
                            <span className="nav-cat-emoji">{catIcon}</span>
                          </div>
                          <div className="nav-cat-info">
                            <div className="nav-cat-title-row">
                              <span className="nav-cat-name">
                                {lang === 'ta' && cat.tamilName ? cat.tamilName : cat.name}
                              </span>
                              <span className="nav-cat-pill">{catTag}</span>
                            </div>
                            <span className="nav-cat-sub">
                              {lang === 'ta' ? cat.name : cat.tamilName}
                            </span>
                          </div>
                          <ChevronRight size={15} className="nav-cat-arrow" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Dropdown Trust Footer */}
                  <div className="nav-dropdown-footer">
                    <div className="dropdown-perk-item">
                      <span className="perk-bullet">🪵</span>
                      <span>100% Marachekku</span>
                    </div>
                    <div className="dropdown-perk-item">
                      <span className="perk-bullet">🌾</span>
                      <span>Native Millets</span>
                    </div>
                    <div className="dropdown-perk-item">
                      <span className="perk-bullet">🚚</span>
                      <span>Free Delivery &gt; ₹499</span>
                    </div>
                  </div>
                </div>
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
            <li className="mobile-category-accordion">
              <button
                type="button"
                className={`mobile-category-trigger ${mobileCatOpen ? 'open' : ''}`}
                onClick={() => setMobileCatOpen((o) => !o)}
                aria-expanded={mobileCatOpen}
              >
                <div className="mobile-category-trigger-left">
                  <span className="mobile-category-icon-main">🌿</span>
                  <span className="mobile-category-title-text">{t('categories')}</span>
                  <span className="mobile-category-count-pill">{activeCategories.length}</span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`mobile-category-chevron ${mobileCatOpen ? 'rotated' : ''}`} 
                />
              </button>

              {mobileCatOpen && (
                <ul className="mobile-category-sublist" role="region">
                  {activeCategories.map((cat) => {
                    const catIcon = cat.icon || CATEGORY_ICON_MAP[cat.id] || '🌾';
                    return (
                      <li key={cat.id} className="mobile-sub-item">
                        <a
                          href={`#/shop?category=${cat.id}`}
                          onClick={(e) => { e.preventDefault(); handleCategoryClick(cat.id); }}
                          className="mobile-cat-link"
                        >
                          <span className="mobile-cat-icon">{catIcon}</span>
                          <div className="mobile-cat-text">
                            <span className="mobile-cat-name">
                              {lang === 'ta' && cat.tamilName ? cat.tamilName : cat.name}
                            </span>
                            <span className="mobile-cat-tamil">
                              {lang === 'ta' ? cat.name : cat.tamilName}
                            </span>
                          </div>
                          <ChevronRight size={14} className="mobile-cat-arrow" />
                        </a>
                      </li>
                    );
                  })}
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
