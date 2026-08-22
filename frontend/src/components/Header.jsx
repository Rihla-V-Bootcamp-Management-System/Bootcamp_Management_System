import {
  Search,
  Bell,
  UserCircle,
  Menu,
  X,
} from "lucide-react";

function Header({
  title,
  description,
  onMenuClick,
  sidebarOpen,
}) {
  return (
    <header className="shrink-0 bg-[#eef3f2]">
      <div className="flex min-h-[78px] items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">

          {/* MOBILE MENU */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white md:hidden"
            aria-label="Open menu"
          >
            {sidebarOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>

          {/* PAGE TITLE */}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
              {title}
            </h1>

            {description && (
              <p className="mt-1 hidden truncate text-sm text-slate-500 sm:block">
                {description}
              </p>
            )}
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white"
            aria-label="Search"
          >
            <Search size={19} />
          </button>

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white"
            aria-label="Notifications"
          >
            <Bell size={19} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white"
            aria-label="Profile"
          >
            <UserCircle size={22} />
          </button>

        </div>

      </div>
    </header>
  );
}

export default Header;