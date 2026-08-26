const express = require("express");

const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getMyNotifications
);

router.patch(
  "/read-all",
  authMiddleware,
  markAllNotificationsAsRead
);

router.patch(
  "/:id/read",
  authMiddleware,
  markNotificationAsRead
);

module.exports = router;