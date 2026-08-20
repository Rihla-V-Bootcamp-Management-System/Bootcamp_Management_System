import AdminSidebar from "../components/AdminSidebar";
import MentorSidebar from "../components/MentorSidebar";
import StudentSidebar from "../components/StudentSidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function DashboardLayout({ role }) {
  let sidebar;

  if (role === "admin") {
    sidebar = <AdminSidebar />;
  } else if (role === "mentor") {
    sidebar = <MentorSidebar />;
  } else if (role === "student") {
    sidebar = <StudentSidebar />;
  }

  return (
    <div className="h-screen flex overflow-hidden">

      
      {sidebar}

      <div className="flex-1 flex flex-col min-w-0">

       
        <Header />

        
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;