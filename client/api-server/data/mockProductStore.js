// In-memory persistent catalog & inventory store for Thaniyam Treats
// Ensures resilient operation with full stock tracking, atomic deduction, and safe deactivation

const memoryProducts = new Map();

// Authentic seed products matching Thaniyam Treats heritage catalog
const SEED_CATALOG = [
  {
    id: 'prod-001',
    name: 'Handcrafted Kai Murukku',
    tamilName: 'பாரம்பரிய கை முறுக்கு',
    category: 'traditional-snacks',
    categoryName: 'Traditional Snacks',
    price: 140,
    originalPrice: 160,
    weight: '250g',
    stock: 25,
    rating: 4.9,
    reviewsCount: 64,
    badge: 'Bestseller',
    image: '/images/cat-snacks.jpg',
    description: 'Authentic hand-pressed spiral murukku prepared with premium rice flour, roasted urad dal, cumin seeds, and a hint of asafoetida. Deep fried in pure wood-pressed groundnut oil for signature crunch.',
    ingredients: ['Raw Rice Flour', 'Roasted Urad Dal Flour', 'Butter', 'Cumin Seeds', 'Asafoetida', 'Salt', 'Wood-Pressed Groundnut Oil']
  },
  {
    id: 'prod-002',
    name: 'Spicy Kara Thattai',
    tamilName: 'கார தட்டை',
    category: 'traditional-snacks',
    categoryName: 'Traditional Snacks',
    price: 130,
    originalPrice: 145,
    weight: '250g',
    stock: 20,
    rating: 4.8,
    reviewsCount: 47,
    badge: 'Spicy & Crispy',
    image: '/images/cat-snacks.jpg',
    description: 'Crispy South Indian savory discs seasoned with soaked chana dal, curry leaves, crushed red chillies, and sesame seeds.',
    ingredients: ['Rice Flour', 'Urad Dal Flour', 'Chana Dal', 'Curry Leaves', 'Red Chilli Powder', 'Sesame Seeds', 'Groundnut Oil', 'Salt']
  },
  {
    id: 'prod-003',
    name: 'Traditional Seedai (Crispy Butter Balls)',
    tamilName: 'உப்பு சீடை',
    category: 'traditional-snacks',
    categoryName: 'Traditional Snacks',
    price: 125,
    originalPrice: 140,
    weight: '200g',
    stock: 18,
    rating: 4.7,
    reviewsCount: 38,
    badge: 'Village Special',
    image: '/images/cat-snacks.jpg',
    description: 'Tiny, crunchy roasted rice and butter balls seasoned with white sesame and hing. A classic Gokulashtami and festive savory.',
    ingredients: ['Processed Rice Flour', 'Urad Dal Flour', 'Country Butter', 'White Sesame Seeds', 'Asafoetida', 'Salt']
  },
  {
    id: 'prod-004',
    name: 'Kambu (Pearl Millet) Kara Murukku',
    tamilName: 'கம்பு கார முறுக்கு',
    category: 'traditional-snacks',
    categoryName: 'Traditional Snacks',
    price: 145,
    originalPrice: 165,
    weight: '250g',
    stock: 4, // Intentionally seeded with low stock (<= 5) for test verification
    rating: 4.9,
    reviewsCount: 56,
    badge: 'Millet Rich',
    image: '/images/cat-snacks.jpg',
    description: 'Wholesome savory murukku blending native pearl millet flour with rice flour and black pepper for a deeply savory crunch.',
    ingredients: ['Pearl Millet (Kambu) Flour', 'Rice Flour', 'Roasted Gram Flour', 'Black Pepper', 'Cumin', 'Sesame Seeds', 'Groundnut Oil']
  },
  {
    id: 'prod-005',
    name: 'Marachekku Sesame Oil (Gingelly)',
    tamilName: 'மரச்செக்கு நல்லெண்ணெய்',
    category: 'wood-pressed-oils',
    categoryName: 'Wood-Pressed Oils',
    price: 290,
    originalPrice: 320,
    weight: '500ml',
    stock: 30,
    rating: 5.0,
    reviewsCount: 88,
    badge: 'Pure Wood-Pressed',
    image: '/images/cat-oils.jpg',
    description: 'Extracted slowly using traditional Vaagai wood cold press (Marachekku). Preserves all natural aroma, golden color, and nutrients without refining or chemicals.',
    ingredients: ['100% Native Black Sesame Seeds', 'Pure Palm Jaggery (as natural processing aid)']
  },
  {
    id: 'prod-006',
    name: 'Marachekku Groundnut Oil',
    tamilName: 'மரச்செக்கு கடலை எண்ணெய்',
    category: 'wood-pressed-oils',
    categoryName: 'Wood-Pressed Oils',
    price: 240,
    originalPrice: 270,
    weight: '500ml',
    stock: 22,
    rating: 4.9,
    reviewsCount: 62,
    badge: 'Cold Pressed',
    image: '/images/cat-oils.jpg',
    description: 'Traditional wood-pressed peanut oil with rich nutty fragrance, ideal for authentic South Indian frying and tempering.',
    ingredients: ['100% Sun-Dried Native Groundnut Kernels']
  },
  {
    id: 'prod-007',
    name: 'Marachekku Virgin Coconut Oil',
    tamilName: 'மரச்செக்கு தேங்காய் எண்ணெய்',
    category: 'wood-pressed-oils',
    categoryName: 'Wood-Pressed Oils',
    price: 260,
    originalPrice: 290,
    weight: '500ml',
    stock: 25,
    rating: 4.8,
    reviewsCount: 45,
    badge: 'Unrefined',
    image: '/images/cat-oils.jpg',
    description: 'Extracted from sulfur-free sun-dried copra (coconut meat) from Pollachi farms. Pure, crystal clear, and full of natural aroma.',
    ingredients: ['100% Sun-Dried Coconut Copra']
  },
  {
    id: 'prod-008',
    name: 'Authentic Udangudi Palm Jaggery',
    tamilName: 'உடன்குடி பனைக்கருப்பட்டி',
    category: 'natural-sweeteners',
    categoryName: 'Natural Sweeteners',
    price: 260,
    originalPrice: 280,
    weight: '500g',
    stock: 35,
    rating: 4.8,
    reviewsCount: 52,
    badge: 'Heritage Sourced',
    image: '/images/cat-jaggery.jpg',
    description: 'Handcrafted solid blocks of genuine Karupatti boiled from fresh palmyra palm sap in Udangudi. Free from white sugar adulteration or sodium bicarbonate.',
    ingredients: ['100% Clarified Palmyra Palm Sap', 'Dry Ginger', 'Cardamom']
  },
  {
    id: 'prod-009',
    name: 'Pure Palm Candy (Panang Karkandu)',
    tamilName: 'பனங்கற்கண்டு',
    category: 'natural-sweeteners',
    categoryName: 'Natural Sweeteners',
    price: 210,
    originalPrice: 235,
    weight: '250g',
    stock: 15,
    rating: 4.9,
    reviewsCount: 34,
    badge: 'Natural Crystal',
    image: '/images/cat-jaggery.jpg',
    description: 'Naturally crystallized palm sugar crystals prized for traditional milk beverages, herbal decoctions, and coffee.',
    ingredients: ['100% Palmyra Palm Sap Crystals']
  },
  {
    id: 'prod-010',
    name: 'Country Jaggery Powder (Nattu Sarkarai)',
    tamilName: 'நாட்டு சர்க்கரை',
    category: 'natural-sweeteners',
    categoryName: 'Natural Sweeteners',
    price: 120,
    originalPrice: 140,
    weight: '500g',
    stock: 40,
    rating: 4.7,
    reviewsCount: 51,
    badge: 'Chemical Free',
    image: '/images/cat-jaggery.jpg',
    description: 'Pure, chemical-free cane jaggery powder traditionally clarified using plant extracts. Perfect wholesome daily sweetener for tea and coffee.',
    ingredients: ['100% Fresh Sugarcane Juice', 'Vegetable Clarifying Extract']
  },
  {
    id: 'prod-011',
    name: 'Unpolished Foxtail Millet (Thinai)',
    tamilName: 'தீட்டப்படாத தினை அரிசி',
    category: 'millets-grains',
    categoryName: 'Native Millets',
    price: 110,
    originalPrice: 130,
    weight: '500g',
    stock: 28,
    rating: 4.8,
    reviewsCount: 39,
    badge: 'Whole Grain',
    image: '/images/cat-millets.jpg',
    description: 'Cleaned and unpolished whole foxtail millet grain with natural bran intact. Ideal alternative to white polished rice for upma, pongal, or porridge.',
    ingredients: ['100% Unpolished Foxtail Millet Grains']
  },
  {
    id: 'prod-012',
    name: 'Unpolished Little Millet (Samai)',
    tamilName: 'தீட்டப்படாத சாமை அரிசி',
    category: 'millets-grains',
    categoryName: 'Native Millets',
    price: 115,
    originalPrice: 135,
    weight: '500g',
    stock: 24,
    rating: 4.8,
    reviewsCount: 42,
    badge: 'High Fiber',
    image: '/images/cat-millets.jpg',
    description: 'Traditional Samai grains cleaned without polishing to retain essential minerals and dietary fiber. Cooks light and fluffy.',
    ingredients: ['100% Unpolished Little Millet Grains']
  },
  {
    id: 'prod-013',
    name: 'Unpolished Kodo Millet (Varagu)',
    tamilName: 'தீட்டப்படாத வரகு அரிசி',
    category: 'millets-grains',
    categoryName: 'Native Millets',
    price: 120,
    originalPrice: 140,
    weight: '500g',
    stock: 20,
    rating: 4.7,
    reviewsCount: 33,
    badge: 'Native Crop',
    image: '/images/cat-millets.jpg',
    description: 'Ancient drought-resistant cereal grain with rich earthy flavor. Excellent for traditional variety rices, khichdi, and idli batter.',
    ingredients: ['100% Unpolished Kodo Millet Grains']
  },
  {
    id: 'prod-014',
    name: 'Whole Pearl Millet (Kambu)',
    tamilName: 'முழு கம்பு தானியம்',
    category: 'millets-grains',
    categoryName: 'Native Millets',
    price: 95,
    originalPrice: 110,
    weight: '500g',
    stock: 30,
    rating: 4.9,
    reviewsCount: 50,
    badge: 'Heritage Grain',
    image: '/images/cat-millets.jpg',
    description: 'Stone-cleaned native pearl millet seeds. Essential for cooling summer Kambu Koozh (traditional fermented porridge) and rustic rotis.',
    ingredients: ['100% Whole Pearl Millet Grains']
  },
  {
    id: 'prod-015',
    name: 'Homemade Curry Leaf Idli Podi',
    tamilName: 'கருவேப்பிலை இட்லி பொடி',
    category: 'heritage-podis',
    categoryName: 'Heritage Podis',
    price: 130,
    originalPrice: 150,
    weight: '200g',
    stock: 26,
    rating: 4.9,
    reviewsCount: 73,
    badge: 'Small-Batch Roasted',
    image: '/images/prod-podi.jpg',
    description: 'Coarsely ground aromatic gun-powder blend featuring sun-dried native curry leaves, split roasted lentils, red chillies, and white sesame seeds. Perfect companion for hot idlis.',
    ingredients: ['Curry Leaves', 'Urad Dal', 'Chana Dal', 'Dry Red Chillies', 'Sesame Seeds', 'Garlic', 'Rock Salt', 'Asafoetida']
  },
  {
    id: 'prod-016',
    name: 'Traditional Paruppu Podi (Lentil Podi)',
    tamilName: 'பாரம்பரிய பருப்பு பொடி',
    category: 'heritage-podis',
    categoryName: 'Heritage Podis',
    price: 125,
    originalPrice: 140,
    weight: '200g',
    stock: 22,
    rating: 4.8,
    reviewsCount: 41,
    badge: 'Ghee Companion',
    image: '/images/prod-podi.jpg',
    description: 'Slow-roasted roasted gram and toor dal ground with cumin and black peppercorns. Mixed with hot steaming rice and a spoonful of melted ghee.',
    ingredients: ['Roasted Gram (Pottukadalai)', 'Toor Dal', 'Cumin Seeds', 'Black Peppercorns', 'Dry Red Chillies', 'Salt', 'Asafoetida']
  },
  {
    id: 'prod-017',
    name: 'Thinai (Foxtail Millet) Laddu',
    tamilName: 'தினை மாவு லட்டு',
    category: 'millet-sweets',
    categoryName: 'Millet Sweets',
    price: 190,
    originalPrice: 220,
    weight: '200g (6 pcs)',
    stock: 16,
    rating: 4.9,
    reviewsCount: 41,
    badge: 'Jaggery Sweetened',
    image: '/images/prod-laddu.jpg',
    description: 'Nutritious festive laddu made with slow-roasted foxtail millet flour, crushed country jaggery, cardamom, and roasted cashews bound together with pure farm ghee.',
    ingredients: ['Foxtail Millet Flour', 'Country Jaggery (Nattu Sarkarai)', 'Pure Cow Ghee', 'Cashew Nuts', 'Cardamom']
  },
  {
    id: 'prod-018',
    name: 'Traditional Athirasam (Pack of 5)',
    tamilName: 'பாரம்பரிய அதிரசம்',
    category: 'millet-sweets',
    categoryName: 'Millet Sweets',
    price: 175,
    originalPrice: 195,
    weight: '250g',
    stock: 14,
    rating: 4.8,
    reviewsCount: 36,
    badge: 'Festival Classic',
    image: '/images/prod-laddu.jpg',
    description: 'Mouth-melting soft traditional festive sweet prepared from soaked pounded raw rice fermented with melted jaggery syrup and cardamom.',
    ingredients: ['Raw Rice', 'Pure Jaggery', 'Dry Ginger', 'Cardamom', 'Wood-Pressed Groundnut Oil']
  }
];

