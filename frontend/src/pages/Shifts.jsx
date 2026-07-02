import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Shifts() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employee: "", date: "", startTime: "", endTime: "", notes: "" });
  const [message, setMessage] = useState("");
  const canManage = user.role === "admin" || user.role === "manager";

  const loadShifts = async () => {
    const res = await api.get("/shifts");
    setShifts(res.data);
  };

  useEffect(() => {
    loadShifts();
    if (canManage) {
      api.get("/employees").then((res) => setEmployees(res.data));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/shifts", form);
      setForm({ employee: "", date: "", startTime: "", endTime: "", notes: "" });
      loadShifts();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create shift.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this shift?")) return;
    await api.delete(`/shifts/${id}`);
    loadShifts();
  };

  return (
    <div className="page">
      <h1>Shift Schedule</h1>
      {canManage && (
        <form className="card-form" onSubmit={handleSubmit}>
          <h3>Assign New Shift</h3>
          {message && <div className="info-message">{message}</div>}
          <div className="form-row">
            <select value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} required>
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="form-row">
            <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
            <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
          </div>
          <input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Assign Shift</button>
          </div>
        </form>
      )}
      <table className="data-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            <th>Notes</th>
            {canManage && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {shifts.map((s) => (
            <tr key={s._id}>
              <td>{s.employee?.name}</td>
              <td>{new Date(s.date).toLocaleDateString()}</td>
              <td>{s.startTime}</td>
              <td>{s.endTime}</td>
              <td>{s.notes || "-"}</td>
              {canManage && (
                <td>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(s._id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}