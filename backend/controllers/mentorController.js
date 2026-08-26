const mongoose = require("mongoose");
const User = require("../models/User");

// =========================================================
// HELPERS
// =========================================================

const getRole = (user) => {
  return String(user?.role || "")
    .trim()
    .toLowerCase();
};

const isAdmin = (user) => {
  const role = getRole(user);

  return (
    role === "admin" ||
    role === "superadmin"
  );
};

// =========================================================
// ADMIN - REGISTER MENTOR
// POST /api/mentors/register
// =========================================================

const registerMentor = async (req, res) => {
  try {
    console.log("\n================================");
    console.log("        REGISTER MENTOR");
    console.log("================================");

    console.log("Logged in admin:", {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    });

    console.log("Request body:", req.body);

    // -----------------------------------------------------
    // CHECK ADMIN
    // -----------------------------------------------------

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can register mentors",
        role: getRole(req.user),
      });
    }

    // -----------------------------------------------------
    // GET DATA
    // -----------------------------------------------------

    const {
      name,
      email,
      phone,
      telegramUsername,
    } = req.body;

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (
      !name ||
      !email ||
      !phone ||
      !telegramUsername
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone number, and Telegram username are required",
      });
    }

    // -----------------------------------------------------
    // CLEAN DATA
    // -----------------------------------------------------

    const cleanName = String(name).trim();

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    const cleanPhone = String(phone).trim();

    const cleanTelegramUsername =
      String(telegramUsername).trim();

    // -----------------------------------------------------
    // CHECK EMAIL
    // -----------------------------------------------------

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "A user with this email already exists",
      });
    }

    // -----------------------------------------------------
    // CREATE MENTOR
    // -----------------------------------------------------

    const mentor = await User.create({
      name: cleanName,
      email: cleanEmail,

      // No password during mentor registration
      password: "",

      role: "mentor",

      phone: cleanPhone,

      telegramUsername:
        cleanTelegramUsername,

      assignedMentor: null,
      batchId: null,

      mustResetPassword: true,
      otp: null,
      otpExpiresAt: null,
      otpVerified: false,
    });

    // -----------------------------------------------------
    // REMOVE SENSITIVE DATA
    // -----------------------------------------------------

    const mentorResponse =
      await User.findById(mentor._id)
        .select("-password -otp");

    // -----------------------------------------------------
    // SUCCESS
    // -----------------------------------------------------

    console.log("✅ MENTOR REGISTERED");

    console.log({
      id: mentor._id,
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone,
      telegramUsername:
        mentor.telegramUsername,
    });

    return res.status(201).json({
      success: true,
      message:
        "Mentor registered successfully",
      mentor: mentorResponse,
    });
  } catch (error) {
    console.error(
      "REGISTER MENTOR ERROR:",
      error
    );

    // Duplicate email protection
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "A user with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register mentor",
      error: error.message,
    });
  }
};

// =========================================================
// ADMIN - GET STUDENTS
// GET /api/mentors/students
// =========================================================

const getStudents = async (req, res) => {
  try {
    console.log("\n========== GET STUDENTS ==========");

    console.log("Logged in user:", {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    });

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view students",
        role: getRole(req.user),
      });
    }

    const students = await User.find({
      role: "student",
    })
      .select("-password -otp")
      .populate(
        "assignedMentor",
        "name email phone telegramUsername role"
      )
      .populate(
        "batchId",
        "name"
      );

    console.log(
      "Students found:",
      students.length
    );

    return res.status(200).json({
      success: true,
      total: students.length,
      students,
    });
  } catch (error) {
    console.error(
      "GET STUDENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load students",
      error: error.message,
    });
  }
};

// =========================================================
// ADMIN - GET MENTORS
// GET /api/mentors/mentors
// =========================================================

