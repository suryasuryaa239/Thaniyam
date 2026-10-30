import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderTree, Plus, Edit2, Trash2, CheckCircle2, AlertCircle,
  RefreshCw, Check, X, Image as ImageIcon, Sparkles, Layers,
  ExternalLink
} from 'lucide-react';
import { apiUrl } from '../config/api';
import { useProducts } from '../context/ProductContext';

const PRESET_CATEGORY_IMAGES = [
  { label: 'Dosa & Adai', url: '/images/products/chola-milagu-dosa-mix-sorghum-pepper-dosa-mix.jpg' },
  { label: 'Puttu Flours', url: '/images/products/poongar-rice-kozhukattai-idiyappam-flour.jpg' },
  { label: 'Kanji & Porridge', url: '/images/products/karuppu-kavuni-kanji.jpg' },
  { label: 'Health Mix', url: '/images/products/karuppu-kavuni-nutrition-mix.jpg' },
  { label: 'Heritage Podis', url: '/images/products/pudina-idli-podi-mint-idli-powder.jpg' },
  { label: 'Millet Pongal', url: '/images/products/siruthaniya-pongal-mix-multi-millet-pongal-mix.jpg' },
  { label: 'Traditional Kali', url: '/images/products/ulundhu-kali.jpg' },
  { label: 'Herbal Beverages', url: '/images/products/sukku-malli-coffee-herbal-coffee-mix.jpg' },
  { label: 'Daily Needs', url: '/images/products/himalayan-rock-crtstals.jpg' },
  { label: 'Herbal Beauty', url: '/images/products/nalangu-maavu-herbal-bath-powder.jpg' },
  { label: 'Chapati Mix', url: '/images/products/multi-millet-chapati-mix.jpg' }
];

const EMOJI_SUGGESTIONS = ['✨', '🌾', '🥨', '🫒', '🍯', '🌶️', '🍬', '🫖', '🥣', '🌿', '🍪', '🥥'];

