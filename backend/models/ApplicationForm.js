const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        "text",
        "textarea",
        "select",
        "radio",
        "checkbox",
        "number",
        "date"
      ],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    options: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const applicationFormSchema = new mongoose.Schema(
  {
    seasonId: {
      type: String,
      required: true,
      unique: true
    },
    fields: {
      type: [fieldSchema],
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "ApplicationForm",
  applicationFormSchema
);