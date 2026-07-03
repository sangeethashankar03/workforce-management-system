import { useState } from "react";
import api from "../api/axios";

export default function Holidays() {
  const [countryCode, setCountryCode] = useState("IE");
  const [year, setYear] = useState("2026");
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchHolidays = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await api.get(`/holidays/${countryCode}/${year}`);
      setHolidays(res.data);
    } catch (err) {
      setMessage("Failed to fetch holidays. Check the country code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Public Holidays</h1>
      <p className="subtitle">Fetched from the Nager.Date external API (https://date.nager.at)</p>
      <form className="card-form" onSubmit={fetchHolidays}>
        <h3>Search Public Holidays</h3>
        {message && <div className="info-message">{message}</div>}
        <div className="form-row">
          <input placeholder="Country Code (e.g. IE, GB, US)" value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase())} required />
          <input placeholder="Year (e.g. 2026)" value={year} onChange={(e) => setYear(e.target.value)} required />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Fetching..." : "Get Holidays"}</button>
        </div>
      </form>
      {holidays.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Local Name</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((h) => (
              <tr key={h.date}>
                <td>{h.date}</td>
                <td>{h.name}</td>
                <td>{h.localName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}