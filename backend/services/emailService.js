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
// SEND SUSPENSION EMAIL
// =========================================================

const sendSuspensionEmail = async ({ to, name, reason }) => {
  return sendEmail({
    to,
    subject: "Important Notice: Account Suspension - Bootcamp Management System",
    text: `Hello ${name},\n\nYour account on the Bootcamp Management System has been suspended.\n\nReason for Suspension:\n${reason}\n\nIf you believe this is a mistake, please contact the administration.\n\nBest regards,\nBootcamp Administration`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
        <h2 style="color: #dc2626;">Account Suspension Notice</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>We are writing to inform you that your account on the Bootcamp Management System has been <strong>suspended</strong>.</p>
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #991b1b;">Reason for Suspension:</h4>
          <p style="margin: 0; color: #7f1d1d; font-size: 14px;">${reason}</p>
        </div>
        <p>While suspended, you will not be able to access bootcamp materials, sessions, or assignments.</p>
        <p>If you have any questions or wish to appeal, please contact the bootcamp administration.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Bootcamp Management System • ASTU MSJ</p>
      </div>
    `,
  });
};

// =========================================================
// SEND WARNING EMAIL
// =========================================================

const sendWarningEmail = async ({ to, name, reason, warningNumber }) => {
  return sendEmail({
    to,
    subject: `Official Warning Notice (#${warningNumber || 1}) - Bootcamp Management System`,
    text: `Hello ${name},\n\nYou have received an official warning from the Bootcamp Administration.\n\nWarning #${warningNumber || 1}\nReason:\n${reason}\n\nPlease take this matter seriously. Continued infractions may result in account suspension.\n\nBest regards,\nBootcamp Administration`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #d97706;">Official Warning Notice</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>You have received an official warning (#${warningNumber || 1}) from the Bootcamp Administration regarding your recent activity or participation.</p>
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #92400e;">Reason for Warning:</h4>
          <p style="margin: 0; color: #78350f; font-size: 14px;">${reason}</p>
        </div>
        <p>Please adhere to the bootcamp guidelines and code of conduct. Repeated warnings may lead to dismissal or account suspension.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Bootcamp Management System • ASTU MSJ</p>
      </div>
    `,
  });
};

// =========================================================
// SEND PASSWORD RESET EMAIL WITH REASON
// =========================================================

const sendAdminPasswordResetEmail = async ({ to, name, temporaryPassword, reason }) => {
  return sendEmail({
    to,
    subject: "Your Account Password Has Been Reset - Bootcamp Management System",
    text: `Hello ${name},\n\nYour account password has been reset by an administrator.\n\nReason:\n${reason || "Administrative password reset"}\n\nYour Temporary Password: ${temporaryPassword}\n\nPlease log in and change your password immediately.\n\nBest regards,\nBootcamp Administration`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1f6f5b;">Password Reset Notification</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your password for the Bootcamp Management System has been reset by an administrator.</p>
        ${reason ? `
        <div style="background: #f8fafc; border-left: 4px solid #64748b; padding: 12px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #334155;"><strong>Reason:</strong> ${reason}</p>
        </div>` : ""}
        <div style="background: #e5f1ed; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #165a4a; text-transform: uppercase; font-weight: bold;">Temporary Password</p>
          <p style="margin: 0; font-size: 20px; font-weight: bold; color: #1f6f5b; font-family: monospace;">${temporaryPassword}</p>
        </div>
        <p>Please log in using this temporary password and change it immediately in your profile settings.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Bootcamp Management System • ASTU MSJ</p>
      </div>
    `,
  });
};

// =========================================================
// SEND ACCOUNT DELETION EMAIL
// =========================================================

const sendAccountDeletionEmail = async ({ to, name, reason }) => {
  return sendEmail({
    to,
    subject: "Account Notice: Deletion - Bootcamp Management System",
    text: `Hello ${name},\n\nYour account on the Bootcamp Management System has been removed.\n\nReason:\n${reason}\n\nBest regards,\nBootcamp Administration`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #64748b;">Account Removal Notice</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>This email is to notify you that your account on the Bootcamp Management System has been removed.</p>
        <div style="background: #f1f5f9; border-left: 4px solid #94a3b8; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #334155;">Reason:</h4>
          <p style="margin: 0; color: #475569; font-size: 14px;">${reason}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Bootcamp Management System • ASTU MSJ</p>
      </div>
    `,
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
  sendSuspensionEmail,
  sendWarningEmail,
  sendAdminPasswordResetEmail,
  sendAccountDeletionEmail,
};