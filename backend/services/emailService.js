const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: 587,
  secure: false,
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

  const previewUrl = nodemailer.getTestMessageUrl(info);

  if (previewUrl) {
    console.log("EMAIL PREVIEW:", previewUrl);
  }

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
  const roleName =
    user.role === "admin" ? "Administrator" : "Mentor";

  return sendEmail({
    to: user.email,
    subject: `Bootcamp Management System - ${roleName} Invitation`,
    text: `Dear ${user.name},

You have been invited to join the Bootcamp Management System as a ${roleName}.

Your User ID is: ${user.userID}
Your temporary OTP is: ${user.otp}

The OTP expires at: ${user.otpExpiresAt}

Please use your User ID and OTP to verify your invitation and create your password.

Best regards,
Bootcamp Management System`,
    html: `
      <h2>Welcome, ${user.name}!</h2>
      <p>You have been invited to join the <strong>Bootcamp Management System</strong> as a <strong>${roleName}</strong>.</p>
      <p><strong>User ID:</strong> ${user.userID}</p>
      <p><strong>Temporary OTP:</strong> ${user.otp}</p>
      <p><strong>OTP expires:</strong> ${user.otpExpiresAt}</p>
      <p>Use your User ID and OTP to verify your invitation and create your password.</p>
      <p>Best regards,<br>Bootcamp Management System</p>
    `,
  });
};

module.exports = {
  sendShortlistedEmail,
  sendAcceptedEmail,
  sendRejectedEmail,
  sendStaffInvitationEmail,
};