// Initialize in-memory seed products
const initializeProducts = () => {
  SEED_CATALOG.forEach((item) => {
    const product = {
      ...item,
      isActive: true,
      inStock: (item.stock || 0) > 0,
      images: item.images || [item.image, '/images/hero-banner.jpg', '/images/our-story.jpg'],
      createdAt: new Date('2026-10-01T00:00:00.000Z').toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryProducts.set(product.id, product);
  });
};

initializeProducts();

// Helper to determine next available product ID
const getNextProductId = () => {
  let maxNum = 0;
  for (const id of memoryProducts.keys()) {
    const match = id.match(/^prod-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const nextNum = maxNum + 1;
  return `prod-${String(nextNum).padStart(3, '0')}`;
};

// Retrieve all products with optional filters
export const getAllProductsFromStore = ({
  includeInactive = false,
  category = null,
  search = null,
  stockStatus = null // 'in-stock', 'low-stock', 'out-of-stock'
} = {}) => {
  let list = Array.from(memoryProducts.values());

  if (!includeInactive) {
    list = list.filter((p) => p.isActive !== false);
  }

  if (category && category !== 'all' && category !== 'ALL') {
    list = list.filter((p) => (p.category || '').toLowerCase() === category.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter((p) =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.tamilName || '').toLowerCase().includes(q) ||
      (p.categoryName || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.id || '').toLowerCase().includes(q)
    );
  }

  if (stockStatus) {
    if (stockStatus === 'in-stock') {
      list = list.filter((p) => p.stock > 5);
    } else if (stockStatus === 'low-stock') {
      list = list.filter((p) => p.stock > 0 && p.stock <= 5);
    } else if (stockStatus === 'out-of-stock') {
      list = list.filter((p) => p.stock <= 0);
    }
  }

  return list.map((p) => ({ ...p }));
};

// Retrieve single product
export const getProductByIdFromStore = (id) => {
  if (!id) return null;
  const found = memoryProducts.get(id);
  return found ? { ...found } : null;
};

// Add new product
export const createProductInStore = (productData) => {
  const id = productData.id && !memoryProducts.has(productData.id)
    ? productData.id
    : getNextProductId();

  const stock = Math.max(0, parseInt(productData.stock, 10) || 0);
  const price = Math.max(1, parseFloat(productData.price) || 0);
  const originalPrice = productData.originalPrice ? parseFloat(productData.originalPrice) : null;

  const newProduct = {
    id,
    name: (productData.name || '').trim(),
    tamilName: (productData.tamilName || '').trim(),
    category: (productData.category || 'traditional-snacks').trim(),
    categoryName: (productData.categoryName || '').trim(),
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
    weight: (productData.weight || 'Standard Pack').trim(),
    stock,
    inStock: stock > 0,
    isActive: productData.isActive !== false,
    badge: (productData.badge || '').trim(),
    image: productData.image || '/images/cat-snacks.jpg',
    images: Array.isArray(productData.images) && productData.images.length > 0
      ? productData.images
      : [productData.image || '/images/cat-snacks.jpg', '/images/hero-banner.jpg'],
    description: (productData.description || '').trim(),
    ingredients: Array.isArray(productData.ingredients)
      ? productData.ingredients
      : (typeof productData.ingredients === 'string'
          ? productData.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
          : []),
    rating: typeof productData.rating === 'number' ? productData.rating : 5.0,
    reviewsCount: typeof productData.reviewsCount === 'number' ? productData.reviewsCount : 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  memoryProducts.set(id, newProduct);
  return { ...newProduct };
};

// Edit existing product
export const updateProductInStore = (id, updates) => {
  const existing = memoryProducts.get(id);
  if (!existing) return null;

  const updatedStock = updates.stock !== undefined
    ? Math.max(0, parseInt(updates.stock, 10) || 0)
    : existing.stock;

  const updatedPrice = updates.price !== undefined
    ? Math.max(1, parseFloat(updates.price) || existing.price)
    : existing.price;

  const updatedOriginalPrice = updates.originalPrice !== undefined
    ? (updates.originalPrice ? parseFloat(updates.originalPrice) : null)
    : existing.originalPrice;

  const updatedIngredients = updates.ingredients !== undefined
    ? (Array.isArray(updates.ingredients)
        ? updates.ingredients
        : String(updates.ingredients).split(',').map((s) => s.trim()).filter(Boolean))
    : existing.ingredients;

  const updated = {
    ...existing,
    ...updates,
    id: existing.id, // ID cannot be overwritten
    price: updatedPrice,
    originalPrice: updatedOriginalPrice,
    stock: updatedStock,
    inStock: updatedStock > 0,
    ingredients: updatedIngredients,
    updatedAt: new Date().toISOString()
  };

  if (updates.isActive !== undefined) {
    updated.isActive = Boolean(updates.isActive);
  }

  memoryProducts.set(id, updated);
  return { ...updated };
};

// Quick adjust stock
export const adjustProductStockInStore = (id, delta) => {
  const existing = memoryProducts.get(id);
  if (!existing) return null;

  const change = parseInt(delta, 10) || 0;
  const newStock = Math.max(0, existing.stock + change);

  existing.stock = newStock;
  existing.inStock = newStock > 0;
  existing.updatedAt = new Date().toISOString();

  memoryProducts.set(id, existing);
  return { ...existing };
};

// Set absolute stock
export const setProductStockInStore = (id, targetStock) => {
  const existing = memoryProducts.get(id);
  if (!existing) return null;

  const newStock = Math.max(0, parseInt(targetStock, 10) || 0);
  existing.stock = newStock;
  existing.inStock = newStock > 0;
  existing.updatedAt = new Date().toISOString();

  memoryProducts.set(id, existing);
  return { ...existing };
};

// Deactivate or safe-delete product
// If product has been part of past customer orders, we soft-deactivate it so receipts & order tracking stay 100% intact!
export const deactivateOrDeleteProductInStore = (id, hasOrderHistory = false) => {
  const existing = memoryProducts.get(id);
  if (!existing) return null;

  if (hasOrderHistory) {
    // Preserve customer order integrity by soft-deactivating
    existing.isActive = false;
    existing.updatedAt = new Date().toISOString();
    memoryProducts.set(id, existing);
    return {
      action: 'deactivated',
      product: { ...existing },
      message: `Product "${existing.name}" is referenced in past customer orders and has been safely deactivated to preserve customer receipts and tracking.`
    };
  } else {
    // No past orders reference this product; clean removal is safe
    memoryProducts.delete(id);
    return {
      action: 'deleted',
      product: { ...existing },
      message: `Product "${existing.name}" has been permanently deleted.`
    };
  }
};

// ATOMIC STOCK CHECK & DEDUCTION FOR ORDERS
// Validates ALL items before modifying any stock.
// If any item has insufficient stock, throws an error with item-specific details.
export const deductStockForOrderItemsInStore = (orderItems) => {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return { success: true };
  }

  // 1. Validate availability & stock for ALL items first
  for (const item of orderItems) {
    const prodId = item.productId || item.id;
    const prod = memoryProducts.get(prodId);

    if (!prod) {
      throw new Error(`Product "${prodId}" does not exist in our catalog.`);
    }

    if (!prod.isActive) {
      throw new Error(`Item "${prod.name}" is currently not available for purchase.`);
    }

    const requestedQty = parseInt(item.quantity, 10);
    if (isNaN(requestedQty) || requestedQty <= 0) {
      throw new Error(`Invalid quantity for item "${prod.name}".`);
    }

    if (prod.stock < requestedQty) {
      throw new Error(
        `Insufficient stock for "${prod.name}". Available: ${prod.stock} units (Requested: ${requestedQty}). Please adjust your cart.`
      );
    }
  }

  // 2. Perform atomic deduction
  const deducted = [];
  for (const item of orderItems) {
    const prodId = item.productId || item.id;
    const prod = memoryProducts.get(prodId);
    const requestedQty = parseInt(item.quantity, 10);

    prod.stock = Math.max(0, prod.stock - requestedQty);
    prod.inStock = prod.stock > 0;
    prod.updatedAt = new Date().toISOString();

    memoryProducts.set(prodId, prod);
    deducted.push({
      id: prod.id,
      name: prod.name,
      remainingStock: prod.stock,
      inStock: prod.inStock
    });
  }

  return { success: true, deducted };
};

// RESTORE STOCK (e.g. When an order is Cancelled)
export const restoreStockForOrderItemsInStore = (orderItems) => {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return;
  }

  for (const item of orderItems) {
    const prodId = item.productId || item.id;
    const prod = memoryProducts.get(prodId);
    if (prod) {
      const returnQty = parseInt(item.quantity, 10) || 0;
      prod.stock = prod.stock + returnQty;
      prod.inStock = prod.stock > 0;
      prod.updatedAt = new Date().toISOString();
      memoryProducts.set(prodId, prod);
    }
  }
};
