const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please tell us your first name!"],
    },
    lastName: {
      type: String,
      required: [true, "Please tell us your last name!"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email!"],
      validate: [validator.isEmail, "Please provide a valid email"],
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      select: false,
      minlength: 8,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    method: {
      type: String,
      required: true,
      default: "manual",
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
// userSchema.virtual("posts", {
//   ref: "Post",
//   foreignField: "authorId",
//   localField: "_id",
// });
customerSchema.virtual("wishlists", {
  ref: "Product",
  foreignField: "userId",
  localField: "_id",
});
customerSchema.virtual("carts", {
  ref: "Product",
  foreignField: "userId",
  localField: "_id",
});

customerSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

customerSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
