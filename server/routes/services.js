import express from "express";
import serviceControllers from "../controllers/services.js";

const router = express.Router();

router.get("/", serviceControllers.getUsers);

router.post("/", serviceControllers.createUser);

router.post("/requests", serviceControllers.createRequest);

router.get("/requests", serviceControllers.getRequests);

router.patch("/requests/:Id", serviceControllers.updateRequestStudent);

router.delete("/requests/:Id", serviceControllers.deleteRequest);

router.get("/categories", serviceControllers.getCategories);

router.post("/categories", serviceControllers.createCategory);

export default router;
