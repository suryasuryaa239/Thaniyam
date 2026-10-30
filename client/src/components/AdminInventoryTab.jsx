import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package, Search, Plus, Edit2, Trash2, CheckCircle2, AlertCircle,
  RefreshCw, IndianRupee, Check, X,
  ShieldCheck, AlertTriangle, Archive, Power, Tag, Percent, Sparkles
} from 'lucide-react';
import { apiUrl } from '../config/api';
import { useProducts } from '../context/ProductContext';

const CATEGORY_OPTIONS = [
  { id: 'dosa-mix', name: 'Traditional Dosa & Adai Mixes', tamilName: 'பாரம்பரிய தோசை & அடை' },
  { id: 'puttu-mix', name: 'Puttu & Kozhukattai Flours', tamilName: 'புட்டு & கொழுக்கட்டை மாவு' },
  { id: 'kanji-mix', name: 'Traditional Kanji & Porridge', tamilName: 'பாரம்பரிய கஞ்சி வகைகள்' },
  { id: 'health-mix', name: 'Health & Nutrition Mixes', tamilName: 'பாரம்பரிய சத்து மாவு' },
  { id: 'heritage-podis', name: 'Heritage Podis & Masalas', tamilName: 'பாரம்பரிய பொடிகள்' },
  { id: 'pongal-mix', name: 'Millet Pongal Mixes', tamilName: 'சிறு தானிய பொங்கல்' },
  { id: 'kali-mix', name: 'Traditional Kali Mixes', tamilName: 'பாரம்பரிய களி வகைகள்' },
  { id: 'tea-mix', name: 'Herbal Teas & Beverages', tamilName: 'மூலிகை டீ & காபி' },
  { id: 'daily-needs', name: 'Natural Pantry & Daily Needs', tamilName: 'இயற்கை மளிகை & உப்பு' },
  { id: 'beauty-care', name: 'Natural Herbal Beauty & Hair Care', tamilName: 'இயற்கை அழகு & நலங்கு மாவு' },
  { id: 'chapati-mix', name: 'Millet Chapati & Roti Mixes', tamilName: 'தானிய சப்பாத்தி மாவு' }
];

const PRESET_IMAGES = [
  { label: 'Karuppu Kavuni Nutrition Mix', url: '/images/products/karuppu-kavuni-nutrition-mix.jpg' },
  { label: 'Rathasali Nutrition Mix', url: '/images/products/rathasali-nutrition-mix.jpg' },
  { label: 'Chola Milagu Dosa Mix', url: '/images/products/chola-milagu-dosa-mix-sorghum-pepper-dosa-mix.jpg' },
  { label: 'Kambu Dosa Mix', url: '/images/products/kambu-dosa-pearl-millet-dosa.jpg' },
  { label: 'Keppai Ragi Dosa Mix', url: '/images/products/keppai-dosai-ragi-dosa.jpg' },
  { label: 'Pudina Idli Podi', url: '/images/products/pudina-idli-podi-mint-idli-powder.jpg' },
  { label: 'Kara Idli Podi', url: '/images/products/kara-idli-podi-spicy-idli-powder.jpg' },
  { label: 'Pirandai Idli Podi', url: '/images/products/pirandai-idli-powder-veld-grape-idli-podi.jpg' },
  { label: 'Karuppu Kavuni Kanji', url: '/images/products/karuppu-kavuni-kanji.jpg' },
  { label: 'Barley Kanji', url: '/images/products/barley-kanji.jpg' },
  { label: 'Poongar Rice Puttu Maavu', url: '/images/products/poongar-rice-kozhukattai-idiyappam-flour.jpg' },
  { label: 'Mappillai Samba Puttu', url: '/images/products/mappilai-samba-puttu.jpg' },
  { label: 'Ulundhu Kali Mix', url: '/images/products/ulundhu-kali.jpg' },
  { label: 'Venthaya Kali Mix', url: '/images/products/venthayakali-250gms.jpg' },
  { label: 'Siruthaniya Pongal Mix', url: '/images/products/siruthaniya-pongal-mix-multi-millet-pongal-mix.jpg' },
  { label: 'Sukku Malli Coffee', url: '/images/products/sukku-malli-coffee-herbal-coffee-mix.jpg' },
  { label: 'Energy Beetroot Haemomalt', url: '/images/products/energy-beet-haemomalt.jpg' },
  { label: 'Himalayan Rock Salt Crystals', url: '/images/products/himalayan-rock-crtstals.jpg' },
  { label: 'Nalangu Maavu Bath Powder', url: '/images/products/nalangu-maavu-herbal-bath-powder.jpg' },
  { label: 'Kasthuri Manjal Wild Turmeric', url: '/images/products/kasthuri-manjal-powder-wild-turmeric-powder.jpg' },
  { label: 'Shikakai Herbal Cleanser', url: '/images/products/shikakai-powder-natural-herbal-hair-cleanser.jpg' },
  { label: 'Mint Herbal Face Pack', url: '/images/products/mint-face-pack-natural-skin-care-powder.jpg' },
  { label: 'Rose Skin Rejuvenating Pack', url: '/images/products/rose-face-pack-natural-skin-care-powder.jpg' },
  { label: 'Multi Millet Chapati Mix', url: '/images/products/multi-millet-chapati-mix.jpg' },
  { label: 'Bamboo Rice Chapati Mix', url: '/images/products/bamboo-rice-chapati-mix.jpg' }
];

