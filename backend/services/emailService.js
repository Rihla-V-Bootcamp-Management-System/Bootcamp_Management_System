const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html, attachments }) => {
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

const sendShortlistedEmail = async (registration) => {
  return sendEmail({
    to: registration.email,
    subject: "You have been shortlisted",

    text: `Dear ${registration.fullName},

Congratulations! You have been shortlisted for the ${registration.batchId} bootcamp.

Our team will contact you with the interview details.

Best regards,
Bootcamp Management System`,

    html: `
      <h2>Congratulations, ${registration.fullName}!</h2>
      <p>You have been shortlisted for the <strong>${registration.batchId}</strong> bootcamp.</p>
      <p>Our team will contact you with the interview details.</p>
      <p>Best regards,<br>Bootcamp Management System</p>
    `,
  });
};

const sendAcceptedEmail = async (registration, user) => {
  return sendEmail({
    to: registration.email,
    subject: "Welcome to the Bootcamp",

    text: `Dear ${registration.fullName},

Congratulations! You have been accepted into the bootcamp.

Your student ID is: ${user.userID}
Your temporary OTP is: ${user.otp}

The OTP expires at: ${user.otpExpiresAt}

Use your student ID and OTP to set your password.

Best regards,
Bootcamp Management System`,

    html: `
      <h2>Welcome to the Bootcamp, ${registration.fullName}!</h2>
      <p>Congratulations! You have been accepted.</p>
      <p><strong>Student ID:</strong> ${user.userID}</p>
      <p><strong>Temporary OTP:</strong> ${user.otp}</p>
      <p><strong>OTP expires:</strong> ${user.otpExpiresAt}</p>
      <p>Use your Student ID and OTP to set your password.</p>
      <p>Best regards,<br>Bootcamp Management System</p>
    `,
  });
};

const sendRejectedEmail = async (registration) => {
  return sendEmail({
    to: registration.email,
    subject: "Bootcamp Application Update",

    text: `Dear ${registration.fullName},

Thank you for applying to our bootcamp.

After reviewing your application, we are unable to move forward with your application at this time.

We appreciate your interest and wish you the best.

Best regards,
Bootcamp Management System`,

    html: `
      <h2>Application Update</h2>
      <p>Dear ${registration.fullName},</p>
      <p>Thank you for applying to our bootcamp.</p>
      <p>After reviewing your application, we are unable to move forward with your application at this time.</p>
      <p>We appreciate your interest and wish you the best.</p>
      <p>Best regards,<br>Bootcamp Management System</p>
    `,
  });
};

const sendStaffInvitationEmail = async (user) => {
  const roleNames = {
    admin: "Administrator",
    superadmin: "Super Administrator",
    mentor: "Mentor",
  };

  const roleName = roleNames[user.role] || "Staff Member";

  const logoPath = path.join(
    __dirname,
    "..",
    "assets",
    "bootcamp-logo.png"
  );

  const frontendUrl =
    process.env.FRONTEND_URL || "http://localhost:5174";

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
          Please use your User ID and OTP to verify your invitation
          and create your password.
        </p>

        <p>
          After successfully setting your password, you can log in
          using your email address and new password.
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

module.exports = {
  sendShortlistedEmail,
  sendAcceptedEmail,
  sendRejectedEmail,
  sendStaffInvitationEmail,
};