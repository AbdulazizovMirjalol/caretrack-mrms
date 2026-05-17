import express from "express";
import {
  getDiagnoses,
  getDiagnosisById,
  createDiagnosis,
  updateDiagnosis,
  deleteDiagnosis,
} from "../controllers/diagnosis.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(authorizeRoles("admin", "clinician"), getDiagnoses)
  .post(authorizeRoles("admin"), createDiagnosis);

router
  .route("/:id")
  .get(authorizeRoles("admin", "clinician"), getDiagnosisById)
  .put(authorizeRoles("admin", "clinician"), updateDiagnosis)
  .delete(authorizeRoles("admin"), deleteDiagnosis);

export default router;
