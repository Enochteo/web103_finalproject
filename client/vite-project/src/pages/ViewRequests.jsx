import { React, useState, useEffect } from "react";
import "./ViewRequest.css";

const ViewRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const getAllRequests = async () => {
      try {
        const res = await fetch("/api/requests", { credentials: "include" });
        const body = await res.json().catch(() => ({}));
        // server may return { data: [...], meta: {...} } or an array
        if (body && Array.isArray(body)) {
          setRequests(body);
        } else if (body && Array.isArray(body.data)) {
          setRequests(body.data);
        } else {
          setRequests([]);
        }
      } catch (error) {
        console.log("Error getting Requests", error);
        setRequests([]);
      }
    };
    getAllRequests();
  }, []);
  const handleDelete = async (id) => {
    try {
      const options = {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      };
      const res = await fetch(`/api/requests/${id}`, options);
      if (res.ok) setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting request", error);
    }
  };
  return (
    <div className="page-container">
      <div className="list">
        {requests &&
          requests.map((request) => (
            <div key={request.id} className="card request-card">
              <div>
                <h3>{request.title}</h3>
                <p className="muted">Made by: User {request.user_id}</p>
                <p>{request.description}</p>
                <div className="meta">
                  <span
                    className={`badge status-${(
                      request.status || ""
                    ).toLowerCase()}`}
                  >
                    {request.status}
                  </span>
                  <span className="muted">Category: {request.category_id}</span>
                  <span className="muted">Urgency: {request.urgency}</span>
                </div>
                <div style={{ marginTop: 8 }} className="tech-actions">
                  <button
                    className="btn ghost"
                    onClick={() => handleDelete(request.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {request.photo_url && (
                <img src={request.photo_url} alt="Request photo" />
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ViewRequests;
