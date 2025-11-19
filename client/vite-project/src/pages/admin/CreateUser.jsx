import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

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
    if (user.role !== "ADMIN") return navigate("/login");
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
        <h2>Create User (Admin)</h2>
        <form onSubmit={handleSubmit} className="form">
          <label>Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="TECHNICIAN">TECHNICIAN</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
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
