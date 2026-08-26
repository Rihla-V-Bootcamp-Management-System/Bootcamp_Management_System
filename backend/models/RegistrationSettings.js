const mongoose = require("mongoose");

const registrationSettingsSchema = new mongoose.Schema(
  {
    registrationOpen: {
      type: Boolean,
      default: false,
    },

    opensAt: {
      type: Date,
      default: null,
    },

    closesAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RegistrationSettings",
  registrationSettingsSchema
);