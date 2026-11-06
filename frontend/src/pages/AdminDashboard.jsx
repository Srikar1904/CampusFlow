import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState({});
const [activeMenu, setActiveMenu] = useState("Dashboard");
const [statistics, setStatistics] = useState({
  totalStudents: 0,
  totalFaculty: 0,
  totalEvents: 0,
  totalOD: 0,
  pendingOD: 0,
  approvedOD: 0,
  rejectedOD: 0
});
const [recentApplications, setRecentApplications] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
// STUDENT MANAGEMENT STATES
const [students, setStudents] = useState([]);
const [studentSearch, setStudentSearch] = useState("");
const [departmentFilter, setDepartmentFilter] = useState("All");
const [studentsLoading, setStudentsLoading] = useState(false);
const [studentsError, setStudentsError] = useState("");
const [selectedStudent, setSelectedStudent] = useState(null);
const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);

  // FACULTY MANAGEMENT STATES
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [facultySearch, setFacultySearch] = useState("");
  const [facultyDepartmentFilter, setFacultyDepartmentFilter] = useState("All");
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyError, setFacultyError] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultyDetailsLoading, setFacultyDetailsLoading] = useState(false);

  // EVENT MANAGEMENT STATES
  const [events, setEvents] = useState([]);
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState("All");
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetailsLoading, setEventDetailsLoading] = useState(false);

  // ADMIN OD APPLICATION STATES
  const [odApplications, setOdApplications] = useState([]);
  const [odSearch, setOdSearch] = useState("");
  const [odStatusFilter, setOdStatusFilter] = useState("All");
  const [odLoading, setOdLoading] = useState(false);
  const [odError, setOdError] = useState("");
  const [selectedOD, setSelectedOD] = useState(null);

  // REPORTS AND ANALYTICS STATES
  const [reportData, setReportData] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");

  // ADMIN PROFILE & SETTINGS
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!localStorage.getItem("token") || user.role !== "admin") {
    navigate("/");
    return;
  }

  setAdmin(user);
  fetchDashboardStats();
}, [navigate]);

const fetchAdminProfile = async () => {
  try {
    setProfileLoading(true);
    setProfileError("");
    setProfileMessage("");
    const response = await fetch("http://localhost:5001/api/admin/profile", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to load admin profile");
    setProfileForm({ name: data.admin?.name || "", email: data.admin?.email || "" });
  } catch (error) {
    setProfileError(error.message);
  } finally {
    setProfileLoading(false);
  }
};

const saveAdminProfile = async (event) => {
  event.preventDefault();
  try {
    setProfileSaving(true);
    setProfileError("");
    setProfileMessage("");
    const response = await fetch("http://localhost:5001/api/admin/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(profileForm)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to update profile");
    const updatedAdmin = { ...admin, ...data.admin, role: "admin" };
    setAdmin(updatedAdmin);
    localStorage.setItem("user", JSON.stringify(updatedAdmin));
    setProfileMessage(data.message || "Profile updated successfully");
  } catch (error) {
    setProfileError(error.message);
  } finally {
    setProfileSaving(false);
  }
};

const changeAdminPassword = async (event) => {
  event.preventDefault();
  setPasswordError("");
  setPasswordMessage("");
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    setPasswordError("New password and confirm password do not match.");
    return;
  }
  if (passwordForm.newPassword.length < 6) {
    setPasswordError("New password must contain at least 6 characters.");
    return;
  }
  try {
    setPasswordSaving(true);
    const response = await fetch("http://localhost:5001/api/admin/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to change password");
    setPasswordMessage(data.message || "Password changed successfully");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  } catch (error) {
    setPasswordError(error.message);
  } finally {
    setPasswordSaving(false);
  }
};

const fetchDashboardStats = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      "http://localhost:5001/api/admin/dashboard-stats",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load dashboard");
    }

    setStatistics(data.statistics);
    setRecentApplications(data.recentApplications || []);

  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
