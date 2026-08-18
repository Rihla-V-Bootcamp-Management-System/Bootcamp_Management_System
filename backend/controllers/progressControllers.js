const Progress = require("../models/Progress");

const createProgress = async (req, res) => {
  try {
    const progress = await Progress.create(req.body);
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find()
      .populate("student")
      .populate("course");

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProgress,
  getProgress,
};