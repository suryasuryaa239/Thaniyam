import React from 'react';
import { CATEGORIES } from '../data/sampleData';
import { useLanguage } from '../context/LanguageContext';

export default function Categories({ onSelectCategory }) {
  const { lang, t } = useLanguage();

  return (
    <section id="categories" className="categories-section" aria-label={t('categories')}>
      <div className="category-strip">
        {CATEGORIES.map((cat) => {
          const count = parseInt(cat.itemCount, 10);
          return (
            <button
              key={cat.id}
              type="button"
              className="category-circle"
              onClick={() => onSelectCategory(cat.id)}
            >
              <span className="category-circle-ring">
                <img src={cat.image} alt="" className="category-circle-img" loading="lazy" />
              </span>
              <span className="category-circle-name">{lang === 'ta' ? cat.tamilName : cat.name}</span>
              {Number.isFinite(count) && (
                <span className="category-circle-count">
                  {count} {t('products')}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
