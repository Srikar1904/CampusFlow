import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function StudentRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    email: "",
    department: "",
    year: "",
    section: "",
    phone: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("Creating your account...");
      setMessageType("");

      const response = await fetch(
        "http://localhost:5001/api/student/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            year: Number(formData.year),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage("Account created successfully! Redirecting to login...");
      setMessageType("success");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-register-page">

      {/* LEFT BRANDING SECTION */}

      <section className="cf-register-brand">

        <div className="cf-register-brand-content">

          <div className="cf-register-logo">
            <span>CF</span>
            <div>
              <h2>CampusFlow</h2>
              <p>SMART CAMPUS MANAGEMENT</p>
            </div>
          </div>

          <div className="cf-register-intro">

            <span className="cf-register-tag">
              ✦ JOIN THE CAMPUSFLOW COMMUNITY
            </span>

            <h1>
              Your Campus Journey,
              <span> Starts Here.</span>
            </h1>

            <p>
              Create your student account and experience a smarter
              way to manage college events, On-Duty applications
              and approvals.
            </p>

          </div>

          <div className="cf-register-features">

            <div>
              <span>✓</span>
              <p>Discover college events</p>
            </div>

            <div>
              <span>✓</span>
              <p>Apply for On-Duty online</p>
            </div>

            <div>
              <span>✓</span>
              <p>Track applications easily</p>
            </div>

          </div>

        </div>

        <div className="cf-register-decoration decoration-one"></div>
        <div className="cf-register-decoration decoration-two"></div>

        <div className="cf-register-brand-footer">
          CampusFlow © 2026 · Built for smarter campus management
        </div>

      </section>


      {/* RIGHT REGISTRATION SECTION */}

      <section className="cf-register-form-section">

        <div className="cf-register-form-wrapper">

          <div className="cf-register-mobile-logo">
            <span>CF</span>
            <strong>CampusFlow</strong>
          </div>

          <div className="cf-register-heading">

            <span>STUDENT REGISTRATION</span>

            <h2>Create Your Account</h2>

            <p>
              Enter your details to get started with CampusFlow.
            </p>

          </div>


          <form
            className="cf-register-form"
            onSubmit={handleSubmit}
          >

            {/* PERSONAL DETAILS */}

            <div className="cf-register-form-section-title">
              <span>01</span>
              <div>
                <h3>Personal Information</h3>
                <p>Tell us about yourself.</p>
              </div>
            </div>


            <div className="cf-register-field">
              <label>Full Name <span>*</span></label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>


            <div className="cf-register-field">
              <label>Registration Number <span>*</span></label>

              <input
                type="text"
                name="registrationNumber"
                placeholder="Enter your registration number"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
              />
            </div>


            <div className="cf-register-field">
              <label>Email Address <span>*</span></label>

              <input
                type="email"
                name="email"
                placeholder="Enter your college email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>


            <div className="cf-register-field">
              <label>Phone Number</label>

              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>


            {/* ACADEMIC DETAILS */}

            <div className="cf-register-form-section-title">
              <span>02</span>
              <div>
                <h3>Academic Information</h3>
                <p>Your college academic details.</p>
              </div>
            </div>


            <div className="cf-register-field">
              <label>Department <span>*</span></label>

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select your department</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="AIML">Artificial Intelligence (AIML)</option>
                <option value="DS">Data Science (DS)</option>
              </select>
            </div>


            <div className="cf-register-field-grid">

              <div className="cf-register-field">
                <label>Academic Year <span>*</span></label>

                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>


              <div className="cf-register-field">
                <label>Section <span>*</span></label>

                <input
                  type="text"
                  name="section"
                  placeholder="Example: C"
                  value={formData.section}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>


            {/* SECURITY */}

            <div className="cf-register-form-section-title">
              <span>03</span>
              <div>
                <h3>Account Security</h3>
                <p>Create a secure password.</p>
              </div>
            </div>


            <div className="cf-register-field">
              <label>Password <span>*</span></label>

              <div className="cf-register-password">

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create your password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

              <small>Use at least 6 characters.</small>
            </div>


            {/* MESSAGE */}

            {message && (
              <div className={`cf-register-message ${messageType}`}>
                <span>{messageType === "success" ? "✓" : "!"}</span>
                {message}
              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="cf-register-submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Student Account →"}
            </button>


            <p className="cf-register-login-link">
              Already have an account?
              <Link to="/"> Login Here</Link>
            </p>

          </form>


          <div className="cf-register-bottom">
            CampusFlow © 2026 · All Rights Reserved
          </div>

        </div>

      </section>

    </div>
  );
}

export default StudentRegister;