import {
  isMySQLConnected,
  mysqlGetAllCategories,
  mysqlSaveCategory,
  mysqlDeleteCategory
} from '../config/mysqlStore.js';

export const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Products', tamilName: 'அனைத்து பொருட்கள்', icon: '✨', image: '/images/hero-banner.jpg', description: 'Complete traditional pantry collection' },
  { id: 'millets-grains', name: 'Native Millets & Grains', tamilName: 'சிறு தானியங்கள்', icon: '🌾', image: '/images/cat-millets.jpg', description: 'Unpolished native grains rich in dietary fiber' },
  { id: 'traditional-snacks', name: 'Traditional Savory Snacks', tamilName: 'பாரம்பரிய நொறுக்குத்தீனிகள்', icon: '🥨', image: '/images/cat-snacks.jpg', description: 'Wood-pressed oil fried crunchy snacks' },
  { id: 'wood-pressed-oils', name: 'Wood-Pressed Oils', tamilName: 'மரச்செக்கு எண்ணெய்', icon: '🫒', image: '/images/cat-oils.jpg', description: 'Vaagai Marachekku cold-pressed unrefined oils' },
  { id: 'natural-sweeteners', name: 'Natural Palm Sweeteners', tamilName: 'உடன்குடி பனைக்கருப்பட்டி', icon: '🍯', image: '/images/cat-jaggery.jpg', description: 'Authentic Udangudi Karupatti & Panang Karkandu' },
  { id: 'heritage-podis', name: 'Heritage Podis & Masalas', tamilName: 'பாரம்பரிய பொடிகள்', icon: '🌶️', image: '/images/prod-podi.jpg', description: 'Stone-pounded aromatic lentil idli podis' },
  { id: 'millet-sweets', name: 'Millet Sweets & Delights', tamilName: 'தானிய இனிப்புகள்', icon: '🍬', image: '/images/prod-laddu.jpg', description: 'Jaggery-sweetened festive traditional sweets' }
];

const memoryCategories = new Map();
DEFAULT_CATEGORIES.forEach(c => memoryCategories.set(c.id, { ...c }));

export const syncCategoriesFromMySQL = async () => {
  if (!isMySQLConnected()) return;
  try {
    const cats = await mysqlGetAllCategories();
    if (cats && cats.length > 0) {
      for (const c of cats) {
        memoryCategories.set(c.id, c);
      }
      console.log(`📂 [Store] Synced ${cats.length} categories from TiDB MySQL.`);
    }
  } catch (err) {
    console.warn('⚠️ [MySQL] syncCategories warning:', err.message);
  }
};

export const getAllCategoriesFromStore = () => {
  return Array.from(memoryCategories.values());
};

export const getCategoryByIdFromStore = (id) => {
  return memoryCategories.get(id) || null;
};

export const saveCategoryInStore = async (catData) => {
  const id = catData.id || catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const category = {
    id,
    name: catData.name,
    tamilName: catData.tamilName || '',
    icon: catData.icon || '✨',
    image: catData.image || '/images/cat-snacks.jpg',
    description: catData.description || ''
  };

  memoryCategories.set(id, category);

  if (isMySQLConnected()) {
    try {
      await mysqlSaveCategory(category);
    } catch (e) {
      console.warn('⚠️ [MySQL] Error persisting category:', e.message);
    }
  }

  return category;
};

export const deleteCategoryFromStore = async (id) => {
  if (id === 'all') return false; // Never delete 'all'
  const existed = memoryCategories.delete(id);

  if (isMySQLConnected()) {
    try {
      await mysqlDeleteCategory(id);
    } catch (e) {
      console.warn('⚠️ [MySQL] Error deleting category from MySQL:', e.message);
    }
  }

  return existed;
};
