const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const authOrderSchema = new mongoose.Schema(
    {
        orderId: {
          type: Schema.ObjectId,
          required: true,
        },
        sellerId: {
          type: Schema.ObjectId,
          required: true,
        },
        products: {
          type: Array,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        paymentStatus: {
          type: String,
          required: true,
        },
        shippingInfo: {
          type: String,
          required: true,
        },
        deliveryStatus: {
          type: String,
          required: true,
        },
        date: {
          type: String,
          required: true,
        },
      },
      {
        timestamps: true,
      }
);


const AuthOrder = mongoose.model("AuthOrder", authOrderSchema);
module.exports = AuthOrder;