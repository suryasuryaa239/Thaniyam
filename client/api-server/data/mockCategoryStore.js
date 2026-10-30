import {
  isMySQLConnected,
  mysqlGetAllCategories,
  mysqlSaveCategory,
  mysqlDeleteCategory
} from '../config/mysqlStore.js';

export const DEFAULT_CATEGORIES = [
  {
    "id": "all",
    "name": "All Products",
    "tamilName": "அனைத்து பொருட்கள்",
    "icon": "✨",
    "image": "/images/products/karuppu-kavuni-nutrition-mix.jpg",
    "description": "Complete traditional heritage collection"
  },
  {
    "id": "dosa-mix",
    "name": "Traditional Dosa & Adai Mixes",
    "tamilName": "பாரம்பரிய தோசை & அடை",
    "icon": "🥞",
    "image": "/images/products/chola-milagu-dosa-mix-sorghum-pepper-dosa-mix.jpg",
    "description": "Millet dosas, ragi dosa, and protein-packed adai mixes"
  },
  {
    "id": "puttu-mix",
    "name": "Puttu & Kozhukattai Flours",
    "tamilName": "புட்டு & கொழுக்கட்டை மாவு",
    "icon": "🍚",
    "image": "/images/products/poongar-rice-kozhukattai-idiyappam-flour.jpg",
    "description": "Poongar, Mappillai Samba, and Red Rice flours"
  },
  {
    "id": "kanji-mix",
    "name": "Traditional Kanji & Porridge",
    "tamilName": "பாரம்பரிய கஞ்சி வகைகள்",
    "icon": "🥣",
    "image": "/images/products/karuppu-kavuni-kanji.jpg",
    "description": "Heirloom rice kanji and nourishing porridge mixes"
  },
  {
    "id": "health-mix",
    "name": "Health & Nutrition Mixes",
    "tamilName": "பாரம்பரிய சத்து மாவு",
    "icon": "🥛",
    "image": "/images/products/karuppu-kavuni-nutrition-mix.jpg",
    "description": "Sprouted multigrain and black kavuni nutrition mixes"
  },
  {
    "id": "heritage-podis",
    "name": "Heritage Podis & Masalas",
    "tamilName": "பாரம்பரிய பொடிகள்",
    "icon": "🌶️",
    "image": "/images/products/pudina-idli-podi-mint-idli-powder.jpg",
    "description": "Stone-pounded herbal & lentil idli podis"
  },
  {
    "id": "pongal-mix",
    "name": "Millet Pongal Mixes",
    "tamilName": "சிறு தானிய பொங்கல்",
    "icon": "🍲",
    "image": "/images/products/siruthaniya-pongal-mix-multi-millet-pongal-mix.jpg",
    "description": "Quick-cook nutritious millet ven pongal mixes"
  },
  {
    "id": "kali-mix",
    "name": "Traditional Kali Mixes",
    "tamilName": "பாரம்பரிய களி வகைகள்",
    "icon": "🍯",
    "image": "/images/products/ulundhu-kali.jpg",
    "description": "Cooling Venthaya Kali & bone-strengthening Ulunthangali"
  },
  {
    "id": "tea-mix",
    "name": "Herbal Teas & Beverages",
    "tamilName": "மூலிகை டீ & காபி",
    "icon": "☕",
    "image": "/images/products/sukku-malli-coffee-herbal-coffee-mix.jpg",
    "description": "Sukku Malli Coffee, Masala Chai, and Beetroot Malt"
  },
  {
    "id": "daily-needs",
    "name": "Natural Pantry & Daily Needs",
    "tamilName": "இயற்கை மளிகை & உப்பு",
    "icon": "🧂",
    "image": "/images/products/himalayan-rock-crtstals.jpg",
    "description": "Himalayan pink rock salt, aval, and palm sugars"
  },
  {
    "id": "beauty-care",
    "name": "Natural Herbal Beauty & Hair Care",
    "tamilName": "இயற்கை அழகு & நலங்கு மாவு",
    "icon": "🌿",
    "image": "/images/products/nalangu-maavu-herbal-bath-powder.jpg",
    "description": "Nalangu Maavu, Shikakai, and pure botanical face packs"
  },
  {
    "id": "chapati-mix",
    "name": "Millet Chapati & Roti Mixes",
    "tamilName": "தானிய சப்பாத்தி மாவு",
    "icon": "🫓",
    "image": "/images/products/multi-millet-chapati-mix.jpg",
    "description": "High-fiber multi millet and bamboo rice chapati flours"
  }
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
    image: catData.image || '/images/hero-banner.jpg',
    description: catData.description || ''
  };

  memoryCategories.set(id, category);

  if (isMySQLConnected()) {
    try {
      await mysqlSaveCategory(category);
    } catch (err) {
      console.warn('⚠️ [MySQL] Failed to persist category:', err.message);
    }
  }

  return category;
};

export const deleteCategoryFromStore = async (id) => {
  const existed = memoryCategories.has(id);
  memoryCategories.delete(id);

  if (isMySQLConnected()) {
    try {
      await mysqlDeleteCategory(id);
    } catch (err) {
      console.warn('⚠️ [MySQL] Failed to delete category:', err.message);
    }
  }

  return existed;
};
