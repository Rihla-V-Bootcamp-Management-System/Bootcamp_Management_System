import mockUsers from "../../data/mockUsers";

function AdminDashboard() {
  const totalUsers = mockUsers.length;

  const totalStudents = mockUsers.filter(
    (user) => user.role === "student"
  ).length;

  const activeUsers = mockUsers.filter(
    (user) => user.status === "active"
  ).length;

  return (
    <div>
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Overview of your bootcamp management system.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Users
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {totalUsers}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Registered users
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Students
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {totalStudents}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Active students
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Active Users
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {activeUsers}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Currently active
          </p>
        </div>
      </div>

      {/* Welcome card */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Welcome to the Admin Dashboard
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage bootcamp users, batches, announcements, and other
          administrative activities from one centralized dashboard.
        </p>
      </div>
    </div>
  );
}

export default AdminDashboard;