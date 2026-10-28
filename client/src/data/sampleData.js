// Sample data for Thaniyam Treats MVP Landing Page
// Clearly marked development placeholder data representing authentic traditional South Indian food catalog

export const CATEGORIES = [
  {
    id: 'millets-grains',
    name: 'Native Millets & Grains',
    tamilName: 'சிறு தானியங்கள்',
    description: 'Unpolished foxtail, kodo, barnyard & little millets rich in dietary fiber.',
    itemCount: '8 Products',
    image: '/images/cat-millets.jpg',
  },
  {
    id: 'traditional-snacks',
    name: 'Traditional Savory Snacks',
    tamilName: 'பாரம்பரிய நொறுக்குத்தீனிகள்',
    description: 'Crispy hand-twisted kai murukku, crunchy thattai, and savory seedai.',
    itemCount: '12 Products',
    image: '/images/cat-snacks.jpg',
  },
  {
    id: 'wood-pressed-oils',
    name: 'Wood-Pressed Oils (Marachekku)',
    tamilName: 'மரச்செக்கு நல்லெண்ணெய்',
    description: 'Slow-extracted sesame, groundnut, and coconut oils without heat or chemicals.',
    itemCount: '6 Products',
    image: '/images/cat-oils.jpg',
  },
  {
    id: 'natural-sweeteners',
    name: 'Natural Palm Sweeteners',
    tamilName: 'உடன்குடி பனைக்கருப்பட்டி',
    description: 'Pure, authentic palm jaggery (Karupatti) and crystallised palm sugar candy.',
    itemCount: '5 Products',
    image: '/images/cat-jaggery.jpg',
  },
  {
    id: 'heritage-podis',
    name: 'Heritage Podis & Masalas',
    tamilName: 'பாரம்பரிய இட்லி பொடி',
    description: 'Slow-roasted lentil podis, curry leaf mixes, and authentic sambar blends.',
    itemCount: '9 Products',
    image: '/images/prod-podi.jpg',
  },
  {
    id: 'millet-sweets',
    name: 'Millet Sweets & Delights',
    tamilName: 'தானிய இனிப்புகள்',
    description: 'Traditional laddu and festive treats naturally sweetened with palm jaggery.',
    itemCount: '7 Products',
    image: '/images/prod-laddu.jpg',
  },
];

export const FEATURED_PRODUCTS = [
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
    image: '/images/products/kai-murukku.jpg',
    description: 'Authentic hand-pressed spiral murukku prepared with premium rice flour, roasted urad dal, cumin seeds, and a hint of asafoetida. Deep fried in pure wood-pressed groundnut oil for signature crunch.',
    ingredients: ['Raw Rice Flour', 'Roasted Urad Dal Flour', 'Butter', 'Cumin Seeds', 'Asafoetida', 'Salt', 'Wood-Pressed Groundnut Oil']
  },
  {
    id: 'prod-002',
    name: 'Marachekku Sesame Oil',
    tamilName: 'மரச்செக்கு நல்லெண்ணெய்',
    category: 'wood-pressed-oils',
    categoryName: 'Wood-Pressed Oils',
    price: 290,
    originalPrice: 320,
    weight: '500ml',
    rating: 5.0,
    reviewsCount: 88,
    badge: 'Pure Wood-Pressed',
    image: '/images/products/sesame-oil.jpg',
    description: 'Extracted slowly using traditional Vaagai wood cold press (Marachekku). Preserves all natural aroma, golden color, and nutrients without refining, bleaching, or chemical de-odorizing.',
    ingredients: ['100% Native Black Sesame Seeds', 'Pure Palm Jaggery (as natural processing aid)']
  },
  {
    id: 'prod-003',
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
    image: '/images/products/palm-jaggery.jpg',
    description: 'Handcrafted solid blocks of genuine Karupatti boiled from fresh palmyra palm sap in Udangudi. Free from white sugar adulteration, sodium bicarbonate, or artificial clarifying agents.',
    ingredients: ['100% Clarified Palmyra Palm Sap', 'Dry Ginger', 'Cardamom']
  },
  {
    id: 'prod-004',
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
    image: '/images/products/thinai-laddu.jpg',
    description: 'Nutritious festive laddu made with slow-roasted foxtail millet flour, crushed country jaggery, cardamom, and roasted cashews bound together with pure farm ghee.',
    ingredients: ['Foxtail Millet Flour', 'Country Jaggery (Nattu Sarkarai)', 'Pure Cow Ghee', 'Cashew Nuts', 'Cardamom']
  },
  {
    id: 'prod-005',
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
    image: '/images/products/curry-leaf-podi.jpg',
    description: 'Coarsely ground aromatic gun-powder blend featuring sun-dried native curry leaves, split roasted lentils, red chillies, and white sesame seeds. Perfect companion for hot idlis and dosas.',
    ingredients: ['Curry Leaves', 'Urad Dal', 'Chana Dal', 'Dry Red Chillies', 'Sesame Seeds', 'Garlic', 'Rock Salt', 'Asafoetida']
  },
  {
    id: 'prod-006',
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
    image: '/images/products/thinai-millet.jpg',
    description: 'Cleaned and unpolished whole foxtail millet grain with natural bran intact. Ideal alternative to white polished rice for making traditional upma, pongal, or wholesome daily porridge.',
    ingredients: ['100% Unpolished Foxtail Millet Grains']
  }
];

export const WHY_US_POINTS = [
  {
    icon: 'CookingPot',
    title: 'Authentic Heritage Recipes',
    description: 'Crafted following time-tested ancestral techniques to retain original village flavors and distinct textures.'
  },
  {
    icon: 'Wheat',
    title: 'Native Agricultural Sourcing',
    description: 'Carefully sourced raw millets and oilseeds from regional farming clusters across Tamil Nadu.'
  },
  {
    icon: 'Sparkles',
    title: 'Fresh Small-Batch Preparation',
    description: 'Prepared in small batches rather than mass factory production to preserve peak crispness and aroma.'
  },
  {
    icon: 'ShieldCheck',
    title: 'Zero Artificial Additives',
    description: 'Free from synthetic colorants, chemical flavor enhancers, or artificial chemical preservatives.'
  }
];
