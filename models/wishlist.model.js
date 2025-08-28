const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "Customer",
      required: [true, "Wishlist must belong to a customer"],
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Wishlist must belong to a product"],
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
  }
);

// Parent relationship virtual populate
wishlistSchema.pre(/^find/, function (next) {
  this.populate({
    path: "productId",
    select: "-__v",
  });
  next();
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
module.exports = Wishlist;
