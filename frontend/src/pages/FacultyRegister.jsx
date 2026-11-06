import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function FacultyRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    phone: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password must contain at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5001/api/faculty/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            department: form.department,
            phone: form.phone
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Faculty registration failed"
        );
      }

      alert("Faculty account created successfully!");

      navigate("/");

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-faculty-register-page">

      <div className="cf-faculty-register-card">

        <div className="cf-faculty-register-header">
          <div className="cf-faculty-register-logo">
            CF
          </div>

          <span>FACULTY PORTAL</span>

          <h1>Create Faculty Account</h1>

          <p>
            Join CampusFlow to manage student OD
            applications and approvals.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="cf-faculty-register-grid">

            <div className="cf-faculty-register-field">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="cf-faculty-register-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="faculty@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="cf-faculty-register-field">
              <label>Department</label>

              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="AIML">AIML</option>
                <option value="DS">DS</option>
              </select>
            </div>

            <div className="cf-faculty-register-field">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="cf-faculty-register-field">
              <label>Password</label>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="cf-faculty-register-field">
              <label>Confirm Password</label>

              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <label className="cf-faculty-show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() =>
                setShowPassword(!showPassword)
              }
            />
            Show Password
          </label>

          {message && (
            <div className="cf-faculty-register-error">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="cf-faculty-register-submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Faculty Account →"}
          </button>

        </form>

        <div className="cf-faculty-register-footer">
          Already have an account?
          <Link to="/"> Sign In</Link>
        </div>

      </div>

    </div>
  );
}

export default FacultyRegister;