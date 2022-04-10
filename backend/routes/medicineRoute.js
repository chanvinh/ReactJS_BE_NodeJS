const express = require("express");
const {
  getAllMedicines,
  getAdminMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicineDetails,
  createMedicineReview,
  getMedicineReviews,
  deleteReview,
} = require("../controllers/medicineController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/medicines").get(getAllMedicines);

router
  .route("/admin/medicine/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createMedicine);

router
  .route("/admin/medicines")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminMedicines);

router
  .route("/admin/medicine/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateMedicine)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteMedicine);

router.route("/medicine/:id").get(getMedicineDetails);

router.route("/review").put(isAuthenticatedUser, createMedicineReview);

router
  .route("/reviews")
  .get(isAuthenticatedUser, getMedicineReviews)
  .delete(isAuthenticatedUser, deleteReview);

module.exports = router;
