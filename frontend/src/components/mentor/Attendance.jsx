import { useState } from "react";
function Attendance() {
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "Sebrin Abdu",
      attendance: 100,
      status: "Present",
    },
    {
      id: 2,
      name: "Elham Menur",
      attendance: 85,
      status: "Late",
    },
    {
      id: 3,
      name: "Seid Ahmed",
      attendance: 70,
      status: "Absent",
    },
    {
        id: 4,
        name: "Amir Hussen",
        attendance: 80,
        status: "Excused",
    },
  ]);
  const [date, setDate] = useState("");
  const [topic, setTopic] = useState("");

  const updateStatus = (id, status) => {
    setStudents(
      students.map((student) =>
        student.id === id
          ? { ...student, status }
          : student
      )
    );
  };
  const presentCount = students.filter(
    (student) =>
        student.status === "Present" ||
        student.status === "Late"   
  ).length
  const attendanceRate = Math.round(
    (presentCount / students.length) * 100
  );
  const saveAttendance = () => {
    const attendanceData = {
        date: date,
        topic: topic,
        students: students,
    };
    console.log("Attendance saved:", attendanceData);
    alert("Attendance saved successfully!");
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="mt-2 text-gray-600">
            Record and manage session attendance.
          </p>
        </div>
        <button
        onClick={saveAttendance}
        className="rounded-lg bg-purple-600 px-5 py-3 font-medium text-white hover:bg-purple-700">
            Save Attendance
        </button>

      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl bg-white p-5 shadow md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"/>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Session Topic
          </label>
          <input
            type="text"
            placeholder="Enter session topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"/>
        </div>

        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {attendanceRate}%
            </p>
            <p className="text-sm text-gray-500">Present</p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold">
              {students.length}
            </p>
            <p className="text-sm text-gray-500">
              Students
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="grid grid-cols-3 bg-gray-50 px-5 py-4 text-sm font-semibold">
          <span>Student</span>
          <span>Overall Rate</span>
          <span>Status</span>
        </div>

        {students.map((student) => (
          <div
            key={student.id}
            className="grid grid-cols-3 items-center border-t px-5 py-4" >
            <div className="font-medium">
              {student.name}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 w-24 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-purple-600"
                  style={{
                    width: `${student.attendance}%`,
                  }}
                />
              </div>

              <span className="text-sm">
                {student.attendance}%
              </span>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() =>
                    updateStatus(student.id, "Present")
                }
                className={`rounded px-3 py-1 text-sm ${
                  student.status === "Present"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100"
                }`}
              >
                Present
              </button>

              <button
                onClick={() =>
                  updateStatus(student.id, "Late")
                }
                className={`rounded px-3 py-1 text-sm ${
                  student.status === "Late"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100"
                }`}
              >
                Late
              </button>

              <button
                onClick={() =>
                  updateStatus(student.id, "Absent")
                }
                className={`rounded px-3 py-1 text-sm ${
                  student.status === "Absent"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100"
                }`}
              >
                Absent
              </button>

              <button
              onClick={() =>
                updateStatus(student.id, "Excused")
              }
              className={`rounded px-3 py-1 text-sm ${
                  student.status === "Excused"
                    ? "bg-blue-100 text-red-700"
                    : "bg-gray-100"
                }`}
              >
                Excused
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Attendance