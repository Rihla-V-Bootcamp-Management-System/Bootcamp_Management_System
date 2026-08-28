const mongoose = require("mongoose");
const Announcement = require("../models/Announcement");
const AnnouncementRead = require("../models/AnnouncementRead");
const User = require("../models/User");
const Batch = require("../models/Batch");

// ============================================================
// GET MENTOR BATCHES
// GET /api/announcements/mentor/batches?mentorId=...
// ============================================================
const getMentorBatches = async (req, res) => {
  try {
    const { mentorId } = req.query;

    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "mentorId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentorId",
      });
    }

    const batches = await Batch.find({
      mentors: mentorId,
    }).select("_id name title");

    return res.status(200).json({
      success: true,
      count: batches.length,
      batches,
    });
  } catch (error) {
    console.error("getMentorBatches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load mentor batches",
      error: error.message,
    });
  }
};

// ============================================================
// GET MENTOR STUDENTS
// GET /api/announcements/mentor/students?mentorId=...
// ============================================================
const getMentorStudents = async (req, res) => {
  try {
    const { mentorId } = req.query;

    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "mentorId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentorId",
      });
    }

    const students = await User.find({
      role: "student",
      mentor: mentorId,
    })
      .select("_id name email batch")
      .populate("batch", "name title");

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("getMentorStudents error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load mentor students",
      error: error.message,
    });
  }
};

// ============================================================
// CREATE ANNOUNCEMENT
// POST /api/announcements/mentor
// ============================================================
const createAnnouncement = async (req, res) => {
  try {
    const {
      mentorId,
      title,
      message,
      studentIds = [],
      batchId = null,
      type = "general",
    } = req.body;

    // --------------------------------------------------------
    // VALIDATE MENTOR
    // --------------------------------------------------------
    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "mentorId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentorId",
      });
    }

    // --------------------------------------------------------
    // VALIDATE TITLE AND MESSAGE
    // --------------------------------------------------------
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // --------------------------------------------------------
    // VALIDATE STUDENT IDS
    // --------------------------------------------------------
    if (!Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        message: "studentIds must be an array",
      });
    }

    const uniqueStudentIds = [
      ...new Set(studentIds.map((id) => id.toString())),
    ];

    const invalidIds = uniqueStudentIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more student IDs are invalid",
        invalidIds,
      });
    }

    // --------------------------------------------------------
    // GET MENTOR'S ASSIGNED STUDENTS
    // --------------------------------------------------------
    const assignedStudents = await User.find({
      role: "student",
      mentor: mentorId,
    }).select("_id");

    const assignedStudentIds = assignedStudents.map((student) =>
      student._id.toString()
    );

    // --------------------------------------------------------
    // CHECK SELECTED STUDENTS
    // --------------------------------------------------------
    const unauthorizedStudents = uniqueStudentIds.filter(
      (studentId) => !assignedStudentIds.includes(studentId)
    );

    if (unauthorizedStudents.length > 0) {
      return res.status(403).json({
        success: false,
        message:
          "You can only send announcements to students assigned to this mentor",
        unauthorizedStudents,
      });
    }

    // --------------------------------------------------------
    // RECIPIENTS
    // --------------------------------------------------------
    let recipients = [...uniqueStudentIds];

    // --------------------------------------------------------
    // BATCH
    // --------------------------------------------------------
    if (batchId) {
      if (!mongoose.Types.ObjectId.isValid(batchId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid batch ID",
        });
      }

      const batch = await Batch.findOne({
        _id: batchId,
        mentors: mentorId,
      });

      if (!batch) {
        return res.status(403).json({
          success: false,
          message: "This mentor is not assigned to this batch",
        });
      }

      const batchStudents = await User.find({
        role: "student",
        batch: batchId,
        mentor: mentorId,
      }).select("_id");

      const batchStudentIds = batchStudents.map((student) =>
        student._id.toString()
      );

      recipients = [
        ...new Set([
          ...recipients,
          ...batchStudentIds,
        ]),
      ];
    }

    // --------------------------------------------------------
    // RECIPIENT REQUIRED
    // --------------------------------------------------------
    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Select at least one student or an assigned batch",
      });
    }

    // --------------------------------------------------------
    // CREATE ANNOUNCEMENT
    // --------------------------------------------------------
    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      sender: mentorId,
      senderRole: "mentor",
      batch: batchId || null,
      recipients,
      type,
    });

    // --------------------------------------------------------
    // POPULATE
    // --------------------------------------------------------
    const populatedAnnouncement =
      await Announcement.findById(announcement._id)
        .populate("sender", "name email")
        .populate("batch", "name title")
        .populate("recipients", "name email");

    return res.status(201).json({
      success: true,
      message: "Announcement sent successfully",
      recipientCount: recipients.length,
      announcement: populatedAnnouncement,
    });
  } catch (error) {
    console.error("createAnnouncement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create announcement",
      error: error.message,
    });
  }
};

