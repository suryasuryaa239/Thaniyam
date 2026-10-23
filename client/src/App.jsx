import React, { useState, useEffect } from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import FeaturedProducts from './components/FeaturedProducts';
import ShopPage from './components/ShopPage';
import ProductQuickViewModal from './components/ProductQuickViewModal';
import WhyUs from './components/WhyUs';
import OurStory from './components/OurStory';
import Footer from './components/Footer';
import Toast from './components/Toast';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'shop'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync state with URL hash on mount and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/shop')) {
        setCurrentView('shop');
        const params = new URLSearchParams(hash.split('?')[1] || '');
        const cat = params.get('category');
        if (cat) {
          setSelectedCategory(cat);
        }
      } else {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view, sectionId = null, categoryId = 'all') => {
    setCurrentView(view);
    if (view === 'shop') {
      setSelectedCategory(categoryId);
      window.location.hash = categoryId !== 'all' ? `#/shop?category=${categoryId}` : '#/shop';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = sectionId ? `#${sectionId}` : '#/home';
      if (sectionId) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

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
      `${qty}x ${product.name} (${product.weight}) added to cart.`
    );
  };

  const handleCartClick = () => {
    showToast(
      'Shopping Cart Preview',
      `You have ${cartCount} item(s) selected. Full cart and checkout will be implemented in upcoming steps.`
    );
  };

  return (
    <div className="thaniyam-app">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Navigation Header */}
      <Navbar
        currentView={currentView}
        cartCount={cartCount}
        onCartClick={handleCartClick}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigate={(view, sectionId) => navigateTo(view, sectionId)}
      />

      {/* 3. Main Content: Landing Page OR Shop Page */}
      <main>
        {currentView === 'shop' ? (
          <ShopPage
            onNavigateHome={() => navigateTo('home')}
            initialCategory={selectedCategory}
            onQuickView={(prod) => setQuickViewProduct(prod)}
            onAddToCart={handleAddToCart}
            searchQuery={searchQuery}
          />
        ) : (
          <>
            {/* Landing Hero */}
            <Hero
              onShopNowClick={() => navigateTo('shop', null, 'all')}
              onExploreCategoriesClick={() => navigateTo('home', 'categories')}
            />

            {/* Shop by Category on Landing */}
            <Categories
              onSelectCategory={(catId) => navigateTo('shop', null, catId)}
            />

            {/* Featured Products on Landing */}
            <FeaturedProducts
              onQuickView={(prod) => setQuickViewProduct(prod)}
              onAddToCart={handleAddToCart}
              searchQuery={searchQuery}
              activeCategory="all"
              onCategoryChange={(catId) => navigateTo('shop', null, catId)}
            />

            {/* Why Us Values */}
            <WhyUs />

            {/* Brand Story */}
            <OurStory
              onExploreStory={() => navigateTo('shop', null, 'all')}
            />
          </>
        )}
      </main>

      {/* 4. Footer */}
      <Footer
        onNavigate={(target) => {
          if (target === 'shop' || target === 'categories') {
            navigateTo('shop');
          } else {
            navigateTo('home', target);
          }
        }}
      />

      {/* 5. Product Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* 6. Interactive Toast Notification */}
      {toast && (
        <Toast toast={toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
