import React from "react";
import { Link, useRoutes, Navigate } from "react-router-dom";
import CreateUser from "./pages/CreateUser";
import CreateRequest from "./pages/CreateRequest";
import LoginUser from "./pages/LoginUser";
import ViewRequests from "./pages/ViewRequests";
import Home from "./pages/Home";
import TechnicianDashboard from "./pages/technician/Dashboard";
import TechnicianRequest from "./pages/technician/Request";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminRequest from "./pages/admin/Request";
import AdminCategories from "./pages/admin/Categories";
import AdminCreateUser from "./pages/admin/CreateUser";
import StudentDashboard from "./pages/student/Dashboard";
import { AuthProvider, useAuth } from "./auth/AuthProvider";

const AppInner = () => {
  const { user, logout } = useAuth();

  const Protected = ({ children, roles = [] }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (roles.length === 0) return children;
    const role = (user.role || "").toString().toUpperCase();
    const allowed = roles.map((r) => r.toString().toUpperCase());
    if (!allowed.includes(role)) return <Navigate to="/login" replace />;
    return children;
  };

  const element = useRoutes([
    { path: "/", element: <Home /> },
    { path: "/register", element: <CreateUser /> },
    { path: "/makerequest", element: <CreateRequest /> },
    { path: "/login", element: <LoginUser /> },
    { path: "/requests", element: <ViewRequests /> },
    {
      path: "/technician/dashboard",
      element: (
        <Protected roles={["TECHNICIAN"]}>
          <TechnicianDashboard />
        </Protected>
      ),
    },
    {
      path: "/technician/request/:id",
      element: (
        <Protected roles={["TECHNICIAN"]}>
          <TechnicianRequest />
        </Protected>
      ),
    },
    {
      path: "/admin/dashboard",
      element: (
        <Protected roles={["ADMIN"]}>
          <AdminDashboard />
        </Protected>
      ),
    },
    {
      path: "/admin/request/:id",
      element: (
        <Protected roles={["ADMIN"]}>
          <AdminRequest />
        </Protected>
      ),
    },
    {
      path: "/admin/categories",
      element: (
        <Protected roles={["ADMIN"]}>
          <AdminCategories />
        </Protected>
      ),
    },
    {
      path: "/admin/create-user",
      element: (
        <Protected roles={["ADMIN"]}>
          <AdminCreateUser />
        </Protected>
      ),
    },
    {
      path: "/student/my-requests",
      element: (
        <Protected roles={["STUDENT"]}>
          <StudentDashboard />
        </Protected>
      ),
    },
  ]);

  return (
    <>
      <nav className="main-nav">
        <Link to="/">
          <button className="nav-button">Home</button>
        </Link>

        {!user && (
          <Link to="/register">
            <button className="nav-button">Register</button>
          </Link>
        )}

        {user && user.role === "STUDENT" && (
          <Link to="/makerequest">
            <button className="nav-button">Make a Request</button>
          </Link>
        )}
        {user && user.role === "STUDENT" && (
          <Link to="/student/my-requests">
            <button className="nav-button">My Requests</button>
          </Link>
        )}

        {user && user.role === "TECHNICIAN" && (
          <Link to="/technician/dashboard">
            <button className="nav-button">Technician</button>
          </Link>
        )}

        {user && user.role === "ADMIN" && (
          <Link to="/admin/dashboard">
            <button className="nav-button">Admin</button>
          </Link>
        )}
        {user && user.role === "ADMIN" && (
          <Link to="/admin/create-user">
            <button className="nav-button">Create User</button>
          </Link>
        )}

        {!user ? (
          <Link to="/login">
            <button className="nav-button">Login</button>
          </Link>
        ) : (
          <button className="nav-button" onClick={logout}>
            Logout
          </button>
        )}

        <Link to="/requests">
          <button className="secondary-button">View Requests</button>
        </Link>
      </nav>

      {element}
    </>
  );
};

const App = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;
