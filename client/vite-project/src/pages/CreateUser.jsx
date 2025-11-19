import React, { useState } from "react";
import "./CreateUser.css";

const CreateUser = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "STUDENT",
    password: "",
  });
  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // basic validation
    if (!profile.username || !profile.email || !profile.password) {
      alert("Please fill username, email and password");
      return;
    }

    const options = {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(profile),
    };

    try {
      const res = await fetch("/api", options);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Create user failed", res.status, body);
        alert("Failed to create user");
        return;
      }

      console.log("User successfully created");
      setProfile({
        username: "",
        email: "",
        role: "STUDENT",
        password: "",
      });
      alert("Account created. You may now login.");
    } catch (error) {
      console.error("Error", error);
      alert("Network error creating user");
    }
  };

  return (
    <div className="page-container">
      <div className="card create-user-card">
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
            <h2>Create an account</h2>
            <p className="muted">
              Register with your school email. Admins can create additional
              accounts from the Admin panel.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="form form-grid">
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleChange}
              placeholder="Display name"
              required
            />
          </div>

          <div className="field">
            <label>School Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="you@school.edu"
              required
            />
          </div>

          <div className="field">
            <label>Role</label>
            <select
              name="role"
              id="role"
              value={profile.role}
              onChange={handleChange}
            >
              <option value="STUDENT">STUDENT</option>
              <option value="TECHNICIAN">TECHNICIAN</option>
            </select>
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={profile.password}
              onChange={handleChange}
              placeholder="Choose a strong password"
              required
            />
          </div>

          <div className="submit-row">
            <button type="submit" className="submit-btn">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
