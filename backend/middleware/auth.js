const ErrorHandler = require("../utils/errorhandler");
const catchErrors = require("./catchErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(
      new ErrorHandler("Vui long dang nhap de truy cap vao trang nay", 401)
    );
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData.id);

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Quyen: ${req.user.role} khong duoc phep truy cap vao trang nay`,
          403
        )
      );
    }
    next();
  };
};
