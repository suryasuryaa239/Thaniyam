import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'thaniyam_lang';

const STRINGS = {
  en: {
    home: 'Home',
    shop: 'Shop',
    categories: 'Categories',
    ourStory: 'Our Story',
    trackOrder: 'Track Order',
    searchPlaceholder: 'Search products...',
    heroBadge: 'Handcrafted Traditional Heritage',
    heroLine1: 'Authentic Traditional Flavours, Crafted from',
    heroHighlight: 'Native Millets',
    heroSub:
      'Unpolished native grains, wood-pressed pure oils, hand-twisted crispy murukku and authentic palm jaggery, made with time-honoured ancestral recipes.',
    shopNow: 'Shop Now',
    learnMore: 'Learn More',
    featuredTitle: 'Featured Products',
    featuredSub: 'Pure South Indian snacks, unpolished grains and pantry staples, made in small batches.',
    addToCart: 'Add To Cart',
    soldOut: 'Sold Out',
    featured: 'FEATURED',
    sale: 'SALE',
    quantity: 'Quantity',
    products: 'Products',
    wishlistTitle: 'My Wishlist',
    wishlistEmpty: 'Your wishlist is empty. Tap the heart on any product to save it here.',
    continueShopping: 'Continue Shopping',
  },
  ta: {
    home: 'முகப்பு',
    shop: 'கடை',
    categories: 'வகைகள்',
    ourStory: 'எங்கள் கதை',
    trackOrder: 'ஆர்டர் நிலை',
    searchPlaceholder: 'பொருட்களைத் தேடுங்கள்...',
    heroBadge: 'கைவினை பாரம்பரிய சுவை',
    heroLine1: 'உண்மையான பாரம்பரிய சுவை, உருவாக்கப்பட்டது',
    heroHighlight: 'சிறு தானியங்களால்',
    heroSub:
      'பாலிஷ் செய்யாத சிறு தானியங்கள், மரச்செக்கு எண்ணெய்கள், கை முறுக்கு மற்றும் உண்மையான பனை கருப்பட்டி, பாரம்பரிய முறையில் தயாரிக்கப்பட்டது.',
    shopNow: 'இப்போது வாங்குங்கள்',
    learnMore: 'மேலும் அறிக',
    featuredTitle: 'சிறப்புப் பொருட்கள்',
    featuredSub: 'தூய தென்னிந்திய நொறுக்குத்தீனிகள், தானியங்கள் மற்றும் மளிகைப் பொருட்கள்.',
    addToCart: 'கார்ட்டில் சேர்',
    soldOut: 'தீர்ந்துவிட்டது',
    featured: 'சிறப்பு',
    sale: 'தள்ளுபடி',
    quantity: 'அளவு',
    products: 'பொருட்கள்',
    wishlistTitle: 'என் விருப்பப் பட்டியல்',
    wishlistEmpty: 'விருப்பப் பட்டியல் காலியாக உள்ளது. எந்த பொருளிலும் இதய குறியை அழுத்தி சேமிக்கவும்.',
    continueShopping: 'தொடர்ந்து வாங்குங்கள்',
  },
};

function loadInitial() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'ta' ? 'ta' : 'en';
  } catch {
    return 'en';
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang === 'ta' ? 'ta' : 'en';
  }, [lang]);

  const toggleLang = useCallback(() => setLang((l) => (l === 'en' ? 'ta' : 'en')), []);
  const t = useCallback((key) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
