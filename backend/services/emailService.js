const nodemailer = require("nodemailer");
const EmailTemplate = require("../models/EmailTemplate");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  const info = await transporter.sendMail({
    from: `"Bootcamp Management System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  console.log(`EMAIL SENT TO: ${to}`);
  console.log(`MESSAGE ID: ${info.messageId}`);

  return info;
};

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

const sendStaffInvitationEmail = async (user) => {
  const roleName =
    user.role === "admin" ? "Administrator" : "Mentor";

  return sendEmail({
    to: user.email,
    subject: `Welcome to Bootcamp Management System - ${roleName}`,
    text: `Dear ${user.name},

Welcome to the Bootcamp Management System.

You have been assigned as a ${roleName}.

Your User ID is: ${user.userID}
Your temporary OTP is: ${user.otp}

The OTP expires at: ${user.otpExpiresAt}

Please use your User ID and OTP to verify your invitation and create your password.

Best regards,
Bootcamp Management System`,
    html: `
      <h2>Welcome, ${user.name}!</h2>

      <p>
        You have been assigned as a
        <strong>${roleName}</strong>
        in the Bootcamp Management System.
      </p>

      <p><strong>User ID:</strong> ${user.userID}</p>

      <p><strong>Temporary OTP:</strong> ${user.otp}</p>

      <p><strong>OTP expires:</strong> ${user.otpExpiresAt}</p>

      <p>
        Use your User ID and OTP to verify your invitation
        and create your password.
      </p>

      <p>
        Best regards,<br>
        Bootcamp Management System
      </p>
    `,
  });
};

module.exports = {
  sendShortlistedEmail,
  sendAcceptedEmail,
  sendRejectedEmail,
  sendStaffInvitationEmail,
};