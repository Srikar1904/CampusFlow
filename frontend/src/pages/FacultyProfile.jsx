import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FacultyProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    department: "",
    phone: ""
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/faculty/profile",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load profile");
      }

      setProfile({
        name: data.faculty.name || "",
        email: data.faculty.email || "",
        department: data.faculty.department || "",
        phone: data.faculty.phone || ""
      });

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setMessage("");

      const response = await fetch(
        "http://localhost:5001/api/faculty/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            name: profile.name,
            department: profile.department,
            phone: profile.phone
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile update failed");
      }

      setProfile({
        ...profile,
        ...data.faculty
      });

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          name: data.faculty.name,
          department: data.faculty.department
        })
      );

      setEditing(false);
      setMessage("Profile updated successfully!");

    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) {
    return <div className="faculty-profile-loading">Loading profile...</div>;
  }

  return (
    <div className="faculty-profile-page">

      <div className="faculty-profile-header">
        <div>
          <span>FACULTY WORKSPACE</span>
          <h1>My Profile</h1>
          <p>Manage your faculty account information.</p>
        </div>

        <button onClick={() => navigate("/faculty-dashboard")}>
          ← Dashboard
        </button>
      </div>

      <div className="faculty-profile-card">

        <div className="faculty-profile-banner">
          <div className="faculty-profile-avatar">
            {profile.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{profile.name}</h2>
            <p>{profile.department} Department</p>
            <span>FACULTY ACCOUNT</span>
          </div>
        </div>

        {message && (
          <div className="faculty-profile-message">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate}>

          <div className="faculty-profile-section">
            <h3>Personal Information</h3>

            <div className="faculty-profile-grid">

              <div>
                <label>Full Name</label>
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={editing === false}
                  required
                />
              </div>

              <div>
                <label>Email Address</label>
                <input
                  value={profile.email}
                  disabled
                />
              </div>

              <div>
                <label>Department</label>
                <select
                  name="department"
                  value={profile.department}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="AIML">AIML</option>
                  <option value="DS">DS</option>
                </select>
              </div>

              <div>
                <label>Phone Number</label>
                <input
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Enter phone number"
                />
              </div>

            </div>
          </div>

          <div className="faculty-profile-actions">
  {!editing ? (
    <button
      type="button"
      onClick={() => {
        console.log("Edit clicked");
        setEditing(true);
        setMessage("");
      }}
    >
      ✎ Edit Profile
    </button>
  ) : (
    <>
      <button type="submit" className="faculty-save-btn">
        ✓ Save Changes
      </button>

      <button
        type="button"
        className="faculty-cancel-btn"
        onClick={() => {
          setEditing(false);
          fetchProfile();
          setMessage("");
        }}
      >
        Cancel
      </button>
    </>
  )}
</div>

        </form>

      </div>

    </div>
  );
}

export default FacultyProfile;