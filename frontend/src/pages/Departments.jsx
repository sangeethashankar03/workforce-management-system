import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadDepartments = async () => {
    const res = await api.get("/departments");
    setDepartments(res.data);
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, form);
      } else {
        await api.post("/departments", form);
      }
      setForm({ name: "", description: "" });
      setEditingId(null);
      loadDepartments();
    } catch (err) {
      setMessage(err.response?.data?.message || "Operation failed.");
    }
  };

  const handleEdit = (dept) => {
    setForm({ name: dept.name, description: dept.description || "" });
    setEditingId(dept._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    await api.delete(`/departments/${id}`);
    loadDepartments();
  };

  return (
    <div className="page">
      <h1>Department Management</h1>

      <form className="card-form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Department" : "Add New Department"}</h3>
        {message && <div className="info-message">{message}</div>}
        <div className="form-row">
          <input
            placeholder="Department Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setForm({ name: "", description: "" });
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((d) => (
            <tr key={d._id}>
              <td>{d.name}</td>
              <td>{d.description || "-"}</td>
              <td>
                <button
                  className="btn btn-small"
                  onClick={() => handleEdit(d)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => handleDelete(d._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}