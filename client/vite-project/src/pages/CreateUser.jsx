import { React, useState } from "react";

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
    console.log(profile);

    const options = {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(profile),
    };
    try {
      const res = await fetch("http://localhost:3000/api", options);
      console.log("User successfully created");
      setProfile({
        username: "",
        email: "",
        role: "",
        password: "",
      });
    } catch (error) {
      console.error("Error", error);
    }
  };

  return (
    <>
      <div>
        <form>
          <label> Username </label>
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
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
            <option value="STUDNET">STUDENT</option>
            <option value="TECHNICIAN">TECHNICIAN</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <label>Password</label>
          <input
            type="text"
            name="password"
            value={profile.password}
            onChange={handleChange}
          />

          <button onClick={handleSubmit}>Register</button>
        </form>
      </div>
    </>
  );
};

export default CreateUser;
