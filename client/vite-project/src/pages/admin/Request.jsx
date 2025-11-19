import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

const AdminRequest = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [assignTo, setAssignTo] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "ADMIN") return navigate("/login");

    async function fetchData() {
      try {
        const [rRes, uRes] = await Promise.all([
          fetch(`/api/requests/${id}`, { credentials: "include" }),
          fetch(`/api/`, { credentials: "include" }),
        ]);
        if (rRes.ok) setRequest(await rRes.json());
        if (uRes.ok) {
          const users = await uRes.json();
          setTechnicians(users.filter((u) => u.role === "TECHNICIAN"));
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [id, user]);

  const assign = async () => {
    if (!assignTo) return;
    try {
      const res = await fetch(`/api/requests/${id}/assign`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to: assignTo }),
      });
      if (res.ok) setRequest(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (status) => {
    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setRequest(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  if (!request) return <div className="page-container">Loading…</div>;

  return (
    <div className="page-container">
      <h2>{request.title}</h2>
      <p>{request.description}</p>
      <p>
        <strong>Status:</strong> {request.status}
      </p>
      <p>
        <strong>Assigned To:</strong> {request.assigned_to || "Unassigned"}
      </p>

      <div>
        <select value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
          <option value="">Assign to...</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.username || t.email}
            </option>
          ))}
        </select>
        <button onClick={assign}>Assign</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => updateStatus("IN_PROGRESS")}>Start Work</button>
        <button onClick={() => updateStatus("RESOLVED")}>Resolve</button>
      </div>
    </div>
  );
};

export default AdminRequest;
