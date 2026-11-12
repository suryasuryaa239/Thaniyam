import React, { useMemo } from 'react';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { FEATURED_PRODUCTS } from '../data/sampleData';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from './ProductCard';

const HOME_SAMPLE_LIMIT = 5;

export default function FeaturedProducts({
  onQuickView,
  onViewProduct,
  onAddToCart,
  onViewAllShop,
  searchQuery,
  products: productsProp,
}) {
  const { t } = useLanguage();
  const activeCatalog = useMemo(
    () => (productsProp || FEATURED_PRODUCTS).filter((p) => p.isActive !== false),
    [productsProp]
  );

  const q = (searchQuery || '').trim().toLowerCase();

  const displayedProducts = useMemo(() => {
    if (q) {
      return activeCatalog.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          (product.tamilName && product.tamilName.toLowerCase().includes(q)) ||
          (product.categoryName && product.categoryName.toLowerCase().includes(q))
      );
    }

    // Show 5 diverse, high-rated, in-stock sample products on the Home page
    const inStockPool = activeCatalog.filter(
      (p) => (typeof p.stock !== 'number' || p.stock > 0) && p.inStock !== false
    );
    const pool = inStockPool.length >= HOME_SAMPLE_LIMIT ? inStockPool : activeCatalog;

    const prioritized = [...pool].sort((a, b) => {
      const aHasOffer = a.badge || (a.originalPrice && a.originalPrice > a.price) ? 1 : 0;
      const bHasOffer = b.badge || (b.originalPrice && b.originalPrice > b.price) ? 1 : 0;
      if (bHasOffer !== aHasOffer) return bHasOffer - aHasOffer;
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    });

    const chosen = [];
    const seenCategories = new Set();

    // Pick 1 product from each distinct category first for showcase variety
    for (const item of prioritized) {
      if (chosen.length >= HOME_SAMPLE_LIMIT) break;
      const catKey = item.category || 'other';
      if (!seenCategories.has(catKey)) {
        seenCategories.add(catKey);
        chosen.push(item);
      }
    }

    // Pad up to 5 if fewer than 5 categories are available
    if (chosen.length < HOME_SAMPLE_LIMIT) {
      const chosenIds = new Set(chosen.map((p) => p.id));
      for (const item of prioritized) {
        if (chosen.length >= HOME_SAMPLE_LIMIT) break;
        if (!chosenIds.has(item.id)) {
          chosenIds.add(item.id);
          chosen.push(item);
        }
      }
    }

    return chosen;
  }, [q, activeCatalog]);

  const openProduct = (prod) => (onViewProduct ? onViewProduct(prod.id) : onQuickView(prod));

  return (
    <section id="featured-products" className="products-section">
      <div className="section-header">
        <h2 className="section-title">{t('featuredTitle')}</h2>
        <p className="section-subtitle">{t('featuredSub')}</p>
      </div>

      {displayedProducts.length === 0 ? (
        <div className="no-products-found">
          <p>
            No products found matching "<strong>{searchQuery}</strong>".
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {displayedProducts.map((prod) => (
            <ProductCard key={prod.id} prod={prod} onOpen={openProduct} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}

      {onViewAllShop && (
        <div className="featured-view-all-wrap">
          <button
            type="button"
            className="btn-view-all-categories"
            onClick={onViewAllShop}
            id="btn-home-view-all-categories"
          >
            <LayoutGrid size={18} />
            <span>{t('viewAllCategories')}</span>
            {activeCatalog.length > HOME_SAMPLE_LIMIT && (
              <span className="view-all-count-pill">{activeCatalog.length}</span>
            )}
            <ArrowRight size={18} className="view-all-arrow" />
          </button>
        </div>
      )}
    </section>
  );
}
