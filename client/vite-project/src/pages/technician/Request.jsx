import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { supabase } from "../../supabase/supabaseClient";

const TechnicianRequest = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "TECHNICIAN") return navigate("/login");

    async function fetchRequest() {
      try {
        const res = await fetch(`/api/requests?id=${id}`, {
          credentials: "include",
        });
        // fallback: try fetch single
        if (res.ok) {
          const body = await res.json();
          // if API returns array or object
          setRequest(Array.isArray(body) ? body[0] : body);
          // fetch any existing resolution for this request
          try {
            const rr = await fetch(`/api/resolutions?request_id=${id}`, {
              credentials: "include",
            });
            if (rr.ok) {
              const rbody = await rr.json();
              if (Array.isArray(rbody) && rbody.length > 0)
                setResolution(rbody[0]);
            }
          } catch (err) {
            console.error("Failed to fetch resolution", err);
          }
        } else {
          const res2 = await fetch(`/api/requests/${id}`, {
            credentials: "include",
          });
          if (res2.ok) setRequest(await res2.json());
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchRequest();
  }, [id, user]);

  const handleFile = (e) => setFile(e.target.files?.[0] || null);

  const uploadResolution = async () => {
    if (!file || !request) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `res_${request.id}_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("resolutions")
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: publicData, error: publicError } = supabase.storage
        .from("resolutions")
        .getPublicUrl(uploadData.path);
      if (publicError) console.warn("getPublicUrl error:", publicError);
      const publicURL = publicData?.publicUrl || publicData?.publicURL || null;
      // POST resolution record
      const res = await fetch("/api/resolutions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: request.id,
          technician_photo_url: publicURL,
        }),
      });
      if (!res.ok) {
        console.error("Failed to create resolution", await res.text());
      } else {
        // mark request as resolved
        await fetch(`/api/requests/${request.id}/status`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "RESOLVED" }),
        });
        navigate("/technician/dashboard");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (!request) return <div className="page-container">Loading…</div>;

  return (
    <div className="page-container">
      <h2>{request.title}</h2>
      <p>{request.description}</p>
      {request.photo_url && (
        <img src={request.photo_url} alt="request" style={{ maxWidth: 300 }} />
      )}
      <p>
        <strong>Category:</strong> {request.category_id}
      </p>
      <p>
        <strong>Urgency:</strong> {request.urgency}
      </p>
      <p>
        <strong>Status:</strong> {request.status}
      </p>

      <div>
        <label>Upload resolution photo</label>
        <input type="file" onChange={handleFile} />
        <button onClick={uploadResolution} disabled={!file || uploading}>
          {uploading ? "Uploading…" : "Upload & Resolve"}
        </button>
      </div>
      {resolution && (
        <div style={{ marginTop: 16 }}>
          <h3>Existing Resolution</h3>
          {resolution.technician_photo_url && (
            <img
              src={resolution.technician_photo_url}
              alt="resolution"
              style={{ maxWidth: 300 }}
            />
          )}
          {resolution.admin_notes && (
            <p>
              <strong>Notes:</strong> {resolution.admin_notes}
            </p>
          )}
          {resolution.resolved_at && (
            <p>
              <strong>Resolved At:</strong>{" "}
              {new Date(resolution.resolved_at).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TechnicianRequest;
