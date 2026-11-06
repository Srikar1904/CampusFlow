import { useState } from "react";

const API = "http://localhost:5001/api/events";

function CreateEvent() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create event");
      }

      setMessage(data.message);

      setForm({
        title: "",
        description: "",
        date: "",
        time: "",
        venue: ""
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-create-event-page">

      <div className="cf-create-event-heading">
        <span>EVENT ORGANIZER</span>
        <h2>Create New Event</h2>
        <p>Submit your college event for admin approval.</p>
      </div>

      <form
        className="cf-create-event-form"
        onSubmit={handleSubmit}
      >

        {message && (
          <div className="cf-create-success">
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="cf-create-error">
            ❌ {error}
          </div>
        )}

        <div className="cf-create-event-field">
          <label>Event Title *</label>
          <input
            type="text"
            name="title"
            placeholder="Enter event title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="cf-create-event-field">
          <label>Event Description *</label>
          <textarea
            name="description"
            placeholder="Describe your event..."
            value={form.description}
            onChange={handleChange}
            rows="5"
            required
          />
        </div>

        <div className="cf-create-event-row">

          <div className="cf-create-event-field">
            <label>Event Date *</label>
            <input
              type="date"
              name="date"
              min={new Date().toISOString().split("T")[0]}
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="cf-create-event-field">
            <label>Event Time *</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </div>

        </div>

        <div className="cf-create-event-field">
          <label>Event Venue *</label>
          <input
            type="text"
            name="venue"
            placeholder="Enter venue"
            value={form.venue}
            onChange={handleChange}
            required
          />
        </div>

        <div className="cf-create-event-note">
          <strong>📌 Approval Process</strong>
          <p>
            Your event will remain pending until the administrator
            reviews and approves it.
          </p>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Event →"}
        </button>

      </form>
    </div>
  );
}

export default CreateEvent;