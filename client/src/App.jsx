import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import FeaturedProducts from './components/FeaturedProducts';
import ShopPage from './components/ShopPage';
import ProductDetailsPage from './components/ProductDetailsPage';
import CartPage from './components/CartPage';
import ProductQuickViewModal from './components/ProductQuickViewModal';
import WhyUs from './components/WhyUs';
import OurStory from './components/OurStory';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { ArrowLeft, Clock, ShieldCheck, ShoppingBag } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'shop' | 'product' | 'cart' | 'checkout'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { totalItems, addToCart, toast, closeToast } = useCart();

  // Sync state with URL hash on mount and hash change events
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/cart')) {
        setCurrentView('cart');
      } else if (hash.startsWith('#/checkout')) {
        setCurrentView('checkout');
      } else if (hash.startsWith('#/product')) {
        setCurrentView('product');
        const params = new URLSearchParams(hash.split('?')[1] || '');
        const id = params.get('id') || hash.split('/')[2];
        setSelectedProductId(id || 'prod-001');
      } else if (hash.startsWith('#/shop')) {
        setCurrentView('shop');
        const params = new URLSearchParams(hash.split('?')[1] || '');
        const cat = params.get('category');
        if (cat) {
          setSelectedCategory(cat);
        } else {
          setSelectedCategory('all');
        }
      } else {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view, sectionId = null, categoryId = 'all', productId = null) => {
    setCurrentView(view);

    if (view === 'cart') {
      window.location.hash = '#/cart';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'checkout') {
      window.location.hash = '#/checkout';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'product') {
      const targetId = productId || 'prod-001';
      setSelectedProductId(targetId);
      window.location.hash = `#/product?id=${targetId}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'shop') {
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

  return (
    <div className="thaniyam-app">
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Navigation Header */}
      <Navbar
        currentView={currentView}
        cartCount={totalItems}
        onCartClick={() => navigateTo('cart')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigate={(view, sectionId) => navigateTo(view, sectionId)}
      />

      {/* 3. Main Content Router */}
      <main>
        {currentView === 'cart' ? (
          <CartPage
            onNavigateHome={() => navigateTo('home')}
            onNavigateShop={(cat) => navigateTo('shop', null, cat || 'all')}
            onViewProduct={(id) => navigateTo('product', null, 'all', id)}
            onNavigateCheckout={() => navigateTo('checkout')}
          />
        ) : currentView === 'checkout' ? (
          /* Checkout Preparation Preview for upcoming Step 7 */
          <div className="cart-page">
            <div className="cart-page-container">
              <div className="checkout-preview-card">
                <div className="empty-cart-icon-wrap" style={{ backgroundColor: '#e8f5e9', color: '#1b4332' }}>
                  <ShieldCheck size={48} />
                </div>
                <h1 className="cart-main-heading" style={{ marginTop: 16 }}>
                  Checkout Preview (Step 7 Upcoming)
                </h1>
                <p className="cart-subheading" style={{ maxWidth: 540, margin: '8px auto 24px' }}>
                  Your shopping basket is ready with {totalItems} item(s). In the next step (Step 7),
                  we will implement the complete delivery address, contact form, Cash on Delivery, and order placement workflow!
                </p>
                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn-secondary" onClick={() => navigateTo('cart')}>
                    <ArrowLeft size={16} />
                    <span>Return to Shopping Basket</span>
                  </button>
                  <button className="btn-primary" onClick={() => navigateTo('shop')}>
                    <ShoppingBag size={16} />
                    <span>Continue Browsing Products</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : currentView === 'product' ? (
          <ProductDetailsPage
            productId={selectedProductId}
            onNavigateHome={() => navigateTo('home')}
            onNavigateShop={(cat) => navigateTo('shop', null, cat || 'all')}
            onNavigateCategory={(cat) => navigateTo('shop', null, cat)}
            onViewProduct={(id) => navigateTo('product', null, 'all', id)}
            onAddToCart={addToCart}
          />
        ) : currentView === 'shop' ? (
          <ShopPage
            onNavigateHome={() => navigateTo('home')}
            initialCategory={selectedCategory}
            onQuickView={(prod) => setQuickViewProduct(prod)}
            onViewProduct={(id) => navigateTo('product', null, 'all', id)}
            onAddToCart={addToCart}
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
              onViewProduct={(id) => navigateTo('product', null, 'all', id)}
              onAddToCart={addToCart}
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
          onAddToCart={addToCart}
        />
      )}

      {/* 6. Interactive Toast Notification */}
      {toast && (
        <Toast toast={toast} onClose={closeToast} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
