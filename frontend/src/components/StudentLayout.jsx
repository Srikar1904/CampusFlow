import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../App.css";

function StudentLayout() {
  const navigate = useNavigate();

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const menuItems = [
    { icon: "⌂", label: "Dashboard", path: "/student-dashboard" },
    { icon: "▦", label: "View Events", path: "/view-events" },
    { icon: "＋", label: "Apply for OD", path: "/apply-od" },
    { icon: "◷", label: "OD Status", path: "/od-status" },
    { icon: "✓", label: "Approvals", path: "/approvals" },
    { icon: "♙", label: "My Profile", path: "/my-profile" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="cf-layout">

      {/* SIDEBAR */}

      <aside className="cf-sidebar">

        <div className="cf-brand">
          <div className="cf-brand-logo">CF</div>

          <div>
            <h2>CampusFlow</h2>
            <span>STUDENT PORTAL</span>
          </div>
        </div>


        <div className="cf-menu-label">MAIN MENU</div>

        <nav className="cf-navigation">

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/student-dashboard"}
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


        {/* SIDEBAR BOTTOM */}

        <div className="cf-sidebar-bottom">

          <div className="cf-help-card">
            <div className="cf-help-icon">✦</div>
            <h4>CampusFlow</h4>
            <p>Your college activities, simplified.</p>
          </div>

          <div className="cf-sidebar-user">
            <div className="cf-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>

            <div className="cf-user-details">
              <strong>{user?.name || "Student"}</strong>
              <span>Student Account</span>
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


      {/* PAGE CONTENT */}

      <main className="cf-layout-content">
        <Outlet />
      </main>

    </div>
  );
}

export default StudentLayout;