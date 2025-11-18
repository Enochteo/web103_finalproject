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

router.post("/requests", requireAuth, serviceControllers.createRequest);

router.get("/requests", serviceControllers.getRequests);

router.patch(
  "/requests/:Id",
  requireAuth,
  serviceControllers.updateRequestStudent
);

router.delete("/requests/:Id", requireAuth, serviceControllers.deleteRequest);

router.get("/categories", serviceControllers.getCategories);

router.post("/categories", requireAuth, serviceControllers.createCategory);

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