const getMentors = async (req, res) => {
  try {
    console.log("\n========== GET MENTORS ==========");

    console.log("Logged in user:", {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    });

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view mentors",
        role: getRole(req.user),
      });
    }

    const mentors = await User.find({
      role: "mentor",
    })
      .select("-password -otp")
      .populate(
        "batchId",
        "name"
      );

    console.log(
      "Mentors found:",
      mentors.length
    );

    return res.status(200).json({
      success: true,
      total: mentors.length,
      mentors,
    });
  } catch (error) {
    console.error(
      "GET MENTORS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load mentors",
      error: error.message,
    });
  }
};

// =========================================================
// ADMIN - GET SINGLE MENTOR
// GET /api/mentors/:id
// =========================================================

const getMentorById = async (req, res) => {
  try {
    console.log(
      "\n========== GET MENTOR BY ID =========="
    );

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "Only admins can view mentor details",
      });
    }

    const { id } = req.params;

    // -----------------------------------------------------
    // VALIDATE ID
    // -----------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentor ID",
      });
    }

    // -----------------------------------------------------
    // FIND MENTOR
    // -----------------------------------------------------

    const mentor = await User.findOne({
      _id: id,
      role: "mentor",
    })
      .select("-password -otp")
      .populate(
        "batchId",
        "name startDate endDate"
      );

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    // -----------------------------------------------------
    // GET STUDENTS ASSIGNED TO THIS MENTOR
    // -----------------------------------------------------

    const students = await User.find({
      role: "student",
      assignedMentor: mentor._id,
    })
      .select(
        "name email gender phone batchId"
      )
      .populate(
        "batchId",
        "name"
      );

    return res.status(200).json({
      success: true,

      mentor,

      assignedStudents: students,

      totalAssignedStudents:
        students.length,
    });
  } catch (error) {
    console.error(
      "GET MENTOR BY ID ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load mentor details",
      error: error.message,
    });
  }
};

// =========================================================
// ADMIN - ASSIGN MENTOR
// POST /api/mentors/assign
// =========================================================

const assignMentor = async (req, res) => {
  try {
    console.log(
      "\n========================================"
    );
    console.log("          ASSIGN MENTOR");
    console.log(
      "========================================"
    );

    console.log("Logged in user:", {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    });

    console.log(
      "Request body:",
      req.body
    );

    // -----------------------------------------------------
    // CHECK ADMIN
    // -----------------------------------------------------

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "Only admins can assign mentors",
        role: getRole(req.user),
      });
    }

    // -----------------------------------------------------
    // GET IDS
    // -----------------------------------------------------

    const {
      studentId,
      mentorId,
    } = req.body;

    if (!studentId || !mentorId) {
      return res.status(400).json({
        success: false,
        message:
          "studentId and mentorId are required",
      });
    }

    // -----------------------------------------------------
    // CLEAN IDS
    // -----------------------------------------------------

    const cleanStudentId =
      String(studentId).trim();

    const cleanMentorId =
      String(mentorId).trim();

    // -----------------------------------------------------
    // VALIDATE IDS
    // -----------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        cleanStudentId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid studentId",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        cleanMentorId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentorId",
      });
    }

    // -----------------------------------------------------
    // FIND STUDENT
    // -----------------------------------------------------

    const student =
      await User.findById(
        cleanStudentId
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // -----------------------------------------------------
    // CHECK STUDENT ROLE
    // -----------------------------------------------------

    if (
      getRole(student) !== "student"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Selected user is not a student",
        role: student.role,
      });
    }

    // -----------------------------------------------------
    // FIND MENTOR
    // -----------------------------------------------------

    const mentor =
      await User.findById(
        cleanMentorId
      );

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    // -----------------------------------------------------
    // CHECK MENTOR ROLE
    // -----------------------------------------------------

    if (
      getRole(mentor) !== "mentor"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Selected user is not a mentor",
        role: mentor.role,
      });
    }

    // -----------------------------------------------------
    // CHECK SAME MENTOR
    // -----------------------------------------------------

    if (
      student.assignedMentor &&
      student.assignedMentor.toString() ===
        mentor._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This mentor is already assigned to this student",
      });
    }

    // -----------------------------------------------------
    // ASSIGN MENTOR
    // -----------------------------------------------------

    const updatedStudent =
      await User.findByIdAndUpdate(
        cleanStudentId,
        {
          $set: {
            assignedMentor:
              mentor._id,
          },
        },
        {
          new: true,
          runValidators: false,
        }
      )
        .select("-password -otp")
        .populate(
          "assignedMentor",
          "name email phone telegramUsername role"
        )
        .populate(
          "batchId",
          "name"
        );

    console.log(
      `✅ ${mentor.name} assigned to ${student.name}`
    );

    return res.status(200).json({
      success: true,
      message:
        "Mentor assigned successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error(
      "ASSIGN MENTOR ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to assign mentor",
      error: error.message,
    });
  }
};

