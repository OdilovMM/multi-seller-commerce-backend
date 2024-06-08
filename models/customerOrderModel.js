const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerOrderSchema = new mongoose.Schema(
  {
    customerId: {
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
      type: Object,
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

const CustomerOrder = mongoose.model("CustomerOrder", customerOrderSchema);
module.exports = CustomerOrder;
