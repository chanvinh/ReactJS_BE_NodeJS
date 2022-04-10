const Medicine = require("../models/medicineModel");
const ErrorHandler = require("../utils/errorhandler");
const catchErrors = require("../middleware/catchErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");

exports.getAllMedicines = catchErrors(async (req, res, next) => {
  const resultPerPage = 4;
  const medicinesCount = await Medicine.countDocuments();
  const apiFeature = new ApiFeatures(Medicine.find(), req.query)
    .search()
    .filter();

  let medicines = await apiFeature.query;

  let filteredMedicinesCount = medicines.length;

  apiFeature.pagination(resultPerPage);

  medicines = await apiFeature.query;

  res.status(200).json({
    success: true,
    medicines,
    medicinesCount,
    resultPerPage,
    filteredMedicinesCount,
  });
});

exports.getMedicineDetails = catchErrors(async (req, res, next) => {
  let medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return next(new ErrorHandler("Medicine Not Found", 404));
  }

  res.status(200).json({
    success: true,
    medicine,
  });
});

exports.getAdminMedicines = catchErrors(async (req, res, next) => {
  const medicines = await Medicine.find();

  res.status(200).json({
    success: true,
    medicines,
  });
});

exports.createMedicine = catchErrors(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "medicines",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;

  const medicine = await Medicine.create(req.body);

  res.status(201).json({
    success: true,
    medicine,
  });
});

exports.updateMedicine = catchErrors(async (req, res, next) => {
  let medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return next(new ErrorHandler("Medicine Not Found", 404));
  }

  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    for (let i = 0; i < medicine.images.length; i++) {
      await cloudinary.v2.uploader.destroy(medicine.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "medicines",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    medicine,
  });
});

exports.deleteMedicine = catchErrors(async (req, res, next) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return next(new ErrorHandler("Duoc pham khong tim thay", 404));
  }

  for (let i = 0; i < medicine.images.length; i++) {
    await cloudinary.v2.uploader.destroy(medicine.images[i].public_id);
  }

  await medicine.remove();

  res.status(200).json({
    success: true,
    message: "Xoa Thanh Cong",
  });
});

exports.createMedicineReview = catchErrors(async (req, res, next) => {
  const { rating, comment, medicineId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const medicine = await Medicine.findById(medicineId);

  const isReviewed = medicine.reviews.find(
    (rev) => rev.user.toString() === req.user._id
  );

  if (isReviewed) {
    medicine.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    medicine.reviews.push(review);
    medicine.numOfReviews = medicine.reviews.length;
  }

  let avg = 0;
  medicine.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  medicine.ratings = avg / medicine.reviews.length;

  await medicine.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

exports.getMedicineReviews = catchErrors(async (req, res, next) => {
  const medicine = await Medicine.findById(req.query.id);

  if (!medicine) {
    return next(new ErrorHandler("San pham khong tim thay", 404));
  }

  res.status(200).json({
    success: true,
    reviews: medicine.reviews,
  });
});

exports.deleteReview = catchErrors(async (req, res, next) => {
  const medicine = await Medicine.findById(req.query.medicineId);

  if (!medicine) {
    return next(new ErrorHandler("san pham khong tim thay", 404));
  }

  const reviews = medicine.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Medicine.findByIdAndUpdate(
    req.query.medicineId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
