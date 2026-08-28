const express = require("express");
const {
  getEmailTemplates,
  getEmailTemplate,
  updateEmailTemplate,
} = require("../controllers/emailTemplateController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  getEmailTemplates
);

router.get(
  "/:type",
  authMiddleware,
  roleMiddleware("admin"),
  getEmailTemplate
);

router.patch(
  "/:type",
  authMiddleware,
  roleMiddleware("admin"),
  updateEmailTemplate
);

module.exports = router;