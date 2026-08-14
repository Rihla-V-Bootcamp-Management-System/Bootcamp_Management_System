function AssignedStudents() {
  const students = [
    {
      id: 1,
      name: "Sabrin Abdu",
      email: "saburiabdu@example.com",
      progress: 75,
      attendance: 95,
      status: "Active",
    },
    {
      id: 2,
      name: "Elham Menur",
      email: "elumenur@example.com",
      progress: 80,
      attendance: 100,
      status: "Active",
    },
    {
      id: 3,
      name: "Seid Ahmed",
      email: "seidoahme@example.com",
      progress: 30,
      attendance: 65,
      status: "At Risk",
    },
    {
      id: 4,
      name: "Amir Hussen",
      email: "amirhussen.ui@example.com",
      progress: 45,
      attendance: 40,
      status: "Inactive",
    },
  ]
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assigned Students</h1>
          <p className="mt-2 text-gray-600">
            Manage and track your assigned students.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search students..."
          className="w-64 rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"/>
      </div>

      <div className="mb-6">
        <select className="rounded-lg border bg-white px-4 py-2">
          <option>All Status</option>
          <option>Active</option>
          <option>At Risk</option>
          <option>Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Student
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Email
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Progress
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Attendance
              </th>
              <th className="px-5 py-4 text-left text-sm font-semibold">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-medium">
                  {student.name}
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {student.email}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-purple-600"
                        style={{ width: `${student.progress}%` }} />
                    </div>

                    <span className="text-sm">
                      {student.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {student.attendance}%
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <p>Showing 1 to 4 of 24 students</p>
        <div className="flex gap-2">
          <button className="rounded border px-3 py-1">1</button>
          <button className="rounded border px-3 py-1">2</button>
          <button className="rounded border px-3 py-1">3</button>
          <button className="rounded border px-3 py-1">next</button>
        </div>
      </div>
    </div>
  )
}
export default AssignedStudents