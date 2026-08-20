const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "text",
        "textarea",
        "select",
        "radio",
        "checkbox",
        "number",
        "date",
      ],
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const applicationFormSchema = new mongoose.Schema(
  {
    fields: {
      type: [fieldSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ApplicationForm",
  applicationFormSchema
);