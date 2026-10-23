import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../data/sampleData';

export default function Categories({ onSelectCategory }) {
  return (
    <section id="categories" className="categories-section">
      <div className="section-header text-center">
        <span className="section-tag">HERITAGE SELECTIONS</span>
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-subtitle">
          Explore our pantry of nutritious native millets, authentic sweets, wood-pressed oils, and handmade snacks.
        </p>
      </div>

      <div className="categories-grid">
        {CATEGORIES.map((cat) => (
          <article 
            key={cat.id} 
            className="category-card"
            onClick={() => onSelectCategory(cat.id)}
          >
            <div className="category-image-wrap">
              <img 
                src={cat.image} 
                alt={`${cat.name} category`} 
                className="category-img"
                loading="lazy"
              />
              <div className="category-overlay" />
            </div>

            <div className="category-info">
              <span className="category-tamil">{cat.tamilName}</span>
              <h3 className="category-name">{cat.name}</h3>
              <p className="category-desc">{cat.description}</p>
              <div className="category-footer">
                <span className="category-count">{cat.itemCount}</span>
                <span className="category-action">
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
