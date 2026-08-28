const Announcement = require("../models/Announcement");
const User = require("../models/User");
const Batch = require("../models/Batch");

const {
  createNotifications,
} = require("../services/notificationService");

// =========================================================
// CREATE ANNOUNCEMENT
// =========================================================

const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      recipients,
      activeLink,
      eventDate,
      startTime,
      endTime,
      publishDate,
      location,
      status,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Announcement title is required",
      });
    }

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Announcement content is required",
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Announcement category is required",
      });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one recipient is required",
      });
    }

    const allowedTypes = [
      "Contest",
      "Session",
      "Experience Sharing",
      "Deadline",
      "Other",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement category",
      });
    }

    const allowedRecipients = [
      "Superadmin",
      "Mentor",
      "Student",
    ];

    const invalidRecipient = recipients.some(
      (recipient) => !allowedRecipients.includes(recipient)
    );

    if (invalidRecipient) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement recipient",
      });
    }

    if (!req.user.batchId) {
      return res.status(400).json({
        success: false,
        message: "You are not assigned to a batch",
      });
    }

    const batch = await Batch.findById(req.user.batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Assigned batch was not found",
      });
    }

    let finalStatus = status || "Draft";

    if (
      !["Draft", "Scheduled", "Published"].includes(finalStatus)
    ) {
      finalStatus = "Draft";
    }

    let finalPublishDate = publishDate
      ? new Date(publishDate)
      : null;

    if (finalStatus === "Published" && !finalPublishDate) {
      finalPublishDate = new Date();
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      type,
      recipients,
      batchId: req.user.batchId,
      activeLink: activeLink?.trim() || "",
      eventDate: eventDate || null,
      startTime: startTime?.trim() || "",
      endTime: endTime?.trim() || "",
      location: location?.trim() || "",
      publishDate: finalPublishDate,
      authorId: req.user._id,
      status: finalStatus,
    });

    if (finalStatus === "Published") {
      await sendAnnouncementNotifications(
        announcement,
        batch
      );
    }

    const populatedAnnouncement =
      await Announcement.findById(announcement._id)
        .populate("authorId", "name email role")
        .populate("batchId", "name year season");

    return res.status(201).json({
      success: true,
      message:
        finalStatus === "Published"
          ? "Announcement published successfully"
          : finalStatus === "Scheduled"
          ? "Announcement scheduled successfully"
          : "Announcement saved as draft",
      announcement: populatedAnnouncement,
    });
  } catch (error) {
    console.error("CREATE ANNOUNCEMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create announcement",
      error: error.message,
    });
  }
};

// =========================================================
// SEND ANNOUNCEMENT NOTIFICATIONS
// =========================================================

const sendAnnouncementNotifications = async (
  announcement,
  batch
) => {
  try {
    const recipientIds = [];

    if (announcement.recipients.includes("Student")) {
      recipientIds.push(...(batch.studentIds || []));
    }

    if (announcement.recipients.includes("Mentor")) {
      recipientIds.push(...(batch.mentorIds || []));
    }

    if (announcement.recipients.includes("Superadmin")) {
      const superAdmins = await User.find({
        role: "superadmin",
      }).select("_id");

      recipientIds.push(
        ...superAdmins.map((user) => user._id)
      );
    }

    const uniqueRecipientIds = [
      ...new Set(
        recipientIds.map((id) => id.toString())
      ),
    ];

    if (uniqueRecipientIds.length === 0) {
      return;
    }

    await createNotifications({
      recipientIds: uniqueRecipientIds,
      type: announcement.type,
      title: announcement.title,
      message: announcement.content,
      referenceId: announcement._id,
    });

    console.log(
      `Announcement notification sent to ${uniqueRecipientIds.length} users`
    );
  } catch (error) {
    console.error(
      "ANNOUNCEMENT NOTIFICATION ERROR:",
      error
    );
  }
};

// =========================================================
// GET ANNOUNCEMENTS FOR CURRENT USER
// PAGINATED + NEWEST FIRST
// =========================================================

const getAnnouncements = async (req, res) => {
  try {
    const user = req.user;

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) || 10,
        1
      ),
      50
    );

    const skip = (page - 1) * limit;

    const query = {
      status: "Published",
      publishDate: {
        $lte: new Date(),
      },
    };

    // =====================================================
    // SUPERADMIN
    // =====================================================

    if (user.role === "superadmin") {
      query.recipients = "Superadmin";
    }

    // =====================================================
    // ADMIN / MENTOR / STUDENT
    // =====================================================

    else {
      if (!user.batchId) {
        return res.status(200).json({
          success: true,
          count: 0,
          announcements: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      query.batchId = user.batchId;

      if (user.role === "mentor") {
        query.recipients = "Mentor";
      }

      if (user.role === "student") {
        query.recipients = "Student";
      }

      // Admin can see all published announcements
      // belonging to their batch.
    }

    const [announcements, total] =
      await Promise.all([
        Announcement.find(query)
          .populate("authorId", "name email role")
          .populate("batchId", "name year season")
          .sort({
            publishDate: -1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit),

        Announcement.countDocuments(query),
      ]);

    return res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "GET ANNOUNCEMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

// =========================================================
// GET ADMIN'S OWN ANNOUNCEMENTS
// PAGINATED + NEWEST FIRST
// =========================================================

const getMyAnnouncements = async (req, res) => {
  try {
    if (!req.user.batchId) {
      return res.status(200).json({
        success: true,
        count: 0,
        announcements: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    }

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) || 10,
        1
      ),
      50
    );

    const skip = (page - 1) * limit;

    const query = {
      batchId: req.user.batchId,
      authorId: req.user._id,
    };

    const [announcements, total] =
      await Promise.all([
        Announcement.find(query)
          .populate("authorId", "name email role")
          .populate("batchId", "name year season")
          .sort({
            createdAt: -1,
            publishDate: -1,
          })
          .skip(skip)
          .limit(limit),

        Announcement.countDocuments(query),
      ]);

    return res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "GET MY ANNOUNCEMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your announcements",
    });
  }
};

// =========================================================
// GET SINGLE ANNOUNCEMENT
// =========================================================

const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findOne({
      _id: id,
    })
      .populate("authorId", "name email role")
      .populate("batchId", "name year season");

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    return res.status(200).json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error(
      "GET ANNOUNCEMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcement",
    });
  }
};

