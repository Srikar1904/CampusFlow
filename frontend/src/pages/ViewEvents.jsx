import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function ViewEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/events");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch events");
        }

        setEvents(data.events || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="cf-events-page">

      {/* HEADER */}

      <header className="cf-events-header">
        <div>
          <span className="cf-events-breadcrumb">
            CAMPUSFLOW / STUDENT PORTAL
          </span>

          <h1>Explore Campus Events</h1>

          <p>
            Discover exciting events, workshops and activities
            happening at your college.
          </p>
        </div>

        <button
          className="cf-events-back"
          onClick={() => navigate("/student-dashboard")}
        >
          ← Dashboard
        </button>
      </header>


      {/* HERO BANNER */}

      <section className="cf-events-hero">
        <div>
          <span>✦ CAMPUS ACTIVITIES</span>
          <h2>Make Every Campus Moment Count.</h2>
          <p>
            Explore opportunities, participate in events and
            make your college experience memorable.
          </p>

          <button onClick={() => navigate("/apply-od")}>
            Apply for On-Duty →
          </button>
        </div>

        <div className="cf-events-hero-decoration">
          <div className="cf-event-orbit orbit-one"></div>
          <div className="cf-event-orbit orbit-two"></div>
          <span>✦</span>
        </div>
      </section>


      {/* EVENT SUMMARY */}

      <section className="cf-events-summary">
        <div>
          <span className="cf-summary-icon">▦</span>
          <div>
            <strong>{events.length}</strong>
            <p>Total Events</p>
          </div>
        </div>

        <div>
          <span className="cf-summary-icon">✦</span>
          <div>
            <strong>Explore</strong>
            <p>Campus Activities</p>
          </div>
        </div>
      </section>


      {/* EVENTS SECTION */}

      <section className="cf-events-section">

        <div className="cf-events-section-heading">
          <div>
            <span>WHAT'S HAPPENING</span>
            <h2>Upcoming Events</h2>
          </div>

          <span className="cf-event-count">
            {events.length} Events Found
          </span>
        </div>


        {loading && (
          <div className="cf-events-message">
            <div className="cf-loading-spinner"></div>
            <h3>Loading Events...</h3>
            <p>Fetching the latest campus activities.</p>
          </div>
        )}


        {error && (
          <div className="cf-events-message cf-events-error">
            <h3>Unable to Load Events</h3>
            <p>{error}</p>
          </div>
        )}


        {!loading && !error && events.length === 0 && (
          <div className="cf-events-empty">
            <div>▦</div>
            <h2>No Events Available</h2>
            <p>
              New college events will appear here once
              they are added by the administrator.
            </p>
          </div>
        )}


        {!loading && !error && events.length > 0 && (
          <div className="cf-events-grid">

            {events.map((event, index) => {
              const eventDate = new Date(event.date);

              const validDate = !Number.isNaN(eventDate.getTime());

              return (
                <article className="cf-event-card" key={event._id}>

                  <div className={`cf-event-card-banner banner-${index % 4}`}>
                    <span className="cf-event-category">
                      COLLEGE EVENT
                    </span>

                    <div className="cf-event-date">
                      <strong>
                        {validDate
                          ? eventDate.getDate()
                          : "--"}
                      </strong>

                      <span>
                        {validDate
                          ? eventDate.toLocaleString("en-US", {
                              month: "short",
                            }).toUpperCase()
                          : "DATE"}
                      </span>
                    </div>

                    <div className="cf-event-banner-symbol">
                      ✦
                    </div>
                  </div>


                  <div className="cf-event-card-content">

                    <h3>{event.title}</h3>

                    <p className="cf-event-description">
                      {event.description}
                    </p>

                    <div className="cf-event-details">

                      <div>
                        <span>◷</span>
                        <p>{event.time}</p>
                      </div>

                      <div>
                        <span>⌖</span>
                        <p>{event.venue}</p>
                      </div>

                    </div>

                    <button
                      className="cf-event-apply"
                      onClick={() => navigate("/apply-od")}
                    >
                      Apply for OD <span>→</span>
                    </button>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>


      {/* FOOTER */}

      <footer className="cf-events-footer">
        <span>CampusFlow © 2026</span>
        <span>Smart Club Event & OD Approval System</span>
      </footer>

    </div>
  );
}

export default ViewEvents;