// Thaniyam Treats - Expanded Product Catalog
// Development mock data clearly separated for MVP Step 4
// Authentic South Indian traditional food catalog with real heritage items

export const SHOP_CATEGORIES = [
  { id: 'all', name: 'All Products', tamilName: 'அனைத்து பொருட்கள்', icon: '✨', image: '/images/hero-banner.jpg', description: 'Complete traditional pantry collection' },
  { id: 'millets-grains', name: 'Native Millets & Grains', tamilName: 'சிறு தானியங்கள்', icon: '🌾', image: '/images/cat-millets.jpg', description: 'Unpolished native grains rich in fiber' },
  { id: 'traditional-snacks', name: 'Traditional Savory Snacks', tamilName: 'பாரம்பரிய நொறுக்குத்தீனிகள்', icon: '🥨', image: '/images/cat-snacks.jpg', description: 'Wood-pressed oil fried crunchy snacks' },
  { id: 'wood-pressed-oils', name: 'Wood-Pressed Oils', tamilName: 'மரச்செக்கு எண்ணெய்', icon: '🫒', image: '/images/cat-oils.jpg', description: 'Vaagai Marachekku cold-pressed unrefined oils' },
  { id: 'natural-sweeteners', name: 'Natural Palm Sweeteners', tamilName: 'உடன்குடி பனைக்கருப்பட்டி', icon: '🍯', image: '/images/cat-jaggery.jpg', description: 'Authentic Udangudi Karupatti & Panang Karkandu' },
  { id: 'heritage-podis', name: 'Heritage Podis & Masalas', tamilName: 'பாரம்பரிய பொடிகள்', icon: '🌶️', image: '/images/prod-podi.jpg', description: 'Stone-pounded aromatic lentil idli podis' },
  { id: 'millet-sweets', name: 'Millet Sweets & Delights', tamilName: 'தானிய இனிப்புகள்', icon: '🍬', image: '/images/prod-laddu.jpg', description: 'Jaggery-sweetened festive traditional sweets' }
];

