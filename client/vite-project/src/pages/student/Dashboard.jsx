import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "STUDENT") return navigate("/login");

    async function fetchMine() {
      setLoading(true);
      try {
        const res = await fetch(`/api/requests?user_id=${user.id}`, {
          credentials: "include",
        });
        const body = await res.json().catch(() => ({}));
        if (Array.isArray(body)) setRequests(body);
        else if (body && Array.isArray(body.data)) setRequests(body.data);
        else setRequests([]);
      } catch (err) {
        console.error(err);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMine();
  }, [user]);

  if (loading) return <div className="page-container">Loading…</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>My Requests</h2>
      </div>
      {requests.length === 0 && (
        <div className="card">You have not submitted any requests yet.</div>
      )}

      <div className="list">
        {requests.map((r) => (
          <div key={r.id} className="card request-card">
            <div>
              <h3>{r.title}</h3>
              <p className="muted">
                Status:{" "}
                <span
                  className={`badge status-${(r.status || "").toLowerCase()}`}
                >
                  {r.status}
                </span>
              </p>
              <p>{r.description}</p>
              <p className="muted">Location: {r.location}</p>
              <p className="muted">Urgency: {r.urgency}</p>
            </div>
            {r.photo_url && <img src={r.photo_url} alt="request" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
