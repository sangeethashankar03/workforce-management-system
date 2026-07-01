import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">Workforce Management System</div>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        {(user.role === "admin" || user.role === "manager") && (
          <Link to="/employees">Employees</Link>
        )}
        {user.role === "admin" && (
          <Link to="/departments">Departments</Link>
        )}
        <Link to="/shifts">Shifts</Link>
        <Link to="/attendance">Attendance</Link>
        <Link to="/leaves">Leave Requests</Link>
        <span className="navbar-user">
          {user.name} ({user.role})
        </span>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>
    </nav>
  );
}