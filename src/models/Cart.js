const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    discountPrice: {
      type: Number,
      default: 0
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalPrice: {
    type: Number,
    default: 0
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  finalPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalPrice = this.items.reduce((sum, item) => sum + item.price, 0);
  this.totalDiscount = this.items.reduce((sum, item) => {
    const discount = item.discountPrice > 0 ? (item.price - item.discountPrice) : 0;
    return sum + discount;
  }, 0);
  this.finalPrice = this.items.reduce((sum, item) => {
    const price = item.discountPrice > 0 ? item.discountPrice : item.price;
    return sum + price;
  }, 0);
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

