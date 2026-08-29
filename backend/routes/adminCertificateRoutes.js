const express = require("express");

const {
  getAdminCertificates,
  getEligibleStudents,
  createCertificate,
  issueBatchCertificates,
  getCertificateById,
  revokeCertificate,
} = require("../controllers/adminCertificateController");

const {
  getMyCertificates,
  getMyCertificateById,
} = require("../controllers/studentCertificateController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================================================
// STUDENT CERTIFICATES
// =========================================================

// GET all certificates of logged-in student
router.get(
  "/my",
  authMiddleware,
  getMyCertificates
);

// GET single certificate of logged-in student
router.get(
  "/my/:id",
  authMiddleware,
  getMyCertificateById
);

// =========================================================
// ADMIN CERTIFICATES
// =========================================================

// GET all certificates
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  getAdminCertificates
);

// GET STUDENTS FOR A BATCH
router.get(
  "/batch/:batchId",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  getEligibleStudents
);

// ISSUE ONE CERTIFICATE
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  createCertificate
);

// ISSUE CERTIFICATES FOR BATCH
router.post(
  "/batch/:batchId",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  issueBatchCertificates
);

// GET SINGLE CERTIFICATE
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  getCertificateById
);

// REVOKE CERTIFICATE
router.patch(
  "/:id/revoke",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  revokeCertificate
);

module.exports = router;
