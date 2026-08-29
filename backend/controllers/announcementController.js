const mongoose = require("mongoose");
const Announcement = require("../models/Announcement");
const AnnouncementRead = require("../models/AnnouncementRead");
const User = require("../models/User");
const Batch = require("../models/Batch");

const {
  createNotifications,
} = require("../services/notificationService");

// =========================================================
// SEND ANNOUNCEMENT NOTIFICATIONS HELPER
// =========================================================

const sendAnnouncementNotifications = async (
  announcement,
  batch
) => {
  try {
    const recipientIds = [];

    // If specific recipient users were selected
    if (
      Array.isArray(announcement.recipientUsers) &&
      announcement.recipientUsers.length > 0
    ) {
      recipientIds.push(...announcement.recipientUsers);
    } else if (batch) {
      if (
        announcement.recipients?.includes("Student") ||
        announcement.recipientRoles?.includes("student")
      ) {
        recipientIds.push(...(batch.studentIds || []));
      }

      if (
        announcement.recipients?.includes("Mentor") ||
        announcement.recipientRoles?.includes("mentor")
      ) {
        recipientIds.push(...(batch.mentorIds || []));
      }
    } else {
      // Platform-wide
      if (
        announcement.recipients?.includes("Student") ||
        announcement.recipientRoles?.includes("student")
      ) {
        const students = await User.find({ role: "student" }).select("_id");
        recipientIds.push(...students.map((u) => u._id));
      }
      if (
        announcement.recipients?.includes("Mentor") ||
        announcement.recipientRoles?.includes("mentor")
      ) {
        const mentors = await User.find({ role: "mentor" }).select("_id");
        recipientIds.push(...mentors.map((u) => u._id));
      }
    }

    if (
      announcement.recipients?.includes("Superadmin") ||
      announcement.recipientRoles?.includes("superadmin")
    ) {
      const superAdmins = await User.find({
        role: "superadmin",
      }).select("_id");

      recipientIds.push(
        ...superAdmins.map((user) => user._id)
      );
    }

    const uniqueRecipientIds = [
      ...new Set(
        recipientIds
          .filter(Boolean)
          .map((id) => id.toString())
      ),
    ];

    if (uniqueRecipientIds.length === 0) {
      return;
    }

    await createNotifications({
      recipientIds: uniqueRecipientIds,
      type: announcement.type || "Announcement",
      title: announcement.title,
      message: announcement.content || announcement.message,
      referenceId: announcement._id,
    });
  } catch (error) {
    console.error("ANNOUNCEMENT NOTIFICATION ERROR:", error);
  }
};

// =========================================================
// CREATE ANNOUNCEMENT (Admin & Mentor)
// =========================================================

const createAnnouncement = async (req, res) => {
  try {
    const user = req.user;
    const isMentor = user.role === "mentor";

    const {
      title,
      content,
      message,
      type,
      recipients,
      recipientUsers,
      activeLink,
      eventDate,
      startTime,
      endTime,
      publishDate,
      location,
      status,
      batchId,
      isSpecial,
    } = req.body;

    const announcementContent = (content || message || "").trim();

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Announcement title is required",
      });
    }

    if (!announcementContent) {
      return res.status(400).json({
        success: false,
        message: "Announcement content is required",
      });
    }

    // Category / Type
    const announcementType = type || "Session";

    // Batch assignment
    let targetBatchId = batchId || user.batchId;
    if (isMentor && !targetBatchId) {
      // Find batches where mentor is assigned
      const assignedBatch = await Batch.findOne({ mentorIds: user._id });
      if (assignedBatch) {
        targetBatchId = assignedBatch._id;
      }
    }

    let batch = null;
    if (targetBatchId && mongoose.Types.ObjectId.isValid(targetBatchId)) {
      batch = await Batch.findById(targetBatchId);
    }

    // Recipients
    let finalRecipients = Array.isArray(recipients) && recipients.length > 0
      ? recipients
      : isMentor
      ? ["Student"]
      : ["Student", "Mentor"];

    let finalStatus = status || "Published";
    if (!["Draft", "Scheduled", "Published"].includes(finalStatus)) {
      finalStatus = "Published";
    }

    let finalPublishDate = publishDate ? new Date(publishDate) : new Date();

    const announcement = await Announcement.create({
      title: title.trim(),
      message: announcementContent.substring(0, 200),
      content: announcementContent,
      type: announcementType,
      recipients: finalRecipients,
      recipientRoles: finalRecipients.map((r) => r.toLowerCase()),
      recipientUsers: Array.isArray(recipientUsers) ? recipientUsers : [],
      sender: user._id,
      senderRole: user.role.toLowerCase(),
      authorId: user._id,
      batch: targetBatchId || null,
      batchId: targetBatchId || null,
      activeLink: activeLink?.trim() || "",
      eventDate: eventDate || null,
      startTime: startTime?.trim() || "",
      endTime: endTime?.trim() || "",
      location: location?.trim() || "",
      isSpecial: Boolean(isSpecial),
      publishDate: finalPublishDate,
      status: finalStatus,
    });

    if (finalStatus === "Published") {
      await sendAnnouncementNotifications(announcement, batch);
    }

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate("authorId", "name email role")
      .populate("sender", "name email role")
      .populate("batchId", "name year season")
      .populate("batch", "name year season");

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
// GET ANNOUNCEMENTS FOR CURRENT USER (Role-Aware)
// =========================================================

