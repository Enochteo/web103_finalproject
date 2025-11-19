import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [queryText, setQueryText] = useState("");
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "ADMIN") return navigate("/login");

    async function fetchAll() {
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (sortBy) params.set("sort_by", sortBy);
        if (sortDir) params.set("sort_dir", sortDir);
        if (queryText) params.set("q", queryText);
        const url = `/api/requests?${params.toString()}`;
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) return;
        const body = await res.json();
        // Server may return either an array or a paginated object { data, meta }
        const rows = Array.isArray(body) ? body : body?.data ?? [];
        setRequests(rows);
        setMeta(body?.meta ?? null);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAll();
  }, [user]);

  // refetch when filters change
  useEffect(() => {
    if (!user) return;
    // trigger fetch by calling the effect above via user dependency hack: call fetch directly
    async function refetch() {
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (sortBy) params.set("sort_by", sortBy);
        if (sortDir) params.set("sort_dir", sortDir);
        if (queryText) params.set("q", queryText);
        const url = `/api/requests?${params.toString()}`;
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) return;
        const body = await res.json();
        const rows = Array.isArray(body) ? body : body?.data ?? [];
        setRequests(rows);
        setMeta(body?.meta ?? null);
      } catch (err) {
        console.error(err);
      }
    }
    refetch();
  }, [statusFilter, sortBy, sortDir, queryText]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <div className="muted">Manage and review requests</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link to="/admin/categories">
            <button className="btn">Manage Categories</button>
          </Link>
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

      {meta && (
        <div className="muted">
          Total: {meta.total} — Page {meta.page} / {meta.totalPages}
        </div>
      )}

      <div className="list">
        {requests.map((r) => (
          <div key={r.id} className="card request-card">
            <h3>{r.title}</h3>
            <p>{r.description}</p>
            <p>
              <strong>Assigned To:</strong> {r.assigned_to || "Unassigned"}
            </p>
            <p>
              <strong>Status:</strong> {r.status}
            </p>
            <Link to={`/admin/request/${r.id}`}>
              <button>Details</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
