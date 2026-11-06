import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function ODStatus() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login first.");
        }

        const response = await fetch(
          "http://localhost:5001/api/od/my-applications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to fetch OD applications"
          );
        }

        setApplications(data.applications || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getCount = (status) =>
    applications.filter(
      (app) => app.status?.toLowerCase() === status
    ).length;

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "✓";
      case "rejected":
        return "✕";
      default:
        return "◷";
    }
  };

  return (
    <div className="cf-status-page">

      {/* HEADER */}

      <header className="cf-status-header">

        <div>
          <span className="cf-status-breadcrumb">
            CAMPUSFLOW / STUDENT PORTAL
          </span>

          <h1>My OD Applications</h1>

          <p>
            Monitor your On-Duty applications and track their progress.
          </p>
        </div>

        <button
          className="cf-status-back"
          onClick={() => navigate("/student-dashboard")}
        >
          ← Dashboard
        </button>

      </header>


      {/* HERO */}

      <section className="cf-status-hero">

        <div>
          <span>✦ APPLICATION TRACKER</span>

          <h2>Stay Updated on Your Requests.</h2>

          <p>
            View your submitted applications and check their
            current approval status in one place.
          </p>

          <button onClick={() => navigate("/apply-od")}>
            + New OD Application
          </button>
        </div>

        <div className="cf-status-hero-icon">
          ◷
        </div>

      </section>


      {/* SUMMARY CARDS */}

      <section className="cf-status-summary">

        <div className="cf-status-summary-card">
          <div className="cf-summary-icon total">▤</div>
          <div>
            <span>Total Applications</span>
            <h2>{applications.length}</h2>
          </div>
        </div>

        <div className="cf-status-summary-card">
          <div className="cf-summary-icon pending">◷</div>
          <div>
            <span>Pending</span>
            <h2>{getCount("pending")}</h2>
          </div>
        </div>

        <div className="cf-status-summary-card">
          <div className="cf-summary-icon approved">✓</div>
          <div>
            <span>Approved</span>
            <h2>{getCount("approved")}</h2>
          </div>
        </div>

        <div className="cf-status-summary-card">
          <div className="cf-summary-icon rejected">✕</div>
          <div>
            <span>Rejected</span>
            <h2>{getCount("rejected")}</h2>
          </div>
        </div>

      </section>


      {/* APPLICATION LIST */}

      <section className="cf-status-content">

        <div className="cf-status-section-heading">
          <div>
            <span>APPLICATION HISTORY</span>
            <h2>Your Submitted Requests</h2>
          </div>

          <span className="cf-status-count">
            {applications.length} Applications
          </span>
        </div>


        {loading && (
          <div className="cf-status-state">
            <div className="cf-status-spinner"></div>
            <h3>Loading Applications</h3>
            <p>Please wait while we retrieve your OD requests.</p>
          </div>
        )}


        {error && (
          <div className="cf-status-error">
            <span>!</span>
            <div>
              <strong>Unable to load applications</strong>
              <p>{error}</p>
            </div>
          </div>
        )}


        {!loading && !error && applications.length === 0 && (
          <div className="cf-status-empty">
            <div className="cf-empty-icon">▤</div>

            <h2>No Applications Found</h2>

            <p>
              You haven't submitted any OD applications yet.
              Explore college events and submit your first request.
            </p>

            <button onClick={() => navigate("/apply-od")}>
              Apply for OD →
            </button>
          </div>
        )}


        {!loading && !error && applications.length > 0 && (
          <div className="cf-status-list">

            {applications.map((application, index) => {
              const status = application.status?.toLowerCase() || "pending";

              return (
                <article
                  className="cf-status-application"
                  key={application._id}
                >

                  <div className="cf-status-card-top">

                    <div className="cf-status-event-icon">
                      ▦
                    </div>

                    <div className="cf-status-event-info">
                      <span className="cf-application-number">
                        APPLICATION #{index + 1}
                      </span>

                      <h3>
                        {application.eventId?.title || "Event unavailable"}
                      </h3>

                      <p>
                        Submitted on {formatDate(application.createdAt)}
                      </p>
                    </div>

                    <span className={`cf-status-badge ${status}`}>
                      {getStatusIcon(status)} {status.toUpperCase()}
                    </span>

                  </div>


                  <div className="cf-status-details">

                    <div className="cf-status-detail">
                      <span>OD DATE</span>
                      <strong>{formatDate(application.date)}</strong>
                    </div>

                    <div className="cf-status-detail">
                      <span>EVENT VENUE</span>
                      <strong>
                        {application.eventId?.venue || "Not available"}
                      </strong>
                    </div>

                    <div className="cf-status-detail">
                      <span>EVENT TIME</span>
                      <strong>
                        {application.eventId?.time || "Not available"}
                      </strong>
                    </div>

                  </div>


                  <div className="cf-status-reason">
                    <span>APPLICATION REASON</span>
                    <p>{application.reason}</p>
                  </div>


                  {/* TRACKING TIMELINE */}

                  <div className="cf-status-timeline">

                    <div className="cf-timeline-step completed">
                      <div className="cf-timeline-dot">✓</div>
                      <div>
                        <strong>Application Submitted</strong>
                        <p>Your OD request has been received.</p>
                      </div>
                    </div>

                    <div className={`cf-timeline-step ${
                      status === "pending" ? "current" : "completed"
                    }`}>
                      <div className="cf-timeline-dot">
                        {status === "pending" ? "2" : "✓"}
                      </div>

                      <div>
                        <strong>Faculty Review</strong>
                        <p>
                          {status === "pending"
                            ? "Waiting for faculty review."
                            : "Application review completed."}
                        </p>
                      </div>
                    </div>

                    <div className={`cf-timeline-step ${
                      status === "approved" || status === "rejected"
                        ? "completed"
                        : "waiting"
                    }`}>
                      <div className="cf-timeline-dot">
                        {status === "approved"
                          ? "✓"
                          : status === "rejected"
                          ? "✕"
                          : "3"}
                      </div>

                      <div>
                        <strong>Final Decision</strong>
                        <p>
                          {status === "approved"
                            ? "Your OD application has been approved."
                            : status === "rejected"
                            ? "Your OD application has been rejected."
                            : "Final decision is pending."}
                        </p>
                      </div>
                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>


      {/* FOOTER */}

      <footer className="cf-status-footer">
        <span>CampusFlow © 2026</span>
        <span>Smart Club Event & OD Approval System</span>
      </footer>

    </div>
  );
}

export default ODStatus;