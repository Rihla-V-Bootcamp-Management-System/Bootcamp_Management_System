const mongoose = require("mongoose");

const ApplicationForm = require("../models/ApplicationForm");
const Season = require("../models/Season");

// =====================================================
// GET CURRENT APPLICATION FORM
// GET /api/application-forms
//
// IMPORTANT:
// This does NOT check isOpen.
// The application form is independent from
// registration open/closed control.
// =====================================================

const DEFAULT_FIELDS = [
  {
    id: "fullName",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "Enter your full name",
  },
  {
    id: "email",
    label: "Email Address",
    type: "email",
    required: true,
    placeholder: "you@example.com",
  },
  {
    id: "phoneNumber",
    label: "Phone Number",
    type: "tel",
    required: true,
    placeholder: "+251 912 345 678",
  },
  {
    id: "telegramUsername",
    label: "Telegram Username",
    type: "text",
    required: true,
    placeholder: "@username",
  },
  {
    id: "gender",
    label: "Gender",
    type: "select",
    required: true,
    options: ["Male", "Female"],
  },
  {
    id: "educationLevel",
    label: "Education Level / Year",
    type: "select",
    required: true,
    options: [
      "1st Year",
      "2nd Year",
      "3rd Year",
      "4th Year",
      "5th Year",
      "Graduate",
    ],
  },
  {
    id: "educationInstitution",
    label: "University / Institution",
    type: "text",
    required: true,
    placeholder: "e.g. Adama Science and Technology University",
  },
  {
    id: "fieldOfStudy",
    label: "Field of Study",
    type: "text",
    required: true,
    placeholder: "e.g. Software Engineering / Computer Science",
  },
  {
    id: "programmingExperience",
    label: "Programming Experience Level",
    type: "select",
    required: true,
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    id: "githubLink",
    label: "GitHub Profile Link (optional)",
    type: "url",
    required: false,
    placeholder: "https://github.com/your-username",
  },
  {
    id: "codeforcesLink",
    label: "Codeforces Profile Link (optional)",
    type: "url",
    required: false,
    placeholder: "https://codeforces.com/profile/username",
  },
  {
    id: "motivation",
    label: "Why do you want to join this bootcamp?",
    type: "textarea",
    required: false,
    placeholder: "Tell us about your goals and motivations...",
  },
];

