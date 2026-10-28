import express from 'express';
import {
  getAllCategoriesFromStore,
  getCategoryByIdFromStore,
  saveCategoryInStore,
  deleteCategoryFromStore
} from '../data/mockCategoryStore.js';
import { requireAdminAuth } from './orderRoutes.js';

const router = express.Router();

// 1. PUBLIC: GET /api/categories - retrieve all categories
router.get('/', (req, res) => {
  try {
    const categories = getAllCategoriesFromStore();
    return res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. PUBLIC: GET /api/categories/:id - retrieve single category
router.get('/:id', (req, res) => {
  const cat = getCategoryByIdFromStore(req.params.id);
  if (!cat) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  return res.json({ success: true, category: cat });
});

// 3. ADMIN: POST /api/categories - create a new category
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const { name, tamilName, icon, image, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const saved = await saveCategoryInStore({
      name: name.trim(),
      tamilName: tamilName?.trim() || '',
      icon: icon?.trim() || '✨',
      image: image?.trim() || '/images/cat-snacks.jpg',
      description: description?.trim() || ''
    });

    return res.status(201).json({
      success: true,
      message: `Category "${saved.name}" created successfully.`,
      category: saved
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. ADMIN: PUT /api/categories/:id - update existing category
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = getCategoryByIdFromStore(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const updated = await saveCategoryInStore({
      ...existing,
      ...req.body,
      id
    });

    return res.json({
      success: true,
      message: `Category "${updated.name}" updated successfully.`,
      category: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. ADMIN: DELETE /api/categories/:id - delete a category
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      return res.status(400).json({ success: false, message: 'Cannot delete the base "all" category' });
    }

    const deleted = await deleteCategoryFromStore(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found or already deleted' });
    }

    return res.json({
      success: true,
      message: `Category removed successfully.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
