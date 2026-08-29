import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import {
  Users,
  GraduationCap,
  UserRoundCheck,
  ClipboardList,
  Activity,
} from "lucide-react";

function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    mentors: 0,
    pendingApplications: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await apiClient.get("/superadmin/stats");
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <p className="dashboard-eyebrow">OVERVIEW</p>
        <h2>Super Admin Dashboard</h2>
        <p>
          Monitor and manage the bootcamp system from one place.
        </p>
      </div>

      {error && (
        <div className="dashboard-panel">
          <div className="dashboard-empty-state">
            <p>{error}</p>
          </div>
        </div>
      )}

      <section className="dashboard-stats">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon">
              <Users size={19} />
            </div>
          </div>

          <span>Total Users</span>
          <strong>{loading ? "..." : stats.totalUsers}</strong>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon">
              <GraduationCap size={19} />
            </div>
          </div>

          <span>Students</span>
          <strong>{loading ? "..." : stats.students}</strong>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon">
              <UserRoundCheck size={19} />
            </div>
          </div>

          <span>Mentors</span>
          <strong>{loading ? "..." : stats.mentors}</strong>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <div className="dashboard-stat-icon">
              <ClipboardList size={19} />
            </div>
          </div>

          <span>Pending Applications</span>
          <strong>
            {loading ? "..." : stats.pendingApplications}
          </strong>
        </div>
      </section>

      <section className="dashboard-overview">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>System Overview</h3>
              <p>
                A quick overview of your bootcamp management system.
              </p>
            </div>

            <Activity size={19} />
          </div>

          <div className="dashboard-empty-state">
            <p>No recent activity yet.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SuperAdminDashboard;