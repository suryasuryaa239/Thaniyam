import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package, Search, Plus, Edit2, Trash2, CheckCircle2, AlertCircle,
  RefreshCw, IndianRupee, Check, X,
  ShieldCheck, AlertTriangle, Archive, Power
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
  { id: 'traditional-snacks', name: 'Traditional Savory Snacks', tamilName: 'பாரம்பரிய நொறுக்குத்தீனிகள்' },
  { id: 'wood-pressed-oils', name: 'Wood-Pressed Oils (Marachekku)', tamilName: 'மரச்செக்கு எண்ணெய்' },
  { id: 'natural-sweeteners', name: 'Natural Palm Sweeteners', tamilName: 'உடன்குடி பனைக்கருப்பட்டி' },
  { id: 'kali-mix', name: 'Traditional Kali Mixes', tamilName: 'பாரம்பரிய களி வகைகள்' },
  { id: 'tea-mix', name: 'Herbal Teas & Beverages', tamilName: 'மூலிகை டீ & காபி' },
  { id: 'daily-needs', name: 'Natural Pantry & Salts', tamilName: 'இயற்கை மளிகை & உப்பு' },
  { id: 'beauty-care', name: 'Natural Herbal Beauty & Hair Care', tamilName: 'இயற்கை அழகு & நலங்கு மாவு' },
  { id: 'chapati-mix', name: 'Millet Chapati & Roti Mixes', tamilName: 'தானிய சப்பாத்தி மாவு' },
  { id: 'millets-grains', name: 'Native Millets & Grains', tamilName: 'சிறு தானியங்கள்' },
  { id: 'millet-sweets', name: 'Millet Sweets & Delights', tamilName: 'தானிய இனிப்புகள்' }
];

const PRESET_IMAGES = [
  { label: 'Kai Murukku', url: '/images/products/kai-murukku.jpg' },
  { label: 'Kara Thattai', url: '/images/products/spicy-thattai.jpg' },
  { label: 'Crispy Seedai', url: '/images/products/traditional-seedai.jpg' },
  { label: 'Kambu Murukku', url: '/images/products/kambu-murukku.jpg' },
  { label: 'Sesame Oil', url: '/images/products/sesame-oil.jpg' },
  { label: 'Groundnut Oil', url: '/images/products/groundnut-oil.jpg' },
  { label: 'Virgin Coconut Oil', url: '/images/products/coconut-oil.jpg' },
  { label: 'Udangudi Karupatti', url: '/images/products/palm-jaggery.jpg' },
  { label: 'Panang Karkandu', url: '/images/products/palm-candy.jpg' },
  { label: 'Nattu Sarkarai', url: '/images/products/nattu-sarkarai.jpg' },
  { label: 'Thinai Millet', url: '/images/products/thinai-millet.jpg' },
  { label: 'Samai Millet', url: '/images/products/samai-millet.jpg' },
  { label: 'Varagu Millet', url: '/images/products/varagu-millet.jpg' },
  { label: 'Pearl Millet Grain', url: '/images/products/kambu-grain.jpg' },
  { label: 'Curry Leaf Podi', url: '/images/products/curry-leaf-podi.jpg' },
  { label: 'Paruppu Podi', url: '/images/products/paruppu-podi.jpg' },
  { label: 'Thinai Laddu', url: '/images/products/thinai-laddu.jpg' },
  { label: 'Traditional Athirasam', url: '/images/products/athirasam.jpg' },
  { label: 'Snacks Category', url: '/images/cat-snacks.jpg' },
  { label: 'Oils Category', url: '/images/cat-oils.jpg' },
  { label: 'Jaggery Category', url: '/images/cat-jaggery.jpg' },
  { label: 'Millets Category', url: '/images/cat-millets.jpg' }
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

      // Stock status filter
      if (stockStatusFilter === 'in-stock' && prod.stock <= 5) return false;
      if (stockStatusFilter === 'low-stock' && (prod.stock <= 0 || prod.stock > 5)) return false;
      if (stockStatusFilter === 'out-of-stock' && prod.stock > 0) return false;
      if (stockStatusFilter === 'inactive' && prod.isActive !== false) return false;

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

          {/* Stock Status Filter */}
          <div className="admin-filter-group">
            <select
              className="admin-select"
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              id="select-inventory-stock-status"
            >
              <option value="all">All Stock Statuses</option>
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

                {/* Badge */}
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-badge">
                    Marketing Badge
                  </label>
                  <input
                    id="prod-badge"
                    type="text"
                    className="form-input"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Bestseller, Pure Ghee"
                  />
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
    </div>
  );
}
