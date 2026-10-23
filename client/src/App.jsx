import React, { useState } from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import FeaturedProducts from './components/FeaturedProducts';
import ProductQuickViewModal from './components/ProductQuickViewModal';
import WhyUs from './components/WhyUs';
import OurStory from './components/OurStory';
import Footer from './components/Footer';
import Toast from './components/Toast';

export default function App() {
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (title, message) => {
    setToast({ title, message });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const handleAddToCart = (product, qty = 1) => {
    setCartCount((prev) => prev + qty);
    showToast(
      'Added to Cart!',
      `${qty}x ${product.name} (${product.weight}) added. Cart feature connects in upcoming step.`
    );
  };

  const handleCartClick = () => {
    showToast(
      'Shopping Cart Preview',
      `You have ${cartCount} item(s) selected. The full interactive cart & checkout will be implemented in a future step.`
    );
  };

  const handleNavigate = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    handleNavigate('featured-products');
  };

  return (
    <div className="thaniyam-app">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Navigation Header */}
      <Navbar
        cartCount={cartCount}
        onCartClick={handleCartClick}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigate={handleNavigate}
      />

      <main>
        {/* 3. Hero Section */}
        <Hero
          onShopNowClick={() => handleNavigate('featured-products')}
          onExploreCategoriesClick={() => handleNavigate('categories')}
        />

        {/* 4. Shop by Category */}
        <Categories onSelectCategory={handleSelectCategory} />

        {/* 5. Featured Products */}
        <FeaturedProducts
          onQuickView={(prod) => setQuickViewProduct(prod)}
          onAddToCart={handleAddToCart}
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* 6. Why Thaniyam Treats */}
        <WhyUs />

        {/* 7. Our Story */}
        <OurStory onExploreStory={() => handleNavigate('featured-products')} />
      </main>

      {/* 8. Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Product Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Interactive Toast Notification */}
      {toast && (
        <Toast toast={toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
