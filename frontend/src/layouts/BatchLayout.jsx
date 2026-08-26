import { Link, Outlet, useLocation, useParams } from "react-router-dom";

function BatchLayout() {
  const { id } = useParams();
  const location = useLocation();

  const batchId =
    id ||
    new URLSearchParams(location.search).get("batchId");

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      {/* =====================================================
          FIXED BATCH NAVIGATION
      ===================================================== */}

      <div className="sticky top-0 z-40 border-b border-[#E5E0D5] bg-white/95 shadow-sm backdrop-blur">

        <div className="overflow-x-auto">

          <div className="flex min-w-max">

            {/* OVERVIEW */}

            <Link
              to={`/admin/batches/${batchId}`}
              className={`border-b-2 px-6 py-4 text-sm transition ${
                isActive(`/admin/batches/${batchId}`)
                  ? "border-[#1D3866] font-semibold text-[#1D3866]"
                  : "border-transparent font-medium text-[#52627A] hover:border-[#1D3866] hover:text-[#1D3866]"
              }`}
            >
              Overview
            </Link>

            {/* MODULES */}

            <Link
              to={`/admin/modules?batchId=${batchId}`}
              className={`border-b-2 px-6 py-4 text-sm transition ${
                location.pathname.startsWith("/admin/modules")
                  ? "border-[#1D3866] font-semibold text-[#1D3866]"
                  : "border-transparent font-medium text-[#52627A] hover:border-[#1D3866] hover:text-[#1D3866]"
              }`}
            >
              Modules
            </Link>

            {/* LEVELS */}

            <Link
              to={`/admin/levels?batchId=${batchId}`}
              className={`border-b-2 px-6 py-4 text-sm transition ${
                location.pathname.startsWith("/admin/levels")
                  ? "border-[#1D3866] font-semibold text-[#1D3866]"
                  : "border-transparent font-medium text-[#52627A] hover:border-[#1D3866] hover:text-[#1D3866]"
              }`}
            >
              Levels
            </Link>

            {/* DAILY TASKS */}

            <Link
              to={`/admin/daily-tasks?batchId=${batchId}`}
              className={`border-b-2 px-6 py-4 text-sm transition ${
                location.pathname.startsWith("/admin/daily-tasks")
                  ? "border-[#1D3866] font-semibold text-[#1D3866]"
                  : "border-transparent font-medium text-[#52627A] hover:border-[#1D3866] hover:text-[#1D3866]"
              }`}
            >
              Daily Tasks
            </Link>

            {/* CAPSTONE */}

            <button
              type="button"
              className="border-b-2 border-transparent px-6 py-4 text-sm font-medium text-[#52627A] transition hover:border-[#1D3866] hover:text-[#1D3866]"
            >
              Capstone Project
            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <main className="p-6">
        <Outlet />
      </main>

    </div>
  );
}

export default BatchLayout;