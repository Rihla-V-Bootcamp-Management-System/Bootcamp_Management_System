import { Outlet } from "react-router-dom";
import MentorSidebar from "../components/MentorSidebar";

function MentorLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Mentor Sidebar */}
      <MentorSidebar />

      {/* Page Content */}
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>

    </div>
  );
}

export default MentorLayout;