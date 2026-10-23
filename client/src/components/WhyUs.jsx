import React from 'react';
import { Utensils, Wheat, Sparkles, ShieldCheck } from 'lucide-react';
import { WHY_US_POINTS } from '../data/sampleData';

const ICON_MAP = {
  CookingPot: Utensils,
  Wheat: Wheat,
  Sparkles: Sparkles,
  ShieldCheck: ShieldCheck
};

export default function WhyUs() {
  return (
    <section id="why-us" className="why-us-section">
      <div className="why-us-container">
        <div className="section-header text-center">
          <span className="section-tag">OUR VALUES</span>
          <h2 className="section-title">Why Thaniyam Treats?</h2>
          <p className="section-subtitle">
            Committed to preserving the uncompromised integrity of South Indian culinary heritage.
          </p>
        </div>

        <div className="benefits-grid">
          {WHY_US_POINTS.map((point, index) => {
            const IconComponent = ICON_MAP[point.icon] || Sparkles;
            return (
              <div key={index} className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <IconComponent size={28} className="benefit-icon" />
                </div>
                <h3 className="benefit-title">{point.title}</h3>
                <p className="benefit-desc">{point.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
