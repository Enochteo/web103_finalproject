import { React, useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchMe() {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
        });
        if (!res.ok) return;
        const body = await res.json().catch(() => ({}));
        if (mounted) setUser(body.user || null);
      } catch (err) {
        // ignore
      }
    }
    fetchMe();
    return () => (mounted = false);
  }, []);
  return (
    <div className="page-container">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Campus Maintenance Portal</h1>
      </header>

      <section style={{ display: "grid", gap: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Quick Actions</h2>
          <ul>
            {user && (
              <li>
                <Link to="/makerequest">Submit a maintenance request</Link>
              </li>
            )}
            <li>
              <Link to="/requests">Browse submitted requests</Link>
            </li>
            <li>
              <Link to="/register">Create an account</Link>
            </li>
            <li>
              <Link to="/login">Sign in</Link>
            </li>
          </ul>
        </div>

        <div className="card">
          <h3>How it works</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Use this portal to report maintenance issues on campus. Provide a
            clear title, exact location, and photos when possible. Set urgency
            appropriately so critical issues get prioritized.
          </p>
        </div>

        <div className="card">
          <h3>Tips</h3>
          <ul>
            <li>Specify building and room number whenever possible.</li>
            <li>Attach photos to show the issue clearly.</li>
            <li>Choose urgency honestly — it helps prioritize resources.</li>
          </ul>
        </div>
      </section>

      <footer style={{ marginTop: 32 }}>
        <small className="muted">© Campus Maintenance Portal</small>
      </footer>
    </div>
  );
}
