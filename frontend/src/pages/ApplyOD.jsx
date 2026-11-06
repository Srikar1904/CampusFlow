import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function ApplyOD() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const selectedEvent = events.find(
    (event) => event._id === eventId
  );

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/events"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch events");
        }

        setEvents(data.events || []);
      } catch (error) {
        setMessage(error.message);
        setMessageType("error");
      } finally {
        setFetching(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        "http://localhost:5001/api/od/apply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventId,
            reason,
            date,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OD application failed");
      }

      setMessage("Your OD application has been submitted successfully!");
      setMessageType("success");

      setEventId("");
      setReason("");
      setDate("");

    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-apply-page">

      {/* TOP HEADER */}

      <header className="cf-apply-header">

        <div>
          <span className="cf-apply-breadcrumb">
            CAMPUSFLOW / STUDENT PORTAL
          </span>

          <h1>Apply for On-Duty</h1>

          <p>
            Submit your OD request for participation in college events.
          </p>
        </div>

        <button
          className="cf-apply-back"
          onClick={() => navigate("/student-dashboard")}
        >
          ← Dashboard
        </button>

      </header>


      {/* HERO */}

      <section className="cf-apply-hero">

        <div>
          <span>✦ STUDENT SERVICES</span>

          <h2>Your Participation Matters.</h2>

          <p>
            Apply for On-Duty permission and participate in
            college activities without worrying about attendance.
          </p>
        </div>

        <div className="cf-apply-hero-icon">
          ✦
        </div>

      </section>


      {/* MAIN CONTENT */}

      <div className="cf-apply-layout">

        {/* FORM */}

        <section className="cf-apply-form-card">

          <div className="cf-apply-card-heading">

            <div className="cf-apply-form-icon">＋</div>

            <div>
              <h2>OD Application Form</h2>
              <p>Fill in the details to submit your request.</p>
            </div>

          </div>


          {message && (
            <div className={`cf-apply-alert ${messageType}`}>
              <span>{messageType === "success" ? "✓" : "!"}</span>
              <p>{message}</p>
            </div>
          )}


          <form onSubmit={handleSubmit}>

            {/* EVENT */}

            <div className="cf-apply-field">

              <label>
                Select College Event <span>*</span>
              </label>

              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                required
                disabled={fetching || events.length === 0}
              >
                <option value="">
                  {fetching
                    ? "Loading events..."
                    : "Choose your event"}
                </option>

                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}

              </select>

              <small>Select the event for which you require OD.</small>

            </div>


            {/* DATE */}

            <div className="cf-apply-field">

              <label>
                On-Duty Date <span>*</span>
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <small>Select the date for your OD application.</small>

            </div>


            {/* REASON */}

            <div className="cf-apply-field">

              <label>
                Reason for On-Duty <span>*</span>
              </label>

              <textarea
                placeholder="Explain why you are applying for On-Duty..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                minLength={5}
                maxLength={500}
              />

              <div className="cf-character-count">
                {reason.length}/500 characters
              </div>

            </div>


            {/* BUTTON */}

            <button
              type="submit"
              className="cf-apply-submit"
              disabled={loading || fetching || events.length === 0}
            >
              {loading
                ? "Submitting Application..."
                : "Submit OD Application →"}
            </button>

          </form>

        </section>


        {/* RIGHT INFORMATION PANEL */}

        <aside className="cf-apply-side">

          {/* EVENT PREVIEW */}

          <div className="cf-apply-preview">

            <span className="cf-preview-label">
              SELECTED EVENT
            </span>

            {selectedEvent ? (
              <>
                <div className="cf-preview-icon">✦</div>

                <h3>{selectedEvent.title}</h3>

                <p>{selectedEvent.description}</p>

                <div className="cf-preview-details">
                  <div>
                    <span>◷</span>
                    {selectedEvent.time}
                  </div>

                  <div>
                    <span>⌖</span>
                    {selectedEvent.venue}
                  </div>
                </div>
              </>
            ) : (
              <div className="cf-preview-empty">
                <div>▦</div>
                <h3>No Event Selected</h3>
                <p>Select an event to see its details here.</p>
              </div>
            )}

          </div>


          {/* APPLICATION PROCESS */}

          <div className="cf-apply-process">

            <h3>Application Process</h3>

            <div className="cf-process-step">
              <div className="cf-process-number">1</div>

              <div>
                <strong>Submit Application</strong>
                <p>Fill in the OD form and submit.</p>
              </div>
            </div>

            <div className="cf-process-line"></div>

            <div className="cf-process-step">
              <div className="cf-process-number">2</div>

              <div>
                <strong>Faculty Review</strong>
                <p>Your application will be reviewed.</p>
              </div>
            </div>

            <div className="cf-process-line"></div>

            <div className="cf-process-step">
              <div className="cf-process-number">3</div>

              <div>
                <strong>Check Status</strong>
                <p>Track the decision in OD Status.</p>
              </div>
            </div>

          </div>


          {/* QUICK LINK */}

          <button
            className="cf-apply-status-link"
            onClick={() => navigate("/od-status")}
          >
            View My OD Applications →
          </button>

        </aside>

      </div>


      {/* FOOTER */}

      <footer className="cf-apply-footer">
        <span>CampusFlow © 2026</span>
        <span>Smart Club Event & OD Approval System</span>
      </footer>

    </div>
  );
}

export default ApplyOD;