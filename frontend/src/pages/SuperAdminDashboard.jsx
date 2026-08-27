function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">

        <aside className="w-64 border-r border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-5">
            <h1 className="text-xl font-bold text-gray-900">
              Super Admin
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              System Management
            </p>
          </div>

          <nav className="p-4">

            <div className="mb-6">
              <p className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">
                Main
              </p>

              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">
                Dashboard
              </button>
            </div>

            <div className="mb-6">
              <p className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">
                Users
              </p>

              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">
                All Users
              </button>

              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">
                Admins
              </button>

              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">
                Mentors
              </button>

              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">
                Students
              </button>
            </div>

            <div className="mb-6">
              <p className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">
                Registration
              </p>

              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">
                Registration Settings
              </button>

              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">
                Form Questions
              </button>

              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">
                Applications
              </button>

              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">
                Registration Status
              </button>
            </div>

            <div>
              <p className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">
                System
              </p>

              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">
                Audit Logs
              </button>

              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">
                Admin Management
              </button>

              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">
                Settings
              </button>
            </div>

          </nav>
        </aside>

        <main className="flex-1">

          <header className="border-b border-gray-200 bg-white px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Super Admin Dashboard
            </h2>
          </header>

          <section className="p-6">

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Dashboard
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Super Admin system overview.
              </p>
            </div>

          </section>

        </main>

      </div>
    </div>
  );
}

export default SuperAdminDashboard;