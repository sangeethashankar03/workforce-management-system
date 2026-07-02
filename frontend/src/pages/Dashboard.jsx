import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    activeShifts: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (user.role === "admin" || user.role === "manager") {
          const [employeesRes, departmentsRes, leavesRes, shiftsRes] =
            await Promise.all([
              api.get("/employees").catch(() => ({ data: [] })),
              api.get("/departments").catch(() => ({ data: [] })),
              api.get("/leaves").catch(() => ({ data: [] })),
              api.get("/shifts").catch(() => ({ data: [] })),
            ]);

          setStats({
            employees: employeesRes.data.length,
            departments: departmentsRes.data.length,
            pendingLeaves: leavesRes.data.filter((l) => l.status === "pending").length,
            approvedLeaves: leavesRes.data.filter((l) => l.status === "approved").length,
            rejectedLeaves: leavesRes.data.filter((l) => l.status === "rejected").length,
            activeShifts: shiftsRes.data.length,
          });
        } else {
          const leavesRes = await api.get("/leaves").catch(() => ({ data: [] }));
          setStats((s) => ({
            ...s,
            pendingLeaves: leavesRes.data.filter((l) => l.status === "pending").length,
            approvedLeaves: leavesRes.data.filter((l) => l.status === "approved").length,
            rejectedLeaves: leavesRes.data.filter((l) => l.status === "rejected").length,
          }));
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    };
    loadStats();
  }, [user]);

  return (
    <div className="page">
      <h1>Welcome, {user.name}</h1>
      <p className="subtitle">Role: {user.role}</p>

      {(user.role === "admin" || user.role === "manager") && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.employees}</h3>
            <p>Total Employees</p>
          </div>
          <div className="stat-card">
            <h3>{stats.departments}</h3>
            <p>Departments</p>
          </div>
          <div className="stat-card">
            <h3>{stats.activeShifts}</h3>
            <p>Scheduled Shifts</p>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.pendingLeaves}</h3>
          <p>Pending Leave Requests</p>
        </div>
        <div className="stat-card">
          <h3>{stats.approvedLeaves}</h3>
          <p>Approved Leave Requests</p>
        </div>
        <div className="stat-card">
          <h3>{stats.rejectedLeaves}</h3>
          <p>Rejected Leave Requests</p>
        </div>
      </div>
    </div>
  );
}