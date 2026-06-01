import bcrypt from "bcryptjs";
import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { normalizeEmail, trimString } from "../utils/sanitize.js";

const userFields = `
  id,
  full_name,
  email,
  role,
  doctor_id,
  created_at,
  updated_at,
  doctor:doctors (
    id,
    full_name,
    specialty,
    department
  )
`;

const allowedRoles = ["admin", "clinician", "receptionist"];

export const getUsers = asyncHandler(async (req, res) => {
  const { search, role } = req.query;

  let query = supabase
    .from("users")
    .select(userFields)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (role) {
    query = query.eq("role", role);
  }

  const { data: users, error } = await query;

  if (error) throw new ApiError(500, error.message);

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const full_name = trimString(req.body.full_name);
  const email = normalizeEmail(req.body.email);
  const role = trimString(req.body.role);
  const password = trimString(req.body.password);
  const doctor_id = trimString(req.body.doctor_id);

  if (!full_name || !email || !role || !password) {
    throw new ApiError(
      400,
      "Full name, email, role and password are required.",
    );
  }

  if (!allowedRoles.includes(role)) {
    throw new ApiError(400, "Invalid role.");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters.");
  }

  if (role === "clinician" && !doctor_id) {
    throw new ApiError(400, "Clinician account must be linked to a doctor.");
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from("users")
    .insert({
      full_name,
      email,
      role,
      doctor_id: role === "clinician" ? doctor_id : null,
      password_hash,
    })
    .select(userFields)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError(409, "This email is already used.");
    }

    throw new ApiError(500, error.message);
  }

  res.status(201).json({
    success: true,
    message: "Staff account created successfully.",
    user,
  });
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const new_password = trimString(req.body.new_password);

  if (!new_password) {
    throw new ApiError(400, "New password is required.");
  }

  if (new_password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters.");
  }

  const password_hash = await bcrypt.hash(new_password, 10);

  const { error } = await supabase
    .from("users")
    .update({ password_hash })
    .eq("id", id);

  if (error) throw new ApiError(500, error.message);

  res.status(200).json({
    success: true,
    message: "Password reset successfully.",
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    throw new ApiError(400, "You cannot delete your own account.");
  }

  const { data: user, error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    .select(userFields)
    .single();

  if (error || !user) {
    throw new ApiError(404, "Staff account not found.");
  }

  res.status(200).json({
    success: true,
    message: "Staff account deleted successfully.",
    user,
  });
});
