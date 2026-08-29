const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const FormQuestion = require("./models/FormQuestion");
const FAQ = require("./models/FAQ");
const User = require("./models/User");

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Find an admin user for FAQ authorship
    let adminUser = await User.findOne({ role: { $in: ["admin", "superadmin"] } });
    if (!adminUser) {
      adminUser = await User.findOne();
    }

    // ==========================================
    // 1. SEED APPLICATION QUESTIONS
    // ==========================================
    const questionCount = await FormQuestion.countDocuments();
    if (questionCount <= 2) {
      console.log("Seeding application form questions...");
      await FormQuestion.deleteMany({}); // Reset incomplete/placeholder questions

      const standardQuestions = [
        {
          question: "First Name",
          type: "text",
          required: true,
          order: 1,
          active: true,
        },
        {
          question: "Last Name",
          type: "text",
          required: true,
          order: 2,
          active: true,
        },
        {
          question: "Student ID / University Identifier",
          type: "text",
          required: true,
          order: 3,
          active: true,
        },
        {
          question: "Telegram Username",
          type: "text",
          required: true,
          order: 4,
          active: true,
        },
        {
          question: "Preferred Track",
          type: "select",
          options: [
            "Full Stack Web Development",
            "Competitive Programming",
            "Data Science & AI",
          ],
          required: true,
          order: 5,
          active: true,
        },
        {
          question: "Why do you want to join the ASTU MSJ Bootcamp?",
          type: "textarea",
          required: true,
          order: 6,
          active: true,
        },
        {
          question: "Personal Motivation & Background Experience",
          type: "textarea",
          required: true,
          order: 7,
          active: true,
        },
      ];

      await FormQuestion.insertMany(standardQuestions);
      console.log(`Seeded ${standardQuestions.length} standard form questions.`);
    }

    // ==========================================
    // 2. SEED REALISTIC FAQs
    // ==========================================
    const faqCount = await FAQ.countDocuments();
    if (faqCount === 0 && adminUser) {
      console.log("Seeding FAQs...");
      const standardFAQs = [
        {
          question: "What is the ASTU MSJ Summer Bootcamp?",
          answer:
            "The ASTU MSJ Summer Bootcamp is an intensive, hands-on software development and competitive programming program designed to empower students with industry-standard engineering skills, mentorship, and practical capstone projects.",
          published: true,
          createdBy: adminUser._id,
        },
        {
          question: "Who can use this platform — students, mentors, admins?",
          answer:
            "Our platform supports 4 distinct roles: Super Admins (platform oversight), Admins (operational management, batch & registration controls), Mentors (cohort guidance, grading, and review), and Students (learning materials, assignment submissions, and progress tracking).",
          published: true,
          createdBy: adminUser._id,
        },
        {
          question: "How is attendance calculated?",
          answer:
            "Attendance is automatically calculated from live Google Meet sessions and manual verification. A student's attendance percentage is derived as: (Present Sessions + Late Sessions) / Total Scheduled Sessions × 100.",
          published: true,
          createdBy: adminUser._id,
        },
        {
          question: "How does progress tracking work across tracks?",
          answer:
            "Progress is tracked through daily programming tasks, weekly milestone assignments, and module completion checklists across both Competitive Programming and Web Development curriculum tracks.",
          published: true,
          createdBy: adminUser._id,
        },
        {
          question: "How are assignments submitted and graded?",
          answer:
            "Students submit GitHub repository links, live deployment URLs, and required files through their student portal. Mentors review submissions, provide detailed constructive feedback, and award scores against the grading criteria.",
          published: true,
          createdBy: adminUser._id,
        },
        {
          question: "How do I apply / what happens after submission?",
          answer:
            "Prospective students can submit an application via the public portal. Once reviewed by administrators, applicants receive an automated email notification with their acceptance status and password setup instructions.",
          published: true,
          createdBy: adminUser._id,
        },
      ];

      await FAQ.insertMany(standardFAQs);
      console.log(`Seeded ${standardFAQs.length} standard FAQs.`);
    }

    console.log("Seeding check completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("SEEDING ERROR:", error);
    process.exit(1);
  }
};

seedDatabase();
