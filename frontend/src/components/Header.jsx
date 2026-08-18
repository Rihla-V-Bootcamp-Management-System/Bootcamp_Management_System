import { Bell, User } from "lucide-react";

function Header() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-8">

      <h1 className="text-xl font-semibold">
        Dashboard
      </h1>

      <div className="flex items-center gap-5">

        <button className="relative">
          <Bell size={21} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
            <User size={19} />
          </div>

          <span className="text-sm font-medium">
            elham
          </span>
        </div>

      </div>

    </header>
  );
}

export default Header;