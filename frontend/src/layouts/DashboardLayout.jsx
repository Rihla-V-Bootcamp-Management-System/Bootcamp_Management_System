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
    <div className="min-h-screen flex">

      {sidebar}

      <div className="flex-1 flex flex-col">

        <Header />

        <main className="flex-1 bg-slate-100 p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;