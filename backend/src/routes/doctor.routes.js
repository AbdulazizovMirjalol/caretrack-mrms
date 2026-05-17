import express from "express";
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctor.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getDoctors).post(authorizeRoles("admin"), createDoctor);

router
  .route("/:id")
  .get(getDoctorById)
  .put(authorizeRoles("admin"), updateDoctor)
  .delete(authorizeRoles("admin"), deleteDoctor);

export default router;
