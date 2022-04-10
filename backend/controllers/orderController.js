const Order = require("../models/orderModel");
const Medicine = require("../models/medicineModel");
const ErrorHandler = require("../utils/errorhandler");
const catchErrors = require("../middleware/catchErrors");

exports.newOrder = catchErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    itemsPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    itemsPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

exports.getSingleOrder = catchErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("Khong tim thay don hang voi id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});


exports.myOrders = catchErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.getAllOrders = catchErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});



exports.updateOrder = catchErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Khong tim thay don hang voi id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("Don Hang da duoc giao den ban", 400));
  }

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (s) => {
      await updateStock(s.medicine, s.quantity);
    });
  }
  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const medicine = await Medicine.findById(id);

  medicine.Stock -= quantity;

  await medicine.save({ validateBeforeSave: false });
}


exports.deleteOrder = catchErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Khong tim thay don hang voi id", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});