// =========================================================
// ADMIN - REMOVE MENTOR
// DELETE /api/mentors/remove/:studentId
// =========================================================

const removeMentor = async (req, res) => {
  try {
    console.log(
      "\n========== REMOVE MENTOR =========="
    );

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "Only admins can remove mentors",
      });
    }

    const studentId = String(
      req.params.studentId || ""
    ).trim();

    // -----------------------------------------------------
    // VALIDATE ID
    // -----------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        studentId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid student ID",
      });
    }

    // -----------------------------------------------------
    // FIND STUDENT
    // -----------------------------------------------------

    const student =
      await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message:
          "Student not found",
      });
    }

    // -----------------------------------------------------
    // REMOVE MENTOR
    // -----------------------------------------------------

    const updatedStudent =
      await User.findByIdAndUpdate(
        studentId,
        {
          $set: {
            assignedMentor: null,
          },
        },
        {
          new: true,
          runValidators: false,
        }
      )
        .select("-password -otp")
        .populate(
          "assignedMentor",
          "name email phone telegramUsername role"
        )
        .populate(
          "batchId",
          "name"
        );

    console.log(
      "✅ MENTOR REMOVED"
    );

    return res.status(200).json({
      success: true,
      message:
        "Mentor removed successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error(
      "REMOVE MENTOR ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove mentor",
      error: error.message,
    });
  }
};

// =========================================================
// STUDENT - GET MY MENTOR
// GET /api/mentors/my-mentor
// =========================================================

const getMyMentor = async (req, res) => {
  try {
    const role = getRole(req.user);

    if (role !== "student") {
      return res.status(403).json({
        success: false,
        message:
          "Only students can view their mentor",
        detectedRole: role,
      });
    }

    const student =
      await User.findById(
        req.user._id
      )
        .select("-password -otp")
        .populate(
          "assignedMentor",
          "name email phone telegramUsername role"
        );

    if (!student) {
      return res.status(404).json({
        success: false,
        message:
          "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      mentor:
        student.assignedMentor ||
        null,
    });
  } catch (error) {
    console.error(
      "GET MY MENTOR ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get mentor",
      error: error.message,
    });
  }
};

// =========================================================
// MENTOR - GET MY STUDENTS
// GET /api/mentors/my-students
// =========================================================

const getMyStudents = async (req, res) => {
  try {
    if (
      getRole(req.user) !==
      "mentor"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only mentors can view their students",
      });
    }

    const students =
      await User.find({
        role: "student",
        assignedMentor:
          req.user._id,
      })
        .select("-password -otp")
        .populate(
          "batchId",
          "name"
        );

    return res.status(200).json({
      success: true,
      total: students.length,
      students,
    });
  } catch (error) {
    console.error(
      "GET MY STUDENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get assigned students",
      error: error.message,
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  registerMentor,
  getStudents,
  getMentors,
  getMentorById,
  assignMentor,
  removeMentor,
  getMyMentor,
  getMyStudents,
};