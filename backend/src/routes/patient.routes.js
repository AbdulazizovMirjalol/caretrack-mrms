import express from "express";
import {
  getPatients,
  getPatientById,
  getPatientProfile,
  createPatient,
  updatePatient,
  deletePatient
} from "../controllers/patient.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(authorizeRoles("admin", "clinician", "receptionist"), getPatients)
  .post(authorizeRoles("admin", "receptionist"), createPatient);

router.get(
  "/:id/profile",
  authorizeRoles("admin", "clinician"),
  getPatientProfile
);

router
  .route("/:id")
  .get(authorizeRoles("admin", "clinician", "receptionist"), getPatientById)
  .put(authorizeRoles("admin", "clinician"), updatePatient)
  .delete(authorizeRoles("admin"), deletePatient);

export default router;