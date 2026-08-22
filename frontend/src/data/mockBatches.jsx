const mockBatches = [
  {
    id: 1,
    name: "Full Stack Web Development — Batch 01",
    track: "Full Stack Web Development",
    status: "Active",

    startDate: "August 1, 2026",
    endDate: "April 30, 2027",
    duration: "9 Months",

    description:
      "This batch is designed to transform complete beginners into autonomous, production-ready software engineers through a structured 9-month learning program.",

    students: [
      {
        id: 1,
        name: "Ahmed Ali",
        email: "ahmed@example.com",
        level: "Level 3",
        progress: 62,
        attendance: 91,
        status: "Active",
      },
      {
        id: 2,
        name: "Sara Mohammed",
        email: "sara@example.com",
        level: "Level 2",
        progress: 48,
        attendance: 88,
        status: "Active",
      },
    ],

    mentors: [
      {
        id: 1,
        name: "Abebe Kebede",
        specialization: "Frontend Development",
      },
      {
        id: 2,
        name: "Hana Ali",
        specialization: "Backend Development",
      },
    ],

    levels: [
      {
        id: 1,
        name: "Web Foundations",
        description:
          "Students learn the fundamentals required to build modern websites.",
        modules: [
          {
            id: 1,
            name: "HTML Fundamentals",
            description:
              "Learn semantic HTML and the structure of web pages.",
          },
          {
            id: 2,
            name: "CSS Fundamentals",
            description:
              "Learn styling, layouts, responsive design and modern CSS.",
          },
          {
            id: 3,
            name: "Git & GitHub",
            description:
              "Learn version control and collaborative development.",
          },
        ],
      },

      {
        id: 2,
        name: "JavaScript & Frontend Development",
        description:
          "Students learn JavaScript and modern frontend development.",
        modules: [
          {
            id: 4,
            name: "JavaScript Fundamentals",
            description:
              "Variables, data types, functions, arrays, objects and control flow.",
          },
          {
            id: 5,
            name: "DOM Manipulation",
            description:
              "Learn how JavaScript interacts with web pages.",
          },
          {
            id: 6,
            name: "React Fundamentals",
            description:
              "Build modern interfaces using React.",
          },
        ],
      },

      {
        id: 3,
        name: "Backend Development",
        description:
          "Students learn server-side development and databases.",
        modules: [
          {
            id: 7,
            name: "Node.js",
            description:
              "Learn server-side JavaScript using Node.js.",
          },
          {
            id: 8,
            name: "Express.js",
            description:
              "Build REST APIs using Express.",
          },
          {
            id: 9,
            name: "MongoDB",
            description:
              "Learn database design and MongoDB.",
          },
        ],
      },

      {
        id: 4,
        name: "Full Stack Development",
        description:
          "Students combine frontend and backend technologies.",
        modules: [
          {
            id: 10,
            name: "Frontend & Backend Integration",
            description:
              "Connect React applications with backend APIs.",
          },
          {
            id: 11,
            name: "Authentication",
            description:
              "Implement authentication and authorization.",
          },
          {
            id: 12,
            name: "Deployment",
            description:
              "Deploy full-stack applications.",
          },
        ],
      },

      {
        id: 5,
        name: "Software Engineering & Capstone",
        description:
          "Students apply software engineering practices to real-world projects.",
        modules: [
          {
            id: 13,
            name: "Software Architecture",
            description:
              "Learn how to design scalable software systems.",
          },
          {
            id: 14,
            name: "Testing",
            description:
              "Learn software testing and quality assurance.",
          },
          {
            id: 15,
            name: "Capstone Project",
            description:
              "Build and deploy a complete real-world application.",
          },
        ],
      },
    ],

    resources: [
      {
        id: 1,
        title: "HTML Documentation",
        type: "Documentation",
      },
      {
        id: 2,
        title: "CSS Learning Materials",
        type: "PDF",
      },
      {
        id: 3,
        title: "JavaScript Exercises",
        type: "Practice",
      },
    ],

    missions: [
      {
        id: 1,
        title: "Build a Personal Portfolio",
        level: "Web Foundations",
        difficulty: "Beginner",
        status: "Active",
      },
      {
        id: 2,
        title: "Build a Todo Application",
        level: "JavaScript & Frontend Development",
        difficulty: "Intermediate",
        status: "Active",
      },
    ],

    dailyTasks: [
      {
        id: 1,
        day: 1,
        title: "Introduction to HTML",
        status: "Published",
      },
      {
        id: 2,
        day: 2,
        title: "HTML Elements and Attributes",
        status: "Published",
      },
    ],

    weeklyAssessments: [
      {
        id: 1,
        week: 1,
        title: "HTML Fundamentals Assessment",
        passingScore: 70,
        status: "Published",
      },
    ],

    placementAssessment: {
      enabled: true,
      passingScore: 70,
      status: "Upcoming",
    },

    capstone: {
      enabled: true,
      title: "Full Stack Capstone Project",
      description:
        "Students build and deploy a complete production-style application.",
      status: "Upcoming",
    },
  },
];

export default mockBatches;