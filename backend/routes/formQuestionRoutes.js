const express = require("express");
const FormQuestion = require("../models/FormQuestion");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const questions = await FormQuestion.find({ active: true }).sort({
      order: 1,
    });

    res.json({ questions });
  } catch (error) {
    console.error("GET QUESTIONS ERROR:", error);
    res.status(500).json({
      message: "Failed to get questions",
      error: error.message,
    });
  }
});

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { question, type, options, required, order } = req.body;

      if (!question) {
        return res.status(400).json({
          message: "Question is required",
        });
      }

      const newQuestion = await FormQuestion.create({
        question,
        type: type || "text",
        options: options || [],
        required: required || false,
        order: order || 0,
      });

      res.status(201).json({
        message: "Question added successfully",
        question: newQuestion,
      });
    } catch (error) {
      console.error("ADD QUESTION ERROR:", error);
      res.status(500).json({
        message: "Failed to add question",
        error: error.message,
      });
    }
  }
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { question, type, options, required, order } = req.body;

      const existingQuestion = await FormQuestion.findById(req.params.id);

      if (!existingQuestion) {
        return res.status(404).json({
          message: "Question not found",
        });
      }

      if (question !== undefined) {
        existingQuestion.question = question;
      }

      if (type !== undefined) {
        existingQuestion.type = type;
      }

      if (options !== undefined) {
        existingQuestion.options = options;
      }

      if (required !== undefined) {
        existingQuestion.required = required;
      }

      if (order !== undefined) {
        existingQuestion.order = order;
      }

      await existingQuestion.save();

      res.json({
        message: "Question updated successfully",
        question: existingQuestion,
      });
    } catch (error) {
      console.error("UPDATE QUESTION ERROR:", error);
      res.status(500).json({
        message: "Failed to update question",
        error: error.message,
      });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const question = await FormQuestion.findByIdAndUpdate(
        req.params.id,
        { active: false },
        { new: true }
      );

      if (!question) {
        return res.status(404).json({
          message: "Question not found",
        });
      }

      res.json({
        message: "Question removed successfully",
      });
    } catch (error) {
      console.error("DELETE QUESTION ERROR:", error);
      res.status(500).json({
        message: "Failed to remove question",
        error: error.message,
      });
    }
  }
);

module.exports = router;