import express from "express";
import {
  getUsers,
  createUser,
  resetUserPassword,
  deleteUser,
} from "../controllers/user.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.route("/").get(getUsers).post(createUser);
router.put("/:id/password", resetUserPassword);
router.delete("/:id", deleteUser);

export default router;
