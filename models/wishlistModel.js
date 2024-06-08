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

// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const wishlistSchema = new mongoose.Schema({
//   userId: {
//     type: String,
//     required: true,
//   },
//   productId: {
//     type: String,
//     required: true,
//   },
//   name: {
//     type: String,
//     required: true,
//   },
//   brand: {
//     type: String,
//     required: true,
//   },
//   category: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
//   discount: {
//     type: Number,
//     required: true,
//   },
//   category: {
//     type: String,
//     required: true,
//   },
//   images: {
//     type: Array,
//     required: true,
//   },
//   price: {
//     type: Number,
//     required: true,
//   },
//   rating: {
//     type: Number,
//     required: true,
//   },
//   shopName: {
//     type: String,
//     required: true,
//   },
//   slug: {
//     type: String,
//     required: true,
//   },
//   stock: {
//     type: Number,
//     default: 0,
//   },
// });

// const Wishlist = mongoose.model("Wishlist", wishlistSchema);
// module.exports = Wishlist
