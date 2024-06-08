const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcryptjs')

const adminSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: [true, "Please provide a password"],
    select: false,
    minlength: 8,
  },
  role: {
    type: String,
    enum: ["user", "seller", "admin"],
    default: "admin",
  },
});

adminSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

adminSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
