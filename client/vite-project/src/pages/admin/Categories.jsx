import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const AdminCategories = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "ADMIN") return navigate("/login");
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories", { credentials: "include" });
    if (!res.ok) return;
    setCategories(await res.json());
  };

  const create = async () => {
    if (!name) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setName("");
      fetchCategories();
    }
  };

  const remove = async (id) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) fetchCategories();
  };

  return (
    <div className="page-container">
      <h2>Categories</h2>
      <div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
        />
        <button onClick={create}>Create</button>
      </div>
      <ul>
        {categories.map((c) => (
          <li key={c.id}>
            {c.name} <button onClick={() => remove(c.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminCategories;
