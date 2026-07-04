import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Attendance() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [message, setMessage] = useState("");

  const loadRecords = async () => {
    const res = await api.get("/attendance");
    setRecords(res.data);
  };

  useEffect(() => {
    loadRecords();
     if (user.role === "store_manager" || user.role === "training_manager") {
    api.get("/employees").then((res) => setEmployees(res.data));
     }
  }, []);

  const handleClockIn = async () => {
    setMessage("");
    if (!selectedEmployee) return setMessage("Please select a crew member.");
    try {
      await api.post("/attendance/clock-in", { employeeId: selectedEmployee });
      setSelectedEmployee("");
      loadRecords();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to clock in.");
    }
  };

  const handleClockOut = async () => {
    setMessage("");
    if (!selectedEmployee) return setMessage("Please select a crew member.");
    try {
      await api.put("/attendance/clock-out", { employeeId: selectedEmployee });
      setSelectedEmployee("");
      loadRecords();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to clock out.");
    }
  };

  return (
    <div className="page">
      <h1>Attendance</h1>
      {message && <div className="info-message">{message}</div>}
      {(user.role === "store_manager" || user.role === "training_manager") && (
  <div className="card-form">
    <h3>Clock In / Out Crew Member</h3>
    {message && <div className="info-message">{message}</div>}
    <div className="form-row">
      <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
        <option value="">Select Crew Member</option>
        {employees.filter(e => e.role === "crew").map((emp) => (
          <option key={emp._id} value={emp._id}>{emp.name} ({emp.level})</option>
        ))}
      </select>
    </div>
    <div className="form-actions">
      <button className="btn btn-primary" onClick={handleClockIn}>Clock In</button>
      <button className="btn btn-secondary" onClick={handleClockOut}>Clock Out</button>
    </div>
  </div>
)}

      <table className="data-table">
        <thead>
          <tr>
            {(user.role === "store_manager" || user.role === "training_manager") && <th>Employee</th>}
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Hours Worked</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              {(user.role === "store_manager" || user.role === "training_manager") && <td>{r.employee?.name}</td>}
              <td>{new Date(r.clockIn).toLocaleString()}</td>
              <td>{r.clockOut ? new Date(r.clockOut).toLocaleString() : "-"}</td>
              <td>{r.hoursWorked ? (() => {
                const totalSeconds = Math.round(r.hoursWorked * 3600);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                return `${hours}h ${minutes}m ${seconds}s`;
                })() : "-"}
            </td>
            <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}