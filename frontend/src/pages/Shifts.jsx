import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Shifts() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [weekForms, setWeekForms] = useState({});
  const [message, setMessage] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const canManage = user.role === "store_manager";

  const getWeekDates = (weekStart) => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });
  };

  const getWeekNumber = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
  };

  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const loadShifts = async () => {
    const res = await api.get("/shifts");
    setShifts(res.data);
  };

  useEffect(() => {
    loadShifts();
    api.get("/employees").then((res) => setEmployees(res.data));
  }, []);

  const handleWeekFormChange = (employeeId, dayIndex, field, value) => {
    setWeekForms((prev) => ({
      ...prev,
      [`${employeeId}-${dayIndex}`]: {
        ...prev[`${employeeId}-${dayIndex}`],
        [field]: value,
      },
    }));
  };

  const handleSaveRota = async () => {
    setMessage("");
    try {
      const weekDates = getWeekDates(currentWeekStart);
      const promises = [];
      Object.entries(weekForms).forEach(([key, val]) => {
        if (val.startTime && val.endTime) {
          const parts = key.split("-");
          const dayIndex = parseInt(parts[parts.length - 1]);
          const employeeId = parts.slice(0, -1).join("-");
          const date = weekDates[dayIndex];
          promises.push(
            api.post("/shifts", {
              employee: employeeId,
              date: date.toISOString(),
              startTime: val.startTime,
              endTime: val.endTime,
            })
          );
        }
      });
      await Promise.all(promises);
      setWeekForms({});
      loadShifts();
      setMessage("Rota saved successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save rota.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this shift?")) return;
    await api.delete(`/shifts/${id}`);
    loadShifts();
  };

  return (
    <div className="page">
      <h1>Shift Schedule</h1>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
        <button className="btn btn-secondary" onClick={prevWeek}>← Prev</button>
        <h3 style={{ margin: 0 }}>
          {currentWeekStart.toLocaleString("default", { month: "long", year: "numeric" })} — Week {getWeekNumber(currentWeekStart)}
        </h3>
        <button className="btn btn-secondary" onClick={nextWeek}>Next →</button>
      </div>

      {message && <div className="info-message">{message}</div>}

      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Crew Member</th>
              {getWeekDates(currentWeekStart).map((date, i) => (
                <th key={i}>
                  {date.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}
                </th>
              ))}
              <th>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const weekDates = getWeekDates(currentWeekStart);
              let totalMinutes = 0;
              return (
                <tr key={emp._id} style={String(emp._id) === String(user.id || user._id) ? { backgroundColor: "#ede9fe" } : {}}>
                  <td>
                    <strong>{emp.name}</strong><br />
                    <small>{emp.role === "training_manager" ? "Training Manager" : `Crew - ${emp.level}`}</small>
                  </td>
                  {weekDates.map((date, dayIndex) => {
                    const existingShift = shifts.find((s) =>
                      String(s.employee?._id) === String(emp._id) &&
                      new Date(s.date).toDateString() === date.toDateString()
                    );
                    if (existingShift) {
                      const [sh, sm] = existingShift.startTime.split(":").map(Number);
                      const [eh, em] = existingShift.endTime.split(":").map(Number);
                      totalMinutes += (eh * 60 + em) - (sh * 60 + sm);
                    }
                    const formKey = `${emp._id}-${dayIndex}`;
                    const formVal = weekForms[formKey] || {};
                    return (
                      <td key={dayIndex} style={{ minWidth: "120px" }}>
                        {existingShift ? (
                          <div>
                            <div>{existingShift.startTime} - {existingShift.endTime}</div>
                            {canManage && (
                              <button className="btn btn-small btn-danger" onClick={() => handleDelete(existingShift._id)}>Remove</button>
                            )}
                          </div>
                        ) : canManage ? (
                          <div>
                            <input type="time" value={formVal.startTime || ""} onChange={(e) => handleWeekFormChange(emp._id, dayIndex, "startTime", e.target.value)} style={{ width: "100%", marginBottom: "4px" }} />
                            <input type="time" value={formVal.endTime || ""} onChange={(e) => handleWeekFormChange(emp._id, dayIndex, "endTime", e.target.value)} style={{ width: "100%" }} />
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>OFF</span>
                        )}
                      </td>
                    );
                  })}
                  <td><strong>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</strong></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {canManage && (
        <div style={{ marginTop: "16px" }}>
          <button className="btn btn-primary" onClick={handleSaveRota}>Save Rota</button>
        </div>
      )}
    </div>
  );
}