const mongoose = require("mongoose");

const Certificate = require("../models/Certificate");
const User = require("../models/User");
const Batch = require("../models/Batch");
const Progress = require("../models/Progress");

// =========================================================
// CONSTANTS
// =========================================================

const REQUIRED_TOPICS = [
  "HTML/CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Express.js",
  "MongoDB",
  "Git/GitHub",
];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// =========================================================
// GENERATE CERTIFICATE NUMBER
// =========================================================

const generateCertificateNumber = async () => {
  let certificateNumber;
  let exists = true;

  while (exists) {
    const year = new Date().getFullYear();

    const randomNumber = Math.floor(
      100000 + Math.random() * 900000
    );

    certificateNumber = `CERT-${year}-${randomNumber}`;

    exists = await Certificate.exists({
      certificateNumber,
    });
  }

  return certificateNumber;
};

// =========================================================
// CHECK VALID OBJECT ID
// =========================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =========================================================
// SAFE PAGINATION
// =========================================================

const getPagination = (page, limit) => {
  const parsedPage = Math.max(
    parseInt(page) || DEFAULT_PAGE,
    1
  );

  const parsedLimit = Math.min(
    Math.max(
      parseInt(limit) || DEFAULT_LIMIT,
      1
    ),
    MAX_LIMIT
  );

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
};

// =========================================================
// GET ADMIN CERTIFICATES
// PAGINATION + SEARCH + STATUS FILTER
// =========================================================

const getAdminCertificates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "All",
    } = req.query;

    const {
      page: currentPage,
      limit: currentLimit,
      skip,
    } = getPagination(page, limit);

    // -------------------------------------------------------
    // Build certificate query
    // -------------------------------------------------------

    const certificateQuery = {};

    if (
      status &&
      status !== "All" &&
      ["Issued", "Revoked"].includes(status)
    ) {
      certificateQuery.status = status;
    }

    // -------------------------------------------------------
    // Search students if search exists
    // -------------------------------------------------------

    if (search && search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      const matchingStudents = await User.find({
        role: "student",
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { userID: searchRegex },
        ],
      }).select("_id");

      certificateQuery.studentId = {
        $in: matchingStudents.map(
          (student) => student._id
        ),
      };
    }

    // -------------------------------------------------------
    // Count
    // -------------------------------------------------------

    const totalCertificates =
      await Certificate.countDocuments(
        certificateQuery
      );

    // -------------------------------------------------------
    // Get certificates
    // -------------------------------------------------------

    const certificates =
      await Certificate.find(certificateQuery)
        .populate(
          "studentId",
          "name email userID gender"
        )
        .populate(
          "batchId",
          "name year season startDate endDate"
        )
        .populate(
          "issuedBy",
          "name email userID"
        )
        .populate(
          "revokedBy",
          "name email userID"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(currentLimit);

    const totalPages = Math.ceil(
      totalCertificates / currentLimit
    );

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total: totalCertificates,
        totalPages,
        hasNextPage:
          currentPage < totalPages,
        hasPreviousPage:
          currentPage > 1,
      },
    });
  } catch (error) {
    console.error(
      "GET ADMIN CERTIFICATES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load certificates",
    });
  }
};

// =========================================================
// GET ELIGIBLE STUDENTS FOR A BATCH
// PAGINATION + GENDER FILTER + SEARCH
// =========================================================

