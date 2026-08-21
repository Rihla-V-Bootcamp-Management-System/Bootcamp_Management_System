import {
  Search,
  Bell,
  UserCircle,
} from "lucide-react";

function Header({ title, description }) {
  return (
    <header className="w-full bg-gray-50 px-4 py-5 sm:px-6 md:px-8">
      <div className="flex items-center justify-between gap-4">

        {/* PAGE TITLE */}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
            {title}
          </h1>

          {description && (
            <p className="mt-1 hidden text-sm text-gray-500 sm:block">
              {description}
            </p>
          )}
        </div>

        {/* RIGHT SIDE ICONS */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">

          <button
            type="button"
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-200"
            aria-label="Search"
          >
            <Search size={19} />
          </button>

          <button
            type="button"
            className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-200"
            aria-label="Notifications"
          >
            <Bell size={19} />

            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button
            type="button"
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-200"
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