import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  tamilName: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  categoryName: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 1
  },
  originalPrice: {
    type: Number,
    default: null
  },
  weight: {
    type: String,
    default: '250g'
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 20
  },
  inStock: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  image: {
    type: String,
    default: '/images/cat-snacks.jpg'
  },
  images: {
    type: [String],
    default: []
  },
  badge: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 4.8
  },
  reviewsCount: {
    type: Number,
    default: 25
  },
  description: {
    type: String,
    default: ''
  },
  ingredients: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Auto-sync inStock flag with stock count before saving
ProductSchema.pre('save', function (next) {
  this.inStock = this.stock > 0;
  next();
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;
