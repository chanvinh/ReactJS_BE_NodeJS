const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Nhap ten san pham"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Nhap mo ta san pham"],
  },
  title: {
    type: String,
    required: [true, "Nhap chi tiet san pham"],
  },
  discount: {
    type: Number,
    required: [true, "Nhap phan tram giam gia san pham"],
  },
  price: {
    type: Number,
    required: [true, "Nhap gia san pham"],
    maxLenght: [8, "Gia tien khong the duoi 8 ky tu"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Nhap loai san pham"],
  },
  Stock: {
    type: Number,
    required: [true, "Nhap so luong ton kho"],
    maxLength: [4, "So luong ton khong duoi 4 ky tu"],
    default: 1,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Medicine", medicineSchema);
