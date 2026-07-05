import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Leaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ startDate: "", endDate: "", leaveType: "", reason: "" });
  const [message, setMessage] = useState("");
  const canReview = user.role === "store_manager";

  const loadLeaves = async () => {
    const res = await api.get("/leaves");
    setLeaves(res.data);
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/leaves", form);
      setForm({ startDate: "", endDate: "", leaveType: "", reason: "" });
      loadLeaves();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit leave request.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleReview = async (id, status) => {
    await api.put(`/leaves/${id}/review`, { status });
    loadLeaves();
  };

  return (
    <div className="page">
      <h1>Leave Requests</h1>
      {!canReview && (
        <form className="card-form" onSubmit={handleSubmit}>
          <h3>Request Leave</h3>
          {message && <div className="info-message">{message}</div>}
          <div className="form-row">
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
          </div>
          <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })} required>
            <option value="">Select Leave Type</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Annual Leave">Annual Leave</option>
            <option value="Emergency Leave">Emergency Leave</option>
          </select>
          <input placeholder="Reason for leave" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Submit Request</button>
          </div>
        </form>
      )}
      <table className="data-table">
        <thead>
          <tr>
            {canReview && <th>Employee</th>}
            <th>Start Date</th>
            <th>End Date</th>
            <th>Leave Type</th>
            <th>Reason</th>
            <th>Status</th>
            {canReview && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {leaves.map((l) => (
            <tr key={l._id}>
              {canReview && <td>{l.employee?.name}</td>}
              <td>{new Date(l.startDate).toLocaleDateString()}</td>
              <td>{new Date(l.endDate).toLocaleDateString()}</td>
              <td>{l.leaveType}</td>
              <td>{l.reason}</td>
              <td>{l.status}</td>
              {canReview && (
                <td>
                  {l.status === "pending" ? (
                    <>
                      <button className="btn btn-small" onClick={() => handleReview(l._id, "approved")}>Approve</button>
                      <button className="btn btn-small btn-danger" onClick={() => handleReview(l._id, "rejected")}>Reject</button>
                    </>
                  ) : "-"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}