const getCurrentApplicationForm = async (req, res) => {
  try {
    // -------------------------------------------------
    // Get the latest season or auto-create default
    // -------------------------------------------------

    let season = await Season.findOne().sort({ createdAt: -1 });

    if (!season) {
      season = await Season.create({
        name: "Bootcamp Season 1",
        description: "ASTU MSJ Summer Bootcamp",
        isOpen: true,
      });
      console.log("Created default season:", season._id.toString());
    }

    // -------------------------------------------------
    // Find application form for this season
    // -------------------------------------------------

    let applicationForm = await ApplicationForm.findOne({
      seasonId: season._id,
    });

    // -------------------------------------------------
    // If form doesn't exist or is empty, seed default fields
    // -------------------------------------------------

    if (!applicationForm) {
      applicationForm = await ApplicationForm.create({
        seasonId: season._id,
        fields: DEFAULT_FIELDS,
      });
      console.log(
        "Created application form with default fields:",
        applicationForm._id.toString()
      );
    } else if (
      !Array.isArray(applicationForm.fields) ||
      applicationForm.fields.length === 0
    ) {
      applicationForm.fields = DEFAULT_FIELDS;
      await applicationForm.save();
      console.log(
        "Seeded default fields into existing application form:",
        applicationForm._id.toString()
      );
    }

    const mergeWithDefaultFields = (existingFields = []) => {
      const coreIds = new Set(DEFAULT_FIELDS.map((f) => f.id));
      const customMap = new Map();
      if (Array.isArray(existingFields)) {
        existingFields.forEach((f) => {
          const key = f.id || f._id?.toString();
          if (key) customMap.set(key, f);
        });
      }

      const baseSchema = DEFAULT_FIELDS.map((coreField) => {
        return customMap.get(coreField.id) || coreField;
      });

      const customOnly = (
        Array.isArray(existingFields) ? existingFields : []
      ).filter(
        (f) => f && (f.id || f._id) && !coreIds.has(f.id || f._id?.toString())
      );

      return [...baseSchema, ...customOnly];
    };

    const formObj = applicationForm.toObject
      ? applicationForm.toObject()
      : applicationForm;
    formObj.fields = mergeWithDefaultFields(formObj.fields);

    // -------------------------------------------------
    // Return
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      season,
      applicationForm: formObj,
      form: formObj,
      data: formObj,
    });
  } catch (error) {
    console.error("Get current application form error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get application form",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE APPLICATION FORM
// POST /api/application-forms
// POST /api/application-forms/:seasonId
// =====================================================

const createApplicationForm = async (req, res) => {
  try {
    const { seasonId } = req.params;
    const fields = req.body.fields || req.body.questions || [];

    let targetSeasonId = seasonId || req.body.seasonId;

    if (!targetSeasonId || !mongoose.Types.ObjectId.isValid(targetSeasonId)) {
      let season = await Season.findOne().sort({ createdAt: -1 });
      if (!season) {
        season = await Season.create({
          name: "Bootcamp Season 1",
          description: "ASTU MSJ Summer Bootcamp",
          isOpen: true,
        });
      }
      targetSeasonId = season._id;
    }

    if (!Array.isArray(fields)) {
      return res.status(400).json({
        success: false,
        message: "fields must be an array",
      });
    }

    let applicationForm = await ApplicationForm.findOne({
      seasonId: targetSeasonId,
    });

    if (applicationForm) {
      applicationForm.fields = fields;
      await applicationForm.save();
    } else {
      applicationForm = await ApplicationForm.create({
        seasonId: targetSeasonId,
        fields,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application form saved successfully",
      form: applicationForm,
      data: applicationForm,
      applicationForm,
    });
  } catch (error) {
    console.error("Create application form error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create application form",
      error: error.message,
    });
  }
};

// =====================================================
// GET APPLICATION FORM BY SEASON
// GET /api/application-forms/:seasonId
// =====================================================

const getApplicationForm = async (req, res) => {
  try {
    const { seasonId } = req.params;

    if (!seasonId || !mongoose.Types.ObjectId.isValid(seasonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seasonId",
      });
    }

    const season = await Season.findById(seasonId);

    if (!season) {
      return res.status(404).json({
        success: false,
        message: "Season not found",
      });
    }

    let applicationForm = await ApplicationForm.findOne({
      seasonId,
    });

    if (!applicationForm) {
      applicationForm = await ApplicationForm.create({
        seasonId,
        fields: DEFAULT_FIELDS,
      });
    }

    return res.status(200).json({
      success: true,
      season,
      applicationForm,
      form: applicationForm,
      data: applicationForm,
    });
  } catch (error) {
    console.error("Get application form error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get application form",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE APPLICATION FORM
// PUT /api/application-forms/:id
// PATCH /api/application-forms/:seasonId
// =====================================================

const updateApplicationForm = async (req, res) => {
  try {
    const targetId = req.params.seasonId || req.params.id || req.body.seasonId;
    const fields = req.body.fields || req.body.questions || [];

    if (!Array.isArray(fields)) {
      return res.status(400).json({
        success: false,
        message: "fields must be an array",
      });
    }

    let applicationForm = null;

    if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
      applicationForm = await ApplicationForm.findById(targetId);
      if (!applicationForm) {
        applicationForm = await ApplicationForm.findOne({ seasonId: targetId });
      }
    }

    if (!applicationForm) {
      let season = await Season.findOne().sort({ createdAt: -1 });
      if (!season) {
        season = await Season.create({
          name: "Bootcamp Season 1",
          description: "ASTU MSJ Summer Bootcamp",
          isOpen: true,
        });
      }

      applicationForm = await ApplicationForm.create({
        seasonId: season._id,
        fields,
      });
    } else {
      applicationForm.fields = fields;
      await applicationForm.save();
    }

    return res.status(200).json({
      success: true,
      message: "Application form saved successfully",
      form: applicationForm,
      data: applicationForm,
      applicationForm,
    });
  } catch (error) {
    console.error("Update application form error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save application form",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createApplicationForm,
  getApplicationForm,
  updateApplicationForm,
  getCurrentApplicationForm,
};