// FETCH STUDENTS FROM MONGODB
const fetchStudents = async () => {
  try {
    setStudentsLoading(true);
    setStudentsError("");

    const response = await fetch(
      "http://localhost:5001/api/admin/students",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch students");
    }

    setStudents(data.students || []);
  } catch (error) {
    setStudentsError(error.message);
  } finally {
    setStudentsLoading(false);
  }
};
// FETCH INDIVIDUAL STUDENT DETAILS
const fetchStudentDetails = async (studentId) => {
  try {
    setStudentDetailsLoading(true);
    setSelectedStudent(null);

    const response = await fetch(
      `http://localhost:5001/api/admin/students/${studentId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch student details");
    }

    setSelectedStudent(data.student);

  } catch (error) {
    alert(error.message);
  } finally {
    setStudentDetailsLoading(false);
  }
};
// FREEZE / UNFREEZE STUDENT ACCOUNT
const handleFreezeToggle = async (student) => {
  const newStatus = !student.isFrozen;

  const confirmed = window.confirm(
    newStatus
      ? `Are you sure you want to freeze ${student.name}'s account?`
      : `Are you sure you want to unfreeze ${student.name}'s account?`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `http://localhost:5001/api/admin/students/${student._id}/freeze`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          isFrozen: newStatus,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update account");
    }

    // Update student list immediately
    setStudents((previousStudents) =>
      previousStudents.map((item) =>
        item._id === student._id
          ? { ...item, isFrozen: newStatus }
          : item
      )
    );

    // Update details popup if it is open
    setSelectedStudent((previous) =>
      previous?._id === student._id
        ? { ...previous, isFrozen: newStatus }
        : previous
    );

    alert(data.message);

  } catch (error) {
    alert(error.message);
  }
};
// FETCH FACULTY MEMBERS FROM MONGODB
const fetchFaculty = async () => {
  try {
    setFacultyLoading(true);
    setFacultyError("");
    const response = await fetch("http://localhost:5001/api/admin/faculty", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch faculty");
    setFacultyMembers(data.faculty || []);
  } catch (error) {
    setFacultyError(error.message);
  } finally {
    setFacultyLoading(false);
  }
};

// FETCH INDIVIDUAL FACULTY DETAILS
const fetchFacultyDetails = async (facultyId) => {
  try {
    setFacultyDetailsLoading(true);
    setSelectedFaculty(null);
    const response = await fetch(`http://localhost:5001/api/admin/faculty/${facultyId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch faculty details");
    setSelectedFaculty(data.faculty);
  } catch (error) {
    alert(error.message);
  } finally {
    setFacultyDetailsLoading(false);
  }
};

// FREEZE / UNFREEZE FACULTY ACCOUNT
const handleFacultyFreezeToggle = async (faculty) => {
  const newStatus = !faculty.isFrozen;
  const confirmed = window.confirm(
    newStatus
      ? `Are you sure you want to freeze ${faculty.name}'s account?`
      : `Are you sure you want to unfreeze ${faculty.name}'s account?`
  );
  if (!confirmed) return;
  try {
    const response = await fetch(`http://localhost:5001/api/admin/faculty/${faculty._id}/freeze`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ isFrozen: newStatus }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update faculty account");
    setFacultyMembers((previous) => previous.map((item) =>
      item._id === faculty._id ? { ...item, isFrozen: newStatus } : item
    ));
    setSelectedFaculty((previous) =>
      previous?._id === faculty._id ? { ...previous, isFrozen: newStatus } : previous
    );
    alert(data.message || "Faculty account updated successfully");
  } catch (error) {
    alert(error.message);
  }
};

// DELETE FACULTY ACCOUNT
const handleDeleteFaculty = async (faculty) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${faculty.name}'s faculty account?`
  );
  if (!confirmed) return;
  try {
    const response = await fetch(`http://localhost:5001/api/admin/faculty/${faculty._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete faculty account");
    setFacultyMembers((previous) => previous.filter((item) => item._id !== faculty._id));
    setSelectedFaculty(null);
    alert(data.message || "Faculty account deleted successfully");
  } catch (error) {
    alert(error.message);
  }
};

// FETCH ALL OD APPLICATIONS FOR ADMIN
const fetchODApplications = async () => {
  try {
    setOdLoading(true);
    setOdError("");

    const response = await fetch("http://localhost:5001/api/admin/od-applications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch OD applications");
    }

    setOdApplications(data.applications || []);
  } catch (error) {
    setOdError(error.message);
  } finally {
    setOdLoading(false);
  }
};

// FETCH REPORTS AND ANALYTICS
const fetchReports = async () => {
  try {
    setReportsLoading(true);
    setReportsError("");

    const response = await fetch("http://localhost:5001/api/admin/reports", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch reports");
    }

    setReportData(data);
  } catch (error) {
    setReportsError(error.message);
  } finally {
    setReportsLoading(false);
  }
};

// DOWNLOAD REPORTS AS CSV
const downloadReportsCSV = () => {
  if (!reportData) return;

  const rows = [
    ["CampusFlow Reports & Analytics"],
    [],
    ["Overview", "Count"],
    ...Object.entries(reportData.overview || {}),
    [],
    ["Department", "Total Applications", "Pending", "Approved", "Rejected"],
    ...(reportData.departmentStats || []).map((item) => [
      item.department, item.total, item.pending, item.approved, item.rejected
    ]),
    [],
    ["Month", "Total Applications", "Pending", "Approved", "Rejected"],
    ...(reportData.monthlyStats || []).map((item) => [
      item.month, item.total, item.pending, item.approved, item.rejected
    ])
  ];

  const csv = rows.map((row) =>
    row.map((value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    }).join(",")
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "CampusFlow_Reports.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

// FETCH ALL EVENTS FOR ADMIN
const fetchEvents = async () => {
  try {
    setEventsLoading(true);
    setEventsError("");
    const response = await fetch("http://localhost:5001/api/admin/events", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch events");
    setEvents(data.events || []);
  } catch (error) {
    setEventsError(error.message);
  } finally {
    setEventsLoading(false);
  }
};

// FETCH INDIVIDUAL EVENT DETAILS
const fetchEventDetails = async (eventId) => {
  try {
    setEventDetailsLoading(true);
    setSelectedEvent(null);
    const response = await fetch(`http://localhost:5001/api/admin/events/${eventId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch event details");
    setSelectedEvent(data.event);
  } catch (error) {
    alert(error.message);
  } finally {
    setEventDetailsLoading(false);
  }
};

// APPROVE OR REJECT EVENT
const handleEventStatus = async (event, status) => {
  const remarks = window.prompt(
    status === "rejected"
      ? "Enter a reason for rejecting this event:"
      : "Optional remarks for this event:",
    event.adminRemarks || ""
  );

  if (remarks === null) return;

  if (status === "rejected" && !remarks.trim()) {
    alert("Please provide a reason for rejecting the event.");
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to ${status} "${event.title}"?`
  );
  if (!confirmed) return;

  try {
    const response = await fetch(`http://localhost:5001/api/admin/events/${event._id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ status, adminRemarks: remarks.trim() }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update event");
    setEvents((previous) => previous.map((item) =>
      item._id === event._id
        ? { ...item, status, adminRemarks: remarks.trim() }
        : item
    ));
    setSelectedEvent((previous) =>
      previous?._id === event._id
        ? { ...previous, status, adminRemarks: remarks.trim() }
        : previous
    );
    alert(data.message || `Event ${status} successfully`);
  } catch (error) {
    alert(error.message);
  }
};

// DELETE EVENT (BLOCKED BY BACKEND IF OD RECORDS EXIST)
const handleDeleteEvent = async (event) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${event.title}"? This cannot be undone.`
  );
  if (!confirmed) return;

  try {
    const response = await fetch(`http://localhost:5001/api/admin/events/${event._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete event");
    setEvents((previous) => previous.filter((item) => item._id !== event._id));
    setSelectedEvent(null);
    alert(data.message || "Event deleted successfully");
  } catch (error) {
    alert(error.message);
  }
};

useEffect(() => {
  if (activeMenu === "Events") fetchEvents();
  if (activeMenu === "OD Applications") fetchODApplications();
}, [activeMenu]);

useEffect(() => {
  if (activeMenu === "Reports") fetchReports();
}, [activeMenu]);

useEffect(() => {
  if (activeMenu === "Settings") fetchAdminProfile();
}, [activeMenu]);

useEffect(() => {
  if (activeMenu === "Faculty") fetchFaculty();
}, [activeMenu]);

useEffect(() => {
  if (activeMenu === "Students") {
    fetchStudents();
  }
}, [activeMenu]);
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Students", icon: "♙" },
    { name: "Faculty", icon: "♧" },
    { name: "Events", icon: "▣" },
    { name: "OD Applications", icon: "▤" },
    { name: "Reports", icon: "▥" },
    { name: "Settings", icon: "⚙" }
  ];
  // AVAILABLE DEPARTMENTS
const departments = [
  "All",
  ...new Set(
    students
      .map((student) => student.department)
      .filter(Boolean)
  ),
];

// FILTER STUDENTS
const filteredStudents = students.filter((student) => {
  const search = studentSearch.toLowerCase().trim();

  const matchesSearch =
    (student.name || "").toLowerCase().includes(search) ||
    (student.email || "").toLowerCase().includes(search) ||
    (student.registrationNumber || "")
      .toLowerCase()
      .includes(search);

  const matchesDepartment =
    departmentFilter === "All" ||
    student.department === departmentFilter;

  return matchesSearch && matchesDepartment;
});

// FACULTY DEPARTMENT FILTERS AND SEARCH
const facultyDepartments = [
  "All",
  ...new Set(facultyMembers.map((faculty) => faculty.department).filter(Boolean)),
];
const filteredFaculty = facultyMembers.filter((faculty) => {
  const search = facultySearch.toLowerCase().trim();
  const matchesSearch =
    (faculty.name || "").toLowerCase().includes(search) ||
    (faculty.email || "").toLowerCase().includes(search) ||
    (faculty.department || "").toLowerCase().includes(search);
  const matchesDepartment =
    facultyDepartmentFilter === "All" ||
    faculty.department === facultyDepartmentFilter;
  return matchesSearch && matchesDepartment;
});

// OD APPLICATION SEARCH AND STATUS FILTER
const filteredODApplications = odApplications.filter((od) => {
  const search = odSearch.toLowerCase().trim();
  const student = od.studentId || {};
  const event = od.eventId || {};
  const matchesSearch =
    (student.name || "").toLowerCase().includes(search) ||
    (student.registrationNumber || "").toLowerCase().includes(search) ||
    (student.email || "").toLowerCase().includes(search) ||
    (event.title || "").toLowerCase().includes(search);
  const matchesStatus =
    odStatusFilter === "All" || (od.status || "pending") === odStatusFilter;
  return matchesSearch && matchesStatus;
});

// EVENT SEARCH AND STATUS FILTER
const filteredEvents = events.filter((event) => {
  const search = eventSearch.toLowerCase().trim();
  const matchesSearch =
    (event.title || "").toLowerCase().includes(search) ||
    (event.venue || "").toLowerCase().includes(search) ||
    (event.description || "").toLowerCase().includes(search);
  // Older records without a status are treated as pending for admin review.
  const status = event.status || "pending";
  const matchesStatus = eventStatusFilter === "All" || status === eventStatusFilter;
  return matchesSearch && matchesStatus;
});

const stats = [
  {
    title: "Total Students",
    value: statistics.totalStudents,
    icon: "🎓",
    color: "blue"
  },
  {
    title: "Total Faculty",
    value: statistics.totalFaculty,
    icon: "👨‍🏫",
    color: "purple"
  },
  {
    title: "Total Events",
    value: statistics.totalEvents,
    icon: "📅",
    color: "orange"
  },
  {
    title: "OD Applications",
    value: statistics.totalOD,
    icon: "📋",
    color: "green"
  }
];

  return (
    <div className="cf-admin-dashboard">

      {/* SIDEBAR */}

      <aside className="cf-admin-sidebar">

        <div className="cf-admin-brand">
          <div className="cf-admin-brand-logo">CF</div>

          <div>
            <h2>CampusFlow</h2>
            <span>ADMIN CONSOLE</span>
          </div>
        </div>

        <div className="cf-admin-sidebar-label">
          MAIN MENU
        </div>

        <nav className="cf-admin-navigation">

          {menuItems.map((item) => (
            <button
              key={item.name}
              className={
                activeMenu === item.name
                  ? "cf-admin-menu active"
                  : "cf-admin-menu"
              }
              onClick={() => setActiveMenu(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}

        </nav>

        <div className="cf-admin-sidebar-bottom">

          <div className="cf-admin-user-mini">
            <div className="cf-admin-user-avatar">
              {admin.name?.charAt(0).toUpperCase() || "A"}
            </div>

            <div>
              <strong>{admin.name || "Administrator"}</strong>
              <span>System Admin</span>
            </div>
          </div>

          <button
            className="cf-admin-logout"
            onClick={logout}
          >
            ↪ Logout
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="cf-admin-main">

        <header className="cf-admin-topbar">

          <div>
            <span>ADMINISTRATION / {activeMenu.toUpperCase()}</span>
            <h1>{activeMenu}</h1>
          </div>

          <div className="cf-admin-topbar-right">

            <div className="cf-admin-status">
              <span></span>
              System Online
            </div>
            <section className="cf-admin-od-summary">

  <div>
    <span>⏳</span>
    <p>Pending OD</p>
    <h2>{statistics.pendingOD}</h2>
  </div>

  <div>
    <span>✓</span>
    <p>Approved OD</p>
    <h2>{statistics.approvedOD}</h2>
  </div>

  <div>
    <span>✕</span>
    <p>Rejected OD</p>
    <h2>{statistics.rejectedOD}</h2>
  </div>

</section>

            <div className="cf-admin-top-avatar">
              {admin.name?.charAt(0).toUpperCase() || "A"}
            </div>

          </div>

        </header>

        {activeMenu === "Dashboard" && (
          <>

            <section className="cf-admin-welcome">

              <div>
                <span>OVERVIEW</span>

                <h2>
                  Welcome back, {admin.name || "Admin"} 👋
                </h2>

                <p>
                  Here's what's happening across your campus today.
                </p>
              </div>

              <div className="cf-admin-date">
                CAMPUSFLOW ADMIN
              </div>

            </section>

            <section className="cf-admin-stats">

              {stats.map((stat) => (
                <div className="cf-admin-stat-card" key={stat.title}>

                  <div className={`cf-admin-stat-icon ${stat.color}`}>
                    {stat.icon}
                  </div>

                  <div>
                    <p>{stat.title}</p>
                    <h2>{stat.value}</h2>
                    <span>Live Database statistics</span>
                  </div>

                </div>
              ))}

            </section>

            <section className="cf-admin-content-grid">

              <div className="cf-admin-panel">

                <div className="cf-admin-panel-heading">
                  <div>
                    <h3>Platform Overview</h3>
                    <p>CampusFlow management center</p>
                  </div>

                  <span className="cf-admin-live-badge">
                    LIVE
                  </span>
                </div>

                <div className="cf-admin-overview-placeholder">

                  <div className="cf-admin-overview-icon">
                    📊
                  </div>

                  <h3>Campus Analytics</h3>

                  <p>
                    Real-time campus statistics will appear here
                    after connecting the dashboard APIs.
                  </p>

                </div>

              </div>

              <div className="cf-admin-panel">

                <div className="cf-admin-panel-heading">
                  <div>
                    <h3>Quick Actions</h3>
                    <p>Frequently used operations</p>
                  </div>
                </div>

                <div className="cf-admin-quick-actions">

                  <button onClick={() => setActiveMenu("Students")}>
                    <span>🎓</span>
                    <div>
                      <strong>Manage Students</strong>
                      <small>View student accounts</small>
                    </div>
                    <b>→</b>
                  </button>

                  <button onClick={() => setActiveMenu("Faculty")}>
                    <span>👨‍🏫</span>
                    <div>
                      <strong>Manage Faculty</strong>
                      <small>View faculty accounts</small>
                    </div>
                    <b>→</b>
                  </button>

                  <button onClick={() => setActiveMenu("Events")}>
                    <span>📅</span>
                    <div>
                      <strong>Manage Events</strong>
                      <small>Review campus events</small>
                    </div>
                    <b>→</b>
                  </button>

                  <button onClick={() => setActiveMenu("OD Applications")}>
                    <span>📋</span>
                    <div>
                      <strong>OD Applications</strong>
                      <small>Monitor OD requests</small>
                    </div>
                    <b>→</b>
                  </button>

                </div>

              </div>

            </section>

            <div className="cf-admin-footer">
              CampusFlow Administration System © 2026
              <span>Built for Smarter Campus Management</span>
            </div>

          </>
        )}
        {/* STUDENT MANAGEMENT */}

{activeMenu === "Students" && (
  <section className="cf-admin-students">

    <div className="cf-admin-students-header">
      <div>
        <span className="cf-admin-section-label">
          STUDENT DIRECTORY
        </span>

        <h2>Student Management</h2>

        <p>
          View and search registered CampusFlow students.
        </p>
      </div>

      <div className="cf-admin-students-count">
        <span>Total Students</span>
        <strong>{students.length}</strong>
      </div>
    </div>

    <div className="cf-admin-students-toolbar">

      <input
        type="text"
        placeholder="Search name, email or registration number..."
        value={studentSearch}
        onChange={(e) => setStudentSearch(e.target.value)}
      />

      <select
        value={departmentFilter}
        onChange={(e) => setDepartmentFilter(e.target.value)}
      >
        {departments.map((department) => (
          <option key={department} value={department}>
            {department === "All"
              ? "All Departments"
              : department}
          </option>
        ))}
      </select>

      <button onClick={fetchStudents}>
        ↻ Refresh
      </button>

    </div>

    {studentsError && (
      <div className="cf-admin-students-error">
        {studentsError}
      </div>
    )}

    {studentsLoading ? (
      <div className="cf-admin-students-empty">
        Loading students...
      </div>
    ) : (
      <div className="cf-admin-students-table-wrapper">

        <table className="cf-admin-students-table">

          <thead>
            <tr>
              <th>Student</th>
              <th>Registration No.</th>
              <th>Department</th>
              <th>Year</th>
              <th>Section</th>
              <th>Phone</th>
<th>Account Status</th>
<th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="8" className="cf-admin-students-empty">
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student._id}>

                  <td>
                    <div className="cf-admin-student-identity">

                      <div className="cf-admin-student-avatar">
                        {student.name?.charAt(0).toUpperCase() || "S"}
                      </div>

                      <div>
                        <strong>{student.name || "Unknown"}</strong>
                        <span>{student.email || "—"}</span>
                      </div>

                    </div>
                  </td>

                  <td>
                    {student.registrationNumber || "—"}
                  </td>

                  <td>
                    <span className="cf-admin-department-badge">
                      {student.department || "—"}
                    </span>
                  </td>

                  <td>{student.year || "—"}</td>

                  <td>{student.section || "—"}</td>

                  <td>{student.phone || "—"}</td>
                  <td>
                    <span
                      className={student.isFrozen ? "cf-admin-status-frozen" : "cf-admin-status-active"}
                    >
                      {student.isFrozen ? "● Frozen" : "● Active"}
                    </span>
                  </td>
                  <td>
                    <div className="cf-admin-student-actions">
                      <button
                        className="cf-admin-view-student"
                        onClick={() => fetchStudentDetails(student._id)}
                      >
                        View Details
                      </button>
                      <button
                        className={student.isFrozen ? "cf-admin-unfreeze-button" : "cf-admin-freeze-button"}
                        onClick={() => handleFreezeToggle(student)}
                      >
                        {student.isFrozen ? "Unfreeze" : "Freeze"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>
    )}

    <div className="cf-admin-students-footer">
      Showing {filteredStudents.length} of {students.length} students
    </div>

  </section>
)}
{/* ADMIN OD APPLICATIONS */}
{activeMenu === "OD Applications" && (
  <section className="cf-admin-students">
    <div className="cf-admin-students-header">
      <div>
        <span className="cf-admin-section-label">STUDENT OD DIRECTORY</span>
        <h2>OD Applications</h2>
        <p>Monitor student on-duty applications and their faculty approval history.</p>
      </div>
      <div className="cf-admin-students-count">
        <span>Total Applications</span>
        <strong>{odApplications.length}</strong>
      </div>
    </div>

    <div className="cf-admin-students-toolbar">
      <input
        type="text"
        placeholder="Search student, registration number or event..."
        value={odSearch}
        onChange={(e) => setOdSearch(e.target.value)}
      />
      <select value={odStatusFilter} onChange={(e) => setOdStatusFilter(e.target.value)}>
        <option value="All">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <button onClick={fetchODApplications}>↻ Refresh</button>
    </div>

    {odError && <div className="cf-admin-students-error">{odError}</div>}

    {odLoading ? (
      <div className="cf-admin-students-empty">Loading OD applications...</div>
    ) : (
      <div className="cf-admin-students-table-wrapper">
        <table className="cf-admin-students-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Event</th>
              <th>Application Date</th>
              <th>Faculty Approvals</th>
              <th>OD Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredODApplications.length === 0 ? (
              <tr>
                <td colSpan="6" className="cf-admin-students-empty">
                  No OD applications found.
                </td>
              </tr>
            ) : (
              filteredODApplications.map((od) => {
                const student = od.studentId || {};
                const event = od.eventId || {};
                const status = od.status || "pending";
                const approvalCount = (od.approvals || []).length;

                return (
                  <tr key={od._id}>
                    <td>
                      <div className="cf-admin-student-identity">
                        <div className="cf-admin-student-avatar">
                          {student.name?.charAt(0).toUpperCase() || "S"}
                        </div>
                        <div>
                          <strong>{student.name || "Unknown Student"}</strong>
                          <span>{student.registrationNumber || student.email || "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{event.title || "Event unavailable"}</strong>
                      <br />
                      <small>{event.venue || ""}</small>
                    </td>
                    <td>
                      {od.createdAt ? new Date(od.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td>{approvalCount} record(s)</td>
                    <td>
                      <span className={`cf-admin-od-status ${status}`}>
                        ● {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="cf-admin-student-actions">
                        <button
                          className="cf-admin-view-student"
                          onClick={() => setSelectedOD(od)}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    )}

    <div className="cf-admin-students-footer">
      Showing {filteredODApplications.length} of {odApplications.length} applications
    </div>
  </section>
)}

{/* OD APPLICATION DETAILS POPUP */}
{selectedOD && (
  <div className="cf-admin-modal-overlay" onClick={() => setSelectedOD(null)}>
    <div className="cf-admin-student-modal" onClick={(e) => e.stopPropagation()}>
      <div className="cf-admin-modal-header">
        <div>
          <span>OD APPLICATION INFORMATION</span>
          <h2>Application Details</h2>
        </div>
        <button onClick={() => setSelectedOD(null)}>×</button>
      </div>

      <div className="cf-admin-modal-profile">
        <div className="cf-admin-modal-avatar">📋</div>
        <h3>{selectedOD.studentId?.name || "Unknown Student"}</h3>
        <p>{selectedOD.studentId?.registrationNumber || selectedOD.studentId?.email || "—"}</p>
      </div>

      <div className="cf-admin-modal-details">
        <div><span>Student Email</span><strong>{selectedOD.studentId?.email || "—"}</strong></div>
        <div><span>Department</span><strong>{selectedOD.studentId?.department || "—"}</strong></div>
        <div><span>Year / Section</span><strong>{[selectedOD.studentId?.year, selectedOD.studentId?.section].filter(Boolean).join(" / ") || "—"}</strong></div>
        <div><span>Event</span><strong>{selectedOD.eventId?.title || "Event unavailable"}</strong></div>
        <div><span>Event Date</span><strong>{selectedOD.eventId?.date ? new Date(selectedOD.eventId.date).toLocaleDateString() : "—"}</strong></div>
        <div><span>Event Venue</span><strong>{selectedOD.eventId?.venue || "—"}</strong></div>
        <div><span>OD Date</span><strong>{selectedOD.date ? new Date(selectedOD.date).toLocaleDateString() : "—"}</strong></div>
        <div><span>Application Submitted</span><strong>{selectedOD.createdAt ? new Date(selectedOD.createdAt).toLocaleString() : "—"}</strong></div>
        <div><span>OD Status</span><strong>{(selectedOD.status || "pending").toUpperCase()}</strong></div>
        <div><span>Reason</span><strong>{selectedOD.reason || "No reason provided"}</strong></div>
      </div>

      <div className="cf-admin-od-approval-history">
        <h3>Faculty Approval History</h3>
        {(selectedOD.approvals || []).length === 0 ? (
          <p>No faculty approval records are available yet.</p>
        ) : (
          (selectedOD.approvals || []).map((approval, index) => (
            <div className="cf-admin-od-approval-item" key={approval._id || index}>
              <div>
                <strong>{approval.approverId?.name || approval.approverRole || "Approver"}</strong>
                <span>{approval.approverId?.email || approval.approverId?.department || ""}</span>
              </div>
              <span className={`cf-admin-od-status ${approval.status || "pending"}`}>
                {(approval.status || "pending").toUpperCase()}
              </span>
              <p>Remarks: {approval.remarks || "No remarks"}</p>
              {approval.approvedAt && (
                <small>{new Date(approval.approvedAt).toLocaleString()}</small>
              )}
            </div>
          ))
        )}
      </div>

      <button className="cf-admin-modal-close" onClick={() => setSelectedOD(null)}>
        Close Details
      </button>
    </div>
  </div>
)}

{/* EVENTS MANAGEMENT */}
{activeMenu === "Events" && (
  <section className="cf-admin-students">
    <div className="cf-admin-students-header">
      <div>
        <span className="cf-admin-section-label">CAMPUS EVENT DIRECTORY</span>
        <h2>Events Management</h2>
        <p>Review event requests and control which events are available for student OD applications.</p>
      </div>
      <div className="cf-admin-students-count">
        <span>Total Events</span>
        <strong>{events.length}</strong>
      </div>
    </div>

    <div className="cf-admin-students-toolbar">
      <input
        type="text"
        placeholder="Search event title, venue or description..."
        value={eventSearch}
        onChange={(e) => setEventSearch(e.target.value)}
      />
      <select value={eventStatusFilter} onChange={(e) => setEventStatusFilter(e.target.value)}>
        <option value="All">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <button onClick={fetchEvents}>↻ Refresh</button>
    </div>

    {eventsError && <div className="cf-admin-students-error">{eventsError}</div>}

    {eventsLoading ? (
      <div className="cf-admin-students-empty">Loading events...</div>
    ) : (
      <div className="cf-admin-students-table-wrapper">
        <table className="cf-admin-students-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Time</th>
              <th>Venue</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan="7" className="cf-admin-students-empty">No events found.</td>
              </tr>
            ) : (
              filteredEvents.map((event) => {
                const status = event.status || "pending";
                return (
                  <tr key={event._id}>
                    <td>
                      <div className="cf-admin-student-identity">
                        <div className="cf-admin-student-avatar">📅</div>
                        <div>
                          <strong>{event.title || "Untitled Event"}</strong>
                          <span>{event.description || "No description"}</span>
                        </div>
                      </div>
                    </td>
                    <td>{event.date ? new Date(event.date).toLocaleDateString() : "—"}</td>
                    <td>{event.time || "—"}</td>
                    <td>{event.venue || "—"}</td>
                    <td>
                      {event.createdBy?.name || "Unknown"}
                      <br />
                      <small>{event.createdBy?.email || ""}</small>
                    </td>
                    <td>
                      <span className={`cf-admin-event-status ${status}`}>
                        ● {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="cf-admin-student-actions">
                        <button className="cf-admin-view-student" onClick={() => fetchEventDetails(event._id)}>
                          View
                        </button>
                        {status !== "approved" && (
                          <button className="cf-admin-unfreeze-button" onClick={() => handleEventStatus(event, "approved")}>
                            Approve
                          </button>
                        )}
                        {status !== "rejected" && (
                          <button className="cf-admin-freeze-button" onClick={() => handleEventStatus(event, "rejected")}>
                            Reject
                          </button>
                        )}
                        <button className="cf-admin-delete-button" onClick={() => handleDeleteEvent(event)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    )}
    <div className="cf-admin-students-footer">
      Showing {filteredEvents.length} of {events.length} events
    </div>
  </section>
)}

{/* EVENT DETAILS POPUP */}
{(selectedEvent || eventDetailsLoading) && (
  <div className="cf-admin-modal-overlay" onClick={() => { if (!eventDetailsLoading) setSelectedEvent(null); }}>
    <div className="cf-admin-student-modal" onClick={(e) => e.stopPropagation()}>
      <div className="cf-admin-modal-header">
        <div><span>EVENT INFORMATION</span><h2>Event Details</h2></div>
        <button onClick={() => setSelectedEvent(null)} disabled={eventDetailsLoading}>×</button>
      </div>
      {eventDetailsLoading ? (
        <p className="cf-admin-modal-loading">Loading event details...</p>
      ) : (
        <>
          <div className="cf-admin-modal-profile">
            <div className="cf-admin-modal-avatar">📅</div>
            <h3>{selectedEvent.title}</h3>
            <p>{selectedEvent.venue}</p>
          </div>
          <div className="cf-admin-modal-details">
            <div><span>Description</span><strong>{selectedEvent.description || "—"}</strong></div>
            <div><span>Date</span><strong>{selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString() : "—"}</strong></div>
            <div><span>Time</span><strong>{selectedEvent.time || "—"}</strong></div>
            <div><span>Venue</span><strong>{selectedEvent.venue || "—"}</strong></div>
            <div><span>Created By</span><strong>{selectedEvent.createdBy?.name || "Unknown"}</strong></div>
            <div><span>Creator Email</span><strong>{selectedEvent.createdBy?.email || "—"}</strong></div>
            <div><span>Status</span><strong>{(selectedEvent.status || "pending").toUpperCase()}</strong></div>
            <div><span>Admin Remarks</span><strong>{selectedEvent.adminRemarks || "No remarks"}</strong></div>
          </div>
          <div className="cf-admin-student-actions">
            {(selectedEvent.status || "pending") !== "approved" && (
              <button className="cf-admin-unfreeze-button" onClick={() => handleEventStatus(selectedEvent, "approved")}>Approve Event</button>
            )}
            {(selectedEvent.status || "pending") !== "rejected" && (
              <button className="cf-admin-freeze-button" onClick={() => handleEventStatus(selectedEvent, "rejected")}>Reject Event</button>
            )}
            <button className="cf-admin-modal-close" onClick={() => setSelectedEvent(null)}>Close Details</button>
          </div>
        </>
      )}
    </div>
  </div>
)}

{/* FACULTY MANAGEMENT */}
{activeMenu === "Faculty" && (
  <section className="cf-admin-students">
    <div className="cf-admin-students-header">
      <div>
        <span className="cf-admin-section-label">FACULTY DIRECTORY</span>
        <h2>Faculty Management</h2>
        <p>View, search and manage registered CampusFlow faculty accounts.</p>
      </div>
      <div className="cf-admin-students-count">
        <span>Total Faculty</span>
        <strong>{facultyMembers.length}</strong>
      </div>
    </div>

    <div className="cf-admin-students-toolbar">
      <input
        type="text"
        placeholder="Search name, email or department..."
        value={facultySearch}
        onChange={(e) => setFacultySearch(e.target.value)}
      />
      <select
        value={facultyDepartmentFilter}
        onChange={(e) => setFacultyDepartmentFilter(e.target.value)}
      >
        {facultyDepartments.map((department) => (
          <option key={department} value={department}>
            {department === "All" ? "All Departments" : department}
          </option>
        ))}
      </select>
      <button onClick={fetchFaculty}>↻ Refresh</button>
    </div>

    {facultyError && <div className="cf-admin-students-error">{facultyError}</div>}

    {facultyLoading ? (
      <div className="cf-admin-students-empty">Loading faculty...</div>
    ) : (
      <div className="cf-admin-students-table-wrapper">
        <table className="cf-admin-students-table">
          <thead>
            <tr>
              <th>Faculty</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Account Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFaculty.length === 0 ? (
              <tr><td colSpan="5" className="cf-admin-students-empty">No faculty members found.</td></tr>
            ) : (
              filteredFaculty.map((faculty) => (
                <tr key={faculty._id}>
                  <td>
                    <div className="cf-admin-student-identity">
                      <div className="cf-admin-student-avatar">
                        {faculty.name?.charAt(0).toUpperCase() || "F"}
                      </div>
                      <div>
                        <strong>{faculty.name || "Unknown"}</strong>
                        <span>{faculty.email || "—"}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="cf-admin-department-badge">{faculty.department || "—"}</span></td>
                  <td>{faculty.phone || "—"}</td>
                  <td>
                    <span className={faculty.isFrozen ? "cf-admin-status-frozen" : "cf-admin-status-active"}>
                      {faculty.isFrozen ? "● Frozen" : "● Active"}
                    </span>
                  </td>
                  <td>
                    <div className="cf-admin-student-actions">
                      <button className="cf-admin-view-student" onClick={() => fetchFacultyDetails(faculty._id)}>View Details</button>
                      <button
                        className={faculty.isFrozen ? "cf-admin-unfreeze-button" : "cf-admin-freeze-button"}
                        onClick={() => handleFacultyFreezeToggle(faculty)}
                      >{faculty.isFrozen ? "Unfreeze" : "Freeze"}</button>
                      <button className="cf-admin-delete-button" onClick={() => handleDeleteFaculty(faculty)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )}
    <div className="cf-admin-students-footer">Showing {filteredFaculty.length} of {facultyMembers.length} faculty members</div>
  </section>
)}

{/* FACULTY DETAILS POPUP */}
{(selectedFaculty || facultyDetailsLoading) && (
  <div className="cf-admin-modal-overlay" onClick={() => { if (!facultyDetailsLoading) setSelectedFaculty(null); }}>
    <div className="cf-admin-student-modal" onClick={(e) => e.stopPropagation()}>
      <div className="cf-admin-modal-header">
        <div><span>FACULTY INFORMATION</span><h2>Faculty Details</h2></div>
        <button onClick={() => setSelectedFaculty(null)} disabled={facultyDetailsLoading}>×</button>
      </div>
      {facultyDetailsLoading ? (
        <p className="cf-admin-modal-loading">Loading faculty details...</p>
      ) : (
        <>
          <div className="cf-admin-modal-profile">
            <div className="cf-admin-modal-avatar">{selectedFaculty.name?.charAt(0).toUpperCase() || "F"}</div>
            <h3>{selectedFaculty.name}</h3><p>{selectedFaculty.email}</p>
          </div>
          <div className="cf-admin-modal-details">
            <div><span>Department</span><strong>{selectedFaculty.department || "—"}</strong></div>
            <div><span>Phone Number</span><strong>{selectedFaculty.phone || "Not provided"}</strong></div>
            <div><span>Account Status</span><strong className={selectedFaculty.isFrozen ? "cf-admin-status-frozen" : "cf-admin-status-active"}>{selectedFaculty.isFrozen ? "Frozen" : "Active"}</strong></div>
            <div><span>Account Created</span><strong>{selectedFaculty.createdAt ? new Date(selectedFaculty.createdAt).toLocaleDateString() : "—"}</strong></div>
          </div>
          <button className="cf-admin-modal-close" onClick={() => setSelectedFaculty(null)}>Close Details</button>
        </>
      )}
    </div>
  </div>
)}

{/* STUDENT DETAILS POPUP */}

{(selectedStudent || studentDetailsLoading) && (
  <div
    className="cf-admin-modal-overlay"
    onClick={() => {
      if (!studentDetailsLoading) {
        setSelectedStudent(null);
      }
    }}
  >
    <div
      className="cf-admin-student-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <div className="cf-admin-modal-header">
        <div>
          <span>STUDENT INFORMATION</span>
          <h2>Student Details</h2>
        </div>

        <button
          onClick={() => setSelectedStudent(null)}
          disabled={studentDetailsLoading}
        >
          ×
        </button>
      </div>

      {studentDetailsLoading ? (
        <p className="cf-admin-modal-loading">
          Loading student details...
        </p>
      ) : (
        <>
          <div className="cf-admin-modal-profile">
            <div className="cf-admin-modal-avatar">
              {selectedStudent.name?.charAt(0).toUpperCase() || "S"}
            </div>

            <h3>{selectedStudent.name}</h3>
            <p>{selectedStudent.email}</p>
          </div>

          <div className="cf-admin-modal-details">

            <div>
              <span>Registration Number</span>
              <strong>{selectedStudent.registrationNumber || "—"}</strong>
            </div>

            <div>
              <span>Department</span>
              <strong>{selectedStudent.department || "—"}</strong>
            </div>

            <div>
              <span>Year</span>
              <strong>{selectedStudent.year || "—"}</strong>
            </div>

            <div>
              <span>Section</span>
              <strong>{selectedStudent.section || "—"}</strong>
            </div>

            <div>
              <span>Phone Number</span>
              <strong>{selectedStudent.phone || "Not provided"}</strong>
            </div>
            <div>
  <span>Account Status</span>

  <strong
    className={
      selectedStudent.isFrozen
        ? "cf-admin-status-frozen"
        : "cf-admin-status-active"
    }
  >
    {selectedStudent.isFrozen ? "Frozen" : "Active"}
  </strong>
</div>

            <div>
              <span>Account Created</span>
              <strong>
                {selectedStudent.createdAt
                  ? new Date(selectedStudent.createdAt).toLocaleDateString()
                  : "—"}
              </strong>
            </div>

          </div>

          <button
            className="cf-admin-modal-close"
            onClick={() => setSelectedStudent(null)}
          >
            Close Details
          </button>
        </>
      )}

    </div>
  </div>
)}
        {activeMenu === "Reports" && (
  <section className="cf-admin-reports">
    <div className="cf-admin-students-header">
      <div>
        <span className="cf-admin-section-label">CAMPUS PERFORMANCE</span>
        <h2>Reports &amp; Analytics</h2>
        <p>Live insights generated from CampusFlow database records.</p>
      </div>
      <div className="cf-admin-report-actions">
        <button onClick={fetchReports} disabled={reportsLoading}>↻ Refresh</button>
        <button onClick={downloadReportsCSV} disabled={!reportData}>↓ Download CSV</button>
      </div>
    </div>

    {reportsError && <div className="cf-admin-students-error">{reportsError}</div>}

    {reportsLoading ? (
      <div className="cf-admin-students-empty">Generating reports...</div>
    ) : reportData ? (
      <>
        <div className="cf-admin-report-cards">
          {[
            ["Total Students", reportData.overview?.totalStudents, "🎓"],
            ["Total Faculty", reportData.overview?.totalFaculty, "👨‍🏫"],
            ["Total Events", reportData.overview?.totalEvents, "📅"],
            ["OD Applications", reportData.overview?.totalOD, "📋"]
          ].map(([label, value, icon]) => (
            <div className="cf-admin-report-card" key={label}>
              <span>{icon}</span>
              <div><p>{label}</p><h2>{value ?? 0}</h2></div>
            </div>
          ))}
        </div>

        <div className="cf-admin-report-status-grid">
          {[
            ["Pending", reportData.overview?.pendingOD, "pending"],
            ["Approved", reportData.overview?.approvedOD, "approved"],
            ["Rejected", reportData.overview?.rejectedOD, "rejected"]
          ].map(([label, value, status]) => (
            <div className="cf-admin-report-status-card" key={label}>
              <span className={`cf-admin-od-status ${status}`}>{label}</span>
              <strong>{value ?? 0}</strong>
            </div>
          ))}
        </div>

        <div className="cf-admin-report-panels">
          <div className="cf-admin-panel cf-admin-report-panel">
            <div className="cf-admin-panel-heading">
              <div><h3>Department-wise OD Applications</h3><p>Application distribution by student department</p></div>
            </div>
            {(reportData.departmentStats || []).length === 0 ? (
              <p className="cf-admin-report-empty">No department application data available.</p>
            ) : (
              <div className="cf-admin-report-bars">
                {reportData.departmentStats.map((item) => {
                  const max = Math.max(...reportData.departmentStats.map((entry) => entry.total || 0), 1);
                  return (
                    <div className="cf-admin-report-bar-row" key={item.department}>
                      <div className="cf-admin-report-bar-label"><strong>{item.department}</strong><span>{item.total}</span></div>
                      <div className="cf-admin-report-bar-track"><div style={{ width: `${(item.total / max) * 100}%` }} /></div>
                      <small>Pending: {item.pending} · Approved: {item.approved} · Rejected: {item.rejected}</small>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="cf-admin-panel cf-admin-report-panel">
            <div className="cf-admin-panel-heading">
              <div><h3>Monthly OD Trends</h3><p>Application activity over the last six months</p></div>
            </div>
            {(reportData.monthlyStats || []).length === 0 ? (
              <p className="cf-admin-report-empty">No monthly data available.</p>
            ) : (
              <div className="cf-admin-monthly-chart">
                {reportData.monthlyStats.map((item) => {
                  const max = Math.max(...reportData.monthlyStats.map((entry) => entry.total || 0), 1);
                  return (
                    <div className="cf-admin-month-column" key={item.month}>
                      <strong>{item.total}</strong>
                      <div className="cf-admin-month-bar-wrap">
                        <div className="cf-admin-month-bar" style={{ height: `${Math.max((item.total / max) * 100, item.total ? 5 : 0)}%` }} />
                      </div>
                      <span>{item.month}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="cf-admin-panel cf-admin-report-table-panel">
          <div className="cf-admin-panel-heading">
            <div><h3>Department Summary</h3><p>Detailed OD application status by department</p></div>
          </div>
          <div className="cf-admin-students-table-wrapper">
            <table className="cf-admin-students-table">
              <thead><tr><th>Department</th><th>Total</th><th>Pending</th><th>Approved</th><th>Rejected</th></tr></thead>
              <tbody>
                {(reportData.departmentStats || []).length === 0 ? (
                  <tr><td colSpan="5" className="cf-admin-students-empty">No records available.</td></tr>
                ) : reportData.departmentStats.map((item) => (
                  <tr key={item.department}>
                    <td><strong>{item.department}</strong></td><td>{item.total}</td><td>{item.pending}</td><td>{item.approved}</td><td>{item.rejected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    ) : (
      <div className="cf-admin-students-empty">No report data available.</div>
    )}
  </section>
)}

{activeMenu === "Settings" && (
  <section className="cf-admin-settings">
    <div className="cf-admin-settings-heading">
      <span className="cf-admin-section-label">ACCOUNT CONTROL</span>
      <h2>Admin Profile &amp; Settings</h2>
      <p>Manage your administrator details and account security.</p>
    </div>

    {profileLoading ? (
      <div className="cf-admin-settings-message">Loading profile...</div>
    ) : (
      <div className="cf-admin-settings-grid">
        <form className="cf-admin-settings-card" onSubmit={saveAdminProfile}>
          <div className="cf-admin-settings-card-title"><span>👤</span><div><h3>Profile Information</h3><p>Update your administrator identity.</p></div></div>
          <label>Full Name</label>
          <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required placeholder="Enter your name" />
          <label>Email Address</label>
          <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required placeholder="Enter your email" />
          {profileError && <div className="cf-admin-settings-error">{profileError}</div>}
          {profileMessage && <div className="cf-admin-settings-success">{profileMessage}</div>}
          <button type="submit" disabled={profileSaving}>{profileSaving ? "Saving..." : "Save Profile Changes"}</button>
        </form>

        <form className="cf-admin-settings-card" onSubmit={changeAdminPassword}>
          <div className="cf-admin-settings-card-title"><span>🔐</span><div><h3>Change Password</h3><p>Choose a strong password for your account.</p></div></div>
          <label>Current Password</label>
          <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required autoComplete="current-password" placeholder="Enter current password" />
          <label>New Password</label>
          <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} autoComplete="new-password" placeholder="Minimum 6 characters" />
          <label>Confirm New Password</label>
          <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required minLength={6} autoComplete="new-password" placeholder="Re-enter new password" />
          {passwordError && <div className="cf-admin-settings-error">{passwordError}</div>}
          {passwordMessage && <div className="cf-admin-settings-success">{passwordMessage}</div>}
          <button type="submit" disabled={passwordSaving}>{passwordSaving ? "Updating..." : "Update Password"}</button>
        </form>
      </div>
    )}
    <div className="cf-admin-settings-security"><span>🛡️</span><div><strong>Account Security</strong><p>Your password is stored securely using password hashing. Never share your administrator login details.</p></div></div>
  </section>
)}

{activeMenu !== "Dashboard" && activeMenu !== "Students" && activeMenu !== "Faculty" && activeMenu !== "Events" && activeMenu !== "OD Applications" && activeMenu !== "Reports" && activeMenu !== "Settings" && (

          <section className="cf-admin-coming-soon">

            <div>🚀</div>

            <h2>{activeMenu} Management</h2>

            <p>
              This module will be connected to the database
              in the next development stage.
            </p>

            <button onClick={() => setActiveMenu("Dashboard")}>
              ← Back to Dashboard
            </button>

          </section>

        )}

      </main>

    </div>
  );
}

export default AdminDashboard;