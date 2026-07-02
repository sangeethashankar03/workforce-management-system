import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "employee",
  department: "",
  position: "",
  phone: "",
};

export default function Employees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const [empRes, deptRes] = await Promise.all([
      api.get("/employees"),
      api.get("/departments"),
    ]);
    setEmployees(empRes.data);
    setDepartments(deptRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editingId) {
        const { password, ...updateData } = form;
        await api.put(`/employees/${editingId}`, updateData);
        setMessage("Employee updated successfully.");
      } else {
        await api.post("/employees", form);
        setMessage("Employee created successfully.");
      }
      resetForm();
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Operation failed.");
    }
  };

  const handleEdit = (emp) => {
    setForm({
      name: emp.name,
      email: emp.email,
      password: "",
      role: emp.role,
      department: emp.department?._id || "",
      position: emp.position || "",
      phone: emp.phone || "",
    });
    setEditingId(emp._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    await api.delete(`/employees/${id}`);
    loadData();
  };

  return (
    <div className="page">
      <h1>Employee Management</h1>

      {user.role === "admin" && (
        <form className="card-form" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit Employee" : "Add New Employee"}</h3>
          {message && <div className="info-message">{message}</div>}
          <div className="form-row">
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            {!editingId && (
              <input
                name="password"
                type="password"
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            )}
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-row">
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
            >
              <option value="">No Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            <input
              name="position"
              placeholder="Position / Title"
              value={form.position}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update Employee" : "Add Employee"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Position</th>
            <th>Status</th>
            {user.role === "admin" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.role}</td>
              <td>{emp.department?.name || "-"}</td>
              <td>{emp.position || "-"}</td>
              <td>{emp.isActive ? "Active" : "Inactive"}</td>
              {user.role === "admin" && (
                <td>
                  <button
                    className="btn btn-small"
                    onClick={() => handleEdit(emp)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(emp._id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}