const getEligibleStudents = async (req, res) => {
  try {
    const { batchId } = req.params;

    const {
      page = 1,
      limit = 10,
      gender = "All",
      search = "",
    } = req.query;

    // -------------------------------------------------------
    // Validate batch ID
    // -------------------------------------------------------

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
    }

    // -------------------------------------------------------
    // Find batch
    // -------------------------------------------------------

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // -------------------------------------------------------
    // Pagination
    // -------------------------------------------------------

    const {
      page: currentPage,
      limit: currentLimit,
      skip,
    } = getPagination(page, limit);

    // -------------------------------------------------------
    // Build student query
    // -------------------------------------------------------

    const studentQuery = {
      _id: {
        $in: batch.studentIds || [],
      },
      role: "student",
    };

    // -------------------------------------------------------
    // Gender filter
    // -------------------------------------------------------

    if (
      gender &&
      gender !== "All" &&
      ["Male", "Female"].includes(gender)
    ) {
      studentQuery.gender = gender;
    }

    // -------------------------------------------------------
    // Search
    // -------------------------------------------------------

    if (search && search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      studentQuery.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { userID: searchRegex },
      ];
    }

    // -------------------------------------------------------
    // Count filtered students
    // -------------------------------------------------------

    const totalStudents =
      await User.countDocuments(studentQuery);

    // -------------------------------------------------------
    // Get students
    // -------------------------------------------------------

    const students = await User.find(
      studentQuery
    )
      .select(
        "name email userID gender batchId"
      )
      .sort({
        name: 1,
      })
      .skip(skip)
      .limit(currentLimit);

    // -------------------------------------------------------
    // Get existing certificates
    // -------------------------------------------------------

    const studentIds = students.map(
      (student) => student._id
    );

    const existingCertificates =
      await Certificate.find({
        batchId,
        studentId: {
          $in: studentIds,
        },
      }).select(
        "studentId status certificateNumber"
      );

    // -------------------------------------------------------
    // Certificate lookup
    // -------------------------------------------------------

    const certificateMap = new Map();

    existingCertificates.forEach(
      (certificate) => {
        certificateMap.set(
          certificate.studentId.toString(),
          certificate
        );
      }
    );

    // -------------------------------------------------------
    // Check progress
    // -------------------------------------------------------

    const result = await Promise.all(
      students.map(async (student) => {
        const progressRecords =
          await Progress.find({
            studentId: student._id,
          }).select(
            "topic status notes updatedAt"
          );

        const progressMap = new Map();

        progressRecords.forEach(
          (progress) => {
            progressMap.set(
              progress.topic,
              progress
            );
          }
        );

        // ---------------------------------------------------
        // Completed topics
        // ---------------------------------------------------

        const completedTopics =
          REQUIRED_TOPICS.filter((topic) => {
            const progress =
              progressMap.get(topic);

            return (
              progress &&
              progress.status === "Completed"
            );
          });

        // ---------------------------------------------------
        // Incomplete topics
        // ---------------------------------------------------

        const incompleteTopics =
          REQUIRED_TOPICS.filter(
            (topic) =>
              !completedTopics.includes(topic)
          );

        // ---------------------------------------------------
        // Progress percentage
        // ---------------------------------------------------

        const progressPercentage = Math.round(
          (completedTopics.length /
            REQUIRED_TOPICS.length) *
            100
        );

        // ---------------------------------------------------
        // Eligibility
        // ---------------------------------------------------

        const eligible =
          completedTopics.length ===
          REQUIRED_TOPICS.length;

        // ---------------------------------------------------
        // Existing certificate
        // ---------------------------------------------------

        const existingCertificate =
          certificateMap.get(
            student._id.toString()
          );

        return {
          student: {
            _id: student._id,
            name: student.name,
            email: student.email,
            userID: student.userID,
            gender: student.gender,
          },

          progressPercentage,

          completedTopics,

          incompleteTopics,

          eligible,

          certificate:
            existingCertificate
              ? {
                  _id:
                    existingCertificate._id,
                  status:
                    existingCertificate.status,
                  certificateNumber:
                    existingCertificate.certificateNumber,
                }
              : null,
        };
      })
    );

    // -------------------------------------------------------
    // Statistics
    // -------------------------------------------------------

    const eligibleStudents =
      result.filter(
        (student) =>
          student.eligible &&
          !student.certificate
      ).length;

    const alreadyCertified =
      result.filter(
        (student) =>
          student.certificate &&
          student.certificate.status ===
            "Issued"
      ).length;

    const notEligible =
      result.filter(
        (student) =>
          !student.eligible
      ).length;

    // -------------------------------------------------------
    // Pagination
    // -------------------------------------------------------

    const totalPages = Math.ceil(
      totalStudents / currentLimit
    );

    // -------------------------------------------------------
    // Response
    // -------------------------------------------------------

    return res.status(200).json({
      success: true,

      batch: {
        _id: batch._id,
        name: batch.name,
        year: batch.year,
        season: batch.season,
        startDate: batch.startDate,
        endDate: batch.endDate,
        status: batch.status,
      },

      statistics: {
        totalStudents,
        eligibleStudents,
        alreadyCertified,
        notEligible,
      },

      students: result,

      pagination: {
        page: currentPage,
        limit: currentLimit,
        total: totalStudents,
        totalPages,
        hasNextPage:
          currentPage < totalPages,
        hasPreviousPage:
          currentPage > 1,
      },

      filters: {
        gender,
        search,
      },
    });
  } catch (error) {
    console.error(
      "GET ELIGIBLE STUDENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to determine eligible students",
    });
  }
};

// =========================================================
// ISSUE ONE CERTIFICATE
// =========================================================