// ============================================================
// GET MENTOR ANNOUNCEMENTS
// GET /api/announcements/mentor?mentorId=...
// ============================================================
const getMentorAnnouncements = async (req, res) => {
  try {
    const { mentorId } = req.query;

    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "mentorId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentorId",
      });
    }

    const announcements = await Announcement.find({
      sender: mentorId,
      senderRole: "mentor",
    })
      .populate("sender", "name email")
      .populate("batch", "name title")
      .populate("recipients", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    console.error("getMentorAnnouncements error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load announcements",
      error: error.message,
    });
  }
};

// ============================================================
// GET STUDENT ANNOUNCEMENTS
// GET /api/announcements/student?studentId=...
// ============================================================
const getStudentAnnouncements = async (req, res) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studentId",
      });
    }

    const announcements = await Announcement.find({
      recipients: studentId,
    })
      .populate("sender", "name email")
      .populate("batch", "name title")
      .sort({ createdAt: -1 })
      .lean();

    // --------------------------------------------------------
    // GET READ ANNOUNCEMENTS
    // --------------------------------------------------------
    const readRecords = await AnnouncementRead.find({
      studentId,
    }).select("announcementId");

    const readIds = new Set(
      readRecords.map((record) =>
        record.announcementId.toString()
      )
    );

    // --------------------------------------------------------
    // ADD isRead
    // --------------------------------------------------------
    const formattedAnnouncements = announcements.map(
      (announcement) => ({
        ...announcement,
        isRead: readIds.has(
          announcement._id.toString()
        ),
      })
    );

    const unreadCount = formattedAnnouncements.filter(
      (announcement) => !announcement.isRead
    ).length;

    return res.status(200).json({
      success: true,
      count: formattedAnnouncements.length,
      unreadCount,
      announcements: formattedAnnouncements,
    });
  } catch (error) {
    console.error(
      "getStudentAnnouncements error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load announcement data",
      error: error.message,
    });
  }
};

// ============================================================
// MARK ANNOUNCEMENT AS READ
// PATCH /api/announcements/:announcementId/read?studentId=...
// ============================================================
const markAnnouncementAsRead = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        announcementId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid studentId",
      });
    }

    const announcement =
      await Announcement.findOne({
        _id: announcementId,
        recipients: studentId,
      });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    await AnnouncementRead.findOneAndUpdate(
      {
        announcementId,
        studentId,
      },
      {
        announcementId,
        studentId,
        readAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Announcement marked as read",
    });
  } catch (error) {
    console.error(
      "markAnnouncementAsRead error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to mark announcement as read",
      error: error.message,
    });
  }
};

// ============================================================
// DELETE ANNOUNCEMENT
// DELETE /api/announcements/mentor/:id?mentorId=...
// ============================================================
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorId } = req.query;

    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "mentorId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentorId",
      });
    }

    const announcement =
      await Announcement.findOne({
        _id: id,
        sender: mentorId,
        senderRole: "mentor",
      });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    await Announcement.findByIdAndDelete(id);

    // Also remove read records
    await AnnouncementRead.deleteMany({
      announcementId: id,
    });

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error(
      "deleteAnnouncement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
      error: error.message,
    });
  }
};

module.exports = {
  getMentorBatches,
  getMentorStudents,
  createAnnouncement,
  getMentorAnnouncements,
  getStudentAnnouncements,
  markAnnouncementAsRead,
  deleteAnnouncement,
};