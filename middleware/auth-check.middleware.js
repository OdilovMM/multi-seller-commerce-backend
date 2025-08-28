const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/user.model");
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { UnauthorizedError, NotFoundError } = require("../errors");


exports.protect = asyncErrorHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new UnauthorizedError('You are not logged in! Please log in to get access.')
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_ACCESS_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new NotFoundError('The user belonging to this token no longer exists.')
    );
  }

  req.user = currentUser;
  next();
});