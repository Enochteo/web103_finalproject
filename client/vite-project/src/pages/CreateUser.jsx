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
        <form onSubmit={handleSubmit} className="form">
          <label> Username </label>
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            placeholder="Display name"
          />

          <label> School Email (.edu) </label>
          <input
            type="text"
            name="email"
            value={profile.email}
            onChange={handleChange}
          />

          <label> Role </label>
          <select
            name="role"
            id="role"
            value={profile.role}
            onChange={handleChange}
          >
            <option value="STUDENT">STUDENT</option>
            <option value="TECHNICIAN">TECHNICIAN</option>
          </select>

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={profile.password}
            onChange={handleChange}
            placeholder="Choose a strong password"
          />

          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
