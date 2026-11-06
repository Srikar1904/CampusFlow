import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function MyProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    registrationNumber: "",
    department: "",
    year: "",
    section: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5001/api/student/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile");
        }

        setProfile({
          name: data.student.name || "",
          email: data.student.email || "",
          registrationNumber: data.student.registrationNumber || "",
          department: data.student.department || "",
          year: data.student.year || "",
          section: data.student.section || "",
          phone: data.student.phone || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5001/api/student/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profile.name,
            department: profile.department,
            year: Number(profile.year),
            section: profile.section,
            phone: profile.phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile update failed");
      }

      setProfile((previous) => ({
        ...previous,
        ...data.student,
      }));

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          name: data.student.name,
        })
      );

      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading your profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-topbar">
        <button onClick={() => navigate("/student-dashboard")}>
          ← Dashboard
        </button>
        <span>CampusFlow / My Profile</span>
      </div>

      <div className="profile-layout">

        <div className="profile-intro">
          <div className="profile-avatar">
            {profile.name.charAt(0).toUpperCase()}
          </div>

          <h1>{profile.name}</h1>
          <p>Student Account</p>

          <div className="profile-intro-line"></div>

          <div className="profile-mini-info">
            <span>Registration Number</span>
            <strong>{profile.registrationNumber}</strong>
          </div>

          <div className="profile-mini-info">
            <span>Department</span>
            <strong>{profile.department}</strong>
          </div>

          <div className="profile-mini-info">
            <span>Academic Year</span>
            <strong>Year {profile.year}</strong>
          </div>
        </div>

        <div className="profile-form-card">
          <div className="profile-heading">
            <div>
              <span className="profile-label">ACCOUNT SETTINGS</span>
              <h2>Personal Information</h2>
              <p>View and manage your student profile details.</p>
            </div>

            <div className="profile-status">
              ● Active
            </div>
          </div>

          {error && <div className="profile-error">{error}</div>}
          {message && <div className="profile-success">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="profile-form-grid">

              <div className="profile-field">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                />
              </div>

              <div className="profile-field">
                <label>Registration Number</label>
                <input
                  type="text"
                  value={profile.registrationNumber}
                  disabled
                />
              </div>

              <div className="profile-field">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={profile.department}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-field">
                <label>Academic Year</label>
                <select
                  name="year"
                  value={profile.year}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                </select>
              </div>

              <div className="profile-field">
                <label>Section</label>
                <input
                  type="text"
                  name="section"
                  value={profile.section}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-field full-width">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  maxLength="10"
                  pattern="[0-9]{10}"
                  placeholder="Enter 10-digit phone number"
                />
              </div>

            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="profile-cancel"
                onClick={() => navigate("/student-dashboard")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="profile-save"
                disabled={saving}
              >
                {saving ? "Saving Changes..." : "Save Changes →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;