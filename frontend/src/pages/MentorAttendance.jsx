import {
  Check,
  X,
  Clock,
  CircleAlert,
  History,
  CalendarCheck,
} from "lucide-react";

const students = [
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

function MentorAttendance() {
  const batch = "Batch 2026";
  const sessionDate = new Date().toISOString().split("T")[0];

  const getStatusStyle = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-50 text-green-700 border-green-200";

      case "Absent":
        return "bg-red-50 text-red-700 border-red-200";

      case "Late":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "Excused":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <Check size={15} />;

      case "Absent":
        return <X size={15} />;

      case "Late":
        return <Clock size={15} />;

      case "Excused":
        return <CircleAlert size={15} />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">

      {/* ========================= */}
      {/* PAGE HEADER */}
      {/* ========================= */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Attendance
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View attendance records for your assigned students.
        </p>
      </div>


      {/* ========================= */}
      {/* BATCH + DATE */}
      {/* ========================= */}

      <div className="rounded-xl border border-gray-200 bg-white p-5">

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Batch */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Batch
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
              <CalendarCheck
                size={18}
                className="text-gray-500"
              />

              <span className="text-sm font-medium text-gray-700">
                {batch}
              </span>
            </div>
          </div>


          {/* Session Date */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Session Date
            </label>

            <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {sessionDate}
            </div>
          </div>

        </div>
      </div>


      {/* ========================= */}
      {/* VIEW ONLY NOTICE */}
      {/* ========================= */}

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">

        <div className="flex items-center gap-3">

          <CalendarCheck
            size={19}
            className="text-blue-600"
          />

          <div>
            <p className="text-sm font-medium text-blue-800">
              View-only attendance
            </p>

            <p className="mt-1 text-xs text-blue-700">
              Attendance is managed by the administrator.
              You can view attendance for your assigned students.
            </p>
          </div>

        </div>

      </div>


      {/* ========================= */}
      {/* STUDENT ROSTER */}
      {/* ========================= */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

          <div>

            <h2 className="font-semibold text-gray-900">
              Student Attendance
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {students.length} assigned students
            </p>

          </div>


          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <History size={17} />

            View History
          </button>

        </div>


        {/* Empty State */}

        {students.length === 0 ? (

          <div className="py-16 text-center">

            <CalendarCheck
              className="mx-auto h-10 w-10 text-gray-300"
            />

            <p className="mt-4 font-medium text-gray-900">
              No students assigned
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Attendance records will appear here when students
              are assigned to you.
            </p>

          </div>

        ) : (

          /* Student Table */

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="border-b border-gray-200 bg-gray-50">

                <tr>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Student
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Attendance
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Today's Status
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {students.map((student) => (

                  <tr
                    key={student.id}
                    className="transition hover:bg-gray-50"
                  >

                    {/* Student */}

                    <td className="px-5 py-4">

                      <p className="font-medium text-gray-900">
                        {student.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {student.studentId}
                      </p>

                    </td>


                    {/* Percentage */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-200">

                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{
                              width: `${student.percentage}%`,
                            }}
                          />

                        </div>

                        <span className="text-sm font-medium text-gray-700">
                          {student.percentage}%
                        </span>

                      </div>

                    </td>


                    {/* Status */}

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${getStatusStyle(
                          student.status
                        )}`}
                      >

                        {getStatusIcon(student.status)}

                        {student.status}

                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default MentorAttendance;