import express from "express";
import serviceControllers from "../controllers/services.js";
import passport from "../config/passport.js";

const router = express.Router();

router.get("/", serviceControllers.getUsers);

router.post("/", serviceControllers.createUser);

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ message: "Logged in successfully", user: req.user });
});

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Not logged in" });
};

const requireRole = (role) => (req, res, next) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ message: "Not logged in" });
  const userRole = (req.user && req.user.role) || "";
  if (userRole.toUpperCase() !== role.toUpperCase())
    return res.status(403).json({ message: "Forbidden" });
  return next();
};

router.post("/requests", requireAuth, serviceControllers.createRequest);

router.get("/requests", serviceControllers.getRequests);

// REST-style single request fetch
router.get("/requests/:id", serviceControllers.getRequests);

// Technician: get requests assigned to them
router.get(
  "/technician/requests",
  requireAuth,
  requireRole("TECHNICIAN"),
  serviceControllers.getTechnicianRequests
);

// Update status (used by technicians and admins) — body: { status }
router.patch(
  "/requests/:id/status",
  requireAuth,
  serviceControllers.updateRequestStatus
);

// Assign request to technician (admin only)
router.patch(
  "/requests/:id/assign",
  requireAuth,
  requireRole("ADMIN"),
  serviceControllers.assignRequest
);

router.patch(
  "/requests/:Id",
  requireAuth,
  serviceControllers.updateRequestStudent
);

router.delete("/requests/:Id", requireAuth, serviceControllers.deleteRequest);

// Create a resolution entry (technician uploads photo via supabase then POSTs data)
router.post(
  "/resolutions",
  requireAuth,
  requireRole("TECHNICIAN"),
  serviceControllers.createResolution
);

// Fetch resolutions by request id(s)
router.get("/resolutions", requireAuth, serviceControllers.getResolutions);

router.get("/categories", serviceControllers.getCategories);

router.post("/categories", requireAuth, serviceControllers.createCategory);
// Admin-only user creation endpoint (explicit)
router.post(
  "/admin/users",
  requireAuth,
  requireRole("ADMIN"),
  serviceControllers.createUser
);
router.delete(
  "/categories/:id",
  requireAuth,
  requireRole("ADMIN"),
  serviceControllers.deleteCategory
);

router.post("/logout", requireAuth, (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
});

router.get("/me", (req, res) => {
  if (!req.user) return res.json({ user: null });
  res.json({ user: req.user });
});

export default router;
