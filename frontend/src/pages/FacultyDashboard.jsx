import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FacultyDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const [recentApplications, setRecentApplications] = useState([]);
  const [department, setDepartment] = useState(user.department || "N/A");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5001/api/od/faculty/dashboard-stats",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load dashboard");
      }

      setStatistics(data.statistics);
      setRecentApplications(data.recentApplications || []);
      setDepartment(data.department || "N/A");

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="faculty-dashboard">

      <header className="faculty-topbar">
        <div>
          <h2>CampusFlow</h2>
          <span>Faculty Portal</span>
        </div>

        <button onClick={handleLogout}>
          Logout ↗
        </button>
      </header>

      <main className="faculty-main">

        <div className="faculty-welcome">
          <div>
            <span className="faculty-label">
              FACULTY WORKSPACE
            </span>

            <h1>
              Welcome back, {user.name || "Faculty"} 👋
            </h1>

            <p>
              Manage student OD requests and monitor event approvals
              from your faculty workspace.
            </p>
          </div>

          <div className="faculty-avatar">
            {(user.name || "F").charAt(0).toUpperCase()}
          </div>
        </div>


        {/* LIVE STATISTICS */}

        <div className="faculty-stats">

          <div className="faculty-stat-card">
            <div className="faculty-stat-icon blue">📩</div>
            <p>Total Requests</p>
            <h2>{loading ? "..." : statistics.total}</h2>
            <span>Department OD applications</span>
          </div>

          <div className="faculty-stat-card">
            <div className="faculty-stat-icon blue">⏳</div>
            <p>Pending Requests</p>
            <h2>{loading ? "..." : statistics.pending}</h2>
            <span>Awaiting faculty decision</span>
          </div>

          <div className="faculty-stat-card">
            <div className="faculty-stat-icon green">✓</div>
            <p>Approved Requests</p>
            <h2>{loading ? "..." : statistics.approved}</h2>
            <span>Successfully approved</span>
          </div>

          <div className="faculty-stat-card">
            <div className="faculty-stat-icon red">✕</div>
            <p>Rejected Requests</p>
            <h2>{loading ? "..." : statistics.rejected}</h2>
            <span>Rejected applications</span>
          </div>

        </div>


        {/* QUICK ACTIONS */}

        <section className="faculty-section">

          <div className="faculty-section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Access your important faculty activities.</p>
            </div>
          </div>

          <div className="faculty-actions">

            <div
              className="faculty-action-card"
              onClick={() => navigate("/faculty-od-requests")}
            >
              <div className="faculty-action-icon">📋</div>
              <h3>OD Requests</h3>
              <p>View and manage student OD applications.</p>
              <span>View Requests →</span>
            </div>

            <div
              className="faculty-action-card"
              onClick={() => navigate("/faculty-profile")}
            >
              <div className="faculty-action-icon">👤</div>
              <h3>My Profile</h3>
              <p>View your faculty account information.</p>
              <span>View Profile →</span>
            </div>
            <div
  className="faculty-action-card"
  onClick={() => navigate("/faculty-create-event")}
>
  <div className="faculty-action-icon">✦</div>
  <h3>Create Event</h3>
  <p>Organize a new college event and submit it for approval.</p>
  <span>Create Event →</span>
</div>

          </div>

        </section>


        {/* RECENT ACTIVITY */}

        <section className="faculty-section">

          <div className="faculty-section-heading">
            <div>
              <h2>Recent OD Applications</h2>
              <p>Latest applications from your department.</p>
            </div>
          </div>

          <div className="faculty-recent-list">

            {loading ? (
              <p>Loading applications...</p>
            ) : recentApplications.length === 0 ? (
              <p>No recent applications available.</p>
            ) : (

              recentApplications.map((application) => (

                <div
                  className="faculty-recent-card"
                  key={application._id}
                >

                  <div>
                    <h3>
                      {application.studentId?.name || "Student"}
                    </h3>

                    <p>
                      {application.eventId?.title || "Event"}
                    </p>
                  </div>

                  <span className={`faculty-od-badge ${application.status}`}>
                    {application.status}
                  </span>

                </div>

              ))

            )}

          </div>

        </section>


        {/* DEPARTMENT INFORMATION */}

        <section className="faculty-information">

          <div className="faculty-info-icon">🏛️</div>

          <div>
            <h3>Department Information</h3>
            <p>
              You are currently managing OD applications
              for the <strong>{department}</strong> department.
            </p>
          </div>

        </section>

        <footer className="faculty-footer">
          CampusFlow © 2026 | Smart Club Event & OD Approval System
        </footer>

      </main>

    </div>
  );
}

export default FacultyDashboard;