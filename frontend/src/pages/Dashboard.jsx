import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    todayAttendance: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    activeShifts: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (user.role === "store_manager") {
          const [employeesRes, leavesRes, shiftsRes, attendanceRes] =
            await Promise.all([
              api.get("/employees").catch(() => ({ data: [] })),
              api.get("/leaves").catch(() => ({ data: [] })),
              api.get("/shifts").catch(() => ({ data: [] })),
              api.get("/attendance").catch(() => ({ data: [] })),
            ]);


          setStats({
            employees: employeesRes.data.length,
            todayAttendance: attendanceRes.data.filter((a) => a.status === "active").length,
            pendingLeaves: leavesRes.data.filter((l) => l.status === "pending").length,
            approvedLeaves: leavesRes.data.filter((l) => l.status === "approved").length,
            rejectedLeaves: leavesRes.data.filter((l) => l.status === "rejected").length,
            activeShifts: shiftsRes.data.length,
          });
        } else if (user.role=="training_manager") {
            const attendanceRes = await api.get("/attendance").catch(() => ({ data: [] }));
            setStats((s) => ({
            ...s,
            todayAttendance: attendanceRes.data.filter((a) => a.status === "active").length,
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
      <p className="subtitle">
      {user.role === "store_manager" ? "Store Manager" :
      user.role === "training_manager" ? "Training Manager" :
      user.level === "Level 2" ? "Crew Member - Level 2" : "Crew Member - Level 1"}
      </p>

      {user.role === "store_manager" && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.employees}</h3>
            <p>Total Crew</p>
        </div>

        <div className="stat-card">
            <h3>{stats.activeShifts}</h3>
            <p>Scheduled Shifts This Week</p>
        </div>

          <div className="stat-card">
            <h3>{stats.todayAttendance}</h3>
            <p>Currently Clocked In</p>
          </div>
        </div>
      )}

      {user.role === "training_manager" && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.todayAttendance}</h3>
            <p>Crew Currently Clocked In Today</p>
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