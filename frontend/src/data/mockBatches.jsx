const mockBatches = [
  {
    id: 1,
    name: "Batch 01",
    batchNumber: "B01",
    startDate: "2026-08-01",
    endDate: "2026-12-30",
    capacity: 30,
    status: "Active",

    levels: [
      {
        id: 101,
        name: "Level 1",
        description: "Web Foundations",
      },
      {
        id: 102,
        name: "Level 2",
        description: "JavaScript",
      },
      {
        id: 103,
        name: "Level 3",
        description: "React",
      },
    ],
  },

  {
    id: 2,
    name: "Batch 02",
    batchNumber: "B02",
    startDate: "2026-09-01",
    endDate: "2027-01-30",
    capacity: 25,
    status: "Upcoming",

    levels: [
      {
        id: 201,
        name: "Level 1",
        description: "Web Foundations",
      },
      {
        id: 202,
        name: "Level 2",
        description: "JavaScript",
      },
    ],
  },
];

export default mockBatches;