import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginUser.css";
import { useAuth } from "../auth/AuthProvider";

const LoginUser = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [credential, setCredential] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredential((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!credential.email || !credential.password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credential),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.message || "Invalid credentials";
        setError(msg);
        console.error("Login failed", res.status, body);
        setLoading(false);
        return;
      }

      const body = await res.json().catch(() => ({}));
      // login successful — set auth context, reset form and route
      console.log(body.user);
      if (body.user) setUser(body.user);
      setCredential({ email: "", password: "" });
      setLoading(false);
      navigate("/requests");
    } catch (err) {
      console.error("Network/login error", err);
      setError("Network error during login");
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card login-card">
        <form onSubmit={handleSubmit} className="form">
          <label>Email</label>
          <input
            type="text"
            name="email"
            value={credential.email}
            onChange={handleChange}
            placeholder="School Email (.edu)"
            disabled={loading}
          />

          <label> Password </label>
          <input
            type="password"
            name="password"
            value={credential.password}
            onChange={handleChange}
            placeholder="Password"
            disabled={loading}
          />

          {error && <div className="error-msg">{error}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !credential.email || !credential.password}
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginUser;
