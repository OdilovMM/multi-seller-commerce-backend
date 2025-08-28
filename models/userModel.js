const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { user_type_enums } = require('../lib/config');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please tell us your first name!'],
    },
    lastName: {
      type: String,
      required: [true, 'Please tell us your last name!'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email!'],
      validate: [validator.isEmail, 'Please provide a valid email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      select: false,
      minlength: 8,
    },
    role: {
      type: String,
      enum: {
        values: user_type_enums,
        message: "{VALUE} is not among permitted field"
      },
      default: 'customer',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'blocked'],
      default: 'pending',
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    payment: {
      type: String,
      enum: ['inactive', 'active'],
      default: 'inactive',
    },
    method: {
      type: String,
      required: true,
      default: 'manual',
    },
    image: {
      type: String,
      default: 'default.jpg',
    },
    shopInfo: {
      type: Object,
      default: {},
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

userSchema.index(
  {
    name: 'text',
    email: 'text',
    status: 'text',
    payment: 'text',
    shopInfo: 'text',
  },
  {
    weights: {
      name: 5,
      email: 5,
      status: 5,
      payment: 5,
      shopInfo: 5,
    },
  },
);

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
