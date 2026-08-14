import { useState } from "react"
import Sidebar from "./components/mentor/Sidebar"
import MentorDashboard from "./pages/MentorDashboard"
import AssignedStudents from "./components/mentor/AssignedStudents"
import Attendance from "./components/mentor/Attendance"

function App() {
  const [activePage, setActivePage] = useState("Dashboard")

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="flex-1 p-8">
        {activePage === "Dashboard" && <MentorDashboard />}

        {activePage === "Assigned Students" && <AssignedStudents />}

        {activePage === "Attendance" && <Attendance />}

        {activePage === "Progress" && (
          <h1 className="text-3xl font-bold">Progress</h1>
        )}

        {activePage === "Assignments" && (
          <h1 className="text-3xl font-bold">Assignments</h1>
        )}

        {activePage === "Announcements" && (
          <h1 className="text-3xl font-bold">Announcements</h1>
        )}

        {activePage === "Profile" && (
          <h1 className="text-3xl font-bold">Profile</h1>
        )}
      </main>
    </div>
  )
}

export default App