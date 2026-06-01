import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { normalizeEmail, trimString } from "../utils/sanitize.js";

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );
};

const publicUserFields = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
  doctor_id: user.doctor_id,
});

export const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = trimString(req.body.password);

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("id, full_name, email, password_hash, role, doctor_id")
    .eq("email", email)
    .single();

  if (error || !user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = createToken(user);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    token,
    user: publicUserFields(user),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const full_name = trimString(req.body.full_name);
  const email = normalizeEmail(req.body.email);

  const updateData = {};

  if (full_name !== undefined) updateData.full_name = full_name;
  if (email !== undefined) updateData.email = email;

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "At least one field is required to update.");
  }

  const { data: user, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", req.user.id)
    .select("id, full_name, email, role, doctor_id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError(409, "This email is already used by another account.");
    }

    throw new ApiError(500, error.message);
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;

  if (!current_password || !new_password || !confirm_password) {
    throw new ApiError(
      400,
      "Current password, new password and confirm password are required.",
    );
  }

  if (new_password !== confirm_password) {
    throw new ApiError(400, "New password and confirm password do not match.");
  }

  if (new_password.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters long.");
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("id, password_hash")
    .eq("id", req.user.id)
    .single();

  if (error || !user) {
    throw new ApiError(404, "User account not found.");
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    current_password,
    user.password_hash,
  );

  if (!isCurrentPasswordValid) {
    throw new ApiError(401, "Current password is incorrect.");
  }

  const password_hash = await bcrypt.hash(new_password, 10);

  const { error: updateError } = await supabase
    .from("users")
    .update({ password_hash })
    .eq("id", req.user.id);

  if (updateError) {
    throw new ApiError(500, updateError.message);
  }

  res.status(200).json({
    success: true,
    message: "Password changed successfully.",
  });
});
