const mongoose = require("mongoose");

const withdrawReqSchema = new mongoose.Schema(
  {
    sellerId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const WithdrawRequest = mongoose.model("WithdrawRequest", withdrawReqSchema);
module.exports = WithdrawRequest;
