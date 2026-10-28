import React from 'react';
import { ArrowRight, Leaf } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Hero({ onShopNowClick, onLearnMoreClick }) {
  const { t } = useLanguage();

  return (
    <section id="home" className="hero-section">
      <img
        src="/images/hero-banner.jpg"
        alt=""
        className="hero-bg-img"
        loading="eager"
        fetchPriority="high"
      />
      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-content">
        <div className="hero-pill">
          <Leaf size={14} className="hero-pill-icon" />
          <span>{t('heroBadge')}</span>
        </div>

        <h1 className="hero-heading">
          {t('heroLine1')}{' '}
          <span className="highlight-text">
            {t('heroHighlight')}
            <svg className="highlight-swoosh" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2 9 C 60 2, 120 2, 180 7 S 270 12, 298 4" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        <p className="hero-description">{t('heroSub')}</p>

        <div className="hero-cta-group">
          <button className="btn-primary hero-btn" onClick={onShopNowClick}>
            <span>{t('shopNow')}</span>
            <ArrowRight size={18} />
          </button>
          <button className="btn-glass hero-btn" onClick={onLearnMoreClick}>
            <span>{t('learnMore')}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
