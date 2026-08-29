const Batch = require("../models/Batch");
const User = require("../models/User");

// =========================================================
// SYNC BATCH STATUS
// =========================================================

const syncBatchStatus = async (batch) => {
  if (!batch || !batch.startDate) {
    return batch;
  }

  const now = new Date();
  const startDate = new Date(batch.startDate);

  // If your Batch model has a status field, update it.
  if (Object.prototype.hasOwnProperty.call(batch, "status")) {
    if (now < startDate) {
      batch.status = "upcoming";
    } else if (batch.endDate && now > new Date(batch.endDate)) {
      batch.status = "completed";
    } else {
      batch.status = "active";
    }

    if (batch.isModified()) {
      await batch.save();
    }
  }

  return batch;
};

// =========================================================
// GET ALL BATCHES
// =========================================================

const getBatches = async (req, res) => {
  try {
    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.max(
      parseInt(req.query.limit, 10) || 10,
      1
    );

    const skip = (page - 1) * limit;

    const totalBatches = await Batch.countDocuments();

    const totalPages = Math.max(
      Math.ceil(totalBatches / limit),
      1
    );

    const batches = await Batch.find()
      .populate(
        "mentorIds",
        "name email role gender"
      )
      .populate(
        "studentIds",
        "name email role gender"
      )
      .sort({
      
        startDate: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    for (const batch of batches) {
      await syncBatchStatus(batch);
    }

    res.status(200).json({
      success: true,
      batches,
      pagination: {
        totalBatches,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get batches error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load batches",
      error: error.message,
    });
  }
};

// =========================================================
// GET BATCH BY ID
// =========================================================

const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate(
        "mentorIds",
        "name email role gender"
      )
      .populate(
        "studentIds",
        "name email role gender"
      );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    await syncBatchStatus(batch);

    const students = batch.studentIds || [];
    const mentors = batch.mentorIds || [];

    const admins = [];

    const countGender = (users) => {
      let male = 0;
      let female = 0;

      users.forEach((user) => {
        const gender = user?.gender?.toLowerCase();

        if (gender === "male") {
          male++;
        }

        if (gender === "female") {
          female++;
        }
      });

      return {
        total: users.length,
        male,
        female,
      };
    };

    const studentStats = countGender(students);
    const mentorStats = countGender(mentors);
    const adminStats = countGender(admins);

    const totalUsers =
      students.length +
      mentors.length +
      admins.length;

    const totalMale =
      studentStats.male +
      mentorStats.male +
      adminStats.male;

    const totalFemale =
      studentStats.female +
      mentorStats.female +
      adminStats.female;

    res.status(200).json({
      success: true,
      batch,
      statistics: {
        totalUsers,

        students: studentStats,
        mentors: mentorStats,
        admins: adminStats,

        gender: {
          male: totalMale,
          female: totalFemale,
        },
      },
    });
  } catch (error) {
    console.error("Get batch error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load batch",
      error: error.message,
    });
  }
};

// =========================================================
// CREATE BATCH
// =========================================================

const createBatch = async (req, res) => {
  try {
    const {
      name,
      startDate,
      sessionStartTime,
      sessionEndTime,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Batch name is required",
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Start date is required",
      });
    }

    const batch = await Batch.create({
      name: name.trim(),
      startDate: new Date(startDate),
      sessionStartTime:
        sessionStartTime || "09:00",
      sessionEndTime:
        sessionEndTime || "13:00",
      mentorIds: [],
      studentIds: [],
    });

    return res.status(201).json({
      success: true,
      message: "Batch created successfully",
      batch,
    });
  } catch (error) {
    console.error("Create batch error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A batch with this name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create batch",
      error: error.message,
    });
  }
};

// =========================================================
// UPDATE BATCH
// =========================================================

const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      startDate,
      sessionStartTime,
      sessionEndTime,
      endDate,
    } = req.body;

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Batch name cannot be empty",
        });
      }

      batch.name = name.trim();
    }

    if (startDate !== undefined) {
      batch.startDate = new Date(startDate);
    }

    if (sessionStartTime !== undefined) {
      batch.sessionStartTime = sessionStartTime;
    }

    if (sessionEndTime !== undefined) {
      batch.sessionEndTime = sessionEndTime;
    }

    if (
      endDate !== undefined &&
      Object.prototype.hasOwnProperty.call(
        batch.toObject(),
        "endDate"
      )
    ) {
      batch.endDate = endDate
        ? new Date(endDate)
        : null;
    }

    await batch.save();

    const updatedBatch = await Batch.findById(id)
      .populate(
        "mentorIds",
        "name email role gender"
      )
      .populate(
        "studentIds",
        "name email role gender"
      );

    res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error("Update batch error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A batch with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update batch",
      error: error.message,
    });
  }
};

