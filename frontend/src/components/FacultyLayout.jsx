import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../App.css";

function FacultyLayout() {
  const navigate = useNavigate();

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const menuItems = [
    { icon: "⌂", label: "Dashboard", path: "/faculty-dashboard" },
    { icon: "✦", label: "Create Event", path: "/faculty-create-event" },
    { icon: "▦", label: "OD Requests", path: "/faculty-od-requests" },
    { icon: "▤", label: "My Events", path: "/faculty-my-events" },
    { icon: "♙", label: "My Profile", path: "/faculty-profile" }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="cf-layout">

      <aside className="cf-sidebar">

        <div className="cf-brand">
          <div className="cf-brand-logo">CF</div>

          <div>
            <h2>CampusFlow</h2>
            <span>FACULTY PORTAL</span>
          </div>
        </div>

        <div className="cf-menu-label">MAIN MENU</div>

        <nav className="cf-navigation">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/faculty-dashboard"}
              className={({ isActive }) =>
                `cf-nav-item ${isActive ? "selected" : ""}`
              }
            >
              <span className="cf-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              <span className="cf-active-dot"></span>
            </NavLink>
          ))}
        </nav>

        <div className="cf-sidebar-bottom">

          <div className="cf-help-card">
            <div className="cf-help-icon">✦</div>
            <h4>CampusFlow</h4>
            <p>Your college activities, simplified.</p>
          </div>

          <div className="cf-sidebar-user">
            <div className="cf-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "F"}
            </div>

            <div className="cf-user-details">
              <strong>{user?.name || "Faculty"}</strong>
              <span>Faculty Account</span>
            </div>
          </div>

          <button className="cf-logout" onClick={handleLogout}>
            <span>↪</span>
            Logout
          </button>

          <p className="cf-sidebar-footer">
            CampusFlow © 2026
          </p>

        </div>

      </aside>

      <main className="cf-layout-content">
        <Outlet />
      </main>

    </div>
  );
}

export default FacultyLayout;