export default function AdminCategoriesTab({ authToken, onCategoryChange }) {
  const { categories: contextCategories, refreshCategories, products } = useProducts();
  const [categories, setCategories] = useState(contextCategories || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalErrors, setModalErrors] = useState({});

  // Category To Delete
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    tamilName: '',
    icon: '✨',
    image: '/images/products/chola-milagu-dosa-mix-sorghum-pepper-dosa-mix.jpg',
    description: ''
  });

  const fetchCategoriesList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/categories'));
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (err) {
      setError(err.message || 'Error loading categories.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoriesList();
  }, [fetchCategoriesList]);

  // Count products per category
  const productCounts = React.useMemo(() => {
    const counts = { all: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({
      id: '',
      name: '',
      tamilName: '',
      icon: '✨',
      image: '/images/products/chola-milagu-dosa-mix-sorghum-pepper-dosa-mix.jpg',
      description: ''
    });
    setModalErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat) => {
    setModalMode('edit');
    setFormData({
      id: cat.id,
      name: cat.name,
      tamilName: cat.tamilName || '',
      icon: cat.icon || '✨',
      image: cat.image || '/images/cat-snacks.jpg',
      description: cat.description || ''
    });
    setModalErrors({});
    setIsModalOpen(true);
  };

  // Auto generate ID slug from name in Add mode
  const handleNameChange = (val) => {
    const updated = { ...formData, name: val };
    if (modalMode === 'add') {
      updated.id = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    setFormData(updated);
  };

  // Submit Category Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Category name is required';
    if (!formData.id.trim()) errors.id = 'Category slug/ID is required';

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setModalErrors({});

    try {
      const url = modalMode === 'add'
        ? apiUrl('/api/categories')
        : apiUrl(`/api/categories/${formData.id}`);
      
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save category');
      }

      setFeedback({
        type: 'success',
        message: data.message || `Category "${formData.name}" saved successfully!`
      });

      setIsModalOpen(false);
      await fetchCategoriesList();
      if (refreshCategories) refreshCategories();
      if (onCategoryChange) onCategoryChange();
    } catch (err) {
      setModalErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Category
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(apiUrl(`/api/categories/${categoryToDelete.id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete category');
      }

      setFeedback({
        type: 'success',
        message: `Category "${categoryToDelete.name}" deleted successfully.`
      });

      setCategoryToDelete(null);
      await fetchCategoriesList();
      if (refreshCategories) refreshCategories();
      if (onCategoryChange) onCategoryChange();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to delete category'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-categories-tab">
      {/* 1. Alerts */}
      {error && (
        <div className="admin-alert-banner error" role="alert">
          <AlertCircle size={18} color="#dc2626" />
          <span className="alert-msg">{error}</span>
          <button type="button" className="btn-alert-close" onClick={() => setError(null)}>
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
          <button type="button" className="btn-alert-close" onClick={() => setFeedback(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. Controls & Actions Header */}
      <div className="admin-controls-card categories-header-bar">
        <div className="categories-header-left">
          <h2 className="admin-section-heading">
            <FolderTree size={20} className="heading-icon" />
            Storefront Categories Management
          </h2>
          <span className="categories-count-hint">
            {categories.length} total categories configured
          </span>
        </div>

        <div className="categories-header-right">
          <button
            type="button"
            className="btn-admin-action"
            onClick={fetchCategoriesList}
            disabled={isLoading}
            title="Refresh categories"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn-primary-admin"
            onClick={handleOpenAdd}
          >
            <Plus size={16} />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* 3. Category Grid Cards */}
      <div className="admin-categories-grid">
        {categories.map((cat) => {
          const isAll = cat.id === 'all';
          const count = productCounts[cat.id] || 0;

          return (
            <article key={cat.id} className={`admin-category-card ${isAll ? 'card-all-special' : ''}`}>
              <div className="category-card-thumb-wrap">
                <img 
                  src={cat.image || '/images/cat-snacks.jpg'} 
                  alt={cat.name} 
                  className="category-card-thumb" 
                />
                <span className="category-card-icon-pill">{cat.icon || '✨'}</span>
                <span className="category-item-count-badge">{count} Products</span>
              </div>

              <div className="category-card-content">
                <div className="category-title-group">
                  <h3 className="category-card-name">{cat.name}</h3>
                  <span className="category-card-tamil">{cat.tamilName || '—'}</span>
                </div>

                <div className="category-slug-pill">
                  <code>{cat.id}</code>
                </div>

                <p className="category-card-desc">
                  {cat.description || 'No description provided.'}
                </p>

                <div className="category-card-actions">
                  <button
                    type="button"
                    className="btn-card-action edit"
                    onClick={() => handleOpenEdit(cat)}
                    title={`Edit ${cat.name}`}
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  {!isAll && (
                    <button
                      type="button"
                      className="btn-card-action delete"
                      onClick={() => setCategoryToDelete(cat)}
                      title={`Delete ${cat.name}`}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* 4. Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="admin-modal-backdrop admin-modal-overlay" onClick={() => !isSubmitting && setIsModalOpen(false)} role="dialog" aria-modal="true">
          <div className="admin-modal-container category-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-title-group">
                <FolderTree size={20} color="#1b4332" />
                <h3 className="modal-heading">
                  {modalMode === 'add' ? 'Create New Category' : `Edit Category: ${formData.name}`}
                </h3>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-modal-body">
                {modalErrors.submit && (
                  <div className="form-error-banner">
                    <AlertCircle size={16} />
                    <span>{modalErrors.submit}</span>
                  </div>
                )}

                <div className="form-grid-two">
                  {/* Category Name */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="cat-name">
                      Category Name (English) <span className="req">*</span>
                    </label>
                    <input
                      id="cat-name"
                      type="text"
                      className={`form-input ${modalErrors.name ? 'input-error' : ''}`}
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Traditional Pickles"
                      required
                    />
                    {modalErrors.name && <span className="error-hint">{modalErrors.name}</span>}
                  </div>

                  {/* Tamil Name */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="cat-tamil">
                      Tamil Name (தமிழ் பெயர்)
                    </label>
                    <input
                      id="cat-tamil"
                      type="text"
                      className="form-input"
                      value={formData.tamilName}
                      onChange={(e) => setFormData({ ...formData, tamilName: e.target.value })}
                      placeholder="எ.கா. பாரம்பரிய ஊறுகாய்"
                    />
                  </div>
                </div>

                <div className="form-grid-two">
                  {/* Category Slug / ID */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="cat-id">
                      Category Slug (ID) <span className="req">*</span>
                    </label>
                    <input
                      id="cat-id"
                      type="text"
                      className={`form-input ${modalErrors.id ? 'input-error' : ''}`}
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                      placeholder="e.g. traditional-pickles"
                      disabled={modalMode === 'edit'}
                      required
                    />
                    {modalErrors.id && <span className="error-hint">{modalErrors.id}</span>}
                  </div>

                  {/* Icon / Emoji */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="cat-icon">
                      Category Icon / Emoji
                    </label>
                    <div className="icon-selector-wrap">
                      <input
                        id="cat-icon"
                        type="text"
                        className="form-input icon-input"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="✨"
                        maxLength="4"
                      />
                      <div className="emoji-quick-pills">
                        {EMOJI_SUGGESTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className={`emoji-btn ${formData.icon === emoji ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, icon: emoji })}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Image */}
                <div className="form-group">
                  <label className="form-label">Category Image Preset or URL</label>
                  <div className="preset-images-strip">
                    {PRESET_CATEGORY_IMAGES.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        className={`preset-thumb-btn ${formData.image === preset.url ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, image: preset.url })}
                      >
                        <img src={preset.url} alt={preset.label} />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom URL Input & Live Preview */}
                  <div className="image-url-preview-row">
                    <input
                      type="text"
                      className="form-input"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="/images/products/chola-milagu-dosa-mix-sorghum-pepper-dosa-mix.jpg or https://..."
                    />
                    {formData.image && (
                      <div className="live-preview-box">
                        <img src={formData.image} alt="Live Preview" onError={(e) => { e.target.src = '/images/products/chola-milagu-dosa-mix-sorghum-pepper-dosa-mix.jpg'; }} />
                        <span>Preview</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label" htmlFor="cat-desc">
                    Category Description
                  </label>
                  <textarea
                    id="cat-desc"
                    rows="3"
                    className="form-input form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the traditional delicacy collection..."
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
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
                  className="btn-primary-admin"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>{modalMode === 'add' ? 'Create Category' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Category Safety Dialog */}
      {categoryToDelete && (
        <div className="admin-modal-backdrop admin-modal-overlay" onClick={() => !isDeleting && setCategoryToDelete(null)} role="dialog" aria-modal="true">
          <div className="admin-modal-container modal-confirm-delete" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-delete-body text-center">
              <div className="delete-warning-icon">
                <AlertCircle size={40} color="#dc2626" />
              </div>
              <h3 className="confirm-delete-title">Delete Category "{categoryToDelete.name}"?</h3>
              <p className="delete-modal-msg">
                Are you sure you want to remove this category? Products currently assigned to this category will not be deleted but may become uncategorized.
              </p>
              <div className="confirm-delete-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setCategoryToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

