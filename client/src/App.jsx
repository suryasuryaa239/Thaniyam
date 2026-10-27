import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { ProductProvider, useProducts } from './context/ProductContext';
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
import TrackOrderPage from './components/TrackOrderPage';
import AdminOrdersPage from './components/AdminOrdersPage';
import ProductQuickViewModal from './components/ProductQuickViewModal';
import WhyUs from './components/WhyUs';
import OurStory from './components/OurStory';
import Footer from './components/Footer';
import Toast from './components/Toast';

function getViewFromUrl() {
  if (typeof window === 'undefined') return { view: 'home' };
  const hash = window.location.hash || '';
  const pathname = window.location.pathname || '';

  // 1. Admin route (/admin, #/admin, #admin)
  if (
    hash.startsWith('#/admin') ||
    hash.startsWith('#admin') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin')
  ) {
    return { view: 'admin' };
  }

  // 2. Cart route (/cart, #/cart, #cart)
  if (
    hash.startsWith('#/cart') ||
    hash.startsWith('#cart') ||
    pathname === '/cart' ||
    pathname.startsWith('/cart')
  ) {
    return { view: 'cart' };
  }

  // 3. Checkout route (/checkout, #/checkout, #checkout)
  if (
    hash.startsWith('#/checkout') ||
    hash.startsWith('#checkout') ||
    pathname === '/checkout' ||
    pathname.startsWith('/checkout')
  ) {
    return { view: 'checkout' };
  }

  // 4. Track order route (/track-order, #/track-order, #track-order)
  if (
    hash.startsWith('#/track-order') ||
    hash.startsWith('#track-order') ||
    pathname === '/track-order' ||
    pathname.startsWith('/track-order')
  ) {
    let orderId = '';
    let mobile = '';
    const querySource = hash.includes('?') ? hash.split('?')[1] : window.location.search;
    if (querySource) {
      const params = new URLSearchParams(querySource.replace(/^\?/, ''));
      orderId = params.get('orderId') || '';
      mobile = params.get('mobile') || params.get('phone') || '';
    }
    return { view: 'track-order', orderId, mobile };
  }

  // 5. Order confirmation route (/order-confirmation, #/order-confirmation)
  if (
    hash.startsWith('#/order-confirmation') ||
    pathname.startsWith('/order-confirmation')
  ) {
    let orderId = null;
    const querySource = hash.includes('?') ? hash.split('?')[1] : window.location.search;
    if (querySource) {
      const params = new URLSearchParams(querySource.replace(/^\?/, ''));
      orderId = params.get('orderId');
    }
    if (!orderId) {
      const parts = (hash || pathname).split('/');
      if (parts.length >= 3 && parts[2]) {
        orderId = parts[2].replace(/^#/, '');
      }
    }
    return { view: 'order-confirmation', orderId };
  }

  // 6. Product route (/product, #/product)
  if (
    hash.startsWith('#/product') ||
    pathname.startsWith('/product')
  ) {
    const querySource = hash.includes('?') ? hash.split('?')[1] : window.location.search;
    const params = new URLSearchParams((querySource || '').replace(/^\?/, ''));
    let productId = params.get('id');
    if (!productId) {
      const parts = (hash || pathname).split('/');
      if (parts.length >= 3 && parts[2]) productId = parts[2];
    }
    return { view: 'product', productId: productId || 'prod-001' };
  }

  // 7. Shop route (/shop, #/shop)
  if (
    hash.startsWith('#/shop') ||
    pathname.startsWith('/shop')
  ) {
    const querySource = hash.includes('?') ? hash.split('?')[1] : window.location.search;
    const params = new URLSearchParams((querySource || '').replace(/^\?/, ''));
    const category = params.get('category') || 'all';
    return { view: 'shop', category };
  }

  return { view: 'home' };
}

function AppContent() {
  const { products, refreshProducts, getProductById, getRelatedProducts } = useProducts();
  const initialRoute = getViewFromUrl();
  const [currentView, setCurrentView] = useState(initialRoute.view); // 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'order-confirmation' | 'track-order' | 'admin'
  const [selectedCategory, setSelectedCategory] = useState(initialRoute.category || 'all');
  const [selectedProductId, setSelectedProductId] = useState(initialRoute.productId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [confirmedOrderId, setConfirmedOrderId] = useState(initialRoute.orderId || null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [trackingOrderId, setTrackingOrderId] = useState(initialRoute.orderId || '');
  const [trackingMobile, setTrackingMobile] = useState(initialRoute.mobile || '');

  const { totalItems, addToCart, toast, closeToast } = useCart();

  // Sync state with URL hash and pathname on mount and navigation events
  useEffect(() => {
    const syncRouteWithUrl = () => {
      const route = getViewFromUrl();
      setCurrentView(route.view);
      if (route.category) setSelectedCategory(route.category);
      if (route.productId) setSelectedProductId(route.productId);
      if (route.orderId) {
        setConfirmedOrderId(route.orderId);
        setTrackingOrderId(route.orderId);
      }
      if (route.mobile) setTrackingMobile(route.mobile);
    };

    syncRouteWithUrl();
    window.addEventListener('hashchange', syncRouteWithUrl);
    window.addEventListener('popstate', syncRouteWithUrl);
    return () => {
      window.removeEventListener('hashchange', syncRouteWithUrl);
      window.removeEventListener('popstate', syncRouteWithUrl);
    };
  }, []);

  const navigateTo = (view, sectionId = null, categoryId = 'all', productId = null, orderId = null, mobile = null) => {
    setCurrentView(view);

    if (view === 'admin') {
      window.location.hash = '#/admin';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'cart') {
      window.location.hash = '#/cart';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'checkout') {
      window.location.hash = '#/checkout';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'track-order') {
      const targetId = orderId || trackingOrderId || '';
      const targetMobile = mobile || trackingMobile || '';
      if (targetId) setTrackingOrderId(targetId);
      if (targetMobile) setTrackingMobile(targetMobile);

      if (targetId && targetMobile) {
        window.location.hash = `#/track-order?orderId=${encodeURIComponent(targetId)}&mobile=${encodeURIComponent(targetMobile)}`;
      } else if (targetId) {
        window.location.hash = `#/track-order?orderId=${encodeURIComponent(targetId)}`;
      } else {
        window.location.hash = '#/track-order';
      }
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
        {currentView === 'admin' ? (
          <AdminOrdersPage
            onNavigateHome={() => navigateTo('home')}
            onNavigateTrack={(orderId, mobile) => navigateTo('track-order', null, 'all', null, orderId, mobile)}
            onProductChange={refreshProducts}
          />
        ) : currentView === 'track-order' ? (
          <TrackOrderPage
            initialOrderId={trackingOrderId}
            initialMobile={trackingMobile}
            onNavigateHome={() => navigateTo('home')}
            onNavigateShop={(cat) => navigateTo('shop', null, cat || 'all')}
          />
        ) : currentView === 'order-confirmation' ? (
          <OrderConfirmationPage
            orderId={confirmedOrderId}
            initialOrder={confirmedOrder}
            onNavigateHome={() => navigateTo('home')}
            onNavigateShop={(cat) => navigateTo('shop', null, cat || 'all')}
            onNavigateTrack={(orderId, mobile) => navigateTo('track-order', null, 'all', null, orderId, mobile)}
          />
        ) : currentView === 'checkout' ? (
          <CheckoutPage
            onNavigateHome={() => navigateTo('home')}
            onNavigateShop={(cat) => navigateTo('shop', null, cat || 'all')}
            onNavigateCart={() => navigateTo('cart')}
            onOrderSuccess={(order) => {
              setConfirmedOrder(order);
              setConfirmedOrderId(order.orderId);
              refreshProducts();
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
              products={products}
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
          } else if (target === 'track-order') {
            navigateTo('track-order');
          } else if (target === 'admin') {
            navigateTo('admin');
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
    <ProductProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ProductProvider>
  );
}
