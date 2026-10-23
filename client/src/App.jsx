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
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import ProductQuickViewModal from './components/ProductQuickViewModal';
import WhyUs from './components/WhyUs';
import OurStory from './components/OurStory';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { ArrowLeft, Clock, ShieldCheck, ShoppingBag } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'order-confirmation'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [confirmedOrderId, setConfirmedOrderId] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const { totalItems, addToCart, toast, closeToast } = useCart();

  // Sync state with URL hash on mount and hash change events
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/cart')) {
        setCurrentView('cart');
      } else if (hash.startsWith('#/checkout')) {
        setCurrentView('checkout');
      } else if (hash.startsWith('#/order-confirmation')) {
        setCurrentView('order-confirmation');
        let id = null;
        if (hash.includes('?')) {
          const params = new URLSearchParams(hash.split('?')[1] || '');
          id = params.get('orderId');
        } else {
          const parts = hash.split('/');
          if (parts.length >= 3 && parts[2]) {
            id = parts[2];
          }
        }
        if (id) {
          setConfirmedOrderId(id);
        }
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

  const navigateTo = (view, sectionId = null, categoryId = 'all', productId = null, orderId = null) => {
    setCurrentView(view);

    if (view === 'cart') {
      window.location.hash = '#/cart';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'checkout') {
      window.location.hash = '#/checkout';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'order-confirmation') {
      const targetId = orderId || confirmedOrderId;
      if (targetId) setConfirmedOrderId(targetId);
      window.location.hash = targetId ? `#/order-confirmation/${targetId}` : '#/order-confirmation';
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
        {currentView === 'order-confirmation' ? (
          <OrderConfirmationPage
            orderId={confirmedOrderId}
            initialOrder={confirmedOrder}
            onNavigateHome={() => navigateTo('home')}
            onNavigateShop={(cat) => navigateTo('shop', null, cat || 'all')}
          />
        ) : currentView === 'checkout' ? (
          <CheckoutPage
            onNavigateHome={() => navigateTo('home')}
            onNavigateShop={(cat) => navigateTo('shop', null, cat || 'all')}
            onNavigateCart={() => navigateTo('cart')}
            onOrderSuccess={(order) => {
              setConfirmedOrder(order);
              setConfirmedOrderId(order.orderId);
              window.location.hash = `#/order-confirmation/${order.orderId}`;
              setCurrentView('order-confirmation');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentView === 'cart' ? (
          <CartPage
            onNavigateHome={() => navigateTo('home')}
            onNavigateShop={(cat) => navigateTo('shop', null, cat || 'all')}
            onViewProduct={(id) => navigateTo('product', null, 'all', id)}
            onNavigateCheckout={() => navigateTo('checkout')}
          />
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
