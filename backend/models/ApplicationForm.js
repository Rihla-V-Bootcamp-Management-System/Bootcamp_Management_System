const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: function () {
        return new mongoose.Types.ObjectId().toString();
      },
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: "text",
    },
    required: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: "",
    },
    options: {
      type: [String],
      default: [],
    },
    helpText: {
      type: String,
      default: "",
    },
  },
  { _id: true, strict: false }
);

const applicationFormSchema = new mongoose.Schema(
  {
    seasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Season",
      required: true,
      unique: true,
    },
    fields: {
      type: [fieldSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model("ApplicationForm", applicationFormSchema);