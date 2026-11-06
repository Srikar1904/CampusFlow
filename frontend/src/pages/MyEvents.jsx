import { useEffect, useState } from "react";

const API = "http://localhost:5001/api/events";

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API}/my-events`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch events");
      }

      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleEdit = (event) => {
    setEditingEvent({
      ...event,
      date: new Date(event.date).toISOString().split("T")[0]
    });
    setMessage("");
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API}/my-events/${editingEvent._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: editingEvent.title,
            description: editingEvent.description,
            date: editingEvent.date,
            time: editingEvent.time,
            venue: editingEvent.venue
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      setEditingEvent(null);
      setMessage(data.message);
      fetchMyEvents();

    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API}/my-events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setMessage(data.message);
      fetchMyEvents();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="cf-my-events-page">

      <div className="cf-my-events-heading">
        <div>
          <span>EVENT ORGANIZER</span>
          <h2>My Events</h2>
          <p>Manage and track the events you have created.</p>
        </div>

        <button onClick={fetchMyEvents}>
          ↻ Refresh
        </button>
      </div>

      {message && (
        <div className="cf-my-events-success">{message}</div>
      )}

      {error && (
        <div className="cf-my-events-error">{error}</div>
      )}

      {loading ? (
        <div className="cf-my-events-empty">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="cf-my-events-empty">
          <span>📅</span>
          <h3>No Events Created Yet</h3>
          <p>Your created events will appear here.</p>
        </div>
      ) : (

        <div className="cf-my-events-grid">

          {events.map((event) => (

            <div className="cf-my-event-card" key={event._id}>

              <div className="cf-my-event-top">
                <span className="cf-my-event-icon">✦</span>

                <span className={`cf-my-event-status ${event.status}`}>
                  {event.status}
                </span>
              </div>

              <h3>{event.title}</h3>
              <p className="cf-my-event-description">
                {event.description}
              </p>

              <div className="cf-my-event-details">
                <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                <p>🕒 {event.time}</p>
                <p>📍 {event.venue}</p>
              </div>

              {event.adminRemarks && (
                <div className="cf-my-event-remarks">
                  <strong>Admin Remarks</strong>
                  <p>{event.adminRemarks}</p>
                </div>
              )}

              {event.status === "pending" && (
                <div className="cf-my-event-actions">
                  <button
                    className="edit"
                    onClick={() => handleEdit(event)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete"
                    onClick={() => handleDelete(event._id)}
                  >
                    Delete
                  </button>
                </div>
              )}

            </div>

          ))}

        </div>
      )}

      {editingEvent && (

        <div className="cf-my-event-modal">

          <form
            className="cf-my-event-edit-form"
            onSubmit={handleUpdate}
          >

            <h2>Edit Event</h2>

            <label>Event Title</label>
            <input
              value={editingEvent.title}
              onChange={(e) =>
                setEditingEvent({
                  ...editingEvent,
                  title: e.target.value
                })
              }
              required
            />

            <label>Description</label>
            <textarea
              value={editingEvent.description}
              onChange={(e) =>
                setEditingEvent({
                  ...editingEvent,
                  description: e.target.value
                })
              }
              required
            />

            <label>Date</label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={editingEvent.date}
              onChange={(e) =>
                setEditingEvent({
                  ...editingEvent,
                  date: e.target.value
                })
              }
              required
            />

            <label>Time</label>
            <input
              type="time"
              value={editingEvent.time}
              onChange={(e) =>
                setEditingEvent({
                  ...editingEvent,
                  time: e.target.value
                })
              }
              required
            />

            <label>Venue</label>
            <input
              value={editingEvent.venue}
              onChange={(e) =>
                setEditingEvent({
                  ...editingEvent,
                  venue: e.target.value
                })
              }
              required
            />

            <div className="cf-my-event-modal-actions">
              <button type="submit">Save Changes</button>

              <button
                type="button"
                onClick={() => setEditingEvent(null)}
              >
                Cancel
              </button>
            </div>

          </form>

        </div>

      )}

    </div>
  );
}

export default MyEvents;