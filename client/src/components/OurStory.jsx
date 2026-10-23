import React from 'react';
import { ArrowRight, Leaf } from 'lucide-react';

export default function OurStory({ onExploreStory }) {
  return (
    <section id="our-story" className="story-section">
      <div className="story-container">
        <div className="story-grid">
          {/* Left Column: Traditional Artisan Photography */}
          <div className="story-visual-col">
            <div className="story-image-wrapper">
              <img 
                src="/images/our-story.jpg" 
                alt="Traditional Indian artisan hand-grinding roasted grains using stone grinder" 
                className="story-img"
                loading="lazy"
              />
              <div className="story-floating-quote">
                <span className="quote-icon">“</span>
                <p>Authentic taste comes from patience, pure ingredients, and generations of respect for our soil.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Story Copy */}
          <div className="story-content-col">
            <div className="section-tag-group">
              <Leaf size={14} className="tag-icon" />
              <span className="section-tag">ROOTED IN HERITAGE</span>
            </div>

            <h2 className="story-title">
              Reviving Forgotten Flavours of Our Native Soil
            </h2>

            <p className="story-paragraph">
              At <strong>Thaniyam Treats</strong>, our journey began with a simple yearning: to bring back 
              the genuine, comforting taste of South Indian village kitchens where our grandmothers ground 
              fresh grains on stone mills and hand-pressed golden murukku in pure cold-pressed oils.
            </p>

            <p className="story-paragraph">
              In an era dominated by hyper-processed snacks and synthetic additives, we partner with traditional 
              farming communities across Tamil Nadu to celebrate native millets — <em>Thinai</em>, <em>Samai</em>, 
              <em>Varagu</em>, and <em>Kambu</em> — alongside pure Udangudi palm jaggery and slow-extracted wood-pressed oils.
            </p>

            <div className="story-stats-row">
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Traditional Recipes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0%</span>
                <span className="stat-label">Artificial Additives</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">Small</span>
                <span className="stat-label">Batch Preparation</span>
              </div>
            </div>

            <div className="story-action-row">
              <button 
                className="btn-primary story-btn"
                onClick={onExploreStory}
              >
                <span>Discover Our Traditions</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
