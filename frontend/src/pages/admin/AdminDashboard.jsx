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
    <div className="bg-[#F7F5EF]">

      <div className="mb-8 bg-[#F7F5EF]">
        <h1 className="text-2xl font-bold text-[#071629] drop-shadow-sm">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-[#52627A]">
          Overview of your bootcamp management system.
        </p>
      </div>


      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[#52627A]">
            Total Users
          </p>

          <p className="mt-3 text-3xl font-bold text-[#071629] drop-shadow-sm">
            {totalUsers}
          </p>

          <p className="mt-2 text-xs text-[#8A96A8]">
            Registered users
          </p>
        </div>


        <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[#52627A]">
            Students
          </p>

          <p className="mt-3 text-3xl font-bold text-[#071629] drop-shadow-sm">
            {totalStudents}
          </p>

          <p className="mt-2 text-xs text-[#8A96A8]">
            Active students
          </p>
        </div>


        <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[#52627A]">
            Active Users
          </p>

          <p className="mt-3 text-3xl font-bold text-[#071629] drop-shadow-sm">
            {activeUsers}
          </p>

          <p className="mt-2 text-xs text-[#8A96A8]">
            Currently active
          </p>
        </div>

      </div>


      {/* Welcome card */}
      <div className="mt-8 rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-[#071629] drop-shadow-sm">
          Welcome to the Admin Dashboard
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#52627A]">
          Manage bootcamp users, batches, announcements, and other
          administrative activities from one centralized dashboard.
        </p>

      </div>

    </div>
  );
}

export default AdminDashboard;