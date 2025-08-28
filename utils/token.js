const jwt = require("jsonwebtoken");

const signAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN } // masalan: "15m"
  );
};

const signRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN } // masalan: "7d"
  );
};

const createSendToken = (user, statusCode, res) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    accessToken,
    data: { user },
  });
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  createSendToken,
};
