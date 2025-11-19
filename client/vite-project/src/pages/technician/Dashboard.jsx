import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { getUsersMap } from "../../services/userService";

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [resolutions, setResolutions] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [queryText, setQueryText] = useState("");
  const [meta, setMeta] = useState(null);
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    if (!user) return navigate("/login");
    if ((user.role || "").toString().toUpperCase() !== "TECHNICIAN")
      return navigate("/login");

    async function fetchAssigned() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (sortBy) params.set("sort_by", sortBy);
        if (sortDir) params.set("sort_dir", sortDir);
        if (queryText) params.set("q", queryText);
        const url = `/api/technician/requests?${params.toString()}`;
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          setRequests([]);
          setLoading(false);
          return;
        }
        const body = await res.json();
        const rows = Array.isArray(body) ? body : body?.data ?? [];
        setMeta(body?.meta ?? null);
        setRequests(rows);
        // get users map so we can show names instead of ids
        try {
          const map = await getUsersMap();
          setUsersMap(map);
        } catch (err) {
          console.error("Failed to load users map", err);
        }
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

  // refetch when filters change
  useEffect(() => {
    if (!user) return;
    // simple refetch
    async function refetch() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (sortBy) params.set("sort_by", sortBy);
        if (sortDir) params.set("sort_dir", sortDir);
        if (queryText) params.set("q", queryText);
        const url = `/api/technician/requests?${params.toString()}`;
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          setRequests([]);
          setLoading(false);
          return;
        }
        const body = await res.json();
        const rows = Array.isArray(body) ? body : body?.data ?? [];
        setMeta(body?.meta ?? null);
        setRequests(rows);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    refetch();
  }, [statusFilter, sortBy, sortDir, queryText]);

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
      <div className="page-header">
        <div>
          <h2>Technician Dashboard</h2>
          <div className="muted">Requests assigned to you</div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All status</option>
          <option value="PENDING">PENDING</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="created_at">Newest</option>
          <option value="urgency">Urgency</option>
          <option value="status">Status</option>
        </select>
        <select value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <input
          placeholder="Search title or description"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
        />
      </div>

      {requests.length === 0 && <div>No assigned requests.</div>}

      <div className="list">
        {requests.map((r) => (
          <div key={r.id} className="card request-card">
            <h3>{r.title}</h3>
            <p>{r.description}</p>
            {r.photo_url && (
              <img
                src={r.photo_url}
                alt="request"
                className="media-img"
                style={{ maxWidth: 200 }}
              />
            )}
            {resolutions[r.id] && resolutions[r.id].technician_photo_url && (
              <div>
                <strong>Resolution:</strong>
                <br />
                <img
                  src={resolutions[r.id].technician_photo_url}
                  alt="resolution"
                  className="media-img"
                  style={{ maxWidth: 200, marginTop: 8 }}
                />
              </div>
            )}
            <p>
              <strong>Submitted By:</strong>{" "}
              {r.user_id
                ? usersMap[r.user_id] || `User ${r.user_id}`
                : "Unknown"}
            </p>
            <p>
              <strong>Category:</strong> {r.category_id}
            </p>
            <p>
              <strong>Assigned To:</strong>{" "}
              {r.assigned_to
                ? usersMap[r.assigned_to] || r.assigned_to
                : "Unassigned"}
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