// =========================================================
// ASSIGN STUDENTS TO MENTOR + BATCH
// POST /api/batches/:id/assign-mentor
// =========================================================

const assignStudentsToMentor = async (req, res) => {
  try {
    console.log("\n======================================");
    console.log("ASSIGN STUDENTS TO BATCH");
    console.log("======================================");

    const { id } = req.params;
    const { mentorId, studentIds } = req.body;

    console.log("Batch ID:", id);
    console.log("Mentor ID:", mentorId);
    console.log("Student IDs:", studentIds);

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "mentorId is required",
      });
    }

    if (!Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        message: "studentIds must be an array",
      });
    }

    // =====================================================
    // FIND BATCH
    // =====================================================

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // =====================================================
    // VERIFY MENTOR
    // =====================================================

    const mentor = await User.findOne({
      _id: mentorId,
      role: "mentor",
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    // =====================================================
    // ADD MENTOR TO BATCH
    // =====================================================

    if (
      !batch.mentorIds.some(
        (mentor) =>
          mentor.toString() === mentorId.toString()
      )
    ) {
      batch.mentorIds.push(mentorId);
    }

    // =====================================================
    // ADD STUDENTS TO BATCH
    // =====================================================

    studentIds.forEach((studentId) => {
      const exists = batch.studentIds.some(
        (student) =>
          student.toString() ===
          studentId.toString()
      );

      if (!exists) {
        batch.studentIds.push(studentId);
      }
    });

    // =====================================================
    // SAVE BATCH
    // =====================================================

    await batch.save();

    // =====================================================
    // UPDATE USERS
    // =====================================================

    if (studentIds.length > 0) {
      await User.updateMany(
        {
          _id: { $in: studentIds },
          role: "student",
        },
        {
          $set: {
            batchId: batch._id,
            assignedMentor: mentorId,
          },
        },
        {
          runValidators: false,
        }
      );
    }

    // =====================================================
    // GET UPDATED BATCH
    // =====================================================

    const updatedBatch = await Batch.findById(id)
      .populate(
        "mentorIds",
        "name email role"
      )
      .populate(
        "studentIds",
        "name email role"
      );

    console.log(
      "======================================"
    );

    console.log(
      "STUDENTS SUCCESSFULLY ASSIGNED"
    );

    console.log(
      "Batch:",
      updatedBatch.name
    );

    console.log(
      "Students:",
      studentIds.length
    );

    console.log(
      "======================================"
    );

    res.status(200).json({
      success: true,
      message:
        "Students assigned to mentor and batch successfully",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error(
      "Assign students error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to assign students",
      error: error.message,
    });
  }
};

// =========================================================
// DELETE / ARCHIVE BATCH
// =========================================================

const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Check if batch has active students or mentors before hard delete
    const studentCount = batch.studentIds ? batch.studentIds.length : 0;
    const mentorCount = batch.mentorIds ? batch.mentorIds.length : 0;

    // Hard delete from database and unassign batchId from associated users
    await User.updateMany(
      { batchId: id },
      { $unset: { batchId: "", assignedMentor: "" } }
    );

    await Batch.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Batch "${batch.name}" deleted successfully (${studentCount} students and ${mentorCount} mentors unassigned).`,
    });
  } catch (error) {
    console.error("Delete batch error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete batch",
      error: error.message,
    });
  }
};

// =========================================================
// GET MENTOR BATCHES
// GET /api/batches/mentor
// =========================================================

const getMentorBatches = async (req, res) => {
  try {
    const userRole = String(req.user?.role || "").toLowerCase();
    const userId = req.user?._id || req.user?.id;
    const emailQuery = req.query.email;

    let targetMentorId = userId;

    if (emailQuery) {
      const mentorUser = await User.findOne({
        email: String(emailQuery).trim().toLowerCase(),
      });
      if (mentorUser) {
        targetMentorId = mentorUser._id;
      }
    }

    let filter = {};
    if (userRole === "admin" || userRole === "superadmin") {
      if (emailQuery && targetMentorId) {
        filter = { mentorIds: targetMentorId };
      } else {
        filter = {}; // return all batches for admin
      }
    } else {
      filter = { mentorIds: targetMentorId };
    }

    const batches = await Batch.find(filter)
      .populate("mentorIds", "name email role gender")
      .populate("studentIds", "name email role gender userID")
      .sort({ startDate: -1, createdAt: -1 });

    for (const batch of batches) {
      await syncBatchStatus(batch);
    }

    return res.status(200).json({
      success: true,
      batches,
    });
  } catch (error) {
    console.error("Get mentor batches error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load mentor batches",
      error: error.message,
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  getBatches,
  getBatchById,
  getMentorBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  assignStudentsToMentor,
};