const express = require("express");
const FAQ = require("../models/FAQ");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const faqs = await FAQ.find({ published: true }).sort({
      createdAt: -1,
    });

    res.json(faqs);
  } catch (error) {
    console.error("GET FAQ ERROR:", error);

    res.status(500).json({
      message: "Failed to load FAQs",
    });
  }
});

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  async (req, res) => {
    try {
      const faqs = await FAQ.find().sort({
        createdAt: -1,
      });

      res.json(faqs);
    } catch (error) {
      console.error("GET ADMIN FAQ ERROR:", error);

      res.status(500).json({
        message: "Failed to load FAQs",
      });
    }
  }
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  async (req, res) => {
    try {
      console.log("CREATE FAQ REQUEST");
      console.log("USER:", req.user);
      console.log("BODY:", req.body);

      const { question, answer, published } = req.body;

      if (
        typeof question !== "string" ||
        typeof answer !== "string" ||
        !question.trim() ||
        !answer.trim()
      ) {
        return res.status(400).json({
          message: "Question and answer are required.",
        });
      }

      if (!req.user || !req.user._id) {
        return res.status(401).json({
          message: "Authenticated user not found.",
        });
      }

      const faq = await FAQ.create({
        question: question.trim(),
        answer: answer.trim(),
        published:
          published === undefined
            ? true
            : Boolean(published),
        createdBy: req.user._id,
      });

      console.log("FAQ CREATED:", faq._id);

      return res.status(201).json({
        message: "FAQ created successfully",
        faq,
      });
    } catch (error) {
      console.error("CREATE FAQ ERROR:", error);

      return res.status(500).json({
        message: error.message || "Failed to create FAQ",
      });
    }
  }
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  async (req, res) => {
    try {
      console.log("UPDATE FAQ REQUEST");
      console.log("ID:", req.params.id);
      console.log("BODY:", req.body);

      const faq = await FAQ.findById(req.params.id);

      if (!faq) {
        return res.status(404).json({
          message: "FAQ not found",
        });
      }

      const { question, answer, published } = req.body;

      if (question !== undefined) {
        if (
          typeof question !== "string" ||
          !question.trim()
        ) {
          return res.status(400).json({
            message: "Question cannot be empty.",
          });
        }

        faq.question = question.trim();
      }

      if (answer !== undefined) {
        if (
          typeof answer !== "string" ||
          !answer.trim()
        ) {
          return res.status(400).json({
            message: "Answer cannot be empty.",
          });
        }

        faq.answer = answer.trim();
      }

      if (published !== undefined) {
        faq.published = Boolean(published);
      }

      await faq.save();

      return res.json({
        message: "FAQ updated successfully",
        faq,
      });
    } catch (error) {
      console.error("UPDATE FAQ ERROR:", error);

      return res.status(500).json({
        message: error.message || "Failed to update FAQ",
      });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  async (req, res) => {
    try {
      console.log("DELETE FAQ REQUEST");
      console.log("ID:", req.params.id);

      const faq = await FAQ.findById(req.params.id);

      if (!faq) {
        return res.status(404).json({
          message: "FAQ not found",
        });
      }

      await FAQ.findByIdAndDelete(req.params.id);

      return res.json({
        message: "FAQ deleted successfully",
      });
    } catch (error) {
      console.error("DELETE FAQ ERROR:", error);

      return res.status(500).json({
        message: error.message || "Failed to delete FAQ",
      });
    }
  }
);

module.exports = router;