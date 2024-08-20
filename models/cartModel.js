const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Customer',
      required: [true, 'Cart must belong to a customer'],
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Cart must belong to a product'],
    },
    quantity: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  {
    timestamps: true,
  },
);

// Parent relationship virtual populate
cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'productId',
    select: '-__v',
  });
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
