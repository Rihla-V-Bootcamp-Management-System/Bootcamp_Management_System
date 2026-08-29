const About = require("../models/About");

const getAbout = async (req, res) => {
  try {
    const about = await About.findOne({
      published: true,
    }).sort({ createdAt: -1 });

    if (!about) {
      return res.json({
        title: "About Our Bootcamp",
        description: "Empowering next-generation builders through rigorous hands-on technical curriculum, collaborative mentorship, and project-based mastery.",
        published: true,
      });
    }

    res.json(about);
  } catch (error) {
    console.error("GET ABOUT ERROR:", error);

    res.status(500).json({
      message: "Failed to load About information",
    });
  }
};

const getAdminAbout = async (req, res) => {
  try {
    const about = await About.findOne().sort({
      createdAt: -1,
    });

    if (!about) {
      return res.json({
        title: "About Our Bootcamp",
        description: "Empowering next-generation builders through rigorous hands-on technical curriculum, collaborative mentorship, and project-based mastery.",
        published: true,
      });
    }

    res.json(about);
  } catch (error) {
    console.error("GET ADMIN ABOUT ERROR:", error);

    res.status(500).json({
      message: "Failed to load About information",
    });
  }
};

const createAbout = async (req, res) => {
  try {
    const { title, description, published } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const existingAbout = await About.findOne();

    if (existingAbout) {
      return res.status(400).json({
        message:
          "About information already exists. Please update it instead.",
      });
    }

    const about = await About.create({
      title: title.trim(),
      description: description.trim(),
      published: published !== false,
    });

    res.status(201).json({
      message: "About information created successfully",
      about,
    });
  } catch (error) {
    console.error("CREATE ABOUT ERROR:", error);

    res.status(500).json({
      message: "Failed to create About information",
    });
  }
};

const updateAbout = async (req, res) => {
  try {
    const { title, description, published } = req.body;

    const about = await About.findOne();

    if (!about) {
      return res.status(404).json({
        message: "About information not found",
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Title cannot be empty",
        });
      }

      about.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          message: "Description cannot be empty",
        });
      }

      about.description = description.trim();
    }

    if (published !== undefined) {
      about.published = published;
    }

    await about.save();

    res.json({
      message: "About information updated successfully",
      about,
    });
  } catch (error) {
    console.error("UPDATE ABOUT ERROR:", error);

    res.status(500).json({
      message: "Failed to update About information",
    });
  }
};

module.exports = {
  getAbout,
  getAdminAbout,
  createAbout,
  updateAbout,
};