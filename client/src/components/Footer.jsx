import React from 'react';
import { Mail, MapPin, Clock, Phone, ArrowUp } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Main Footer Grid */}
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <span className="footer-logo-icon">🌿</span>
              <span className="footer-brand-name">Thaniyam Treats</span>
            </div>
            <p className="footer-brand-tagline">
              Dedicated to delivering the pure authenticity of South Indian traditional snacks, 
              unpolished native millets, and genuine cold-pressed pantry essentials.
            </p>
            <div className="footer-badge-pill">
              <span>🌾 Sourced from Native Tamil Nadu Farming Clusters</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
                  Home
                </a>
              </li>
              <li>
                <a href="#shop" onClick={(e) => { e.preventDefault(); onNavigate('featured-products'); }}>
                  Shop All Products
                </a>
              </li>
              <li>
                <a href="#categories" onClick={(e) => { e.preventDefault(); onNavigate('categories'); }}>
                  Shop by Category
                </a>
              </li>
              <li>
                <a href="#why-us" onClick={(e) => { e.preventDefault(); onNavigate('why-us'); }}>
                  Why Thaniyam Treats
                </a>
              </li>
              <li>
                <a href="#our-story" onClick={(e) => { e.preventDefault(); onNavigate('our-story'); }}>
                  Our Story & Heritage
                </a>
              </li>
            </ul>
          </div>

          {/* Categories Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Categories</h4>
            <ul className="footer-links">
              <li>
                <a href="#categories" onClick={(e) => { e.preventDefault(); onNavigate('categories'); }}>
                  Native Millets & Grains
                </a>
              </li>
              <li>
                <a href="#categories" onClick={(e) => { e.preventDefault(); onNavigate('categories'); }}>
                  Traditional Savory Snacks
                </a>
              </li>
              <li>
                <a href="#categories" onClick={(e) => { e.preventDefault(); onNavigate('categories'); }}>
                  Wood-Pressed Sesame & Groundnut Oil
                </a>
              </li>
              <li>
                <a href="#categories" onClick={(e) => { e.preventDefault(); onNavigate('categories'); }}>
                  Pure Palm Jaggery (Karupatti)
                </a>
              </li>
              <li>
                <a href="#categories" onClick={(e) => { e.preventDefault(); onNavigate('categories'); }}>
                  Heritage Podis & Sweets
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact & Support</h4>
            <ul className="footer-contact-list">
              <li>
                <Mail size={16} className="contact-icon" />
                <span>support@thaniyamtreats.com</span>
              </li>
              <li>
                <Phone size={16} className="contact-icon" />
                <span>+91 94420 00000 (Mon - Sat)</span>
              </li>
              <li>
                <MapPin size={16} className="contact-icon" />
                <span>Coimbatore, Tamil Nadu 641001, India</span>
              </li>
              <li>
                <Clock size={16} className="contact-icon" />
                <span>Support Hours: 9:30 AM – 6:30 PM IST</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Policies & Copyright Strip */}
        <div className="footer-bottom-strip">
          <div className="footer-policies">
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <span className="dot">•</span>
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <span className="dot">•</span>
            <a href="#shipping" onClick={(e) => e.preventDefault()}>Shipping & Delivery</a>
            <span className="dot">•</span>
            <a href="#returns" onClick={(e) => e.preventDefault()}>Return Policy</a>
          </div>

          <div className="footer-copyright">
            <p>© 2026 Thaniyam Treats. Handcrafted with traditional pride.</p>
          </div>

          <button 
            className="scroll-top-btn" 
            onClick={scrollToTop}
            aria-label="Scroll back to top"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
