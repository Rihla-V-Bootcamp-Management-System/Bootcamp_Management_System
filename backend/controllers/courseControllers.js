const Course = require("../models/Course");

// ==========================================
// CREATE COURSE
// ==========================================

const createCourse = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Course name is required",
      });
    }

    const courseName = name.trim();

    // Prevent duplicate course names
    const existingCourse = await Course.findOne({
      name: courseName,
    });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: "Course already exists",
      });
    }

    const course = await Course.create({
      name: courseName,
      description: description
        ? description.trim()
        : "",
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error(
      "Create course error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL COURSES
// ==========================================

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      isActive: true,
    })
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error(
      "Get courses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ONE COURSE
// ==========================================

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(
      req.params.id
    ).populate(
      "createdBy",
      "name email role"
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error(
      "Get course error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE COURSE
// ==========================================

const updateCourse = async (req, res) => {
  try {
    const {
      name,
      description,
      isActive,
    } = req.body;

    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Update name
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Course name cannot be empty",
        });
      }

      const duplicate = await Course.findOne({
        name: name.trim(),
        _id: { $ne: course._id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another course already has this name",
        });
      }

      course.name = name.trim();
    }

    // Update description
    if (description !== undefined) {
      course.description =
        description.trim();
    }

    // Update active state
    if (isActive !== undefined) {
      course.isActive = Boolean(isActive);
    }

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error(
      "Update course error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE / DEACTIVATE COURSE
// ==========================================

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Soft delete
    course.isActive = false;

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course deactivated successfully",
    });
  } catch (error) {
    console.error(
      "Delete course error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};