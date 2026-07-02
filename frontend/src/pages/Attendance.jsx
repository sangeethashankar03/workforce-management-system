import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Attendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [message, setMessage] = useState("");

  const loadRecords = async () => {
    const res = await api.get("/attendance");
    setRecords(res.data);
    setActiveSession(
      res.data.find((r) => r.status === "active" && String(r.employee?._id) === String(user.id || user._id)) || null
    );
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleClockIn = async () => {
    setMessage("");
    try {
      await api.post("/attendance/clock-in");
      loadRecords();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to clock in.");
    }
  };

  const handleClockOut = async () => {
    setMessage("");
    try {
      await api.put("/attendance/clock-out");
      loadRecords();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to clock out.");
    }
  };

  return (
    <div className="page">
      <h1>Attendance</h1>
      {message && <div className="info-message">{message}</div>}
      <div className="card-form">
        <h3>Your Clock In / Out</h3>
        {activeSession ? (
          <>
            <p>You are currently clocked in since {new Date(activeSession.clockIn).toLocaleTimeString()}.</p>
            <button className="btn btn-primary" onClick={handleClockOut}>Clock Out</button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={handleClockIn}>Clock In</button>
        )}
      </div>
      <table className="data-table">
        <thead>
          <tr>
            {(user.role === "admin" || user.role === "manager") && <th>Employee</th>}
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Hours Worked</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              {(user.role === "admin" || user.role === "manager") && <td>{r.employee?.name}</td>}
              <td>{new Date(r.clockIn).toLocaleString()}</td>
              <td>{r.clockOut ? new Date(r.clockOut).toLocaleString() : "-"}</td>
              <td>{r.hoursWorked || "-"}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}