import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    setupCode: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        "http://localhost:5001/api/admin/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            setupCode: form.setupCode
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert("Admin account created successfully!");
      navigate("/");

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-admin-register-page">

      <div className="cf-admin-register-card">

        <div className="cf-admin-register-header">
          <div className="cf-admin-register-logo">CF</div>
          <span>ADMINISTRATION PORTAL</span>
          <h1>Create Admin Account</h1>
          <p>Register an authorized CampusFlow administrator.</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="cf-admin-register-field">
            <label>Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="cf-admin-register-field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="cf-admin-register-field">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create password"
              required
            />
          </div>

          <div className="cf-admin-register-field">
            <label>Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
            />
          </div>

          <div className="cf-admin-register-field">
            <label>Admin Setup Code</label>
            <input
              type="password"
              name="setupCode"
              value={form.setupCode}
              onChange={handleChange}
              placeholder="Enter private setup code"
              required
            />
          </div>

          <label className="cf-admin-show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Show Password
          </label>

          {message && (
            <div className="cf-admin-register-error">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cf-admin-register-submit"
          >
            {loading ? "Creating Account..." : "Create Admin Account →"}
          </button>

        </form>

        <div className="cf-admin-register-footer">
          Already registered?
          <Link to="/"> Sign In</Link>
        </div>

        <div className="cf-admin-security">
          🔐 Protected administrator registration
        </div>

      </div>

    </div>
  );
}

export default AdminRegister;