import { useNavigate } from "react-router-dom";
import "../App.css";

function StudentDashboard() {
  const navigate = useNavigate();

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const cards = [
    {
      icon: "▦",
      title: "Available Events",
      description: "Discover upcoming college events and activities.",
      action: "Explore Events",
      path: "/view-events",
      className: "blue",
    },
    {
      icon: "＋",
      title: "Apply for OD",
      description: "Submit your On-Duty application for an event.",
      action: "Apply Now",
      path: "/apply-od",
      className: "purple",
    },
    {
      icon: "◷",
      title: "OD Status",
      description: "Track your submitted OD applications.",
      action: "Track Application",
      path: "/od-status",
      className: "orange",
    },
    {
      icon: "✓",
      title: "Approvals",
      description: "Check faculty decisions and approval remarks.",
      action: "View Approvals",
      path: "/approvals",
      className: "green",
    },
  ];

  return (
    <div className="cf-dashboard-content">

      {/* TOPBAR */}

      <header className="cf-topbar">

        <div>
          <div className="cf-breadcrumb">
            PORTAL <span>/</span> DASHBOARD
          </div>

          <h1>Student Dashboard</h1>
          <p>Welcome back! Here's your campus overview.</p>
        </div>

        <button
          className="cf-user-profile"
          onClick={() => navigate("/my-profile")}
        >
          <div className="cf-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "S"}
          </div>

          <div className="cf-user-details">
            <strong>{user?.name || "Student"}</strong>
            <span>Student Account</span>
          </div>

          <span className="cf-profile-arrow">⌄</span>
        </button>

      </header>


      {/* WELCOME BANNER */}

      <section className="cf-welcome">

        <div className="cf-welcome-content">

          <span className="cf-welcome-tag">
            ✦ YOUR CAMPUS, YOUR SPACE
          </span>

          <h2>
            Hello, {user?.name?.split(" ")[0] || "Student"}!
          </h2>

          <p>
            Manage your college events, On-Duty applications
            and approvals from one convenient place.
          </p>

          <button onClick={() => navigate("/view-events")}>
            Explore Events <span>→</span>
          </button>

        </div>

        <div className="cf-welcome-decoration">
          <div className="cf-decoration-circle circle-one"></div>
          <div className="cf-decoration-circle circle-two"></div>
          <div className="cf-decoration-icon">✦</div>
        </div>

      </section>


      {/* SECTION HEADING */}

      <section className="cf-section-heading">
        <div>
          <span>YOUR ACTIVITIES</span>
          <h2>Quick Access</h2>
          <p>Choose a service to continue.</p>
        </div>
      </section>


      {/* DASHBOARD CARDS */}

      <section className="cf-card-grid">

        {cards.map((card) => (
          <div
            className="cf-action-card"
            key={card.title}
            onClick={() => navigate(card.path)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate(card.path);
            }}
          >

            <div className={`cf-card-icon ${card.className}`}>
              {card.icon}
            </div>

            <h3>{card.title}</h3>

            <p>{card.description}</p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(card.path);
              }}
            >
              {card.action} <span>→</span>
            </button>

          </div>
        ))}

      </section>


      {/* STUDENT INFORMATION */}

      <section className="cf-information-section">

        <div className="cf-info-heading">
          <div>
            <span>ACCOUNT OVERVIEW</span>
            <h2>Student Information</h2>
          </div>

          <button onClick={() => navigate("/my-profile")}>
            Edit Profile →
          </button>
        </div>

        <div className="cf-info-grid">

          <div className="cf-info-item">
            <div className="cf-info-icon">♙</div>
            <div>
              <span>Full Name</span>
              <strong>{user?.name || "Not available"}</strong>
            </div>
          </div>

          <div className="cf-info-item">
            <div className="cf-info-icon">✉</div>
            <div>
              <span>Email Address</span>
              <strong>{user?.email || "Not available"}</strong>
            </div>
          </div>

          <div className="cf-info-item">
            <div className="cf-info-icon">▤</div>
            <div>
              <span>Registration Number</span>
              <strong>
                {user?.registrationNumber || "Not available"}
              </strong>
            </div>
          </div>

        </div>

      </section>


      {/* FOOTER */}

      <footer className="cf-dashboard-footer">
        <span>CampusFlow – Smart Club Event & OD Approval System</span>
        <span>Made for smarter campus management.</span>
      </footer>

    </div>
  );
}

export default StudentDashboard;