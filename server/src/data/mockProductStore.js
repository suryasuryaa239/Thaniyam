// In-memory persistent catalog & inventory store for Thaniyam Treats
// Ensures resilient operation with full stock tracking, atomic deduction, and safe deactivation
import {
  isMySQLConnected,
  mysqlGetAllProducts,
  mysqlSaveProduct,
  mysqlUpdateProductStock,
  mysqlDeactivateProduct
} from '../config/mysqlStore.js';

const memoryProducts = new Map();

export const syncProductsFromMySQL = async () => {
  if (!isMySQLConnected()) return;
  try {
    const products = await mysqlGetAllProducts(true);
    if (products && products.length > 0) {
      for (const p of products) {
        memoryProducts.set(p.id, p);
      }
      console.log(`📦 [Store] Synced ${products.length} products from TiDB MySQL into cache.`);
    }
  } catch (err) {
    console.warn('⚠️ [MySQL] syncProducts warning:', err.message);
  }
};

// 74 Authentic seed products with studio white background
export const SEED_CATALOG = [
  {
    "id": "prod-dh-310",
    "name": "Mint Face Pack (Natural Skin Care Powder)",
    "tamilName": "இயற்கை புதினா ஃபேஸ் பேக்",
    "category": "beauty-care",
    "categoryName": "Natural Beauty & Hair Care",
    "price": 180,
    "originalPrice": null,
    "weight": "100g",
    "stock": 1,
    "rating": 4.8,
    "reviewsCount": 50,
    "badge": "",
    "image": "/images/products/mint-face-pack-natural-skin-care-powder.jpg",
    "description": "Refreshing organic mint leaf facial pack crafted to cleanse pores, reduce oiliness, and revitalize tired skin naturally without parabens.",
    "ingredients": [
      "Pure Mint Leaf Powder",
      "Wild Turmeric",
      "Multani Mitti",
      "Neem Leaf Extracts",
      "Rose Petal Powder"
    ]
  },
  {
    "id": "prod-dh-309",
    "name": "Rose Face Pack (Natural Skin Care Powder)",
    "tamilName": "பாரம்பரிய ரோஸ் ஃபேஸ் பேக்",
    "category": "beauty-care",
    "categoryName": "Natural Beauty & Hair Care",
    "price": 180,
    "originalPrice": null,
    "weight": "100g",
    "stock": 10,
    "rating": 4.7,
    "reviewsCount": 37,
    "badge": "",
    "image": "/images/products/rose-face-pack-natural-skin-care-powder.jpg",
    "description": "Aromatic steam-dried organic damask rose petals ground into a gentle skin rejuvenating powder that restores natural radiance and softness.",
    "ingredients": [
      "Damask Rose Petal Powder",
      "Sandalwood Powder",
      "Multani Mitti",
      "Aloe Vera Leaf Powder"
    ]
  },
  {
    "id": "prod-dh-307",
    "name": "Multi Millet Chapati Mix",
    "tamilName": "சிறு தானிய சப்பாத்தி மாவு",
    "category": "chapati-mix",
    "categoryName": "Millet Chapati & Roti Mixes",
    "price": 100,
    "originalPrice": null,
    "weight": "400g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 56,
    "badge": "",
    "image": "/images/products/multi-millet-chapati-mix.jpg",
    "description": "Nutrient-dense whole grain chapati mix combining stone-ground whole wheat with pearl millet, finger millet, and foxtail millet.",
    "ingredients": [
      "Whole Wheat",
      "Kambu (Pearl Millet)",
      "Ragi (Finger Millet)",
      "Thinai (Foxtail Millet)",
      "Flaxseeds"
    ]
  },
  {
    "id": "prod-dh-306",
    "name": "Bamboo Rice Chapati Mix",
    "tamilName": "மூங்கில் அரிசி சப்பாத்தி மாவு",
    "category": "chapati-mix",
    "categoryName": "Millet Chapati & Roti Mixes",
    "price": 80,
    "originalPrice": null,
    "weight": "250g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 43,
    "badge": "",
    "image": "/images/products/bamboo-rice-chapati-mix.jpg",
    "description": "Rare wild bamboo seed grain milled with whole wheat for soft, nutritious chapatis that promote bone strength and joint wellness.",
    "ingredients": [
      "Wild Bamboo Rice",
      "Whole Wheat Grain",
      "Roasted Gram",
      "Cumin"
    ]
  },
  {
    "id": "prod-dh-298",
    "name": "Rathasali Nutrition Mix",
    "tamilName": "ரத்தசாலி பாரம்பரிய சத்து மாவு",
    "category": "health-mix",
    "categoryName": "Health & Nutrition Mixes",
    "price": 390,
    "originalPrice": null,
    "weight": "500g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 29,
    "badge": "",
    "image": "/images/products/rathasali-nutrition-mix.jpg",
    "description": "Sacred red rice variety Rathasali combined with roasted heritage pulses, almonds, and cardamom for iron-rich daily family vitality.",
    "ingredients": [
      "Rathasali Heritage Red Rice",
      "Almonds",
      "Cashews",
      "Roasted Gram",
      "Green Gram",
      "Cardamom",
      "Dry Ginger"
    ]
  },
  {
    "id": "prod-dh-284",
    "name": "Karuppu Kavuni Nutrition MIX",
    "tamilName": "கருப்பு கவுனி சத்து மாவு (ஸ்பெஷல்)",
    "category": "health-mix",
    "categoryName": "Health & Nutrition Mixes",
    "price": 320,
    "originalPrice": null,
    "weight": "500g",
    "stock": 51,
    "rating": 4.9,
    "reviewsCount": 27,
    "badge": "",
    "image": "/images/products/karuppu-kavuni-nutrition-mix.jpg",
    "description": "Royal forbidden black rice packed with natural anti-oxidants, paired with sprouted pulses and dry nuts for morning health drinks.",
    "ingredients": [
      "Karuppu Kavuni Black Rice",
      "Sprouted Ragi",
      "Sprouted Green Gram",
      "Almonds",
      "Cardamom"
    ]
  },
  {
    "id": "prod-dh-283",
    "name": "Siruthaniya Pongal Mix (Multi Millet Pongal Mix)",
    "tamilName": "சிறு தானிய பொங்கல் மிக்ஸ் (மல்டி மில்லட்)",
    "category": "pongal-mix",
    "categoryName": "Millet Pongal Mixes",
    "price": 80,
    "originalPrice": null,
    "weight": "200g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 59,
    "badge": "",
    "image": "/images/products/siruthaniya-pongal-mix-multi-millet-pongal-mix.jpg",
    "description": "Easy-to-cook healthy breakfast blend of mixed millets, roasted moong dal, whole black peppercorns, cumin, and fragrant curry leaves.",
    "ingredients": [
      "Foxtail Millet",
      "Kodo Millet",
      "Little Millet",
      "Split Yellow Moong Dal",
      "Black Peppercorns",
      "Cumin Seeds",
      "Dry Curry Leaves"
    ]
  },
  {
    "id": "prod-dh-282",
    "name": "Kuthiravali Pongal (Barnyard Millet Pongal)",
    "tamilName": "குதிரைவாலி பொங்கல் மிக்ஸ்",
    "category": "pongal-mix",
    "categoryName": "Millet Pongal Mixes",
    "price": 80,
    "originalPrice": null,
    "weight": "200g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 46,
    "badge": "",
    "image": "/images/products/kuthiravali-pongal-barnyard-millet-pongal.jpg",
    "description": "Light, fiber-rich barnyard millet paired with golden moong dal and whole South Indian spices for a comforting breakfast.",
    "ingredients": [
      "Barnyard Millet (Kuthiravali)",
      "Moong Dal",
      "Black Pepper",
      "Cumin",
      "Ginger Flakes",
      "Curry Leaves"
    ]
  },
  {
    "id": "prod-dh-281",
    "name": "Thinai Pongal (Foxtail Millet Pongal)",
    "tamilName": "திணை பொங்கல் மிக்ஸ்",
    "category": "pongal-mix",
    "categoryName": "Millet Pongal Mixes",
    "price": 80,
    "originalPrice": null,
    "weight": "200g",
    "stock": 50,
    "rating": 4.9,
    "reviewsCount": 33,
    "badge": "",
    "image": "/images/products/thinai-pongal-foxtail-millet-pongal.jpg",
    "description": "Nutritious golden foxtail millet and roasted lentils seasoned with classic temple-style spices. Ready in 15 minutes.",
    "ingredients": [
      "Foxtail Millet (Thinai)",
      "Moong Dal",
      "Black Pepper",
      "Cumin Seeds",
      "Asafoetida",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-280",
    "name": "Samai Pongal (Little Millet Pongal)",
    "tamilName": "சாமை பொங்கல் மிக்ஸ்",
    "category": "pongal-mix",
    "categoryName": "Millet Pongal Mixes",
    "price": 80,
    "originalPrice": null,
    "weight": "200g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 65,
    "badge": "",
    "image": "/images/products/samai-pongal-little-millet-pongal.jpg",
    "description": "Delicate little millet grains slow-cooked into comforting ven pongal. Rich in iron, phosphorus, and essential minerals.",
    "ingredients": [
      "Little Millet (Samai)",
      "Moong Dal",
      "Whole Peppercorns",
      "Cumin Seeds",
      "Curry Leaves"
    ]
  },
  {
    "id": "prod-dh-279",
    "name": "Varagu Pongal (Kodo Millet Pongal)",
    "tamilName": "வரகு பொங்கல் மிக்ஸ்",
    "category": "pongal-mix",
    "categoryName": "Millet Pongal Mixes",
    "price": 80,
    "originalPrice": null,
    "weight": "200g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 52,
    "badge": "",
    "image": "/images/products/varagu-pongal-kodo-millet-pongal.jpg",
    "description": "Hearty kodo millet pongal blend providing long-lasting fullness and stable energy throughout busy mornings.",
    "ingredients": [
      "Kodo Millet (Varagu)",
      "Yellow Moong Dal",
      "Cracked Black Pepper",
      "Jeera",
      "Curry Leaves"
    ]
  },
  {
    "id": "prod-dh-277",
    "name": "Himalayan Rock Crystals",
    "tamilName": "இமாலயன் இயற்கை இந்துப்பு தூள்",
    "category": "daily-needs",
    "categoryName": "Natural Sweeteners & Daily Pantry",
    "price": 60,
    "originalPrice": null,
    "weight": "400g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 26,
    "badge": "",
    "image": "/images/products/himalayan-rock-crtstals.jpg",
    "description": "Fine-ground Himalayan pink rock salt for daily culinary seasoning. Enhances digestive enzymes and helps maintain electrolyte balance.",
    "ingredients": [
      "Fine Ground Himalayan Pink Rock Salt"
    ]
  },
  {
    "id": "prod-dh-276",
    "name": "Himalayan Rock Salt (Indhu Uppu)",
    "tamilName": "சிவப்பு அரிசி பாரம்பரிய அவல்",
    "category": "daily-needs",
    "categoryName": "Natural Sweeteners & Daily Pantry",
    "price": 65,
    "originalPrice": null,
    "weight": "400g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 58,
    "badge": "",
    "image": "/images/products/himalayan-salt-crtstal.jpg",
    "description": "Nutritious flattened rice flakes prepared from native unpolished red paddy. Excellent for quick upma, porridge, and healthy evening snacks.",
    "ingredients": [
      "100% Unpolished Native Red Rice Poha Flakes"
    ]
  },
  {
    "id": "prod-dh-275",
    "name": "Red Rice Aval (Sivappu Arisi Aval)",
    "tamilName": "உடன்குடி பனை சர்க்கரை",
    "category": "daily-needs",
    "categoryName": "Natural Sweeteners & Daily Pantry",
    "price": 45,
    "originalPrice": null,
    "weight": "300g",
    "stock": 50,
    "rating": 4.9,
    "reviewsCount": 45,
    "badge": "",
    "image": "/images/products/red-rice-aval-sivappu-arisi-aval.jpg",
    "description": "Traditional unrefined palm sap sugar granules naturally boiled down without synthetic bleaching agents or chemicals.",
    "ingredients": [
      "100% Pure Organic Palm Sap Extract (Panai Sarkarai)"
    ]
  },
  {
    "id": "prod-dh-274",
    "name": "Palm Sugar (Panai Sarkarai)",
    "tamilName": "இயற்கை தென்னை சர்க்கரை",
    "category": "daily-needs",
    "categoryName": "Natural Sweeteners & Daily Pantry",
    "price": 70,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 32,
    "badge": "",
    "image": "/images/products/palm-sugar-panai-sarkarai.jpg",
    "description": "Caramel-noted coconut flower blossom nectar sugar. A premium low-GI sweetener for coffee, baking, and traditional desserts.",
    "ingredients": [
      "Pure Coconut Blossom Nectar Granules"
    ]
  },
  {
    "id": "prod-dh-273",
    "name": "Coconut Sugar (Thennai Sarkarai)",
    "tamilName": "பாரம்பரிய நாட்டு சர்க்கரை (அச்சு வெல்லம் தூள்)",
    "category": "daily-needs",
    "categoryName": "Natural Sweeteners & Daily Pantry",
    "price": 70,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 64,
    "badge": "",
    "image": "/images/products/coconut-sugar-thennai-sarkarai.jpg",
    "description": "Golden cane jaggery powder slow-clarified with okra juice and sun-dried. Perfect everyday alternative to refined white sugar.",
    "ingredients": [
      "Unrefined Organic Sugarcane Juice Concentrate"
    ]
  },
  {
    "id": "prod-dh-272",
    "name": "Country Sugar (Nattu Sarkarai / Jaggery Powder)",
    "tamilName": "தூய கஸ்தூரி மஞ்சள் தூள்",
    "category": "daily-needs",
    "categoryName": "Natural Sweeteners & Daily Pantry",
    "price": 60,
    "originalPrice": null,
    "weight": "450g",
    "stock": 50,
    "rating": 4.9,
    "reviewsCount": 51,
    "badge": "",
    "image": "/images/products/country-sugar-nattu-sarkarai-jaggery-powder.jpg",
    "description": "Non-staining wild aroma turmeric (Curcuma aromatica) traditionally known for acne prevention, blemish clearance, and glowing skin tone.",
    "ingredients": [
      "100% Sun-Dried Wild Kasturi Turmeric Roots"
    ]
  },
  {
    "id": "prod-dh-271",
    "name": "Palm Sugar Crystal (Panangarkandu)",
    "tamilName": "பாரம்பரிய வாசனை நலங்கு மாவு",
    "category": "daily-needs",
    "categoryName": "Natural Sweeteners & Daily Pantry",
    "price": 80,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 38,
    "badge": "",
    "image": "/images/products/palm-sugar-crystal-panangarkandu.jpg",
    "description": "Ancient Ayurvedic bath powder formulated with 18 sacred cooling herbs, vetiver, rose petals, and green gram for daily royal skin care.",
    "ingredients": [
      "Green Gram",
      "Wild Turmeric",
      "Rose Petals",
      "Vetiver (Khus)",
      "Bavanchi Seeds",
      "Poolankizhangu",
      "Neem Leaves"
    ]
  },
  {
    "id": "prod-dh-270",
    "name": "Palm Candy (Panangarkandu)",
    "tamilName": "இயற்கை மூலிகை ஃபேஸ் க்ளென்சர்",
    "category": "daily-needs",
    "categoryName": "Natural Sweeteners & Daily Pantry",
    "price": 240,
    "originalPrice": null,
    "weight": "300g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 25,
    "badge": "",
    "image": "/images/products/palm-candy-panangarkandu.jpg",
    "description": "Mild foaming daily face and body cleanser formulated entirely from saponin-rich botanical berries, fenugreek, and tulsi leaves.",
    "ingredients": [
      "Green Gram Powder",
      "Kasturi Turmeric",
      "Tulsi Leaves",
      "Fenugreek Powder",
      "Amla Fruit"
    ]
  },
  {
    "id": "prod-dh-269",
    "name": "Kodampuli",
    "tamilName": "இயற்கை முல்தானி மிட்டி தூள்",
    "category": "daily-needs",
    "categoryName": "Natural Sweeteners & Daily Pantry",
    "price": 60,
    "originalPrice": null,
    "weight": "50g",
    "stock": 50,
    "rating": 4.9,
    "reviewsCount": 57,
    "badge": "",
    "image": "/images/products/kodampuli.jpg",
    "description": "Micro-fine organic Fuller’s Earth clay that draws out deep-seated impurities, regulates sebum production, and tightens pores.",
    "ingredients": [
      "100% Pure Natural Mineral Fuller’s Earth (Multani Mitti)"
    ]
  },
  {
    "id": "prod-dh-268",
    "name": "Thooyamalli Kozhukattai Flour",
    "tamilName": "இயற்கை ஆரஞ்சு ஃபேஸ் பேக்",
    "category": "puttu-mix",
    "categoryName": "Puttu & Kozhukattai Flours",
    "price": 60,
    "originalPrice": null,
    "weight": "250g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 44,
    "badge": "",
    "image": "/images/products/thooyamalli-kozhukattai-flour.jpg",
    "description": "Sun-ripened orange peel extract rich in bio-flavonoids and Vitamin C to combat tanning, brighten dull skin, and impart natural radiance.",
    "ingredients": [
      "Organic Orange Peel Powder",
      "Multani Mitti",
      "Kasturi Manjal",
      "Rose Petals"
    ]
  },
  {
    "id": "prod-dh-267",
    "name": "Poongar Rice Kozhukattai &amp; Idiyappam Flour",
    "tamilName": "பூங்கார் பாரம்பரிய சத்து மாவு",
    "category": "puttu-mix",
    "categoryName": "Puttu & Kozhukattai Flours",
    "price": 60,
    "originalPrice": null,
    "weight": "250g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 31,
    "badge": "",
    "image": "/images/products/poongar-rice-kozhukattai-idiyappam-flour.jpg",
    "description": "Traditional Poongar red rice specially renowned for supporting women’s hormonal health, milled with nutritious nuts and millets.",
    "ingredients": [
      "Poongar Heritage Rice",
      "Foxtail Millet",
      "Sprouted Wheat",
      "Badam",
      "Pista",
      "Cardamom"
    ]
  },
  {
    "id": "prod-dh-266",
    "name": "Idiyappam Kolukattai Maavu (Rice Flour Mix)",
    "tamilName": "நவதானிய ஆரோக்கிய சத்து மாவு",
    "category": "puttu-mix",
    "categoryName": "Puttu & Kozhukattai Flours",
    "price": 50,
    "originalPrice": null,
    "weight": "450g",
    "stock": 50,
    "rating": 4.9,
    "reviewsCount": 63,
    "badge": "",
    "image": "/images/products/idiyappam-kolukattai-maavu-rice-flour-mix.jpg",
    "description": "Time-tested 9-grain traditional mix featuring nine sprouted grains and lentils carefully slow-roasted to preserve essential nutrients.",
    "ingredients": [
      "Paddy",
      "Wheat",
      "Moong Dal",
      "Chana Dal",
      "Toor Dal",
      "Urad Dal",
      "Sesame",
      "Horse Gram",
      "Kidney Beans",
      "Nuts",
      "Cardamom"
    ]
  },
  {
    "id": "prod-dh-265",
    "name": "Sukku Malli Coffee (Herbal Coffee Mix)",
    "tamilName": "சிறு தானிய நல்வாழ்வு சத்து மாவு",
    "category": "tea-mix",
    "categoryName": "Herbal Teas & Beverages",
    "price": 60,
    "originalPrice": null,
    "weight": "50g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 50,
    "badge": "",
    "image": "/images/products/sukku-malli-coffee-herbal-coffee-mix.jpg",
    "description": "Wholesome porridge blend of five unpolished native millets and dry fruits, delivering low-glycemic sustained daily stamina.",
    "ingredients": [
      "Thinai",
      "Samai",
      "Varagu",
      "Kuthiravali",
      "Kambu",
      "Ragi",
      "Almonds",
      "Dry Ginger",
      "Cardamom"
    ]
  },
  {
    "id": "prod-dh-264",
    "name": "Masala Milk Mix",
    "tamilName": "கருப்பு கவுனி ஊட்டச்சத்து மாவு",
    "category": "tea-mix",
    "categoryName": "Herbal Teas & Beverages",
    "price": 60,
    "originalPrice": null,
    "weight": "50g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 37,
    "badge": "",
    "image": "/images/products/masala-milk-mix.jpg",
    "description": "Nutritious breakfast porridge mix crafted from heirloom Karuppu Kavuni rice, dry fruits, and aromatic Sukku for gentle digestion.",
    "ingredients": [
      "Karuppu Kavuni Rice",
      "Roasted Bengal Gram",
      "Cashews",
      "Almonds",
      "Cardamom",
      "Dry Ginger (Sukku)"
    ]
  },
  {
    "id": "prod-dh-263",
    "name": "Masala Tea Mix",
    "tamilName": "உடன்குடி பனங்கற்கண்டு (100g)",
    "category": "tea-mix",
    "categoryName": "Herbal Teas & Beverages",
    "price": 60,
    "originalPrice": null,
    "weight": "50g",
    "stock": 50,
    "rating": 4.9,
    "reviewsCount": 69,
    "badge": "",
    "image": "/images/products/masala-tea-mix-masala-milk-mix.jpg",
    "description": "Cooling crystalized palm sugar crystals traditionally enjoyed with warm turmeric milk to relieve cold, cough, and throat irritation.",
    "ingredients": [
      "Pure Crystallized Palm Sugar (Panangarkandu)"
    ]
  },
  {
    "id": "prod-dh-262",
    "name": "Energy Beet Haemomalt",
    "tamilName": "பாரம்பரிய உடன்குடி பனங்கற்கண்டு (300g)",
    "category": "tea-mix",
    "categoryName": "Herbal Teas & Beverages",
    "price": 150,
    "originalPrice": null,
    "weight": "150g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 56,
    "badge": "",
    "image": "/images/products/energy-beet-haemomalt.jpg",
    "description": "Authentic large crystal palm sugar from coastal Udangudi palm groves. Rich in calcium, iron, and natural vitamin B complex.",
    "ingredients": [
      "Crystallized Palm Tree Sap"
    ]
  },
  {
    "id": "prod-dh-261",
    "name": "Pudina Idli Podi (Mint Idli Powder)",
    "tamilName": "மலபார் குடம்புளி (கார்சீனியா)",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 43,
    "badge": "",
    "image": "/images/products/pudina-idli-podi-mint-idli-powder.jpg",
    "description": "Sun-smoked Garcinia gummi-gutta (Malabar tamarind) pods used in traditional coastal curries for authentic tangy flavor and weight management.",
    "ingredients": [
      "Sun-Dried Smoked Garcinia Cambogia (Kodampuli) Pods"
    ]
  },
  {
    "id": "prod-dh-260",
    "name": "Kara Idli Podi (Spicy Idli Powder)",
    "tamilName": "தூயமல்லி அரிசி கொழுக்கட்டை மாவு",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.9,
    "reviewsCount": 30,
    "badge": "",
    "image": "/images/products/kara-idli-podi-spicy-idli-powder.jpg",
    "description": "Naturally fragrant native Thooyamalli rice steam-processed and milled for feather-soft modaks, kozhukattai, and sweet dumplings.",
    "ingredients": [
      "Thooyamalli Heritage Rice Flour"
    ]
  },
  {
    "id": "prod-dh-259",
    "name": "Pirandai Idli Powder (Veld Grape Idli Podi)",
    "tamilName": "பூங்கார் அரிசி கொழுக்கட்டை & இடியாப்ப மாவு",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 62,
    "badge": "",
    "image": "/images/products/pirandai-idli-powder-veld-grape-idli-podi.jpg",
    "description": "Fine roasted Poongar rice flour perfect for string hoppers (idiyappam) and savory steamed kozhukattai with gentle red hue.",
    "ingredients": [
      "Poongar Heritage Red Rice Flour"
    ]
  },
  {
    "id": "prod-dh-258",
    "name": "Mudakathan Keerai Idli Powder (Balloon Vine Idli Podi)",
    "tamilName": "பாரம்பரிய இடியாப்ப கொழுக்கட்டை மாவு",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 49,
    "badge": "",
    "image": "/images/products/mudakathan-keerai-idli-powder-balloon-vine-idli-podi.jpg",
    "description": "Triple-sifted classic rice flour blend prepared for tear-free non-sticky idiyappam strings and festival kozhukattai.",
    "ingredients": [
      "Wet-Ground Sun-Dried Raw Rice Flour"
    ]
  },
  {
    "id": "prod-dh-257",
    "name": "Murungai Keerai Idli Powder (Drumstick Leaves Idli Podi)",
    "tamilName": "பாரம்பரிய சுக்கு மல்லி காபி தூள்",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.9,
    "reviewsCount": 36,
    "badge": "",
    "image": "/images/products/murungai-keerai-idli-powder-drumstick-leaves-idli-podi.jpg",
    "description": "Comforting herbal wellness decoction blending sun-dried ginger (sukku), roasted coriander seeds, black pepper, and cardamom.",
    "ingredients": [
      "Dry Ginger (Sukku)",
      "Coriander Seeds (Malli)",
      "Black Pepper",
      "Tulsi",
      "Cardamom",
      "Cloves"
    ]
  },
  {
    "id": "prod-dh-256",
    "name": "Karuveppilai Idli Powder (Curry Leaves Idli Podi)",
    "tamilName": "ஆரோக்கிய மசாலா பால் மிக்ஸ்",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 68,
    "badge": "",
    "image": "/images/products/karuveppilai-idli-powder-curry-leaves-idli-podi.jpg",
    "description": "Healing bedtime golden milk mix packed with pure Salem turmeric, saffron strands, nutmeg, crushed almonds, and black pepper.",
    "ingredients": [
      "Salem Turmeric",
      "Almonds",
      "Nutmeg (Jathikai)",
      "Cardamom",
      "Black Pepper",
      "Saffron"
    ]
  },
  {
    "id": "prod-dh-255",
    "name": "Karuppu Ulundhu Idli Powder (Black Urad Dal Idli Podi)",
    "tamilName": "கிராமத்து மசாலா டீ மிக்ஸ்",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 55,
    "badge": "",
    "image": "/images/products/karuppu-ulundhu-idli-powder-black-urad-dal-idli-podi.jpg",
    "description": "Warm whole spice blend for chai lovers featuring crushed ceylon cinnamon, green cardamom, star anise, and cloves.",
    "ingredients": [
      "Cardamom",
      "Cinnamon",
      "Cloves",
      "Ginger",
      "Star Anise",
      "Fennel Seeds"
    ]
  },
  {
    "id": "prod-dh-254",
    "name": "Indian Pennywort Idli Powder (Vallarai Idli Podi)",
    "tamilName": "இயற்கை பீட்ரூட் மால்ட் (ஹீமோமால்ட்)",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.9,
    "reviewsCount": 42,
    "badge": "",
    "image": "/images/products/indian-pennywort-idli-powder-vallarai-idli-podi.jpg",
    "description": "Nutritious beverage blend of sun-dehydrated fresh beetroot, sprouted wheat malt, roasted cashews, and palm jaggery. Boosts hemoglobin naturally.",
    "ingredients": [
      "Fresh Beetroot Concentrate",
      "Almonds",
      "Cashews",
      "Sprouted Wheat",
      "Country Jaggery",
      "Cardamom"
    ]
  },
  {
    "id": "prod-dh-253",
    "name": "White Sesame Seed Idli Podi (Vellai Ellu Idli Powder)",
    "tamilName": "மணமணக்கும் புதினா இட்லி பொடி",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 60,
    "rating": 4.8,
    "reviewsCount": 29,
    "badge": "",
    "image": "/images/products/white-sesame-seed-idli-podi-vellai-ellu-idli-powder.jpg",
    "description": "Aromatic idli podi crafted with sun-dried garden mint leaves, roasted urad dal, chana dal, and red chillies. Superb with hot idlis and sesame oil.",
    "ingredients": [
      "Dried Mint Leaves",
      "Urad Dal",
      "Chana Dal",
      "Red Chillies",
      "White Sesame",
      "Asafoetida",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-252",
    "name": "Garlic Idli Podi (Poondu Idli Powder)",
    "tamilName": "காரசார இட்லி பொடி (ஸ்பெஷல்)",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 61,
    "badge": "",
    "image": "/images/products/garlic-idli-podi-poondu-idli-powder.jpg",
    "description": "Spicy Chettinad-style gunpowder roasted with Guntur red chillies, fragrant garlic flakes, curry leaves, and split black lentils.",
    "ingredients": [
      "Urad Dal",
      "Chana Dal",
      "Guntur Red Chillies",
      "Garlic",
      "Curry Leaves",
      "Asafoetida",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-251",
    "name": "Climbing Brinjal Idli Podi (Thuthuvalai Idli Powder)",
    "tamilName": "பாரம்பரிய பிரண்டை இட்லி பொடி",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 40,
    "rating": 4.9,
    "reviewsCount": 48,
    "badge": "",
    "image": "/images/products/climbing-brinjal-idli-podi-thuthuvalai-idli-powder.jpg",
    "description": "Medicinal Veld Grape (Pirandai) slow-roasted in cold-pressed sesame oil to eliminate itching and blended with spiced lentils. Relieves joint pain.",
    "ingredients": [
      "Roasted Pirandai (Cissus Quadrangularis)",
      "Urad Dal",
      "Chana Dal",
      "Red Chillies",
      "Sesame",
      "Rock Salt"
    ]
  },
  {
    "id": "prod-dh-250",
    "name": "Paruppu Podi (Lentil Spice Powder)",
    "tamilName": "முடக்கத்தான் கீரை இட்லி பொடி",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 35,
    "badge": "",
    "image": "/images/products/paruppu-podi-lentil-spice-powder.jpg",
    "description": "Balloon Vine greens revered in Siddha medicine for alleviating joint stiffness and arthritis, roasted into a delectable daily tiffin podi.",
    "ingredients": [
      "Mudakathan Keerai (Balloon Vine)",
      "Urad Dal",
      "Chana Dal",
      "Cumin",
      "Red Chillies",
      "Asafoetida",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-249",
    "name": "Flax Seed Dal Rice Mix (Aali Vidhai Paruppu Sadha Podi)",
    "tamilName": "முருங்கைக்கீரை சத்து இட்லி பொடி",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 67,
    "badge": "",
    "image": "/images/products/flax-seed-dal-rice-mix-aali-vidhai-paruppu-sadha-podi.jpg",
    "description": "Nutrient-packed drumstick leaves sun-dried and pounded with roasted lentils, garlic, and cumin. Natural multivitamin seasoning.",
    "ingredients": [
      "Moringa (Drumstick) Leaves",
      "Split Urad Dal",
      "Bengal Gram",
      "Red Chillies",
      "Garlic",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-248",
    "name": "Turmeric Powder",
    "tamilName": "மணக்கும் கருவேப்பிலை இட்லி பொடி",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 30,
    "originalPrice": null,
    "weight": "50g",
    "stock": 40,
    "rating": 4.9,
    "reviewsCount": 54,
    "badge": "",
    "image": "/images/products/turmeric-powder.jpg",
    "description": "Fresh country curry leaves slow-roasted with black sesame, pepper, and lentils. Promotes hair shine, gut digestion, and eye wellness.",
    "ingredients": [
      "Farm Fresh Curry Leaves",
      "Urad Dal",
      "Black Sesame Seeds",
      "Black Pepper",
      "Red Chillies",
      "Asafoetida"
    ]
  },
  {
    "id": "prod-dh-247",
    "name": "Sukku Podi (Dry Ginger Powder)",
    "tamilName": "பூங்கார் அரிசி புட்டு மாவு",
    "category": "heritage-podis",
    "categoryName": "Heritage Podis & Masalas",
    "price": 60,
    "originalPrice": null,
    "weight": "50g",
    "stock": 40,
    "rating": 4.8,
    "reviewsCount": 41,
    "badge": "",
    "image": "/images/products/sukku-podi-dry-ginger-powder.jpg",
    "description": "Coarse ground roasted Poongar rice meal designed for aromatic, crumbly traditional puttu layered with freshly grated coconut.",
    "ingredients": [
      "Roasted Poongar Rice Flour",
      "Cardamom Hint"
    ]
  },
  {
    "id": "prod-dh-245",
    "name": "BLACK URAD DHALL TRADITIONAL RICE KANJI MIX",
    "tamilName": "சிவப்பு அரிசி புட்டு மாவு",
    "category": "kanji-mix",
    "categoryName": "Traditional Kanji & Porridge",
    "price": 110,
    "originalPrice": null,
    "weight": "250g",
    "stock": 50,
    "rating": 4.9,
    "reviewsCount": 60,
    "badge": "",
    "image": "/images/products/black-urad-dhall-traditional-rice-kanji-mix.jpg",
    "description": "Wholesome red bran rice flour steam-roasted to perfection. Mix with warm water and ghee for wholesome morning tiffin.",
    "ingredients": [
      "Native Red Rice Flour"
    ]
  },
  {
    "id": "prod-dh-244",
    "name": "Venthayakali 500gms",
    "tamilName": "கருப்பு கவுனி அரிசி புட்டு மாவு",
    "category": "kali-mix",
    "categoryName": "Traditional Kali Mixes",
    "price": 160,
    "originalPrice": null,
    "weight": "500g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 47,
    "badge": "",
    "image": "/images/products/venthayakali-500gms.jpg",
    "description": "Exotic nutty black rice puttu flour that steams into a deep purple festive delicacy naturally rich in bio-antioxidants.",
    "ingredients": [
      "Karuppu Kavuni Black Rice",
      "Aromatic Cardamom"
    ]
  },
  {
    "id": "prod-dh-243",
    "name": "venthayakali 250gms",
    "tamilName": "கருப்பு உளுந்து இட்லி பொடி (தோல் உளுந்து)",
    "category": "kali-mix",
    "categoryName": "Traditional Kali Mixes",
    "price": 80,
    "originalPrice": null,
    "weight": "250g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 34,
    "badge": "",
    "image": "/images/products/venthayakali-250gms.jpg",
    "description": "Whole unpolished black urad dal with nutritious skin intact, dry-roasted with red chillies and asafoetida. Excellent for back strength.",
    "ingredients": [
      "Whole Black Gram (Karuppu Ulundhu)",
      "Chana Dal",
      "Red Chillies",
      "Curry Leaves",
      "Asafoetida",
      "Rock Salt"
    ]
  },
  {
    "id": "prod-dh-242",
    "name": "ULUTHANKALI (500GMS)",
    "tamilName": "வல்லாரை கீரை இட்லி பொடி",
    "category": "kali-mix",
    "categoryName": "Traditional Kali Mixes",
    "price": 160,
    "originalPrice": null,
    "weight": "500g",
    "stock": 50,
    "rating": 4.9,
    "reviewsCount": 66,
    "badge": "",
    "image": "/images/products/uluthankali-500gms.jpg",
    "description": "Memory-enhancing Indian Pennywort (Brahmi/Vallarai) leaves gently roasted and combined with spiced dal for sharp focus and calm mind.",
    "ingredients": [
      "Vallarai Leaves (Centella Asiatica)",
      "Urad Dal",
      "Chana Dal",
      "Dry Red Chillies",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-241",
    "name": "Ulundhu Kali",
    "tamilName": "வெள்ளை எள்ளு இட்லி பொடி",
    "category": "kali-mix",
    "categoryName": "Traditional Kali Mixes",
    "price": 80,
    "originalPrice": null,
    "weight": "250g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 53,
    "badge": "",
    "image": "/images/products/ulundhu-kali.jpg",
    "description": "Calcium-dense white sesame seeds toasted until nutty and fragrant, blended with spiced lentils for an authentic Tanjore-style idli podi.",
    "ingredients": [
      "White Sesame Seeds (Vellai Ellu)",
      "Urad Dal",
      "Chana Dal",
      "Dry Chillies",
      "Asafoetida",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-240",
    "name": "Shikakai Powder (Natural Herbal Hair Cleanser)",
    "tamilName": "நாட்டு பூண்டு இட்லி பொடி",
    "category": "beauty-care",
    "categoryName": "Natural Beauty & Hair Care",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 40,
    "badge": "",
    "image": "/images/products/shikakai-powder-natural-herbal-hair-cleanser.jpg",
    "description": "Roasted hill garlic cloves crushed with spicy lentils and red chillies. Stimulates appetite, supports healthy cholesterol and digestion.",
    "ingredients": [
      "Native Country Garlic (Poondu)",
      "Urad Dal",
      "Chana Dal",
      "Red Chillies",
      "Curry Leaves",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-239",
    "name": "Papaya Face Pack (Natural Skin Brightening Pack)",
    "tamilName": "தூதுவளை மூலிகை இட்லி பொடி",
    "category": "beauty-care",
    "categoryName": "Natural Beauty & Hair Care",
    "price": 180,
    "originalPrice": null,
    "weight": "100g",
    "stock": 51,
    "rating": 4.9,
    "reviewsCount": 27,
    "badge": "",
    "image": "/images/products/papaya-face-pack-natural-skin-brightening-pack.jpg",
    "description": "Climbing Brinjal (Thuthuvalai) medicinal leaves celebrated in Tamil home remedies for clear throat, respiratory comfort, and immunity.",
    "ingredients": [
      "Thuthuvalai Leaves",
      "Urad Dal",
      "Black Peppercorns",
      "Cumin",
      "Red Chillies",
      "Asafoetida",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-238",
    "name": "Kasthuri Manjal Powder (Wild Turmeric Powder)",
    "tamilName": "பாரம்பரிய பருப்பு சாத பொடி",
    "category": "beauty-care",
    "categoryName": "Natural Beauty & Hair Care",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 51,
    "rating": 4.8,
    "reviewsCount": 59,
    "badge": "",
    "image": "/images/products/kasthuri-manjal-powder-wild-turmeric-powder.jpg",
    "description": "Classic roasted toor dal and roasted gram powder seasoned with cumin and black pepper. Stir into hot steamed rice with a dollop of ghee.",
    "ingredients": [
      "Toor Dal",
      "Roasted Gram (Pottukadalai)",
      "Cumin Seeds",
      "Black Peppercorns",
      "Red Chillies",
      "Asafoetida",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-237",
    "name": "Nalangu Maavu (Herbal Bath Powder)",
    "tamilName": "ஆளி விதை பருப்பு சாத பொடி (Flaxseed)",
    "category": "beauty-care",
    "categoryName": "Natural Beauty & Hair Care",
    "price": 60,
    "originalPrice": null,
    "weight": "100g",
    "stock": 51,
    "rating": 4.7,
    "reviewsCount": 46,
    "badge": "",
    "image": "/images/products/nalangu-maavu-herbal-bath-powder.jpg",
    "description": "Heart-healthy golden roasted flaxseeds blended with aromatic lentils and mild spices to accompany steaming hot rice and ghee.",
    "ingredients": [
      "Golden Flaxseeds (Aali Vidhai)",
      "Toor Dal",
      "Chana Dal",
      "Pepper",
      "Cumin",
      "Red Chillies",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-236",
    "name": "Natural Cleanser (Herbal Face &amp; Skin Cleanser Powder)",
    "tamilName": "தூய சேலம் மஞ்சள் தூள்",
    "category": "beauty-care",
    "categoryName": "Natural Beauty & Hair Care",
    "price": 80,
    "originalPrice": null,
    "weight": "100g",
    "stock": 51,
    "rating": 4.9,
    "reviewsCount": 33,
    "badge": "",
    "image": "/images/products/natural-cleanser-herbal-face-skin-cleanser-powder.jpg",
    "description": "High-curcumin unpolished Salem farm turmeric fingers ground to fine golden powder without artificial colors or lead chromate.",
    "ingredients": [
      "100% Pure Salem Turmeric Roots"
    ]
  },
  {
    "id": "prod-dh-235",
    "name": "Multani Mitti (Fuller’s Earth Face Pack Powder)",
    "tamilName": "நாட்டு சுக்கு பொடி (சுக்கு தூள்)",
    "category": "beauty-care",
    "categoryName": "Natural Beauty & Hair Care",
    "price": 99,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 65,
    "badge": "",
    "image": "/images/products/multani-mitti-fullers-earth-face-pack-powder.jpg",
    "description": "Sun-dried natural ginger root powder. Mix with warm water, honey, or milk to soothe upset stomach, nausea, and morning heaviness.",
    "ingredients": [
      "100% Sun-Dried Ginger (Sukku)"
    ]
  },
  {
    "id": "prod-dh-234",
    "name": "Orange Face Pack (Natural Skin Care Powder)",
    "tamilName": "கருப்பு உளுந்து பாரம்பரிய அரிசி கஞ்சி மிக்ஸ்",
    "category": "beauty-care",
    "categoryName": "Natural Beauty & Hair Care",
    "price": 180,
    "originalPrice": null,
    "weight": "100g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 52,
    "badge": "",
    "image": "/images/products/orange-face-pack-natural-skin-care-powder.jpg",
    "description": "Nourishing porridge blend of unpolished whole black gram, garlic flakes, fenugreek, and native rice. Legendary Tamil strengthening kanji.",
    "ingredients": [
      "Whole Black Urad Dal",
      "Native Rice",
      "Fenugreek Seeds",
      "Dry Ginger",
      "Garlic Flakes",
      "Cardamom"
    ]
  },
  {
    "id": "prod-dh-233",
    "name": "Poongar Puttu",
    "tamilName": "நாட்டு வெந்தயக்களி மிக்ஸ் (500g)",
    "category": "puttu-mix",
    "categoryName": "Puttu & Kozhukattai Flours",
    "price": 80,
    "originalPrice": null,
    "weight": "300g",
    "stock": 50,
    "rating": 4.9,
    "reviewsCount": 39,
    "badge": "",
    "image": "/images/products/poongar-puttu.jpg",
    "description": "Authentic cooling fenugreek porridge flour mix. Cook with sesame oil and palm jaggery for traditional weekly body heat relief.",
    "ingredients": [
      "Raw Rice Flour",
      "Fenugreek (Vendhayam)",
      "Urad Dal",
      "Cardamom"
    ]
  },
  {
    "id": "prod-dh-232",
    "name": "Mappilai Samba Puttu",
    "tamilName": "நாட்டு வெந்தயக்களி மிக்ஸ் (250g)",
    "category": "puttu-mix",
    "categoryName": "Puttu & Kozhukattai Flours",
    "price": 70,
    "originalPrice": null,
    "weight": "250g",
    "stock": 50,
    "rating": 4.8,
    "reviewsCount": 26,
    "badge": "",
    "image": "/images/products/mappilai-samba-puttu.jpg",
    "description": "Convenient 250g pack of traditional Vendhaya Kali flour for authentic South Indian sweet porridge. Balances pitta and relieves internal heat.",
    "ingredients": [
      "Raw Rice Flour",
      "Fenugreek (Vendhayam)",
      "Urad Dal",
      "Cardamom"
    ]
  },
  {
    "id": "prod-dh-231",
    "name": "Red Rice Puttu maavu",
    "tamilName": "கருப்பு உளுந்தங்களி மிக்ஸ் (500g)",
    "category": "puttu-mix",
    "categoryName": "Puttu & Kozhukattai Flours",
    "price": 50,
    "originalPrice": null,
    "weight": "250g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 58,
    "badge": "",
    "image": "/images/products/red-rice-puttu-maavu.jpg",
    "description": "Classic Chettinad Ulunthangali mix featuring roasted black gram and raw rice. Prepared with cold-pressed gingelly oil and palm karupatti.",
    "ingredients": [
      "Roasted Whole Black Gram",
      "Raw Rice",
      "Cardamom",
      "Dry Ginger"
    ]
  },
  {
    "id": "prod-dh-230",
    "name": "Karuppu Kavuni Puttu Maavu",
    "tamilName": "கருப்பு உளுந்தங்களி மிக்ஸ் (250g)",
    "category": "puttu-mix",
    "categoryName": "Puttu & Kozhukattai Flours",
    "price": 130,
    "originalPrice": null,
    "weight": "300g",
    "stock": 50,
    "rating": 4.9,
    "reviewsCount": 45,
    "badge": "",
    "image": "/images/products/karuppu-kavuni-puttu-maavu.jpg",
    "description": "250g authentic black lentil pudding mix. Renowned across Tamil Nadu for bone density, lower back wellness, and growing teenagers.",
    "ingredients": [
      "Roasted Whole Black Gram",
      "Raw Rice",
      "Cardamom",
      "Dry Ginger"
    ]
  },
  {
    "id": "prod-dh-229",
    "name": "Poongar Kanji",
    "tamilName": "Poongar Kanji",
    "category": "kanji-mix",
    "categoryName": "Traditional Kanji & Porridge",
    "price": 110,
    "originalPrice": null,
    "weight": "250g",
    "stock": 40,
    "rating": 4.8,
    "reviewsCount": 32,
    "badge": "",
    "image": "/images/products/poongar-kanji.jpg",
    "description": "Pure authentic Poongar Kanji prepared in traditional South Indian style with zero chemical preservatives and native sourcing.",
    "ingredients": [
      "Natural Farm-Grown Ingredients",
      "Traditional Spices"
    ]
  },
  {
    "id": "prod-dh-228",
    "name": "Kattuyanam Kanji",
    "tamilName": "Kattuyanam Kanji",
    "category": "kanji-mix",
    "categoryName": "Traditional Kanji & Porridge",
    "price": 110,
    "originalPrice": null,
    "weight": "250g",
    "stock": 40,
    "rating": 4.7,
    "reviewsCount": 64,
    "badge": "",
    "image": "/images/products/kattuyanam-kanji.jpg",
    "description": "Pure authentic Kattuyanam Kanji prepared in traditional South Indian style with zero chemical preservatives and native sourcing.",
    "ingredients": [
      "Natural Farm-Grown Ingredients",
      "Traditional Spices"
    ]
  },
  {
    "id": "prod-dh-227",
    "name": "Barley Kanji",
    "tamilName": "Barley Kanji",
    "category": "kanji-mix",
    "categoryName": "Traditional Kanji & Porridge",
    "price": 110,
    "originalPrice": null,
    "weight": "250g",
    "stock": 40,
    "rating": 4.9,
    "reviewsCount": 51,
    "badge": "",
    "image": "/images/products/barley-kanji.jpg",
    "description": "Pure authentic Barley Kanji prepared in traditional South Indian style with zero chemical preservatives and native sourcing.",
    "ingredients": [
      "Natural Farm-Grown Ingredients",
      "Traditional Spices"
    ]
  },
  {
    "id": "prod-dh-226",
    "name": "Mappilai Samba Kanji",
    "tamilName": "Mappilai Samba Kanji",
    "category": "kanji-mix",
    "categoryName": "Traditional Kanji & Porridge",
    "price": 110,
    "originalPrice": null,
    "weight": "250g",
    "stock": 40,
    "rating": 4.8,
    "reviewsCount": 38,
    "badge": "",
    "image": "/images/products/mappilai-samba-kanji.jpg",
    "description": "Pure authentic Mappilai Samba Kanji prepared in traditional South Indian style with zero chemical preservatives and native sourcing.",
    "ingredients": [
      "Natural Farm-Grown Ingredients",
      "Traditional Spices"
    ]
  },
  {
    "id": "prod-dh-225",
    "name": "Karuppu Kavuni Kanji",
    "tamilName": "Karuppu Kavuni Kanji",
    "category": "kanji-mix",
    "categoryName": "Traditional Kanji & Porridge",
    "price": 180,
    "originalPrice": null,
    "weight": "250g",
    "stock": 40,
    "rating": 4.7,
    "reviewsCount": 25,
    "badge": "",
    "image": "/images/products/karuppu-kavuni-kanji.jpg",
    "description": "Pure authentic Karuppu Kavuni Kanji prepared in traditional South Indian style with zero chemical preservatives and native sourcing.",
    "ingredients": [
      "Natural Farm-Grown Ingredients",
      "Traditional Spices"
    ]
  },
  {
    "id": "prod-dh-224",
    "name": "Chola Milagu Dosa Mix (Sorghum Pepper Dosa Mix)",
    "tamilName": "Chola Milagu Dosa Mix (Sorghum Pepper Dosa Mix)",
    "category": "dosa-mix",
    "categoryName": "Traditional Dosa & Adai Mixes",
    "price": 60,
    "originalPrice": null,
    "weight": "200g",
    "stock": 30,
    "rating": 4.9,
    "reviewsCount": 57,
    "badge": "",
    "image": "/images/products/chola-milagu-dosa-mix-sorghum-pepper-dosa-mix.jpg",
    "description": "Pure authentic Chola Milagu Dosa Mix (Sorghum Pepper Dosa Mix) prepared in traditional South Indian style with zero chemical preservatives and native sourcing.",
    "ingredients": [
      "Natural Farm-Grown Ingredients",
      "Traditional Spices"
    ]
  },
  {
    "id": "prod-dh-223",
    "name": "Palathaniya Adai Mix (Multi Grain Adai Mix)",
    "tamilName": "சோள மிளகு கார தோசை மிக்ஸ்",
    "category": "dosa-mix",
    "categoryName": "Traditional Dosa & Adai Mixes",
    "price": 60,
    "originalPrice": null,
    "weight": "200g",
    "stock": 30,
    "rating": 4.8,
    "reviewsCount": 44,
    "badge": "",
    "image": "/images/products/palathaniya-adai-mix-multi-grain-adai-mix.jpg",
    "description": "Crispy wholesome dosa mix blending whole sorghum (cholam) with crushed black pepper and cumin. Naturally gluten-friendly and satisfying.",
    "ingredients": [
      "Sorghum (Cholam) Flour",
      "Rice Flour",
      "Urad Dal",
      "Cracked Black Pepper",
      "Cumin Seeds",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-222",
    "name": "Kuthiravali Murungai Dosa (Barnyard Millet with Drumstick Leaves)",
    "tamilName": "பாரம்பரிய பலதானிய அடை மிக்ஸ்",
    "category": "dosa-mix",
    "categoryName": "Traditional Dosa & Adai Mixes",
    "price": 60,
    "originalPrice": null,
    "weight": "200g",
    "stock": 30,
    "rating": 4.7,
    "reviewsCount": 31,
    "badge": "",
    "image": "/images/products/kuthiravali-murungai-dosa-barnyard-millet-with-drumstick-leaves.jpg",
    "description": "Thick, crunchy traditional South Indian Adai mix combining four wholesome lentils, native millets, dried red chillies, and asafoetida.",
    "ingredients": [
      "Toor Dal",
      "Chana Dal",
      "Urad Dal",
      "Moong Dal",
      "Raw Rice",
      "Red Chillies",
      "Fennel",
      "Asafoetida",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-221",
    "name": "Varagu Mudakkathan Dosa (Kodo Millet with Mudakkathan)",
    "tamilName": "குதிரைவாலி முருங்கைக்கீரை தோசை மிக்ஸ்",
    "category": "dosa-mix",
    "categoryName": "Traditional Dosa & Adai Mixes",
    "price": 60,
    "originalPrice": null,
    "weight": "200g",
    "stock": 30,
    "rating": 4.9,
    "reviewsCount": 63,
    "badge": "",
    "image": "/images/products/varagu-mudakkathan-dosa-kodo-millet-with-mudakkathan.jpg",
    "description": "Barnyard millet infused with fresh drumstick greens (moringa). Flips into crispy golden dosas loaded with iron, calcium, and vitamin A.",
    "ingredients": [
      "Barnyard Millet (Kuthiravali)",
      "Dehydrated Moringa Leaves",
      "Urad Dal",
      "Rice",
      "Jeera",
      "Pepper",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-220",
    "name": "Samai Vallarai Dosa (Little Millet with Vallarai)",
    "tamilName": "வரகு முடக்கத்தான் கீரை தோசை மிக்ஸ்",
    "category": "dosa-mix",
    "categoryName": "Traditional Dosa & Adai Mixes",
    "price": 60,
    "originalPrice": null,
    "weight": "200g",
    "stock": 30,
    "rating": 4.8,
    "reviewsCount": 50,
    "badge": "",
    "image": "/images/products/samai-vallarai-dosa-little-millet-with-vallarai.jpg",
    "description": "Kodo millet blended with medicinal balloon vine greens. Promotes flexibility and eases stiff morning joints while tasting remarkably delicious.",
    "ingredients": [
      "Kodo Millet (Varagu)",
      "Mudakathan Keerai",
      "Urad Dal",
      "Cumin",
      "Pepper",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-219",
    "name": "Keppai Dosai (Ragi Dosa)",
    "tamilName": "சாமை வல்லாரை கீரை தோசை மிக்ஸ்",
    "category": "dosa-mix",
    "categoryName": "Traditional Dosa & Adai Mixes",
    "price": 60,
    "originalPrice": null,
    "weight": "200g",
    "stock": 30,
    "rating": 4.7,
    "reviewsCount": 37,
    "badge": "",
    "image": "/images/products/keppai-dosai-ragi-dosa.jpg",
    "description": "Delicate Little Millet combined with memory-enhancing Vallarai (Brahmi). Delicious golden dosas that kids and elders love alike.",
    "ingredients": [
      "Little Millet (Samai)",
      "Vallarai Leaf Powder",
      "Urad Dal",
      "Rice Flour",
      "Cumin",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-218",
    "name": "Kambu Dosa (Pearl Millet Dosa)",
    "tamilName": "கேப்பை பாரம்பரிய தோசை மிக்ஸ் (ராகி தோசை)",
    "category": "dosa-mix",
    "categoryName": "Traditional Dosa & Adai Mixes",
    "price": 60,
    "originalPrice": null,
    "weight": "200g",
    "stock": 30,
    "rating": 4.9,
    "reviewsCount": 69,
    "badge": "",
    "image": "/images/products/kambu-dosa-pearl-millet-dosa.jpg",
    "description": "Calcium-dense finger millet (ragi) dosa mix that crisps up beautifully on cast iron tawas with a spoonful of cold-pressed sesame oil.",
    "ingredients": [
      "Finger Millet (Ragi / Keppai) Flour",
      "Rice Flour",
      "Urad Dal",
      "Cumin Seeds",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-217",
    "name": "Poongar Nutrition Mix",
    "tamilName": "கம்பு பாரம்பரிய தோசை மிக்ஸ் (முத்து சோளம்)",
    "category": "health-mix",
    "categoryName": "Health & Nutrition Mixes",
    "price": 320,
    "originalPrice": null,
    "weight": "500g",
    "stock": 40,
    "rating": 4.8,
    "reviewsCount": 56,
    "badge": "",
    "image": "/images/products/poongar-nutrition-mix.jpg",
    "description": "Rustic pearl millet (kambu) flour mixed with lentils and whole spices for hearty, gut-friendly dosas full of iron and clean minerals.",
    "ingredients": [
      "Pearl Millet (Kambu) Flour",
      "Rice Flour",
      "Split Black Gram",
      "Cumin",
      "Salt"
    ]
  },
  {
    "id": "prod-dh-216",
    "name": "Navathaniya Nutrition Mix",
    "tamilName": "பூங்கார் பாரம்பரிய அரிசி கஞ்சி",
    "category": "health-mix",
    "categoryName": "Health & Nutrition Mixes",
    "price": 220,
    "originalPrice": null,
    "weight": "500g",
    "stock": 30,
    "rating": 4.7,
    "reviewsCount": 43,
    "badge": "",
    "image": "/images/products/navathaniya-nutrition-mix.jpg",
    "description": "Easily digestible healing kanji prepared from heirloom Poongar rice and cumin. Ideal for nursing mothers and revitalizing convalescents.",
    "ingredients": [
      "Poongar Heritage Rice",
      "Cumin Seeds",
      "Garlic",
      "Fenugreek",
      "Himalayan Salt"
    ]
  },
  {
    "id": "prod-dh-215",
    "name": "Multi Millet Nutrition Mix",
    "tamilName": "காட்டுயானம் பாரம்பரிய அரிசி கஞ்சி",
    "category": "health-mix",
    "categoryName": "Health & Nutrition Mixes",
    "price": 280,
    "originalPrice": null,
    "weight": "500g",
    "stock": 30,
    "rating": 4.9,
    "reviewsCount": 30,
    "badge": "",
    "image": "/images/products/multi-millet-nutrition-mix.jpg",
    "description": "Ancient giant rice variety Kattuyanam (so tall it conceals an elephant) packed with anti-diabetic micronutrients and slow-burning complex carbs.",
    "ingredients": [
      "Kattuyanam Wild Rice Grain",
      "Roasted Moong Dal",
      "Black Peppercorns",
      "Cumin"
    ]
  },
  {
    "id": "prod-dh-213",
    "name": "Karupu Kavuni Nutrition Mix",
    "tamilName": "மாப்பிள்ளை சம்பா சத்து கஞ்சி",
    "category": "health-mix",
    "categoryName": "Health & Nutrition Mixes",
    "price": 320,
    "originalPrice": null,
    "weight": "500g",
    "stock": 50,
    "rating": 4.7,
    "reviewsCount": 49,
    "badge": "",
    "image": "/images/products/karupu-kavuni-nutrition-mix.jpg",
    "description": "Hearty restorative porridge crafted from red Mappillai Samba rice and roasted pulses. Builds natural core stamina and nerve strength.",
    "ingredients": [
      "Mappillai Samba Rice",
      "Green Gram",
      "Cracked Pepper",
      "Garlic",
      "Salt"
    ]
  }
];

SEED_CATALOG.forEach((item) => {
  memoryProducts.set(item.id, {
    ...item,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

export const getAllProductsFromStore = (includeInactive = false) => {
  const all = Array.from(memoryProducts.values());
  if (includeInactive) return all;
  return all.filter((p) => p.isActive !== false);
};

export const getProductByIdFromStore = (id) => {
  const product = memoryProducts.get(id);
  return product && product.isActive !== false ? product : null;
};

export const saveProductInStore = async (productData) => {
  const now = new Date().toISOString();
  const id = productData.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

  const existing = memoryProducts.get(id) || {};
  const merged = {
    ...existing,
    ...productData,
    id,
    isActive: productData.isActive !== undefined ? Boolean(productData.isActive) : true,
    rating: Number(productData.rating || existing.rating || 4.8),
    reviewsCount: Number(productData.reviewsCount || existing.reviewsCount || 0),
    stock: Number(productData.stock !== undefined ? productData.stock : (existing.stock || 0)),
    price: Number(productData.price || existing.price || 0),
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
    createdAt: existing.createdAt || now,
    updatedAt: now
  };

  memoryProducts.set(id, merged);

  if (isMySQLConnected()) {
    try {
      await mysqlSaveProduct(merged);
    } catch (err) {
      console.warn('⚠️ [MySQL] Failed to persist product to database:', err.message);
    }
  }

  return merged;
};

export const updateProductStockInStore = async (id, newStock) => {
  const product = memoryProducts.get(id);
  if (!product) return null;

  const validStock = Math.max(0, Number(newStock));
  product.stock = validStock;
  product.updatedAt = new Date().toISOString();
  memoryProducts.set(id, product);

  if (isMySQLConnected()) {
    try {
      await mysqlUpdateProductStock(id, validStock);
    } catch (err) {
      console.warn('⚠️ [MySQL] Failed to update product stock:', err.message);
    }
  }

  return product;
};

export const deactivateProductInStore = async (id) => {
  const product = memoryProducts.get(id);
  if (!product) return false;

  product.isActive = false;
  product.updatedAt = new Date().toISOString();
  memoryProducts.set(id, product);

  if (isMySQLConnected()) {
    try {
      await mysqlDeactivateProduct(id);
    } catch (err) {
      console.warn('⚠️ [MySQL] Failed to deactivate product:', err.message);
    }
  }

  return true;
};

export const deductStockForOrder = async (items) => {
  for (const item of items) {
    const product = memoryProducts.get(item.productId);
    if (!product || product.stock < item.quantity) {
      return {
        success: false,
        failedItem: item.name || item.productId,
        available: product ? product.stock : 0,
        requested: item.quantity
      };
    }
  }

  for (const item of items) {
    const product = memoryProducts.get(item.productId);
    product.stock = Math.max(0, product.stock - item.quantity);
    product.updatedAt = new Date().toISOString();
    memoryProducts.set(item.productId, product);

    if (isMySQLConnected()) {
      mysqlUpdateProductStock(item.productId, product.stock).catch((err) => {
        console.warn(`⚠️ [MySQL] Async stock deduction failed for ${item.productId}:`, err.message);
      });
    }
  }

  return { success: true };
};
