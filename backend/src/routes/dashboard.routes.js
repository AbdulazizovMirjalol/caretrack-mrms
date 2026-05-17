import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get(
  "/stats",
  authorizeRoles("admin", "clinician", "receptionist"),
  getDashboardStats,
);

export default router;