const getAnnouncements = async (req, res) => {
  try {
    const user = req.user;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const query = {
      status: "Published",
      publishDate: { $lte: new Date() },
    };

    if (req.query.type) {
      query.type = req.query.type;
    }

    // Role-based filtering
    if (user.role === "superadmin" || user.role === "admin") {
      // Admins & Superadmins can view platform announcements
      if (req.query.batchId) {
        query.batchId = req.query.batchId;
      }
    } else if (user.role === "mentor") {
      // Find batches where this mentor is assigned
      const mentorBatches = await Batch.find({ mentorIds: user._id }).select("_id");
      const batchIds = mentorBatches.map((b) => b._id);
      if (user.batchId) batchIds.push(user.batchId);

      query.$or = [
        { authorId: user._id },
        { sender: user._id },
        {
          $and: [
            { recipients: { $in: ["Mentor", "mentor", "All", "all"] } },
            { $or: [{ batchId: { $in: batchIds } }, { batchId: null }] },
          ],
        },
      ];
    } else if (user.role === "student") {
      const studentBatchId = user.batchId;
      query.$or = [
        {
          recipients: { $in: ["Student", "student", "All", "all"] },
          $or: [
            { batchId: studentBatchId },
            { batch: studentBatchId },
            { batchId: null, batch: null },
          ],
        },
        { recipientUsers: user._id },
      ];
    }

    const [announcements, total] = await Promise.all([
      Announcement.find(query)
        .populate("authorId", "name email role")
        .populate("sender", "name email role")
        .populate("batchId", "name year season")
        .sort({ publishDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Announcement.countDocuments(query),
    ]);

    // Attach isRead status for current user if applicable
    const announcementIds = announcements.map((a) => a._id);
    const readRecords = await AnnouncementRead.find({
      announcementId: { $in: announcementIds },
      studentId: user._id,
    });
    const readSet = new Set(readRecords.map((r) => r.announcementId.toString()));

    const transformed = announcements.map((a) => {
      const obj = a.toObject();
      obj.isRead = readSet.has(a._id.toString());
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: transformed.length,
      announcements: transformed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("GET ANNOUNCEMENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
      error: error.message,
    });
  }
};

// =========================================================
// GET USER'S OWN CREATED ANNOUNCEMENTS
// =========================================================

const getMyAnnouncements = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 200);
    const skip = (page - 1) * limit;

    let query = {};
    const role = String(req.user?.role || "").toLowerCase();
    if (role === "superadmin" || role === "admin") {
      query = {};
    } else {
      query = {
        $or: [{ authorId: req.user._id }, { sender: req.user._id }],
      };
    }

    const [announcements, total] = await Promise.all([
      Announcement.find(query)
        .populate("authorId", "name email role")
        .populate("sender", "name email role")
        .populate("batchId", "name year season")
        .sort({ createdAt: -1, publishDate: -1 })
        .skip(skip)
        .limit(limit),
      Announcement.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
      data: announcements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("GET MY ANNOUNCEMENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your announcements",
      error: error.message,
    });
  }
};

// =========================================================
// MENTOR-SPECIFIC HANDLERS
// =========================================================

const getMentorBatches = async (req, res) => {
  try {
    const mentorId = req.user?._id || req.query.mentorId;
    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "Mentor ID is required",
      });
    }

    const batches = await Batch.find({
      mentorIds: mentorId,
    }).select("_id name year season startDate");

    return res.status(200).json({
      success: true,
      batches,
    });
  } catch (error) {
    console.error("GET MENTOR BATCHES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load mentor batches",
      error: error.message,
    });
  }
};

