import { Link } from "react-router-dom";

function AssignmentNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/assignments"
          className="text-xl font-bold tracking-tight text-[#0f1b3d]"
        >
          ASTU MSJ
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/assignments"
            className="text-sm font-medium text-slate-600 transition hover:text-[#2563eb]"
          >
            Assignments
          </Link>

          <Link
            to="/submissions"
            className="text-sm font-medium text-slate-600 transition hover:text-[#2563eb]"
          >
            Submissions
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/assignments"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}

export default AssignmentNavbar;