const createCertificate = async (req, res) => {
  try {
    const {
      studentId,
      batchId,
      title,
      certificateUrl,
      certificatePublicId,
    } = req.body;

    // -------------------------------------------------------
    // Validation
    // -------------------------------------------------------

    if (!studentId || !batchId) {
      return res.status(400).json({
        success: false,
        message:
          "Student ID and batch ID are required",
      });
    }

    if (
      !isValidObjectId(studentId) ||
      !isValidObjectId(batchId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid student ID or batch ID",
      });
    }

    // -------------------------------------------------------
    // Find student
    // -------------------------------------------------------

    const student = await User.findOne({
      _id: studentId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // -------------------------------------------------------
    // Find batch
    // -------------------------------------------------------

    const batch = await Batch.findById(
      batchId
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // -------------------------------------------------------
    // Check student belongs to batch
    // -------------------------------------------------------

    const belongsToBatch =
      batch.studentIds?.some(
        (id) =>
          id.toString() ===
          studentId.toString()
      );

    if (!belongsToBatch) {
      return res.status(400).json({
        success: false,
        message:
          "Student does not belong to this batch",
      });
    }

    // -------------------------------------------------------
    // Check progress
    // -------------------------------------------------------

    const progressRecords =
      await Progress.find({
        studentId,
      });

    const completedTopicNames =
      progressRecords
        .filter(
          (progress) =>
            progress.status === "Completed"
        )
        .map(
          (progress) => progress.topic
        );

    const isEligible =
      REQUIRED_TOPICS.every(
        (topic) =>
          completedTopicNames.includes(topic)
      );

    if (!isEligible) {
      return res.status(400).json({
        success: false,
        message:
          "Student has not completed all required topics",
        completedTopics:
          completedTopicNames,
        requiredTopics:
          REQUIRED_TOPICS,
      });
    }

    // -------------------------------------------------------
    // Prevent duplicate
    // -------------------------------------------------------

    const existingCertificate =
      await Certificate.findOne({
        studentId,
        batchId,
      });

    if (existingCertificate) {
      return res.status(409).json({
        success: false,
        message:
          "Certificate already exists for this student and batch",
        certificate:
          existingCertificate,
      });
    }

    // -------------------------------------------------------
    // Generate certificate number
    // -------------------------------------------------------

    const certificateNumber =
      await generateCertificateNumber();

    // -------------------------------------------------------
    // Create certificate
    // -------------------------------------------------------

    const certificate =
      await Certificate.create({
        studentId,
        batchId,
        certificateNumber,
        title:
          title ||
          "Bootcamp Completion Certificate",
        certificateUrl:
          certificateUrl || "",
        certificatePublicId:
          certificatePublicId || "",
        issuedBy: req.user._id,
        issuedAt: new Date(),
        status: "Issued",
      });

    // -------------------------------------------------------
    // Populate
    // -------------------------------------------------------

    const populatedCertificate =
      await Certificate.findById(
        certificate._id
      )
        .populate(
          "studentId",
          "name email userID gender"
        )
        .populate(
          "batchId",
          "name year season"
        )
        .populate(
          "issuedBy",
          "name email userID"
        );

    return res.status(201).json({
      success: true,
      message:
        "Certificate issued successfully",
      certificate:
        populatedCertificate,
    });
  } catch (error) {
    console.error(
      "CREATE CERTIFICATE ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Certificate already exists for this student and batch",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to issue certificate",
    });
  }
};

// =========================================================
// ISSUE CERTIFICATES FOR ENTIRE BATCH
// =========================================================

const issueBatchCertificates = async (
  req,
  res
) => {
  try {
    const { batchId } = req.params;

    const {
      studentIds,
      title,
      certificateUrl,
      certificatePublicId,
    } = req.body;

    // -------------------------------------------------------
    // Validate batch
    // -------------------------------------------------------

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
    }

    const batch = await Batch.findById(
      batchId
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // -------------------------------------------------------
    // Determine students
    // -------------------------------------------------------

    let selectedStudentIds =
      Array.isArray(studentIds) &&
      studentIds.length > 0
        ? studentIds
        : batch.studentIds || [];

    selectedStudentIds = [
      ...new Set(
        selectedStudentIds.map((id) =>
          id.toString()
        )
      ),
    ];

    // -------------------------------------------------------
    // Validate IDs
    // -------------------------------------------------------

    const invalidId =
      selectedStudentIds.find(
        (id) => !isValidObjectId(id)
      );

    if (invalidId) {
      return res.status(400).json({
        success: false,
        message:
          "One or more student IDs are invalid",
      });
    }

    // -------------------------------------------------------
    // Find students
    // -------------------------------------------------------

    const students = await User.find({
      _id: {
        $in: selectedStudentIds,
      },
      role: "student",
    });

    // -------------------------------------------------------
    // Results
    // -------------------------------------------------------

    const issued = [];
    const skipped = [];
    const failed = [];

    // -------------------------------------------------------
    // Process
    // -------------------------------------------------------

    for (const student of students) {
      try {
        const belongsToBatch =
          batch.studentIds?.some(
            (id) =>
              id.toString() ===
              student._id.toString()
          );

        if (!belongsToBatch) {
          skipped.push({
            studentId: student._id,
            name: student.name,
            reason:
              "Student does not belong to this batch",
          });

          continue;
        }

        // ---------------------------------------------------
        // Existing certificate
        // ---------------------------------------------------

        const existing =
          await Certificate.findOne({
            studentId:
              student._id,
            batchId,
          });

        if (existing) {
          skipped.push({
            studentId: student._id,
            name: student.name,
            reason:
              "Certificate already exists",
            certificateId:
              existing._id,
          });

          continue;
        }

        // ---------------------------------------------------
        // Progress
        // ---------------------------------------------------

        const progressRecords =
          await Progress.find({
            studentId:
              student._id,
          });

        const completedTopics =
          progressRecords
            .filter(
              (progress) =>
                progress.status ===
                "Completed"
            )
            .map(
              (progress) =>
                progress.topic
            );

        // ---------------------------------------------------
        // Eligibility
        // ---------------------------------------------------

        const eligible =
          REQUIRED_TOPICS.every(
            (topic) =>
              completedTopics.includes(
                topic
              )
          );

        if (!eligible) {
          skipped.push({
            studentId: student._id,
            name: student.name,
            reason:
              "Student has not completed all required topics",
          });

          continue;
        }

        // ---------------------------------------------------
        // Generate number
        // ---------------------------------------------------

        const certificateNumber =
          await generateCertificateNumber();

        // ---------------------------------------------------
        // Create
        // ---------------------------------------------------

        const certificate =
          await Certificate.create({
            studentId:
              student._id,
            batchId,
            certificateNumber,
            title:
              title ||
              "Bootcamp Completion Certificate",
            certificateUrl:
              certificateUrl || "",
            certificatePublicId:
              certificatePublicId ||
              "",
            issuedBy:
              req.user._id,
            issuedAt: new Date(),
            status: "Issued",
          });

        issued.push({
          certificateId:
            certificate._id,
          certificateNumber,
          studentId:
            student._id,
          name: student.name,
          email: student.email,
        });
      } catch (studentError) {
        console.error(
          `CERTIFICATE ERROR FOR ${student._id}:`,
          studentError
        );

        failed.push({
          studentId:
            student._id,
          name: student.name,
          reason:
            studentError.message,
        });
      }
    }

    return res.status(201).json({
      success: true,

      message:
        "Batch certificate processing completed",

      summary: {
        selected:
          selectedStudentIds.length,
        issued: issued.length,
        skipped: skipped.length,
        failed: failed.length,
      },

      issued,
      skipped,
      failed,
    });
  } catch (error) {
    console.error(
      "ISSUE BATCH CERTIFICATES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to issue batch certificates",
    });
  }
};

