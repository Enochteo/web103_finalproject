import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [resolutions, setResolutions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "TECHNICIAN") return navigate("/login");

    async function fetchAssigned() {
      setLoading(true);
      try {
        const res = await fetch("/api/technician/requests", {
          credentials: "include",
        });
        if (!res.ok) {
          setRequests([]);
          setLoading(false);
          return;
        }
        const body = await res.json();
        const rows = Array.isArray(body) ? body : body?.data ?? [];
        setRequests(rows);
        // fetch resolutions for these request ids
        const ids = rows.map((r) => r.id).filter(Boolean);
        if (ids.length > 0) {
          try {
            const rr = await fetch(
              `/api/resolutions?request_ids=${ids.join(",")}`,
              {
                credentials: "include",
              }
            );
            if (rr.ok) {
              const resBody = await rr.json();
              // map by request_id
              const map = {};
              (resBody || []).forEach((row) => {
                if (row && row.request_id) map[row.request_id] = row;
              });
              setResolutions(map);
            }
          } catch (err) {
            console.error("Failed to load resolutions", err);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssigned();
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        console.error("Failed to update status", await res.text());
        return;
      }
      const updated = await res.json();
      setRequests((r) => r.map((it) => (it.id === updated.id ? updated : it)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="page-container">Loading…</div>;

  return (
    <div className="page-container">
      <h2>Technician Dashboard</h2>
      {requests.length === 0 && <div>No assigned requests.</div>}
      <div className="list">
        {requests.map((r) => (
          <div key={r.id} className="card request-card">
            <h3>{r.title}</h3>
            <p>{r.description}</p>
            {r.photo_url && (
              <img src={r.photo_url} alt="request" style={{ maxWidth: 200 }} />
            )}
            {resolutions[r.id] && resolutions[r.id].technician_photo_url && (
              <div>
                <strong>Resolution:</strong>
                <br />
                <img
                  src={resolutions[r.id].technician_photo_url}
                  alt="resolution"
                  style={{ maxWidth: 200, marginTop: 8 }}
                />
              </div>
            )}
            <p>
              <strong>Category:</strong> {r.category_id}
            </p>
            <p>
              <strong>Urgency:</strong> {r.urgency}
            </p>
            <p>
              <strong>Status:</strong> {r.status}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {r.status !== "IN_PROGRESS" && (
                <button onClick={() => updateStatus(r.id, "IN_PROGRESS")}>
                  Start Work
                </button>
              )}
              {r.status !== "RESOLVED" && (
                <button onClick={() => updateStatus(r.id, "RESOLVED")}>
                  Resolve
                </button>
              )}
              <Link to={`/technician/request/${r.id}`}>
                <button>Details</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicianDashboard;
