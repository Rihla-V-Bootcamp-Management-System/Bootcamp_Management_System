import { useState } from "react";
import {
  Check,
  X,
  Clock,
  CircleAlert,
  Save,
  History,
} from "lucide-react";

const initialStudents = [
  {
    id: 1,
    name: "Abebe Kebede",
    studentId: "STU-001",
    status: "Present",
    percentage: 95,
  },
  {
    id: 2,
    name: "Sara Ahmed",
    studentId: "STU-002",
    status: "Absent",
    percentage: 88,
  },
  {
    id: 3,
    name: "Mohammed Ali",
    studentId: "STU-003",
    status: "Late",
    percentage: 91,
  },
];

const statusOptions = [
  {
    value: "Present",
    label: "Present",
    icon: Check,
  },
  {
    value: "Absent",
    label: "Absent",
    icon: X,
  },
  {
    value: "Late",
    label: "Late",
    icon: Clock,
  },
  {
    value: "Excused",
    label: "Excused",
    icon: CircleAlert,
  },
];

function MentorAttendance() {
  const [students, setStudents] = useState(initialStudents);
  const [batch, setBatch] = useState("Batch 2026");
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleStatusChange = (studentId, status) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.id === studentId
          ? { ...student, status }
          : student
      )
    );

    setMessage("");
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

   

    setTimeout(() => {
      setSaving(false);
      setMessage("Attendance saved successfully.");
    }, 800);
  };

  return (
    <div className="space-y-6">

      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Attendance
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Mark and manage attendance for your assigned students.
        </p>
      </div>

      
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch
            </label>

            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Batch 2026</option>
              <option>Batch 2025</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Date
            </label>

            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>
      </div>

     
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          {message}
        </div>
      )}

    
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Student Roster
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {students.length} students
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <History size={17} />
            View History
          </button>
        </div>

        {students.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500">
              No students assigned to this batch yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Student
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Attendance %
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {students.map((student) => (
                  <tr key={student.id}>

                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">
                        {student.name}
                      </div>

                      <div className="text-sm text-gray-500">
                        {student.studentId}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-700">
                        {student.percentage}%
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">

                        {statusOptions.map((option) => {
                          const Icon = option.icon;
                          const selected =
                            student.status === option.value;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  student.id,
                                  option.value
                                )
                              }
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition ${
                                selected
                                  ? "border-blue-600 bg-blue-50 text-blue-700"
                                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <Icon size={15} />
                              {option.label}
                            </button>
                          );
                        })}

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>

          </div>
        )}

       
        {students.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-200 flex justify-end">

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={17} />

              {saving ? "Saving..." : "Save Attendance"}
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default MentorAttendance;