import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Approvals() {
  const navigate = useNavigate();

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login first.");
        }

        const response = await fetch(
          "http://localhost:5001/api/od/my-approvals",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch approvals");
        }

        setApprovals(data.approvals || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  const getCount = (status) =>
    approvals.filter(
      (item) => item.status?.toLowerCase() === status
    ).length;

  const formatDate = (date) => {
    if (!date) return "Not processed yet";

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
    <div className="cf-approvals-page">

      {/* HEADER */}

      <header className="cf-approvals-header">

        <div>
          <span className="cf-approvals-breadcrumb">
            CAMPUSFLOW / STUDENT PORTAL
          </span>

          <h1>My Approvals</h1>

          <p>
            View faculty decisions and remarks on your OD applications.
          </p>
        </div>

        <button
          className="cf-approvals-back"
          onClick={() => navigate("/student-dashboard")}
        >
          ← Dashboard
        </button>

      </header>


      {/* HERO */}

      <section className="cf-approvals-hero">

        <div>
          <span>✦ APPROVAL CENTER</span>

          <h2>Your Requests, Their Decisions.</h2>

          <p>
            Stay informed about your OD application decisions,
            faculty remarks and approval history.
          </p>

          <button onClick={() => navigate("/od-status")}>
            Track OD Applications →
          </button>
        </div>

        <div className="cf-approvals-hero-icon">
          ✓
        </div>

      </section>


      {/* SUMMARY */}

      <section className="cf-approvals-summary">

        <div className="cf-approvals-summary-card">
          <div className="cf-approvals-summary-icon total">▤</div>
          <div>
            <span>Total Records</span>
            <h2>{approvals.length}</h2>
          </div>
        </div>

        <div className="cf-approvals-summary-card">
          <div className="cf-approvals-summary-icon pending">◷</div>
          <div>
            <span>Pending</span>
            <h2>{getCount("pending")}</h2>
          </div>
        </div>

        <div className="cf-approvals-summary-card">
          <div className="cf-approvals-summary-icon approved">✓</div>
          <div>
            <span>Approved</span>
            <h2>{getCount("approved")}</h2>
          </div>
        </div>

        <div className="cf-approvals-summary-card">
          <div className="cf-approvals-summary-icon rejected">✕</div>
          <div>
            <span>Rejected</span>
            <h2>{getCount("rejected")}</h2>
          </div>
        </div>

      </section>


      {/* APPROVAL HISTORY */}

      <section className="cf-approvals-content">

        <div className="cf-approvals-section-heading">
          <div>
            <span>DECISION HISTORY</span>
            <h2>Faculty Approval Records</h2>
            <p>Review the decisions associated with your OD requests.</p>
          </div>

          <span className="cf-approvals-count">
            {approvals.length} Records
          </span>
        </div>


        {/* LOADING */}

        {loading && (
          <div className="cf-approvals-state">
            <div className="cf-approvals-spinner"></div>
            <h3>Loading Approval Records</h3>
            <p>Please wait while we retrieve your records.</p>
          </div>
        )}


        {/* ERROR */}

        {error && (
          <div className="cf-approvals-error">
            <span>!</span>

            <div>
              <strong>Unable to load approval records</strong>
              <p>{error}</p>
            </div>
          </div>
        )}


        {/* EMPTY */}

        {!loading && !error && approvals.length === 0 && (
          <div className="cf-approvals-empty">

            <div className="cf-approvals-empty-icon">✓</div>

            <h2>No Approval Records Yet</h2>

            <p>
              Your faculty approval decisions and remarks will
              appear here once your OD applications are processed.
            </p>

            <button onClick={() => navigate("/od-status")}>
              View OD Applications →
            </button>

          </div>
        )}


        {/* APPROVAL CARDS */}

        {!loading && !error && approvals.length > 0 && (
          <div className="cf-approvals-list">

            {approvals.map((approval, index) => {

              const status =
                approval.status?.toLowerCase() || "pending";

              const eventTitle =
                approval.odId?.eventId?.title || "OD Application";

              return (
                <article
                  className="cf-approval-card"
                  key={approval._id}
                >

                  {/* CARD HEADER */}

                  <div className="cf-approval-card-header">

                    <div className="cf-approval-icon">
                      ✓
                    </div>

                    <div className="cf-approval-heading">
                      <span>APPROVAL RECORD #{index + 1}</span>

                      <h3>{eventTitle}</h3>

                      <p>
                        Approver: {approval.approverRole || "Not specified"}
                      </p>
                    </div>

                    <span className={`cf-approval-badge ${status}`}>
                      {getStatusIcon(status)} {status.toUpperCase()}
                    </span>

                  </div>


                  {/* DETAILS */}

                  <div className="cf-approval-details">

                    <div>
                      <span>APPROVER ROLE</span>
                      <strong>
                        {approval.approverRole || "Not available"}
                      </strong>
                    </div>

                    <div>
                      <span>DECISION DATE</span>
                      <strong>
                        {formatDate(approval.approvedAt)}
                      </strong>
                    </div>

                    <div>
                      <span>RECORD CREATED</span>
                      <strong>
                        {formatDate(approval.createdAt)}
                      </strong>
                    </div>

                  </div>


                  {/* REMARKS */}

                  <div className={`cf-approval-remarks ${status}`}>

                    <div className="cf-remarks-icon">
                      ✦
                    </div>

                    <div>
                      <span>FACULTY REMARKS</span>

                      <p>
                        {approval.remarks || "No remarks provided."}
                      </p>
                    </div>

                  </div>


                  {/* DECISION MESSAGE */}

                  <div className={`cf-approval-decision ${status}`}>

                    <span>{getStatusIcon(status)}</span>

                    <p>
                      {status === "approved"
                        ? "Your OD application has been approved."
                        : status === "rejected"
                        ? "Your OD application has been rejected."
                        : "Your approval decision is currently pending."}
                    </p>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>


      {/* FOOTER */}

      <footer className="cf-approvals-footer">
        <span>CampusFlow © 2026</span>
        <span>Smart Club Event & OD Approval System</span>
      </footer>

    </div>
  );
}

export default Approvals;