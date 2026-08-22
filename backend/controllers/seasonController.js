const Season = require("../models/Season");

const createSeason = async (req, res) => {
  try {
    const { name, isOpen, startDate, endDate } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Season name is required",
      });
    }

    const season = await Season.create({
      name,
      isOpen: isOpen ?? false,
      startDate: startDate || null,
      endDate: endDate || null,
    });

    return res.status(201).json({
      message: "Season created successfully",
      season,
    });
  } catch (error) {
    console.error("Create season error:", error);

    return res.status(500).json({
      message: "Failed to create season",
      error: error.message,
    });
  }
};

const getSeasons = async (req, res) => {
  try {
    const seasons = await Season.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      total: seasons.length,
      seasons,
    });
  } catch (error) {
    console.error("Get seasons error:", error);

    return res.status(500).json({
      message: "Failed to get seasons",
      error: error.message,
    });
  }
};

const getCurrentSeason = async (req, res) => {
  try {
    const season = await Season.findOne({
      isOpen: true,
    }).sort({
      createdAt: -1,
    });

    if (!season) {
      return res.status(404).json({
        message: "No application season is currently open",
      });
    }

    return res.status(200).json({
      season,
    });
  } catch (error) {
    console.error("Get current season error:", error);

    return res.status(500).json({
      message: "Failed to get current season",
      error: error.message,
    });
  }
};

const updateSeason = async (req, res) => {
  try {
    const { id } = req.params;

    const season = await Season.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!season) {
      return res.status(404).json({
        message: "Season not found",
      });
    }

    return res.status(200).json({
      message: "Season updated successfully",
      season,
    });
  } catch (error) {
    console.error("Update season error:", error);

    return res.status(500).json({
      message: "Failed to update season",
      error: error.message,
    });
  }
};

module.exports = {
  createSeason,
  getSeasons,
  getCurrentSeason,
  updateSeason,
};