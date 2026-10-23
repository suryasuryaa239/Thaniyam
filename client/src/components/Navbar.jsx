import React, { useState } from 'react';
import { Search, ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar({ cartCount, onCartClick, searchQuery, onSearchChange, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    onNavigate(sectionId);
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
          onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
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
              <a href="#home" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>Home</a>
            </li>
            <li>
              <a href="#shop" onClick={(e) => { e.preventDefault(); handleNavClick('featured-products'); }}>Shop</a>
            </li>
            <li>
              <a href="#categories" onClick={(e) => { e.preventDefault(); handleNavClick('categories'); }}>Categories</a>
            </li>
            <li>
              <a href="#why-us" onClick={(e) => { e.preventDefault(); handleNavClick('why-us'); }}>Why Us</a>
            </li>
            <li>
              <a href="#our-story" onClick={(e) => { e.preventDefault(); handleNavClick('our-story'); }}>Our Story</a>
            </li>
          </ul>
        </nav>

        {/* Actions (Search & Cart) */}
        <div className="navbar-actions">
          {/* Search Trigger */}
          <div className={`search-wrapper ${searchOpen ? 'open' : ''}`}>
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
              className="action-icon-btn"
              aria-label="Search products"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
          </div>

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
              <a href="#home" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>Home</a>
            </li>
            <li>
              <a href="#shop" onClick={(e) => { e.preventDefault(); handleNavClick('featured-products'); }}>
                Shop All Products <ArrowRight size={16} />
              </a>
            </li>
            <li>
              <a href="#categories" onClick={(e) => { e.preventDefault(); handleNavClick('categories'); }}>
                Categories <ArrowRight size={16} />
              </a>
            </li>
            <li>
              <a href="#why-us" onClick={(e) => { e.preventDefault(); handleNavClick('why-us'); }}>Why Us</a>
            </li>
            <li>
              <a href="#our-story" onClick={(e) => { e.preventDefault(); handleNavClick('our-story'); }}>Our Story</a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
