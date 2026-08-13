import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;