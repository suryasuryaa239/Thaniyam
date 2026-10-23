import React, { useState } from 'react';
import { Search, ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar({ 
  currentView, 
  cartCount, 
  onCartClick, 
  searchQuery, 
  onSearchChange, 
  onNavigate 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleNavClick = (view, sectionId) => {
    setMobileMenuOpen(false);
    onNavigate(view, sectionId);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleNavClick('shop');
    }
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn" 
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Brand Logo / Wordmark */}
        <a 
          href="#home" 
          className="brand-logo" 
          onClick={(e) => { e.preventDefault(); handleNavClick('home', 'home'); }}
        >
          <div className="logo-symbol">
            <span>🌿</span>
          </div>
          <div className="logo-text-group">
            <span className="logo-title">Thaniyam Treats</span>
            <span className="logo-subtitle">பாரம்பரிய நல்சுவை • Heritage Foods</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <a 
                href="#home" 
                className={currentView === 'home' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavClick('home', 'home'); }}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#shop" 
                className={currentView === 'shop' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavClick('shop'); }}
              >
                Shop All
              </a>
            </li>
            <li>
              <a 
                href="#categories" 
                onClick={(e) => { e.preventDefault(); handleNavClick('home', 'categories'); }}
              >
                Categories
              </a>
            </li>
            <li>
              <a 
                href="#why-us" 
                onClick={(e) => { e.preventDefault(); handleNavClick('home', 'why-us'); }}
              >
                Why Us
              </a>
            </li>
            <li>
              <a 
                href="#our-story" 
                onClick={(e) => { e.preventDefault(); handleNavClick('home', 'our-story'); }}
              >
                Our Story
              </a>
            </li>
          </ul>
        </nav>

        {/* Actions (Search & Cart) */}
        <div className="navbar-actions">
          {/* Search Trigger & Form */}
          <form className={`search-wrapper ${searchOpen ? 'open' : ''}`} onSubmit={handleSearchSubmit}>
            {searchOpen && (
              <input
                type="text"
                className="search-input"
                placeholder="Search murukku, millets, oils..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
              />
            )}
            <button
              type="button"
              className="action-icon-btn"
              aria-label="Search products"
              onClick={() => {
                if (searchOpen && searchQuery) {
                  handleNavClick('shop');
                } else {
                  setSearchOpen(!searchOpen);
                }
              }}
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
          </form>

          {/* Cart Trigger */}
          <button
            className="action-icon-btn cart-btn"
            aria-label={`Shopping cart with ${cartCount} items`}
            onClick={onCartClick}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav className="mobile-drawer" aria-label="Mobile Navigation">
          <ul className="mobile-nav-links">
            <li>
              <a 
                href="#home" 
                className={currentView === 'home' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavClick('home', 'home'); }}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#shop" 
                className={currentView === 'shop' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavClick('shop'); }}
              >
                Shop All Products <ArrowRight size={16} />
              </a>
            </li>
            <li>
              <a 
                href="#categories" 
                onClick={(e) => { e.preventDefault(); handleNavClick('home', 'categories'); }}
              >
                Categories <ArrowRight size={16} />
              </a>
            </li>
            <li>
              <a 
                href="#why-us" 
                onClick={(e) => { e.preventDefault(); handleNavClick('home', 'why-us'); }}
              >
                Why Us
              </a>
            </li>
            <li>
              <a 
                href="#our-story" 
                onClick={(e) => { e.preventDefault(); handleNavClick('home', 'our-story'); }}
              >
                Our Story
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
