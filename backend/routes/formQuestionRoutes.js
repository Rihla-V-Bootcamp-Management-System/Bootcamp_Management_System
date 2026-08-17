const express = require("express");
const FormQuestion = require("../models/FormQuestion");

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

router.post("/", async (req, res) => {
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
});

router.delete("/:id", async (req, res) => {
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
});

module.exports = router;