// =========================================================
// UPDATE ANNOUNCEMENT
// =========================================================

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      content,
      type,
      recipients,
      activeLink,
      eventDate,
      startTime,
      endTime,
      publishDate,
      location,
      status,
    } = req.body;

    const announcement = await Announcement.findOne({
      _id: id,
      batchId: req.user.batchId,
      authorId: req.user._id,
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found or you are not allowed to edit it",
      });
    }

    const wasPublished =
      announcement.status === "Published";

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Announcement title is required",
        });
      }

      announcement.title = title.trim();
    }

    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Announcement content is required",
        });
      }

      announcement.content = content.trim();
    }

    if (type !== undefined) {
      const allowedTypes = [
        "Contest",
        "Session",
        "Experience Sharing",
        "Deadline",
        "Other",
      ];

      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid announcement category",
        });
      }

      announcement.type = type;
    }

    if (recipients !== undefined) {
      const allowedRecipients = [
        "Superadmin",
        "Mentor",
        "Student",
      ];

      if (
        !Array.isArray(recipients) ||
        recipients.length === 0 ||
        recipients.some(
          (recipient) =>
            !allowedRecipients.includes(recipient)
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid announcement recipient",
        });
      }

      announcement.recipients = recipients;
    }

    if (activeLink !== undefined) {
      announcement.activeLink =
        activeLink?.trim() || "";
    }

    if (eventDate !== undefined) {
      announcement.eventDate =
        eventDate || null;
    }

    if (startTime !== undefined) {
      announcement.startTime =
        startTime?.trim() || "";
    }

    if (endTime !== undefined) {
      announcement.endTime =
        endTime?.trim() || "";
    }

    if (location !== undefined) {
      announcement.location =
        location?.trim() || "";
    }

    if (publishDate !== undefined) {
      announcement.publishDate =
        publishDate || null;
    }

    if (status !== undefined) {
      if (
        !["Draft", "Scheduled", "Published"].includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid announcement status",
        });
      }

      announcement.status = status;
    }

    if (
      announcement.status === "Published" &&
      !announcement.publishDate
    ) {
      announcement.publishDate = new Date();
    }

    await announcement.save();

    if (
      !wasPublished &&
      announcement.status === "Published"
    ) {
      const batch = await Batch.findById(
        announcement.batchId
      );

      if (batch) {
        await sendAnnouncementNotifications(
          announcement,
          batch
        );
      }
    }

    const updatedAnnouncement =
      await Announcement.findById(announcement._id)
        .populate("authorId", "name email role")
        .populate("batchId", "name year season");

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      announcement: updatedAnnouncement,
    });
  } catch (error) {
    console.error(
      "UPDATE ANNOUNCEMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update announcement",
      error: error.message,
    });
  }
};

// =========================================================
// DELETE ANNOUNCEMENT
// =========================================================

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement =
      await Announcement.findOneAndDelete({
        _id: id,
        batchId: req.user.batchId,
        authorId: req.user._id,
      });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found or you are not allowed to delete it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE ANNOUNCEMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
    });
  }
};

// =========================================================
// PUBLISH ANNOUNCEMENT
// =========================================================

const publishAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findOne({
      _id: id,
      batchId: req.user.batchId,
      authorId: req.user._id,
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found or you are not allowed to publish it",
      });
    }

    const wasPublished =
      announcement.status === "Published";

    announcement.status = "Published";

    if (!announcement.publishDate) {
      announcement.publishDate = new Date();
    }

    await announcement.save();

    const batch = await Batch.findById(
      req.user.batchId
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Assigned batch was not found",
      });
    }

    if (!wasPublished) {
      await sendAnnouncementNotifications(
        announcement,
        batch
      );
    }

    const publishedAnnouncement =
      await Announcement.findById(announcement._id)
        .populate("authorId", "name email role")
        .populate("batchId", "name year season");

    return res.status(200).json({
      success: true,
      message: "Announcement published successfully",
      announcement: publishedAnnouncement,
    });
  } catch (error) {
    console.error(
      "PUBLISH ANNOUNCEMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to publish announcement",
      error: error.message,
    });
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getMyAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
};