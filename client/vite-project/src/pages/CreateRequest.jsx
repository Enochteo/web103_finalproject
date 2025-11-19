import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";
import "./CreateRequest.css";

export default function CreateRequest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/categories", { credentials: "include" });
        const data = await res.json();
        setCategories(data || []);
        const meRes = await fetch("/api/me", {
          credentials: "include",
        });
        const meBody = await meRes.json().catch(() => ({}));
        setUser(meBody.user || null);
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  function handleImageChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const MAX = 5 * 1024 * 1024; // 5MB
    if (f.size > MAX) {
      setError("Selected image is too large (max 5 MB)");
      setImageFile(null);
      setImagePreview("");
      return;
    }
    setError("");
    setImageFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(f);
  }

  function formatBytes(bytes) {
    if (!bytes) return "";
    const thresh = 1024;
    if (Math.abs(bytes) < thresh) return bytes + " B";
    const units = ["KB", "MB", "GB", "TB"];
    let u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + " " + units[u];
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !description || !location || !category) {
      setError("Please fill required fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    let photo_url = null;
    if (imageFile) {
      const fileName = `${Date.now()}_${imageFile.name}`;
      const { error } = await supabase.storage
        .from("service-link-images/request_images")
        .upload(fileName, imageFile);
      if (error) {
        console.error(error);
        setError("Image upload failed");
        setLoading(false);
        return;
      }
      photo_url = `${
        import.meta.env.VITE_SUPABASE_URL
      }/storage/v1/object/public/service-link-images/request_images/${fileName}`;
    }

    const payload = {
      title,
      description,
      location,
      urgency: urgency.toUpperCase(),
      category_id: category,
      user_id: user?.id || null,
      photo_url,
    };
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      setSuccess("Request submitted");
      setTitle("");
      setDescription("");
      setLocation("");
      setCategory("");
      setUrgency("medium");
      setImageFile(null);
      setImagePreview("");
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to submit request");
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="card create-request-card">
        <div className="request-header">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
            className="back-btn"
          >
            ← Go back
          </a>
          <div className="hero-box">
            <div className="logo-box">LOGO</div>
            <div>
              <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                Campus Maintenance System
              </div>
              <h3 className="hero-title">Make a request to your IT admin</h3>
            </div>
          </div>
        </div>

        <h2 style={{ marginTop: 0 }}>Submit a maintenance Request</h2>

        <form onSubmit={handleSubmit} className="form">
          <div className="field-row">
            <label htmlFor="title">
              Title<span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="title"
              name="title"
              className="title-input"
              placeholder="Brief summary of the issue (e.g. Leaking ceiling in Room 214)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="field-row">
            <label htmlFor="description">
              Description<span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe the problem with as much detail as possible"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
              aria-required="true"
            />
          </div>

          <div className="field-grid-2">
            <div>
              <label htmlFor="location">
                Location<span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="location"
                name="location"
                className="location-input"
                placeholder="Building, room or area (e.g. Science Hall 214)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <div className="file-help">
                Be as specific as possible to help responders find the issue.
              </div>
            </div>

            <div>
              <label htmlFor="category">
                Category<span style={{ color: "red" }}>*</span>
              </label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-grid-2">
            <div>
              <label htmlFor="urgency">Urgency</label>
              <select
                id="urgency"
                name="urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <div className="file-help">
                Select the appropriate priority for this issue.
              </div>
            </div>

            <div>
              <label htmlFor="photo">Photo (optional)</label>
              <div className="upload-dropzone">
                <input
                  id="photo"
                  className="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label className="file-label" htmlFor="photo">
                  IMG, PNG only
                </label>
              </div>

              {imageFile && (
                <div style={{ marginTop: 8 }}>
                  <div className="file-name">{imageFile.name}</div>
                  <div className="file-size">{formatBytes(imageFile.size)}</div>
                </div>
              )}

              {imagePreview && (
                <div style={{ marginTop: 12 }}>
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="image-preview"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="actions">
            <button
              type="submit"
              className="btn-primary-dark"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Request"}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => window.history.back()}
            >
              Cancel Request
            </button>
          </div>

          <div style={{ marginTop: 8 }}>
            {success && <div className="muted">{success}</div>}
            {error && (
              <div style={{ color: "#b91c1c", fontWeight: 600 }}>{error}</div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
