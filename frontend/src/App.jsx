
import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate
} from "react-router-dom";

import StudentRegister from "./pages/StudentRegister";
import StudentDashboard from "./pages/StudentDashboard";
import ViewEvents from "./pages/ViewEvents";
import ApplyOD from "./pages/ApplyOD";
import ODStatus from "./pages/ODStatus";
import Approvals from "./pages/Approvals";
import MyProfile from "./pages/MyProfile";
import FacultyDashboard from "./pages/FacultyDashboard";
import FacultyODRequests from "./pages/FacultyODRequests";
import FacultyProfile from "./pages/FacultyProfile";

import StudentLayout from "./components/StudentLayout";

import "./App.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!role) {
      setMessage("Please select your role");
      return;
    }

    if (role === "admin") {
      setMessage("Admin login is not implemented yet");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const endpoint =
        role === "student"
          ? "http://localhost:5001/api/student/login"
          : "http://localhost:5001/api/faculty/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const loggedInUser = data.user || data.faculty;

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...loggedInUser,
          role
        })
      );

      navigate(
        role === "student"
          ? "/student-dashboard"
          : "/faculty-dashboard"
      );

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-login-page">

      <div className="cf-login-brand">

        <div className="cf-login-brand-content">

          <div className="cf-login-logo">CF</div>

          <h1>CampusFlow</h1>

          <p className="cf-login-tagline">
            Your Campus. Your Events. Your Flow.
          </p>

          <div className="cf-login-illustration">
            <div className="cf-login-circle">
              <span>🎓</span>
            </div>
          </div>

          <h2>
            Everything on Campus,
            <br />
            One Smart Platform.
          </h2>

          <p>
            Manage club events, submit OD requests and track
            approvals with a smarter campus experience.
          </p>

          <div className="cf-login-features">
            <span>✦ Smart Event Management</span>
            <span>✦ Easy OD Applications</span>
            <span>✦ Transparent Approval Tracking</span>
          </div>

        </div>

        <div className="cf-login-brand-footer">
          CAMPUSFLOW © 2026
        </div>

      </div>

      <div className="cf-login-main">

        <div className="cf-login-form-wrapper">

          <div className="cf-login-mobile-logo">
            <span>CF</span>
            CampusFlow
          </div>

          <div className="cf-login-heading">

            <span className="cf-login-welcome">
              WELCOME BACK
            </span>

            <h2>Sign in to your account</h2>

            <p>
              Enter your credentials to access your CampusFlow dashboard.
            </p>

          </div>

          <form onSubmit={handleLogin} className="cf-login-form">

            <div className="cf-login-field">

              <label>Email Address</label>

              <div className="cf-login-input-box">
                <span>✉</span>

                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

            </div>

            <div className="cf-login-field">

              <label>Password</label>

              <div className="cf-login-input-box">
                <span>🔒</span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="cf-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>

            <div className="cf-login-field">

              <label>Select Your Role</label>

              <div className="cf-role-options">

                <button
                  type="button"
                  className={`cf-role-card ${role === "student" ? "active" : ""}`}
                  onClick={() => setRole("student")}
                >
                  <span className="cf-role-icon">🎓</span>
                  <strong>Student</strong>
                  <small>Student Portal</small>
                </button>

                <button
                  type="button"
                  className={`cf-role-card ${role === "faculty" ? "active" : ""}`}
                  onClick={() => setRole("faculty")}
                >
                  <span className="cf-role-icon">👨‍🏫</span>
                  <strong>Faculty</strong>
                  <small>Faculty Portal</small>
                </button>

                <button
                  type="button"
                  className={`cf-role-card ${role === "admin" ? "active" : ""}`}
                  onClick={() => setRole("admin")}
                >
                  <span className="cf-role-icon">🛡️</span>
                  <strong>Admin</strong>
                  <small>Admin Portal</small>
                </button>

              </div>

            </div>

            {message && (
              <div className={`cf-login-message ${
                message.includes("successful") ? "success" : "error"
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="cf-login-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In to CampusFlow"}
              <span>→</span>
            </button>

          </form>

          <div className="cf-login-register">
            Don't have a student account?
            <Link to="/student-register"> Create Account</Link>
          </div>

          <div className="cf-login-security">
            <span>🔐</span>
            Your account information is securely protected.
          </div>

        </div>

      </div>

    </div>
  );
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* PUBLIC PAGES */}

        <Route path="/" element={<Login />} />

        <Route
          path="/student-register"
          element={<StudentRegister />}
        />

        {/* STUDENT PAGES */}

        <Route element={<StudentLayout />}>

          <Route
            path="/student-dashboard"
            element={<StudentDashboard />}
          />

          <Route
            path="/view-events"
            element={<ViewEvents />}
          />

          <Route
            path="/apply-od"
            element={<ApplyOD />}
          />

          <Route
            path="/od-status"
            element={<ODStatus />}
          />

          <Route
            path="/approvals"
            element={<Approvals />}
          />

          <Route
            path="/my-profile"
            element={<MyProfile />}
          />

        </Route>

        {/* FACULTY PAGE - WITHOUT STUDENT LAYOUT */}

        <Route
          path="/faculty-dashboard"
          element={<FacultyDashboard />}
        />
        <Route
  path="/faculty-od-requests"
  element={<FacultyODRequests />}
/>
        <Route
  path="/faculty-profile"
  element={<FacultyProfile />}
/>
      </Routes>

    </BrowserRouter>
  );
}

export default App;
