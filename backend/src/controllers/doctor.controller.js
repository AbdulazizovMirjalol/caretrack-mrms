import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const doctorFields = `
  id,
  full_name,
  specialty,
  department,
  phone,
  email,
  created_at,
  updated_at
`;

export const getDoctors = asyncHandler(async (req, res) => {
  const { search, department, specialty } = req.query;

  let query = supabase
    .from("doctors")
    .select(doctorFields)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,specialty.ilike.%${search}%,department.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
    );
  }

  if (department) {
    query = query.eq("department", department);
  }

  if (specialty) {
    query = query.eq("specialty", specialty);
  }

  const { data: doctors, error } = await query;

  if (error) {
    throw new ApiError(500, error.message);
  }

  res.status(200).json({
    success: true,
    count: doctors.length,
    doctors,
  });
});

export const getDoctorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: doctor, error } = await supabase
    .from("doctors")
    .select(doctorFields)
    .eq("id", id)
    .single();

  if (error || !doctor) {
    throw new ApiError(404, "Doctor not found.");
  }

  res.status(200).json({
    success: true,
    doctor,
  });
});

export const createDoctor = asyncHandler(async (req, res) => {
  const { full_name, specialty, department, phone, email } = req.body;

  if (!full_name || !specialty || !department || !phone || !email) {
    throw new ApiError(
      400,
      "Full name, specialty, department, phone and email are required.",
    );
  }

  const { data: doctor, error } = await supabase
    .from("doctors")
    .insert({
      full_name,
      specialty,
      department,
      phone,
      email: email.toLowerCase(),
    })
    .select(doctorFields)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError(409, "Doctor email already exists.");
    }

    throw new ApiError(500, error.message);
  }

  res.status(201).json({
    success: true,
    message: "Doctor created successfully.",
    doctor,
  });
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { full_name, specialty, department, phone, email } = req.body;

  const updateData = {};

  if (full_name !== undefined) updateData.full_name = full_name;
  if (specialty !== undefined) updateData.specialty = specialty;
  if (department !== undefined) updateData.department = department;
  if (phone !== undefined) updateData.phone = phone;
  if (email !== undefined) updateData.email = email.toLowerCase();

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "At least one field is required to update.");
  }

  const { data: doctor, error } = await supabase
    .from("doctors")
    .update(updateData)
    .eq("id", id)
    .select(doctorFields)
    .single();

  if (error || !doctor) {
    if (error?.code === "23505") {
      throw new ApiError(409, "Doctor email already exists.");
    }

    throw new ApiError(404, "Doctor not found.");
  }

  res.status(200).json({
    success: true,
    message: "Doctor updated successfully.",
    doctor,
  });
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: patients, error: patientsError } = await supabase
    .from("patients")
    .select("id")
    .eq("doctor_id", id)
    .limit(1);

  if (patientsError) {
    throw new ApiError(500, patientsError.message);
  }

  if (patients.length > 0) {
    throw new ApiError(
      409,
      "This doctor cannot be deleted because patients are assigned to this doctor.",
    );
  }

  const { data: doctor, error } = await supabase
    .from("doctors")
    .delete()
    .eq("id", id)
    .select(doctorFields)
    .single();

  if (error || !doctor) {
    throw new ApiError(404, "Doctor not found.");
  }

  res.status(200).json({
    success: true,
    message: "Doctor deleted successfully.",
    doctor,
  });
});