export default function AdminInventoryTab({
  authToken,
  onProductChange
}) {
  const { categories: contextCategories } = useProducts();
  const activeCategories = useMemo(() => {
    if (contextCategories && contextCategories.length > 0) {
      return contextCategories.filter((c) => c.id !== 'all');
    }
    return CATEGORY_OPTIONS;
  }, [contextCategories]);

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalErrors, setModalErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    tamilName: '',
    category: 'traditional-snacks',
    categoryName: 'Traditional Savory Snacks',
    price: '',
    originalPrice: '',
    weight: '250g',
    stock: '20',
    badge: '',
    image: '/images/cat-snacks.jpg',
    description: '',
    ingredients: ''
  });

  // Delete / Deactivate Safety Dialog
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick stock adjusting ID tracker
  const [adjustingStockId, setAdjustingStockId] = useState(null);

  // Quick Offer & Promotion Modal States
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerProduct, setOfferProduct] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerOriginalPrice, setOfferOriginalPrice] = useState('');
  const [offerBadge, setOfferBadge] = useState('');
  const [isSavingOffer, setIsSavingOffer] = useState(false);

  // Fetch Inventory Products from Server
  const fetchInventory = useCallback(async () => {
    if (!authToken) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl('/api/products/admin/all'), {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch inventory.');
      }

      setProducts(data.products || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err.message || 'Error loading inventory.');
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category filter
      if (categoryFilter !== 'all' && (prod.category || '').toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      // Stock status & Offer filter
      if (stockStatusFilter === 'in-stock' && prod.stock <= 5) return false;
      if (stockStatusFilter === 'low-stock' && (prod.stock <= 0 || prod.stock > 5)) return false;
      if (stockStatusFilter === 'out-of-stock' && prod.stock > 0) return false;
      if (stockStatusFilter === 'inactive' && prod.isActive !== false) return false;
      if (stockStatusFilter === 'offers-only') {
        const hasOffer = Boolean(prod.badge || (prod.originalPrice && Number(prod.originalPrice) > Number(prod.price)));
        if (!hasOffer) return false;
      }
      if (stockStatusFilter === 'no-offers') {
        const hasOffer = Boolean(prod.badge || (prod.originalPrice && Number(prod.originalPrice) > Number(prod.price)));
        if (hasOffer) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = (prod.name || '').toLowerCase().includes(q);
        const matchesTamil = (prod.tamilName || '').toLowerCase().includes(q);
        const matchesId = (prod.id || '').toLowerCase().includes(q);
        const matchesCat = (prod.categoryName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesTamil && !matchesId && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [products, categoryFilter, stockStatusFilter, searchQuery]);

  // Open modal in Add mode
  const handleOpenAdd = () => {
    setModalMode('add');
    setModalErrors({});
    setFormData({
      id: '',
      name: '',
      tamilName: '',
      category: 'traditional-snacks',
      categoryName: 'Traditional Savory Snacks',
      price: '',
      originalPrice: '',
      weight: '250g',
      stock: '20',
      badge: '',
      image: '/images/cat-snacks.jpg',
      description: '',
      ingredients: ''
    });
    setIsModalOpen(true);
  };

  // Open modal in Edit mode
  const handleOpenEdit = (product) => {
    setModalMode('edit');
    setModalErrors({});
    setFormData({
      id: product.id,
      name: product.name || '',
      tamilName: product.tamilName || '',
      category: product.category || 'traditional-snacks',
      categoryName: product.categoryName || '',
      price: product.price !== undefined ? String(product.price) : '',
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      weight: product.weight || '250g',
      stock: product.stock !== undefined ? String(product.stock) : '0',
      badge: product.badge || '',
      image: product.image || '/images/cat-snacks.jpg',
      description: product.description || '',
      ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Product name is required (min 2 characters).';
    }
    const numPrice = parseFloat(formData.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.price = 'Price must be greater than 0.';
    }
    const numStock = parseInt(formData.stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      errors.stock = 'Stock quantity cannot be negative.';
    }
    if (formData.originalPrice) {
      const orig = parseFloat(formData.originalPrice);
      if (isNaN(orig) || orig <= 0) {
        errors.originalPrice = 'Original price must be greater than 0.';
      }
    }
    setModalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save Product (Add or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const selectedCat = CATEGORY_OPTIONS.find((c) => c.id === formData.category);
      const payload = {
        name: formData.name.trim(),
        tamilName: formData.tamilName.trim(),
        category: formData.category,
        categoryName: selectedCat ? selectedCat.name : formData.category,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        weight: formData.weight.trim(),
        stock: parseInt(formData.stock, 10),
        badge: formData.badge.trim(),
        image: formData.image.trim(),
        description: formData.description.trim(),
        ingredients: formData.ingredients
          ? formData.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
          : []
      };

      const url = modalMode === 'add' ? '/api/products' : `/api/products/${formData.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(apiUrl(url), {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save product.');
      }

      setFeedback({
        type: 'success',
        message: modalMode === 'add'
          ? `Product "${payload.name}" successfully added with ${payload.stock} stock units.`
          : `Product "${payload.name}" updated successfully.`
      });

      setIsModalOpen(false);
      await fetchInventory();
      if (onProductChange) onProductChange();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Operation failed.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick adjust stock (+1 or -1 or delta)
  const handleQuickAdjustStock = async (productId, delta) => {
    setAdjustingStockId(productId);
    try {
      const res = await fetch(apiUrl(`/api/products/${productId}/stock`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ delta })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to adjust stock.');
      }

      // Update local state smoothly
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? data.product : p))
      );

      // Re-fetch stats in background
      fetchInventory();
      if (onProductChange) onProductChange();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Stock adjustment failed.'
      });
    } finally {
      setAdjustingStockId(null);
    }
  };

  // Quick Offer & Promotion modal handlers
  const handleOpenOfferModal = (product) => {
    setOfferProduct(product);
    setOfferPrice(product.price ? String(product.price) : '');
    setOfferOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
    setOfferBadge(product.badge || '');
    setIsOfferModalOpen(true);
  };

  const handleApplyOfferPreset = (pct, badgeLabel) => {
    if (!offerProduct) return;
    const currentPrice = Number(offerProduct.price) || 100;
    if (pct > 0) {
      const calculatedMrp = Math.round(currentPrice / (1 - pct / 100));
      setOfferPrice(String(currentPrice));
      setOfferOriginalPrice(String(calculatedMrp));
      setOfferBadge(badgeLabel);
    } else {
      setOfferPrice(String(currentPrice));
      setOfferOriginalPrice('');
      setOfferBadge(badgeLabel);
    }
  };

  const handleClearOfferInputs = () => {
    if (!offerProduct) return;
    setOfferBadge('');
    setOfferOriginalPrice('');
    setOfferPrice(String(offerProduct.price));
  };

  const handleSaveOffer = async () => {
    if (!offerProduct || !authToken) return;
    setIsSavingOffer(true);
    try {
      const payload = {
        price: parseFloat(offerPrice) || offerProduct.price,
        originalPrice: offerOriginalPrice ? parseFloat(offerOriginalPrice) : null,
        badge: (offerBadge || '').trim()
      };

      const res = await fetch(apiUrl(`/api/products/${offerProduct.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update offer');
      }

      setFeedback({
        type: 'success',
        message: `Offer updated for "${offerProduct.name}"! Badge: ${payload.badge || 'None'}`
      });
      setIsOfferModalOpen(false);
      fetchInventory();
      if (onProductChange) onProductChange();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error saving offer.'
      });
    } finally {
      setIsSavingOffer(false);
    }
  };

  const handleQuickRemoveOffer = async (product) => {
    if (!product || !authToken) return;
    try {
      const payload = {
        originalPrice: null,
        badge: ''
      };
      const res = await fetch(apiUrl(`/api/products/${product.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to clear offer');
      }

      setFeedback({
        type: 'success',
        message: `Cleared offer & badge from "${product.name}".`
      });
      if (isOfferModalOpen) setIsOfferModalOpen(false);
      fetchInventory();
      if (onProductChange) onProductChange();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error removing offer.'
      });
    }
  };

  // Toggle Product Active / Deactivate
  const handleToggleActive = async (product) => {
    try {
      const newActiveState = !product.isActive;
      const res = await fetch(apiUrl(`/api/products/${product.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ isActive: newActiveState })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to toggle product status.');
      }

      setFeedback({
        type: 'success',
        message: `Product "${product.name}" has been ${newActiveState ? 'activated' : 'deactivated'}.`
      });

      await fetchInventory();
      if (onProductChange) onProductChange();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Action failed.'
      });
    }
  };

  // Safe Delete / Deactivation execution
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(apiUrl(`/api/products/${productToDelete.id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove product.');
      }

      setFeedback({
        type: 'success',
        message: data.message || `Product "${productToDelete.name}" removed.`
      });

      setProductToDelete(null);
      await fetchInventory();
      if (onProductChange) onProductChange();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to delete product.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-inventory-tab">
      {/* 1. Action Feedback / Error Banner */}
      {error && (
        <div className="admin-alert-banner error" role="alert">
          <AlertCircle size={18} color="#dc2626" />
          <span className="alert-msg">{error}</span>
          <button
            type="button"
            className="btn-alert-close"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {feedback && (
        <div className={`admin-alert-banner ${feedback.type}`} role="alert">
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} color="#15803d" />
          ) : (
            <AlertCircle size={18} color="#dc2626" />
          )}
          <span className="alert-msg">{feedback.message}</span>
          <button
            type="button"
            className="btn-alert-close"
            onClick={() => setFeedback(null)}
            aria-label="Dismiss feedback"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. Inventory Metrics Summary Grid */}
      <div className="admin-metrics-grid inventory-metrics">
        <div className="metric-card metric-total">
          <div className="metric-icon-box">
            <Package size={22} color="#1b4332" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Catalog Products</span>
            <span className="metric-value">{stats?.totalProducts ?? products.length}</span>
            <span className="metric-hint">{stats?.activeProducts ?? products.filter(p => p.isActive !== false).length} Active on Store</span>
          </div>
        </div>

        <div className="metric-card metric-confirmed">
          <div className="metric-icon-box" style={{ background: '#dcfce7' }}>
            <CheckCircle2 size={22} color="#15803d" />
          </div>
          <div className="metric-info">
            <span className="metric-label">In Stock Items</span>
            <span className="metric-value" style={{ color: '#15803d' }}>
              {stats?.inStockCount ?? products.filter((p) => p.stock > 5).length}
            </span>
            <span className="metric-hint">Healthy Inventory (&gt; 5 units)</span>
          </div>
        </div>

        <div className="metric-card metric-processing">
          <div className="metric-icon-box" style={{ background: '#fef3c7' }}>
            <AlertTriangle size={22} color="#b45309" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Low Stock Warning</span>
            <span className="metric-value" style={{ color: '#b45309' }}>
              {stats?.lowStockCount ?? products.filter((p) => p.stock > 0 && p.stock <= 5).length}
            </span>
            <span className="metric-hint">Only 1-5 Units Remaining</span>
          </div>
        </div>

        <div className="metric-card metric-cancelled">
          <div className="metric-icon-box" style={{ background: '#fee2e2' }}>
            <AlertCircle size={22} color="#dc2626" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Out of Stock</span>
            <span className="metric-value" style={{ color: '#dc2626' }}>
              {stats?.outOfStockCount ?? products.filter((p) => p.stock <= 0).length}
            </span>
            <span className="metric-hint">Requires Replenishment</span>
          </div>
        </div>

        <div className="metric-card metric-revenue">
          <div className="metric-icon-box">
            <IndianRupee size={22} color="#1b4332" />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Inventory Units</span>
            <span className="metric-value">
              {stats?.totalStockUnits ?? products.reduce((acc, p) => acc + (p.stock || 0), 0)}
            </span>
            <span className="metric-hint">
              Valuation: ₹{(stats?.totalInventoryValue ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Controls & Action Bar */}
      <div className="admin-controls-card">
        <div className="inventory-controls-flex">
          {/* Search Input */}
          <div className="admin-search-wrap">
            <Search size={18} className="search-icon-left text-muted" />
            <input
              type="text"
              className="admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, Tamil title, or ID..."
              id="input-inventory-search"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="admin-filter-group">
            <select
              className="admin-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              id="select-inventory-category"
            >
              <option value="all">All Categories</option>
              {activeCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Stock & Offer Status Filter */}
          <div className="admin-filter-group">
            <select
              className="admin-select"
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              id="select-inventory-stock-status"
            >
              <option value="all">All Products (Stock &amp; Offers)</option>
              <option value="offers-only">🏷️ Active Offers Only</option>
              <option value="no-offers">Clean Products (No Offers)</option>
              <option value="in-stock">In Stock (&gt; 5)</option>
              <option value="low-stock">Low Stock (1-5)</option>
              <option value="out-of-stock">Out of Stock (0)</option>
              <option value="inactive">Deactivated Products</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="inventory-actions-group">
            <button
              type="button"
              className="btn-primary btn-add-product"
              onClick={handleOpenAdd}
              id="btn-admin-add-product"
            >
              <Plus size={16} />
              <span>Add New Product</span>
            </button>

            <button
              type="button"
              className="btn-admin-action"
              onClick={fetchInventory}
              disabled={isLoading}
              title="Refresh inventory from server"
              id="btn-admin-refresh-inventory"
            >
              <RefreshCw size={16} className={isLoading ? 'spinner' : ''} />
              <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Products Table / List */}
      <div className="admin-table-card">
        <div className="table-header-meta">
          <span className="results-count">
            Showing <strong>{filteredProducts.length}</strong> of {products.length} catalog items
          </span>
          <span className="stock-legend">
            <span className="legend-dot green"></span> In Stock
            <span className="legend-dot amber"></span> Low Stock (&le; 5)
            <span className="legend-dot red"></span> Out of Stock (0)
          </span>
        </div>

        {isLoading && products.length === 0 ? (
          <div className="admin-loading-state">
            <RefreshCw size={32} className="spinner" />
            <p>Loading authoritative inventory from server...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="admin-empty-orders">
            <AlertCircle size={44} color="#d97706" />
            <h3>No products match your current filters</h3>
            <p>Try clearing your search query or expanding category filters.</p>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-orders-table inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Pack Size</th>
                  <th>Price</th>
                  <th>Offer / Badge</th>
                  <th style={{ textAlign: 'center' }}>Stock &amp; Adjustment</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => {
                  const isOutOfStock = (prod.stock || 0) <= 0;
                  const isLowStock = !isOutOfStock && (prod.stock || 0) <= 5;
                  const isInactive = prod.isActive === false;

                  return (
                    <tr
                      key={prod.id}
                      className={`inventory-row ${isOutOfStock ? 'row-out-of-stock' : ''} ${isInactive ? 'row-inactive' : ''}`}
                    >
                      {/* Product Column */}
                      <td>
                        <div className="inventory-product-cell">
                          <img
                            src={prod.image || '/images/cat-snacks.jpg'}
                            alt={prod.name}
                            className="inventory-thumb"
                            onError={(e) => { e.target.src = '/images/cat-snacks.jpg'; }}
                          />
                          <div className="inventory-name-info">
                            <span className="inv-product-name">{prod.name}</span>
                            <span className="inv-tamil-name">{prod.tamilName}</span>
                            <div className="inv-id-badge">
                              <code>{prod.id}</code>
                              {prod.badge && <span className="badge-chip">{prod.badge}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="inv-cat-pill">{prod.categoryName || prod.category}</span>
                      </td>

                      {/* Weight */}
                      <td>
                        <span className="inv-weight">{prod.weight || '250g'}</span>
                      </td>

                      {/* Price */}
                      <td>
                        <div className="inv-price-group">
                          <span className="inv-current-price">₹{prod.price}</span>
                          {prod.originalPrice && (
                            <span className="inv-slashed-price">₹{prod.originalPrice}</span>
                          )}
                        </div>
                      </td>

                      {/* Offer / Badge Column */}
                      <td>
                        {prod.badge || (prod.originalPrice && Number(prod.originalPrice) > Number(prod.price)) ? (
                          <div className="inv-offer-active-box">
                            <span className="inv-offer-badge">
                              <Tag size={12} />
                              <span>
                                {prod.badge || `${Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF`}
                              </span>
                            </span>
                            <div className="inv-offer-actions">
                              <button
                                type="button"
                                className="btn-offer-mini-edit"
                                onClick={() => handleOpenOfferModal(prod)}
                                title="Edit this offer"
                              >
                                <Edit2 size={11} />
                              </button>
                              <button
                                type="button"
                                className="btn-offer-mini-clear"
                                onClick={() => handleQuickRemoveOffer(prod)}
                                title="Remove offer"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-set-offer-quick"
                            onClick={() => handleOpenOfferModal(prod)}
                            title="Set a special offer or promotional badge"
                          >
                            <Plus size={12} />
                            <span>Set Offer</span>
                          </button>
                        )}
                      </td>

                      {/* Stock Stepper */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="inventory-stock-stepper">
                          <button
                            type="button"
                            className="btn-stepper minus"
                            disabled={adjustingStockId === prod.id || prod.stock <= 0}
                            onClick={() => handleQuickAdjustStock(prod.id, -1)}
                            title="Decrease stock by 1"
                            aria-label="Decrease stock"
                          >
                            -
                          </button>
                          <span className={`stock-counter ${isOutOfStock ? 'stock-zero' : isLowStock ? 'stock-low' : 'stock-ok'}`}>
                            {prod.stock || 0}
                          </span>
                          <button
                            type="button"
                            className="btn-stepper plus"
                            disabled={adjustingStockId === prod.id}
                            onClick={() => handleQuickAdjustStock(prod.id, 1)}
                            title="Increase stock by 1"
                            aria-label="Increase stock"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        {isInactive ? (
                          <span className="inv-status-badge badge-deactivated">
                            <Archive size={12} />
                            <span>Deactivated</span>
                          </span>
                        ) : isOutOfStock ? (
                          <span className="inv-status-badge badge-soldout">
                            <AlertCircle size={12} />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="inv-status-badge badge-lowstock">
                            <AlertTriangle size={12} />
                            <span>Low ({prod.stock} left)</span>
                          </span>
                        ) : (
                          <span className="inv-status-badge badge-instock">
                            <Check size={12} />
                            <span>In Stock</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="inv-actions-cell">
                          <button
                            type="button"
                            className="btn-table-action btn-edit"
                            onClick={() => handleOpenEdit(prod)}
                            title="Edit product details, price, and stock"
                          >
                            <Edit2 size={15} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            className={`btn-table-action ${prod.isActive === false ? 'btn-activate' : 'btn-deactivate'}`}
                            onClick={() => handleToggleActive(prod)}
                            title={prod.isActive === false ? 'Reactivate on storefront' : 'Deactivate from storefront'}
                          >
                            <Power size={14} />
                            <span>{prod.isActive === false ? 'Activate' : 'Hide'}</span>
                          </button>

                          <button
                            type="button"
                            className="btn-table-action btn-delete"
                            onClick={() => setProductToDelete(prod)}
                            title="Delete or safely deactivate product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => !isSubmitting && setIsModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-container admin-product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-admin">
              <div className="modal-title-wrap">
                <span className="modal-subheading">
                  {modalMode === 'add' ? 'Catalog Inventory' : `Product ID: ${formData.id}`}
                </span>
                <h2 className="modal-heading">
                  {modalMode === 'add' ? 'Add New Traditional Product' : `Edit: ${formData.name}`}
                </h2>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-form-admin">
              <div className="form-grid-two">
                {/* Product Name (English) */}
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-name">
                    Product Name (English) <span className="req">*</span>
                  </label>
                  <input
                    id="prod-name"
                    type="text"
                    className={`form-input ${modalErrors.name ? 'input-error' : ''}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Handcrafted Kai Murukku"
                    required
                  />
                  {modalErrors.name && <span className="error-hint">{modalErrors.name}</span>}
                </div>

                {/* Tamil Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-tamil-name">
                    Tamil Title (தமிழ் பெயர்)
                  </label>
                  <input
                    id="prod-tamil-name"
                    type="text"
                    className="form-input"
                    value={formData.tamilName}
                    onChange={(e) => setFormData({ ...formData, tamilName: e.target.value })}
                    placeholder="e.g. பாரம்பரிய கை முறுக்கு"
                  />
                </div>
              </div>

              <div className="form-grid-three">
                {/* Category */}
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-cat">
                    Category <span className="req">*</span>
                  </label>
                  <select
                    id="prod-cat"
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => {
                      const selected = activeCategories.find((c) => c.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        category: e.target.value,
                        categoryName: selected ? selected.name : formData.categoryName
                      });
                    }}
                  >
                    {activeCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-price">
                    Selling Price (₹) <span className="req">*</span>
                  </label>
                  <input
                    id="prod-price"
                    type="number"
                    min="1"
                    step="1"
                    className={`form-input ${modalErrors.price ? 'input-error' : ''}`}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="140"
                    required
                  />
                  {modalErrors.price && <span className="error-hint">{modalErrors.price}</span>}
                </div>

                {/* Original Price / MRP */}
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-orig-price">
                    MRP / Original Price (₹)
                  </label>
                  <input
                    id="prod-orig-price"
                    type="number"
                    min="1"
                    step="1"
                    className={`form-input ${modalErrors.originalPrice ? 'input-error' : ''}`}
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="160"
                  />
                  {modalErrors.originalPrice && <span className="error-hint">{modalErrors.originalPrice}</span>}
                </div>
              </div>

              <div className="form-grid-three">
                {/* Stock Quantity */}
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-stock">
                    Available Stock Quantity <span className="req">*</span>
                  </label>
                  <input
                    id="prod-stock"
                    type="number"
                    min="0"
                    step="1"
                    className={`form-input ${modalErrors.stock ? 'input-error' : ''}`}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="25"
                    required
                  />
                  {modalErrors.stock && <span className="error-hint">{modalErrors.stock}</span>}
                </div>

                {/* Pack Weight */}
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-weight">
                    Pack Size / Weight
                  </label>
                  <input
                    id="prod-weight"
                    type="text"
                    className="form-input"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g. 250g, 500ml, 1kg"
                  />
                </div>

                {/* Badge & Offer Settings */}
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-badge">
                    <Tag size={13} style={{ marginRight: 5, verticalAlign: 'middle', color: '#059669' }} />
                    <span>Special Offer / Promo Badge</span>
                  </label>
                  <input
                    id="prod-badge"
                    type="text"
                    className="form-input"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. 10% OFF, Diwali Offer, Bestseller (leave empty for no badge)"
                  />
                  <div className="badge-preset-pills-row">
                    <span className="preset-hint">Presets:</span>
                    <button type="button" className="badge-preset-pill" onClick={() => setFormData({ ...formData, badge: '5% OFF' })}>5% OFF</button>
                    <button type="button" className="badge-preset-pill" onClick={() => setFormData({ ...formData, badge: '10% OFF' })}>10% OFF</button>
                    <button type="button" className="badge-preset-pill" onClick={() => setFormData({ ...formData, badge: '15% OFF' })}>15% OFF</button>
                    <button type="button" className="badge-preset-pill" onClick={() => setFormData({ ...formData, badge: '20% OFF' })}>20% OFF</button>
                    <button type="button" className="badge-preset-pill" onClick={() => setFormData({ ...formData, badge: 'Diwali Special' })}>Diwali</button>
                    <button type="button" className="badge-preset-pill" onClick={() => setFormData({ ...formData, badge: 'Bestseller' })}>Bestseller</button>
                    <button type="button" className="badge-preset-pill clear" onClick={() => setFormData({ ...formData, badge: '' })}>Clear</button>
                  </div>
                </div>
              </div>

              {/* Product Image Preset Picker & Custom URL */}
              <div className="form-group">
                <label className="form-label">Product Image (Choose Preset or Custom URL)</label>
                <div className="preset-images-strip">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      className={`preset-thumb-btn ${formData.image === preset.url ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, image: preset.url })}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
                <div className="image-url-preview-row mt-2">
                  <input
                    type="text"
                    className="form-input"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/images/products/kai-murukku.jpg or https://..."
                  />
                  {formData.image && (
                    <div className="live-preview-box">
                      <img src={formData.image} alt="Live Preview" onError={(e) => { e.target.src = '/images/cat-snacks.jpg'; }} />
                      <span>Preview</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="prod-desc">Description</label>
                <textarea
                  id="prod-desc"
                  rows="3"
                  className="form-input form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Traditional preparation method, taste profile, and heritage notes..."
                ></textarea>
              </div>

              {/* Ingredients */}
              <div className="form-group">
                <label className="form-label" htmlFor="prod-ingredients">
                  Ingredients (comma separated)
                </label>
                <input
                  id="prod-ingredients"
                  type="text"
                  className="form-input"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="Raw Rice Flour, Roasted Urad Dal, Pure Ghee, Cumin Seeds, Salt"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="modal-actions-bar">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                  id="btn-save-product-submit"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="spinner" />
                      <span>Saving Product...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>{modalMode === 'add' ? 'Save New Product' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. SAFE DELETE / DEACTIVATE CONFIRMATION DIALOG */}
      {productToDelete && (
        <div className="modal-backdrop" onClick={() => !isDeleting && setProductToDelete(null)} role="dialog" aria-modal="true">
          <div className="modal-container delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <ShieldCheck size={36} color="#1b4332" />
            </div>
            <h3 className="delete-modal-title">Remove or Deactivate Product</h3>
            <p className="delete-modal-desc">
              Are you sure you want to remove <strong>"{productToDelete.name}"</strong>?
            </p>
            <div className="delete-safety-note">
              <p>
                <strong>Order Integrity Guarantee:</strong> If this product is referenced in any past customer orders,
                it will be <strong>safely deactivated</strong> (hidden from storefront) rather than deleted, so customer receipts, invoices, and live tracking remain 100% intact.
              </p>
            </div>
            <div className="delete-modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
              >
                Keep Product
              </button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                id="btn-confirm-delete-product"
              >
                {isDeleting ? 'Processing...' : 'Confirm Safe Removal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. QUICK OFFER & PROMOTION MANAGEMENT MODAL */}
      {isOfferModalOpen && offerProduct && (
        <div className="modal-backdrop" onClick={() => !isSavingOffer && setIsOfferModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-container offer-manager-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tag size={20} color="#059669" />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0, fontSize: '1.2rem', color: '#064e3b' }}>Product Offer &amp; Promotion Manager</h3>
                  <p className="modal-subtitle" style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                    Set discounts &amp; promo badges for: <strong>{offerProduct.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsOfferModalOpen(false)}
                disabled={isSavingOffer}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Quick Presets Strip */}
              <div className="offer-preset-section">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', color: '#374151', display: 'block', marginBottom: '8px' }}>
                  <Sparkles size={14} style={{ color: '#d97706', marginRight: 5, verticalAlign: 'middle' }} />
                  <span>1-Click Offer Presets (விரைவான சலுகை தேர்வுகள்)</span>
                </label>
                <div className="offer-presets-strip">
                  <button
                    type="button"
                    className={`preset-offer-chip ${offerBadge === '5% OFF' ? 'active' : ''}`}
                    onClick={() => handleApplyOfferPreset(5, '5% OFF')}
                  >
                    🏷️ 5% OFF
                  </button>
                  <button
                    type="button"
                    className={`preset-offer-chip ${offerBadge === '10% OFF' ? 'active' : ''}`}
                    onClick={() => handleApplyOfferPreset(10, '10% OFF')}
                  >
                    🏷️ 10% OFF
                  </button>
                  <button
                    type="button"
                    className={`preset-offer-chip ${offerBadge === '15% OFF' ? 'active' : ''}`}
                    onClick={() => handleApplyOfferPreset(15, '15% OFF')}
                  >
                    🏷️ 15% OFF
                  </button>
                  <button
                    type="button"
                    className={`preset-offer-chip ${offerBadge === '20% OFF' ? 'active' : ''}`}
                    onClick={() => handleApplyOfferPreset(20, '20% OFF')}
                  >
                    🏷️ 20% OFF
                  </button>
                  <button
                    type="button"
                    className={`preset-offer-chip ${offerBadge === '25% OFF' ? 'active' : ''}`}
                    onClick={() => handleApplyOfferPreset(25, '25% OFF')}
                  >
                    🏷️ 25% OFF
                  </button>
                  <button
                    type="button"
                    className={`preset-offer-chip ${offerBadge === 'Diwali Special' ? 'active' : ''}`}
                    onClick={() => handleApplyOfferPreset(10, 'Diwali Special')}
                  >
                    ✨ Diwali Special
                  </button>
                  <button
                    type="button"
                    className={`preset-offer-chip ${offerBadge === 'Weekend Deal' ? 'active' : ''}`}
                    onClick={() => handleApplyOfferPreset(15, 'Weekend Deal')}
                  >
                    ⚡ Weekend Deal
                  </button>
                  <button
                    type="button"
                    className={`preset-offer-chip ${offerBadge === 'Bestseller' ? 'active' : ''}`}
                    onClick={() => handleApplyOfferPreset(0, 'Bestseller')}
                  >
                    🔥 Bestseller
                  </button>
                  <button
                    type="button"
                    className="preset-offer-chip clear-chip"
                    onClick={handleClearOfferInputs}
                  >
                    ❌ Clear Offer
                  </button>
                </div>
              </div>

              {/* Pricing & Badge Custom Inputs */}
              <div className="form-grid-three" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="offer-selling-price">
                    Selling Price (₹) <span className="req">*</span>
                  </label>
                  <input
                    id="offer-selling-price"
                    type="number"
                    min="1"
                    step="1"
                    className="form-input"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="e.g. 180"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="offer-orig-price">
                    MRP / Original Price (₹)
                  </label>
                  <input
                    id="offer-orig-price"
                    type="number"
                    min="1"
                    step="1"
                    className="form-input"
                    value={offerOriginalPrice}
                    onChange={(e) => setOfferOriginalPrice(e.target.value)}
                    placeholder="e.g. 200 (optional)"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="offer-badge-input">
                    Offer Badge Text (பேட்ஜ்)
                  </label>
                  <input
                    id="offer-badge-input"
                    type="text"
                    className="form-input"
                    value={offerBadge}
                    onChange={(e) => setOfferBadge(e.target.value)}
                    placeholder="e.g. 10% OFF, Diwali Offer"
                  />
                </div>
              </div>

              {/* Live Customer Preview */}
              <div className="offer-preview-banner">
                <span className="preview-label">CUSTOMER STOREFRONT PREVIEW:</span>
                <div className="preview-card-chip">
                  {offerBadge ? (
                    <span className="preview-badge-pill">{offerBadge}</span>
                  ) : offerOriginalPrice && Number(offerOriginalPrice) > Number(offerPrice) ? (
                    <span className="preview-badge-pill">
                      {Math.round(((Number(offerOriginalPrice) - Number(offerPrice)) / Number(offerOriginalPrice)) * 100)}% OFF
                    </span>
                  ) : (
                    <span className="preview-no-badge">No Offer Badge (Clean Product Card)</span>
                  )}
                  <div className="preview-pricing">
                    <span className="preview-current-price">₹{offerPrice || offerProduct.price}</span>
                    {offerOriginalPrice && Number(offerOriginalPrice) > Number(offerPrice || offerProduct.price) && (
                      <span className="preview-slashed-price">₹{offerOriginalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #e5e7eb' }}>
              <div>
                {(offerProduct.badge || offerProduct.originalPrice) && (
                  <button
                    type="button"
                    className="btn-delete"
                    style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.85rem' }}
                    onClick={() => handleQuickRemoveOffer(offerProduct)}
                    disabled={isSavingOffer}
                  >
                    Remove Current Offer
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsOfferModalOpen(false)}
                  disabled={isSavingOffer}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveOffer}
                  disabled={isSavingOffer}
                >
                  {isSavingOffer ? (
                    <>
                      <RefreshCw size={15} className="spinner" />
                      <span>Saving Offer...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>Save &amp; Publish Offer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
