const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bannerSchema = new mongoose.Schema(
  {
    productId: {
      type: Schema.ObjectId,
      required: true,
    },
    banner: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model("Banner", bannerSchema);
module.exports = Banner