export const ALL_PRODUCTS = [
  // 1. Traditional Savory Snacks
  {
    id: 'prod-001',
    name: 'Handcrafted Kai Murukku',
    tamilName: 'பாரம்பரிய கை முறுக்கு',
    category: 'traditional-snacks',
    categoryName: 'Traditional Snacks',
    price: 140,
    originalPrice: 160,
    weight: '250g',
    rating: 4.9,
    reviewsCount: 64,
    badge: 'Bestseller',
    highlight: 'Pure Butter & Wood-Pressed Oil',
    image: '/images/products/kai-murukku.jpg',
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
    rating: 4.8,
    reviewsCount: 47,
    badge: 'Spicy & Crispy',
    highlight: 'Chana Dal & Curry Leaves',
    image: '/images/products/spicy-thattai.jpg',
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
    rating: 4.7,
    reviewsCount: 38,
    badge: 'Village Special',
    highlight: 'Country Butter & Roasted Sesame',
    image: '/images/products/traditional-seedai.jpg',
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
    rating: 4.9,
    reviewsCount: 56,
    badge: 'Millet Rich',
    highlight: 'Pearl Millet & Black Pepper',
    image: '/images/products/kambu-murukku.jpg',
    description: 'Wholesome savory murukku blending native pearl millet flour with rice flour and black pepper for a deeply savory crunch.',
    ingredients: ['Pearl Millet (Kambu) Flour', 'Rice Flour', 'Roasted Gram Flour', 'Black Pepper', 'Cumin', 'Sesame Seeds', 'Groundnut Oil']
  },

  // 2. Wood-Pressed Oils
  {
    id: 'prod-005',
    name: 'Marachekku Sesame Oil (Gingelly)',
    tamilName: 'மரச்செக்கு நல்லெண்ணெய்',
    category: 'wood-pressed-oils',
    categoryName: 'Wood-Pressed Oils',
    price: 290,
    originalPrice: 320,
    weight: '500ml',
    rating: 5.0,
    reviewsCount: 88,
    badge: 'Pure Wood-Pressed',
    highlight: 'Vaagai Chekku • Unrefined',
    image: '/images/products/sesame-oil.jpg',
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
    rating: 4.9,
    reviewsCount: 62,
    badge: 'Cold Pressed',
    highlight: 'Sun-Dried Pollachi Groundnuts',
    image: '/images/products/groundnut-oil.jpg',
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
    rating: 4.8,
    reviewsCount: 45,
    badge: 'Unrefined',
    highlight: 'Sulfur-Free Pollachi Copra',
    image: '/images/products/coconut-oil.jpg',
    description: 'Extracted from sulfur-free sun-dried copra (coconut meat) from Pollachi farms. Pure, crystal clear, and full of natural aroma.',
    ingredients: ['100% Sun-Dried Coconut Copra']
  },

  // 3. Natural Sweeteners
  {
    id: 'prod-008',
    name: 'Authentic Udangudi Palm Jaggery',
    tamilName: 'உடன்குடி பனைக்கருப்பட்டி',
    category: 'natural-sweeteners',
    categoryName: 'Natural Sweeteners',
    price: 260,
    originalPrice: 280,
    weight: '500g',
    rating: 4.8,
    reviewsCount: 52,
    badge: 'Heritage Sourced',
    highlight: '100% Pure Palmyra Sap',
    image: '/images/products/palm-jaggery.jpg',
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
    rating: 4.9,
    reviewsCount: 34,
    badge: 'Natural Crystal',
    highlight: 'Naturally Crystallized Sap',
    image: '/images/products/palm-candy.jpg',
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
    rating: 4.7,
    reviewsCount: 51,
    badge: 'Chemical Free',
    highlight: 'Zero Sulfur Clarification',
    image: '/images/products/nattu-sarkarai.jpg',
    description: 'Pure, chemical-free cane jaggery powder traditionally clarified using plant extracts. Perfect wholesome daily sweetener for tea and coffee.',
    ingredients: ['100% Fresh Sugarcane Juice', 'Vegetable Clarifying Extract']
  },

  // 4. Native Millets & Grains
  {
    id: 'prod-011',
    name: 'Unpolished Foxtail Millet (Thinai)',
    tamilName: 'தீட்டப்படாத தினை அரிசி',
    category: 'millets-grains',
    categoryName: 'Native Millets',
    price: 110,
    originalPrice: 130,
    weight: '500g',
    rating: 4.8,
    reviewsCount: 39,
    badge: 'Whole Grain',
    highlight: 'Bran Intact • Low Glycemic',
    image: '/images/products/thinai-millet.jpg',
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
    rating: 4.8,
    reviewsCount: 42,
    badge: 'High Fiber',
    highlight: 'Ancient Iron-Rich Grain',
    image: '/images/products/samai-millet.jpg',
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
    rating: 4.7,
    reviewsCount: 33,
    badge: 'Native Crop',
    highlight: 'Ancient Drought-Tolerant',
    image: '/images/products/varagu-millet.jpg',
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
    rating: 4.9,
    reviewsCount: 50,
    badge: 'Heritage Grain',
    highlight: 'Cooling Summer Superfood',
    image: '/images/products/kambu-grain.jpg',
    description: 'Stone-cleaned native pearl millet seeds. Essential for cooling summer Kambu Koozh (traditional fermented porridge) and rustic rotis.',
    ingredients: ['100% Whole Pearl Millet Grains']
  },

  // 5. Heritage Podis & Masalas
  {
    id: 'prod-015',
    name: 'Homemade Curry Leaf Idli Podi',
    tamilName: 'கருவேப்பிலை இட்லி பொடி',
    category: 'heritage-podis',
    categoryName: 'Heritage Podis',
    price: 130,
    originalPrice: 150,
    weight: '200g',
    rating: 4.9,
    reviewsCount: 73,
    badge: 'Small-Batch Roasted',
    highlight: 'Fresh Karuveppilai & Urad Dal',
    image: '/images/products/curry-leaf-podi.jpg',
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
    rating: 4.8,
    reviewsCount: 41,
    badge: 'Ghee Companion',
    highlight: 'Roasted Gram & Black Pepper',
    image: '/images/products/paruppu-podi.jpg',
    description: 'Slow-roasted roasted gram and toor dal ground with cumin and black peppercorns. Mixed with hot steaming rice and a spoonful of melted ghee.',
    ingredients: ['Roasted Gram (Pottukadalai)', 'Toor Dal', 'Cumin Seeds', 'Black Peppercorns', 'Dry Red Chillies', 'Salt', 'Asafoetida']
  },

  // 6. Millet Sweets & Delights
  {
    id: 'prod-017',
    name: 'Thinai (Foxtail Millet) Laddu',
    tamilName: 'தினை மாவு லட்டு',
    category: 'millet-sweets',
    categoryName: 'Millet Sweets',
    price: 190,
    originalPrice: 220,
    weight: '200g (6 pcs)',
    rating: 4.9,
    reviewsCount: 41,
    badge: 'Jaggery Sweetened',
    highlight: 'Pure Cow Ghee & Cashews',
    image: '/images/products/thinai-laddu.jpg',
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
    rating: 4.8,
    reviewsCount: 36,
    badge: 'Festival Classic',
    highlight: 'Fermented Palm Jaggery Dough',
    image: '/images/products/athirasam.jpg',
    description: 'Mouth-melting soft traditional festive sweet prepared from soaked pounded raw rice fermented with melted jaggery syrup and cardamom.',
    ingredients: ['Raw Rice', 'Pure Jaggery', 'Dry Ginger', 'Cardamom', 'Wood-Pressed Groundnut Oil']
  }
];

// Helper functions for Product Details Page (Step 5)
export const getProductById = (id) => {
  const prod = ALL_PRODUCTS.find((p) => p.id === id);
  if (!prod) return null;
  // Ensure images array exists for gallery thumbnails
  return {
    ...prod,
    inStock: true,
    stockStatus: 'In Stock',
    images: prod.images || [
      prod.image,
      '/images/hero-banner.jpg',
      '/images/our-story.jpg'
    ]
  };
};

export const getRelatedProducts = (currentProductId, categoryId, limit = 4) => {
  return ALL_PRODUCTS
    .filter((p) => p.category === categoryId && p.id !== currentProductId)
    .slice(0, limit);
};
