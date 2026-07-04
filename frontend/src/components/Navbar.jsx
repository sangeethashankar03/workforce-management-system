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
        {(user.role === "store_manager" || user.role === "training_manager") && (
          <Link to="/employees">Staff</Link>
        )}
        <Link to="/shifts">Shifts</Link>
        <Link to="/attendance">Attendance</Link>
        <Link to="/leaves">Leave Requests</Link>
        {user.role === "store_manager" && (
            <Link to="/holidays">Bank Holidays</Link>)}
        <span className="navbar-user">
          {user.name} ({
          user.role === "store_manager" ? "Store Manager" :
          user.role === "training_manager" ? "Training Manager" :
          user.level === "Level 2" ? "Crew - Level 2" : "Crew - Level 1" 
          })
        </span>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>
    </nav>
  );
}