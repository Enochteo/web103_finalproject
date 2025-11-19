import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import "../CreateUser.css";

const AdminCreateUser = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "TECHNICIAN",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!user) return navigate("/login");
    if ((user.role || "").toString().toUpperCase() !== "ADMIN")
      return navigate("/login");
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({
          type: "error",
          text: body.error || "Failed to create user",
        });
        setLoading(false);
        return;
      }
      setMessage({
        type: "success",
        text: `Created ${body.email || body.username}`,
      });
      setForm({ username: "", email: "", role: "TECHNICIAN", password: "" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card form-card">
        <header className="create-header">
          <div className="brand-icon" aria-hidden>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="24" height="24" rx="6" fill="var(--brand)" />
              <path
                d="M7 12h10M7 8h10M7 16h6"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h2>Create User (Admin)</h2>
            <p className="muted">
              Create technician or admin accounts from here.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="form form-grid">
          <div className="field">
            <label>Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="TECHNICIAN">TECHNICIAN</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="submit-row">
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create"}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => navigate("/admin/dashboard")}
            >
              Cancel
            </button>
          </div>

          {message && (
            <div
              style={{
                marginTop: 12,
                color: message.type === "error" ? "#b91c1c" : "#059669",
              }}
            >
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminCreateUser;
