import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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

  const logout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
