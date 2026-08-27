const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const EmailTemplate = require("../models/EmailTemplate");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =========================================================
// SEND EMAIL
// =========================================================

const sendEmail = async ({
  to,
  subject,
  text,
  html,
  attachments,
}) => {
  const info = await transporter.sendMail({
    from: `"Bootcamp Management System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    ...(attachments ? { attachments } : {}),
  });

  console.log(`EMAIL SENT TO: ${to}`);
  console.log(`MESSAGE ID: ${info.messageId}`);

  return info;
};

// =========================================================
// REPLACE TEMPLATE VARIABLES
// =========================================================

const replaceVariables = (content, variables = {}) => {
  if (!content) {
    return "";
  }

  return content.replace(
    /{{\s*([a-zA-Z0-9_]+)\s*}}/g,
    (match, key) => {
      return variables[key] !== undefined &&
        variables[key] !== null
        ? String(variables[key])
        : "";
    }
  );
};

// =========================================================
// SEND TEMPLATE EMAIL
// =========================================================

const sendTemplateEmail = async ({
  type,
  to,
  variables,
}) => {
  const template = await EmailTemplate.findOne({
    type,
  }).lean();

  if (!template) {
    throw new Error(
      `Email template not found for type: ${type}`
    );
  }

  const subject = replaceVariables(
    template.subject,
    variables
  );

  const text = replaceVariables(
    template.text,
    variables
  );

  const html = replaceVariables(
    template.html,
    variables
  );

  return sendEmail({
    to,
    subject,
    text,
    html,
  });
};

// =========================================================
// SHORTLISTED EMAIL
// =========================================================

const sendShortlistedEmail = async (registration) => {
  return sendTemplateEmail({
    type: "SHORTLISTED",
    to: registration.email,
    variables: {
      fullName: registration.fullName,
      batchId: registration.batchId,
      rejectionReason: registration.rejectionReason,
    },
  });
};

// =========================================================
// ACCEPTED EMAIL
// =========================================================

const sendAcceptedEmail = async (
  registration,
  user
) => {
  return sendTemplateEmail({
    type: "ACCEPTED",
    to: registration.email,
    variables: {
      fullName: registration.fullName,
      studentId: user.userID,
      otp: user.otp,
      otpExpiresAt: user.otpExpiresAt,
      batchId: registration.batchId,
    },
  });
};

// =========================================================
// REJECTED EMAIL
// =========================================================

const sendRejectedEmail = async (registration) => {
  return sendTemplateEmail({
    type: "REJECTED",
    to: registration.email,
    variables: {
      fullName: registration.fullName,
      batchId: registration.batchId,
      rejectionReason: registration.rejectionReason,
    },
  });
};

// =========================================================
// STAFF INVITATION EMAIL
// =========================================================

const sendStaffInvitationEmail = async (user) => {
  const roleNames = {
    admin: "Administrator",
    superadmin: "Super Administrator",
    mentor: "Mentor",
  };

  const roleName =
    roleNames[user.role] || "Staff Member";

  const logoPath = path.join(
    __dirname,
    "..",
    "assets",
    "bootcamp-logo.png"
  );

  const frontendUrl =
    process.env.FRONTEND_URL ||
    "http://localhost:5174";

  const passwordSetupUrl =
    `${frontendUrl}/set-password?userID=${encodeURIComponent(
      user.userID
    )}&otp=${encodeURIComponent(user.otp)}`;

  const arabicGreeting =
    "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064a\u0643\u0645 \u0648\u0631\u062d\u0645\u0629 \u0627\u0644\u0644\u0647 \u0648\u0628\u0631\u0643\u0627\u062a\u0647";

  return sendEmail({
    to: user.email,

    subject: `Bootcamp Management System - ${roleName} Invitation`,

    text: `${arabicGreeting}

Dear ${user.name},

Welcome to the Bootcamp Management System.

You have been invited as a ${roleName}.

Your User ID is: ${user.userID}
Your temporary OTP is: ${user.otp}

The OTP expires at: ${user.otpExpiresAt}

Set your password here:
${passwordSetupUrl}

Please use your User ID and OTP to verify your invitation and create your password.

After successfully setting your password, you can log in using your email address and new password.

Best regards,
Bootcamp Management System`,

    html: `
      <div style="font-family: Arial, sans-serif;">

        <p
          dir="rtl"
          style="
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
          "
        >
          ${arabicGreeting}
        </p>

        <h2>Welcome, ${user.name}!</h2>

        <p>
          You have been invited as a
          <strong>${roleName}</strong>
          in the Bootcamp Management System.
        </p>

        <p>
          <strong>User ID:</strong> ${user.userID}
        </p>

        <p>
          <strong>Temporary OTP:</strong> ${user.otp}
        </p>

        <p>
          <strong>OTP expires:</strong> ${user.otpExpiresAt}
        </p>

        <p>
          Please click the button below to create your password.
        </p>

        <p style="margin: 24px 0;">
          <a
            href="${passwordSetupUrl}"
            target="_blank"
            rel="noopener noreferrer"
            style="
              display: inline-block;
              padding: 12px 22px;
              background: #1f2937;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            "
          >
            Set Your Password
          </a>
        </p>

        <p>
          Please use your User ID and OTP to verify your
          invitation and create your password.
        </p>

        <p>
          After successfully setting your password, you can
          log in using your email address and new password.
        </p>

        <p>
          Best regards,<br>
          Bootcamp Management System
        </p>

      </div>
    `,

    attachments: [
      {
        filename: "bootcamp-logo.png",
        content: fs.readFileSync(logoPath),
        contentType: "image/png",
      },
    ],
  });
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  sendShortlistedEmail,
  sendAcceptedEmail,
  sendRejectedEmail,
  sendStaffInvitationEmail,
};