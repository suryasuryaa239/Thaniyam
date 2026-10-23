import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, HeartHandshake, Award } from 'lucide-react';

export default function Hero({ onShopNowClick, onExploreCategoriesClick }) {
  return (
    <section id="home" className="hero-section">
      <div className="hero-grid">
        {/* Left Column: Hero Copy & CTAs */}
        <div className="hero-content">
          <div className="hero-pill">
            <Sparkles size={14} className="hero-pill-icon" />
            <span>Handcrafted Traditional Heritage</span>
          </div>

          <h1 className="hero-heading">
            Authentic Traditional Flavours, Crafted from <span className="highlight-text">Native Millets</span>
          </h1>

          <p className="hero-description">
            Experience the wholesome goodness of unpolished native grains, wood-pressed pure oils,
            hand-twisted crispy murukku, and authentic palm jaggery made with time-honored ancestral recipes.
          </p>

          <div className="hero-cta-group">
            <button 
              className="btn-primary hero-btn"
              onClick={onShopNowClick}
            >
              <span>Shop Traditional Treats</span>
              <ArrowRight size={18} />
            </button>
            <button 
              className="btn-secondary hero-btn"
              onClick={onExploreCategoriesClick}
            >
              <span>Explore Categories</span>
            </button>
          </div>

          {/* Quick trust highlights strip */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <span className="trust-icon-box">🌾</span>
              <div>
                <strong>Native Millets</strong>
                <p>100% Unpolished</p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon-box">🪵</span>
              <div>
                <strong>Wood-Pressed</strong>
                <p>Cold-Extracted Oils</p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon-box">🍯</span>
              <div>
                <strong>Palm Jaggery</strong>
                <p>Zero White Sugar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: High-Res Food Visual Card */}
        <div className="hero-visual">
          <div className="hero-image-frame">
            <img 
              src="/images/hero-banner.jpg" 
              alt="Traditional South Indian millet snacks, kai murukku, and sweets in vintage brass bowls" 
              className="hero-main-img"
              loading="eager"
            />
            <div className="hero-floating-badge">
              <span className="badge-tagline">100% Traditional</span>
              <span className="badge-highlight">Village Made Recipes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
