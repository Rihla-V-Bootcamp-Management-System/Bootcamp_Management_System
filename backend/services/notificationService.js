const Notification = require("../models/Notification");

/**
 * Create an in-app notification for multiple users.
 *
 * @param {Object} data
 * @param {Array} data.recipientIds - User IDs receiving the notification
 * @param {String} data.type - Notification type
 * @param {String} data.title - Notification title
 * @param {String} data.message - Notification message
 * @param {ObjectId} data.referenceId - Related announcement ID
 */
const createNotifications = async ({
  recipientIds,
  type = "Announcement",
  title,
  message,
  referenceId,
}) => {
  if (!recipientIds || recipientIds.length === 0) {
    return [];
  }

  const notifications = recipientIds.map((recipientId) => ({
    recipientId,
    type,
    title,
    message,
    referenceId,
  }));

  return Notification.insertMany(notifications);
};

module.exports = {
  createNotifications,
};