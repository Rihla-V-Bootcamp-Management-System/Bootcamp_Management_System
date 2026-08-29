import { Link, Outlet, useLocation, useParams } from "react-router-dom";

function BatchLayout() {
  const { id } = useParams();
  const location = useLocation();

  let batchId =
    id ||
    new URLSearchParams(location.search).get("batchId") ||
    localStorage.getItem("activeBatchId") ||
    "";

  if (batchId && localStorage.getItem("activeBatchId") !== batchId) {
    localStorage.setItem("activeBatchId", batchId);
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItemClass = (active) =>
    `border-b-2 px-6 py-3.5 text-xs font-semibold transition-all duration-150 ${
      active
        ? "border-[#1f6f5b] text-[#1f6f5b] dark:border-blue-400 dark:text-blue-400"
        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200"
    }`;

  return (
    <div className="space-y-6">
      {/* FIXED BATCH SUB-NAVIGATION TABS */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs backdrop-blur dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="flex min-w-max border-b border-slate-100 dark:border-slate-800/80">
            {/* OVERVIEW */}
            <Link
              to={`/admin/batches/${batchId}`}
              className={navItemClass(isActive(`/admin/batches/${batchId}`))}
            >
              Overview
            </Link>

            {/* MODULES */}
            <Link
              to={`/admin/modules?batchId=${batchId}`}
              className={navItemClass(location.pathname.startsWith("/admin/modules"))}
            >
              Modules
            </Link>

            {/* LEVELS */}
            <Link
              to={`/admin/levels?batchId=${batchId}`}
              className={navItemClass(location.pathname.startsWith("/admin/levels"))}
            >
              Levels
            </Link>

            {/* DAILY TASKS */}
            <Link
              to={`/admin/daily-tasks?batchId=${batchId}`}
              className={navItemClass(location.pathname.startsWith("/admin/daily-tasks"))}
            >
              Daily Tasks
            </Link>

            {/* CAPSTONE */}
            <Link
              to={`/admin/capstone-projects?batchId=${batchId}`}
              className={navItemClass(location.pathname.startsWith("/admin/capstone-projects"))}
            >
              Capstone Project
            </Link>
          </div>
        </div>
      </div>

      {/* SUB-PAGE CONTENT */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default BatchLayout;