const getMentorStudents = async (req, res) => {
  try {
    const mentorId = req.user?._id || req.query.mentorId;
    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "Mentor ID is required",
      });
    }

    const batches = await Batch.find({ mentorIds: mentorId }).select("studentIds");
    const studentIdsFromBatches = batches.flatMap((b) => b.studentIds || []);

    const students = await User.find({
      role: "student",
      $or: [
        { assignedMentor: mentorId },
        { _id: { $in: studentIdsFromBatches } },
      ],
    }).select("_id name email batchId");

    return res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("GET MENTOR STUDENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load mentor students",
      error: error.message,
    });
  }
};

const getMentorAnnouncements = async (req, res) => {
  return getAnnouncements(req, res);
};

const getStudentAnnouncements = async (req, res) => {
  return getAnnouncements(req, res);
};

// =========================================================
// MARK ANNOUNCEMENT AS READ
// =========================================================

const markAnnouncementAsRead = async (req, res) => {
  try {
    const announcementId = req.params.id || req.params.announcementId;
    const userId = req.user?._id || req.body.studentId;

    if (!announcementId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Announcement ID and User ID are required",
      });
    }

    await AnnouncementRead.findOneAndUpdate(
      { announcementId, studentId: userId },
      { announcementId, studentId: userId, readAt: new Date() },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Announcement marked as read",
    });
  } catch (error) {
    console.error("MARK ANNOUNCEMENT AS READ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark announcement as read",
      error: error.message,
    });
  }
};

// =========================================================
// GET SINGLE ANNOUNCEMENT
// =========================================================

const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID",
      });
    }

    const announcement = await Announcement.findById(id)
      .populate("authorId", "name email role")
      .populate("sender", "name email role")
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
    console.error("GET ANNOUNCEMENT ERROR:", error);
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
    const user = req.user;

    const query = { _id: id };
    if (user.role !== "superadmin") {
      query.$or = [{ authorId: user._id }, { sender: user._id }];
    }

    const announcement = await Announcement.findOne(query);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found or you are not allowed to edit it",
      });
    }

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
      isSpecial,
    } = req.body;

    if (title !== undefined) announcement.title = title.trim();
    if (content !== undefined) {
      announcement.content = content.trim();
      announcement.message = content.trim().substring(0, 200);
    }
    if (type !== undefined) announcement.type = type;
    if (recipients !== undefined) announcement.recipients = recipients;
    if (activeLink !== undefined) announcement.activeLink = activeLink.trim();
    if (eventDate !== undefined) announcement.eventDate = eventDate;
    if (startTime !== undefined) announcement.startTime = startTime.trim();
    if (endTime !== undefined) announcement.endTime = endTime.trim();
    if (location !== undefined) announcement.location = location.trim();
    if (publishDate !== undefined) announcement.publishDate = publishDate;
    if (isSpecial !== undefined) announcement.isSpecial = Boolean(isSpecial);
    if (status !== undefined) announcement.status = status;

    await announcement.save();

    const updated = await Announcement.findById(announcement._id)
      .populate("authorId", "name email role")
      .populate("batchId", "name year season");

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      announcement: updated,
    });
  } catch (error) {
    console.error("UPDATE ANNOUNCEMENT ERROR:", error);
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
    const user = req.user;

    const query = { _id: id };
    if (user.role !== "superadmin") {
      query.$or = [{ authorId: user._id }, { sender: user._id }];
    }

    const announcement = await Announcement.findOneAndDelete(query);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found or you are not allowed to delete it",
      });
    }

    await AnnouncementRead.deleteMany({ announcementId: id });

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ANNOUNCEMENT ERROR:", error);
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
    const user = req.user;

    const query = { _id: id };
    if (user.role !== "superadmin") {
      query.$or = [{ authorId: user._id }, { sender: user._id }];
    }

    const announcement = await Announcement.findOne(query);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found or you are not allowed to publish it",
      });
    }

    const wasPublished = announcement.status === "Published";
    announcement.status = "Published";
    if (!announcement.publishDate) {
      announcement.publishDate = new Date();
    }

    await announcement.save();

    let batch = null;
    if (announcement.batchId) {
      batch = await Batch.findById(announcement.batchId);
    }

    if (!wasPublished) {
      await sendAnnouncementNotifications(announcement, batch);
    }

    const published = await Announcement.findById(announcement._id)
      .populate("authorId", "name email role")
      .populate("batchId", "name year season");

    return res.status(200).json({
      success: true,
      message: "Announcement published successfully",
      announcement: published,
    });
  } catch (error) {
    console.error("PUBLISH ANNOUNCEMENT ERROR:", error);
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
  getMentorBatches,
  getMentorStudents,
  getMentorAnnouncements,
  getStudentAnnouncements,
  markAnnouncementAsRead,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
};