// =========================================================
// GET SINGLE CERTIFICATE
// =========================================================

const getCertificateById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid certificate ID",
      });
    }

    const certificate =
      await Certificate.findById(id)
        .populate(
          "studentId",
          "name email userID gender"
        )
        .populate(
          "batchId",
          "name year season startDate endDate"
        )
        .populate(
          "issuedBy",
          "name email userID"
        )
        .populate(
          "revokedBy",
          "name email userID"
        );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message:
          "Certificate not found",
      });
    }

    return res.status(200).json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error(
      "GET CERTIFICATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load certificate",
    });
  }
};

// =========================================================
// REVOKE CERTIFICATE
// =========================================================

const revokeCertificate = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const { reason } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid certificate ID",
      });
    }

    const certificate =
      await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message:
          "Certificate not found",
      });
    }

    if (certificate.status === "Revoked") {
      return res.status(400).json({
        success: false,
        message:
          "Certificate is already revoked",
      });
    }

    certificate.status = "Revoked";
    certificate.revokedAt = new Date();
    certificate.revokedBy =
      req.user._id;
    certificate.revokeReason =
      reason?.trim() ||
      "Certificate revoked by administrator";

    await certificate.save();

    return res.status(200).json({
      success: true,
      message:
        "Certificate revoked successfully",
      certificate,
    });
  } catch (error) {
    console.error(
      "REVOKE CERTIFICATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to revoke certificate",
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  getAdminCertificates,
  getEligibleStudents,
  createCertificate,
  issueBatchCertificates,
  getCertificateById,
  revokeCertificate,
};
