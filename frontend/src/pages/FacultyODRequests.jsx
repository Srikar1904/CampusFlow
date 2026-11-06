import React, { useEffect, useState } from "react";

function FacultyODRequests() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState("");
  const [message, setMessage] = useState("");

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5001/api/od/faculty/requests",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch requests");
      }

      setApplications(data.applications || []);

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDecision = async (odId, status) => {
    try {
      setProcessing(odId);
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/od/faculty/${odId}/decision`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            status,
            remarks: remarks[odId] || ""
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Decision failed");
      }

      setMessage(data.message);

      await fetchApplications();

    } catch (error) {
      setMessage(error.message);
    } finally {
      setProcessing("");
    }
  };

  const pendingCount = applications.filter(
    item => item.status === "pending"
  ).length;

  const approvedCount = applications.filter(
    item => item.status === "approved"
  ).length;

  const rejectedCount = applications.filter(
    item => item.status === "rejected"
  ).length;

  const filteredApplications =
    filter === "all"
      ? applications
      : applications.filter(item => item.status === filter);

  if (loading) {
    return (
      <div className="faculty-od-loading">
        Loading OD applications...
      </div>
    );
  }

  return (
    <div className="faculty-od-page">

      {/* HEADER */}

      <div className="faculty-od-header">
        <div>
          <span>FACULTY WORKSPACE</span>
          <h1>OD Requests</h1>
          <p>Review and manage student On-Duty applications.</p>
        </div>

        <button
          className="faculty-refresh-btn"
          onClick={fetchApplications}
        >
          ↻ Refresh
        </button>
      </div>


      {/* STATISTICS */}

      <div className="faculty-od-stats">

        <div className="faculty-od-stat">
          <span>Total Requests</span>
          <h2>{applications.length}</h2>
        </div>

        <div className="faculty-od-stat pending-stat">
          <span>Pending</span>
          <h2>{pendingCount}</h2>
        </div>

        <div className="faculty-od-stat approved-stat">
          <span>Approved</span>
          <h2>{approvedCount}</h2>
        </div>

        <div className="faculty-od-stat rejected-stat">
          <span>Rejected</span>
          <h2>{rejectedCount}</h2>
        </div>

      </div>


      {/* MESSAGE */}

      {message && (
        <div className="faculty-od-message">
          {message}
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}


      {/* FILTERS */}

      <div className="faculty-od-filter-section">

        <div>
          <h2>Student Applications</h2>
          <p>Review applications submitted by your department.</p>
        </div>

        <div className="faculty-od-filters">

          {["all", "pending", "approved", "rejected"].map(status => (
            <button
              key={status}
              className={filter === status ? "active" : ""}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}

        </div>

      </div>


      {/* APPLICATION CARDS */}

      <div className="faculty-od-list">

        {filteredApplications.length === 0 ? (

          <div className="faculty-od-empty">
            <div>📂</div>
            <h3>No applications found</h3>
            <p>There are no {filter === "all" ? "" : filter} OD applications.</p>
          </div>

        ) : (

          filteredApplications.map(application => {

            const student = application.studentId || {};
            const event = application.eventId || {};

            return (

              <div className="faculty-od-card" key={application._id}>

                {/* CARD HEADER */}

                <div className="faculty-od-card-header">

                  <div>
                    <span className="faculty-od-id">
                      APPLICATION ID: {application._id.slice(-8).toUpperCase()}
                    </span>

                    <h3>{student.name || "Student information unavailable"}</h3>

                    <p>
                      {student.registrationNumber || "No registration number"}
                    </p>
                  </div>

                  <span className={`faculty-od-badge ${application.status}`}>
                    {application.status}
                  </span>

                </div>


                {/* STUDENT DETAILS */}

                <div className="faculty-od-details">

                  <div>
                    <span>Department</span>
                    <strong>{student.department || "N/A"}</strong>
                  </div>

                  <div>
                    <span>Year / Section</span>
                    <strong>
                      {student.year || "N/A"} / {student.section || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{student.email || "N/A"}</strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>{student.phone || "N/A"}</strong>
                  </div>

                </div>


                {/* EVENT DETAILS */}

                <div className="faculty-od-event">

                  <span>EVENT INFORMATION</span>

                  <h3>{event.title || "Event information unavailable"}</h3>

                  <p>
                    📅 {event.date || "Date unavailable"}
                  </p>

                  <p>
                    📍 {event.venue || "Venue unavailable"}
                  </p>

                </div>


                {/* REASON */}

                <div className="faculty-od-reason">

                  <span>STUDENT'S REASON</span>

                  <p>{application.reason}</p>

                </div>


                {/* REMARKS AND ACTIONS */}

                {application.status === "pending" && (

                  <div className="faculty-od-actions">

                    <label>Faculty Remarks</label>

                    <textarea
                      placeholder="Enter your remarks..."
                      value={remarks[application._id] || ""}
                      onChange={e =>
                        setRemarks({
                          ...remarks,
                          [application._id]: e.target.value
                        })
                      }
                    />

                    <div className="faculty-od-buttons">

                      <button
                        className="faculty-approve-btn"
                        disabled={processing === application._id}
                        onClick={() =>
                          handleDecision(application._id, "approved")
                        }
                      >
                        {processing === application._id
                          ? "Processing..."
                          : "✓ Approve"}
                      </button>

                      <button
                        className="faculty-reject-btn"
                        disabled={processing === application._id}
                        onClick={() =>
                          handleDecision(application._id, "rejected")
                        }
                      >
                        ✕ Reject
                      </button>

                    </div>

                  </div>

                )}

                {application.status !== "pending" && (
                  <div className="faculty-od-processed">
                    This application has already been {application.status}.
                  </div>
                )}

              </div>

            );
          })

        )}

      </div>

    </div>
  );
}

export default FacultyODRequests;