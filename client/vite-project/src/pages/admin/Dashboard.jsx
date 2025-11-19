import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "ADMIN") return navigate("/login");

    async function fetchAll() {
      try {
        const res = await fetch("/api/requests", { credentials: "include" });
        if (!res.ok) return;
        const body = await res.json();
        // Server may return either an array or a paginated object { data, meta }
        const rows = Array.isArray(body) ? body : body?.data ?? [];
        setRequests(rows);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAll();
  }, [user]);

  return (
    <div className="page-container">
      <h2>Admin Dashboard</h2>
      <Link to="/admin/categories">
        <button>Manage Categories</button>
      </Link>
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
