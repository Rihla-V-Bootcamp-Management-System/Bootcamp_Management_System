const Batch = require("../models/Batch");

// =========================================================
// HELPER: SYNC BATCH STATUS WITH DATES
// =========================================================

const syncBatchStatus = async (batch) => {
  const now = new Date();

  const startDate = new Date(batch.startDate);
  const endDate = new Date(batch.endDate);

  let newStatus;

  if (now < startDate) {
    newStatus = "Upcoming";
  } else if (now > endDate) {
    newStatus = "Completed";
  } else {
    newStatus = "Active";
  }

  // Only save if the status actually changed
  if (batch.status !== newStatus) {
    batch.status = newStatus;
    await batch.save();
  }

  return batch;
};

// =========================================================
// GET ALL BATCHES WITH PAGINATION
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

    // =====================================================
    // GET BATCHES
    // =====================================================

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
        year: -1,
        startDate: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    // =====================================================
    // SYNC STATUS
    // =====================================================

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

    // =====================================================
    // SYNC STATUS BASED ON CURRENT DATE
    // =====================================================

    await syncBatchStatus(batch);

    // =====================================================
    // USERS
    // =====================================================

    const students = batch.studentIds || [];
    const mentors = batch.mentorIds || [];

    // Admins are not currently stored in Batch.
    // Keep this empty until your team adds adminIds.
    const admins = [];

    // =====================================================
    // GENDER COUNTS
    // =====================================================

    const countGender = (users) => {
      let male = 0;
      let female = 0;

      users.forEach((user) => {
        if (
          user?.gender?.toLowerCase() === "male"
        ) {
          male++;
        }

        if (
          user?.gender?.toLowerCase() === "female"
        ) {
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

    // =====================================================
    // RESPONSE
    // =====================================================

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
      year,
      season,
      startDate,
      endDate,
    } = req.body;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Batch name is required",
      });
    }

    if (!year) {
      return res.status(400).json({
        success: false,
        message: "Year is required",
      });
    }

    if (!season) {
      return res.status(400).json({
        success: false,
        message: "Season is required",
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Start date is required",
      });
    }

    if (!endDate) {
      return res.status(400).json({
        success: false,
        message: "End date is required",
      });
    }

    // =====================================================
    // DATE VALIDATION
    // =====================================================

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date",
      });
    }

    if (Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid end date",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // =====================================================
    // CHECK DUPLICATE
    // =====================================================

    const existingBatch = await Batch.findOne({
      name: name.trim(),
    });

    if (existingBatch) {
      return res.status(409).json({
        success: false,
        message:
          "A batch with this name already exists",
      });
    }

    // =====================================================
    // DETERMINE INITIAL STATUS
    // =====================================================

    const now = new Date();

    let initialStatus;

    if (now < start) {
      initialStatus = "Upcoming";
    } else if (now > end) {
      initialStatus = "Completed";
    } else {
      initialStatus = "Active";
    }

    // =====================================================
    // CREATE BATCH
    // =====================================================

    const batch = await Batch.create({
      name: name.trim(),
      year: Number(year),
      season,
      startDate: start,
      endDate: end,

      // Automatically determined
      status: initialStatus,

      mentorIds: [],
      studentIds: [],
    });

    // =====================================================
    // POPULATE CREATED BATCH
    // =====================================================

    const createdBatch = await Batch.findById(
      batch._id
    )
      .populate(
        "mentorIds",
        "name email role gender"
      )
      .populate(
        "studentIds",
        "name email role gender"
      );

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      batch: createdBatch,
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

    res.status(500).json({
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
      year,
      season,
      startDate,
      endDate,
    } = req.body;

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // =====================================================
    // NAME
    // =====================================================

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Batch name cannot be empty",
        });
      }

      const existingBatch =
        await Batch.findOne({
          name: name.trim(),
          _id: { $ne: id },
        });

      if (existingBatch) {
        return res.status(409).json({
          success: false,
          message:
            "Another batch already has this name",
        });
      }

      batch.name = name.trim();
    }

    // =====================================================
    // YEAR
    // =====================================================

    if (year !== undefined) {
      const parsedYear = Number(year);

      if (Number.isNaN(parsedYear)) {
        return res.status(400).json({
          success: false,
          message: "Invalid year",
        });
      }

      batch.year = parsedYear;
    }

    // =====================================================
    // SEASON
    // =====================================================

    if (season !== undefined) {
      batch.season = season;
    }

    // =====================================================
    // START DATE
    // =====================================================

    if (startDate !== undefined) {
      const start = new Date(startDate);

      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date",
        });
      }

      batch.startDate = start;
    }

    // =====================================================
    // END DATE
    // =====================================================

    if (endDate !== undefined) {
      const end = new Date(endDate);

      if (Number.isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end date",
        });
      }

      batch.endDate = end;
    }

    // =====================================================
    // DATE VALIDATION
    // =====================================================

    if (
      batch.startDate &&
      batch.endDate &&
      new Date(batch.startDate) >=
        new Date(batch.endDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End date must be after start date",
      });
    }

    // =====================================================
    // AUTOMATIC STATUS
    // =====================================================

    const now = new Date();

    if (
      now <
      new Date(batch.startDate)
    ) {
      batch.status = "Upcoming";
    } else if (
      now >
      new Date(batch.endDate)
    ) {
      batch.status = "Completed";
    } else {
      batch.status = "Active";
    }

    // =====================================================
    // SAVE
    // =====================================================

    await batch.save();

    // =====================================================
    // GET UPDATED BATCH
    // =====================================================

    const updatedBatch =
      await Batch.findById(id)
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

    res.status(500).json({
      success: false,
      message: "Failed to update batch",
      error: error.message,
    });
  }
};

// =========================================================
// ASSIGN STUDENTS TO MENTOR
// =========================================================

const assignStudentsToMentor = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      mentorId,
      studentIds,
    } = req.body;

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
        message:
          "studentIds must be an array",
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
    // ADD MENTOR
    // =====================================================

    const mentorExists =
      batch.mentorIds.some(
        (mentor) =>
          mentor.toString() ===
          mentorId.toString()
      );

    if (!mentorExists) {
      batch.mentorIds.push(mentorId);
    }

    // =====================================================
    // ADD STUDENTS
    // =====================================================

    studentIds.forEach((studentId) => {
      const exists =
        batch.studentIds.some(
          (student) =>
            student.toString() ===
            studentId.toString()
        );

      if (!exists) {
        batch.studentIds.push(studentId);
      }
    });

    // =====================================================
    // SAVE
    // =====================================================

    await batch.save();

    // =====================================================
    // GET UPDATED BATCH
    // =====================================================

    const updatedBatch =
      await Batch.findById(id)
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
      message:
        "Students assigned to mentor successfully",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error(
      "Assign students error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to assign students",
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
  createBatch,
  updateBatch,
  assignStudentsToMentor,
};