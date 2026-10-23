import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  tamilName: {
    type: String,
    default: ''
  },
  weight: {
    type: String,
    default: ''
  },
  unitPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  lineTotal: {
    type: Number,
    required: true
  }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customer: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    mobile: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      default: ''
    },
    addressLine: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    deliveryNotes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  items: {
    type: [OrderItemSchema],
    required: true,
    validate: [array => array.length > 0, 'Order must contain at least one product']
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    shippingCharges: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  payment: {
    method: {
      type: String,
      default: 'Pay on Delivery / Manual Confirmation'
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Paid'],
      default: 'Pending'
    }
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'],
    default: 'Placed'
  }
}, {
  timestamps: true
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;
