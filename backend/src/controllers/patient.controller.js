import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { trimString } from "../utils/sanitize.js";

const patientFields = `
  id,
  full_name,
  date_of_birth,
  gender,
  phone,
  address,
  doctor_id,
  created_at,
  updated_at,
  doctor:doctors (
    id,
    full_name,
    specialty,
    department,
    phone,
    email
  )
`;

const profileFields = `
  id,
  full_name,
  date_of_birth,
  gender,
  phone,
  address,
  doctor_id,
  created_at,
  updated_at,
  doctor:doctors (
    id,
    full_name,
    specialty,
    department,
    phone,
    email
  ),
  diagnoses (
    id,
    icd_code,
    description,
    severity,
    notes,
    diagnosed_at,
    created_at,
    updated_at
  )
`;

const allowedGenders = ["male", "female", "other"];

const ensureDoctorExists = async (doctorId) => {
  const { data: doctor, error } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", doctorId)
    .single();

  if (error || !doctor) {
    throw new ApiError(400, "Assigned doctor does not exist.");
  }
};

const ensureClinicianOwnsPatient = (req, patient) => {
  if (req.user.role !== "clinician") return;

  if (!req.user.doctor_id || patient.doctor_id !== req.user.doctor_id) {
    throw new ApiError(403, "You can only access patients assigned to you.");
  }
};

export const getPatients = asyncHandler(async (req, res) => {
  const { search, gender, doctorId } = req.query;

  let query = supabase
    .from("patients")
    .select(patientFields)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,phone.ilike.%${search}%,address.ilike.%${search}%`,
    );
  }

  if (gender) {
    query = query.eq("gender", gender);
  }

  if (doctorId) {
    query = query.eq("doctor_id", doctorId);
  }

  if (req.user.role === "clinician") {
    if (!req.user.doctor_id) {
      return res.status(200).json({
        success: true,
        count: 0,
        patients: [],
      });
    }

    query = query.eq("doctor_id", req.user.doctor_id);
  }

  const { data: patients, error } = await query;

  if (error) {
    throw new ApiError(500, error.message);
  }

  res.status(200).json({
    success: true,
    count: patients.length,
    patients,
  });
});

export const getPatientById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: patient, error } = await supabase
    .from("patients")
    .select(patientFields)
    .eq("id", id)
    .single();

  if (error || !patient) {
    throw new ApiError(404, "Patient not found.");
  }

  ensureClinicianOwnsPatient(req, patient);

  res.status(200).json({
    success: true,
    patient,
  });
});

export const getPatientProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: patient, error } = await supabase
    .from("patients")
    .select(profileFields)
    .eq("id", id)
    .single();

  if (error || !patient) {
    throw new ApiError(404, "Patient profile not found.");
  }

  ensureClinicianOwnsPatient(req, patient);

  res.status(200).json({
    success: true,
    patient,
  });
});

export const createPatient = asyncHandler(async (req, res) => {
  const full_name = trimString(req.body.full_name);
  const date_of_birth = trimString(req.body.date_of_birth);
  const gender = trimString(req.body.gender);
  const phone = trimString(req.body.phone);
  const address = trimString(req.body.address);
  const doctor_id = trimString(req.body.doctor_id);

  if (
    !full_name ||
    !date_of_birth ||
    !gender ||
    !phone ||
    !address ||
    !doctor_id
  ) {
    throw new ApiError(
      400,
      "Full name, date of birth, gender, phone, address and doctor ID are required.",
    );
  }

  if (!allowedGenders.includes(gender)) {
    throw new ApiError(400, "Gender must be male, female or other.");
  }

  await ensureDoctorExists(doctor_id);

  const { data: patient, error } = await supabase
    .from("patients")
    .insert({
      full_name,
      date_of_birth,
      gender,
      phone,
      address,
      doctor_id,
    })
    .select(patientFields)
    .single();

  if (error) {
    throw new ApiError(500, error.message);
  }

  res.status(201).json({
    success: true,
    message: "Patient created successfully.",
    patient,
  });
});

export const updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role === "clinician") {
    const { data: existingPatient, error: existingPatientError } =
      await supabase
        .from("patients")
        .select("id, doctor_id")
        .eq("id", id)
        .single();

    if (existingPatientError || !existingPatient) {
      throw new ApiError(404, "Patient not found.");
    }

    if (existingPatient.doctor_id !== req.user.doctor_id) {
      throw new ApiError(403, "You can only update patients assigned to you.");
    }
  }

  const full_name = trimString(req.body.full_name);
  const date_of_birth = trimString(req.body.date_of_birth);
  const gender = trimString(req.body.gender);
  const phone = trimString(req.body.phone);
  const address = trimString(req.body.address);
  const doctor_id = trimString(req.body.doctor_id);

  const updateData = {};

  if (full_name !== undefined) updateData.full_name = full_name;
  if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;

  if (gender !== undefined) {
    if (!allowedGenders.includes(gender)) {
      throw new ApiError(400, "Gender must be male, female or other.");
    }

    updateData.gender = gender;
  }

  if (doctor_id !== undefined) {
    if (req.user.role === "clinician") {
      throw new ApiError(403, "Clinicians cannot change the assigned doctor.");
    }

    await ensureDoctorExists(doctor_id);
    updateData.doctor_id = doctor_id;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "At least one field is required to update.");
  }

  const { data: patient, error } = await supabase
    .from("patients")
    .update(updateData)
    .eq("id", id)
    .select(patientFields)
    .single();

  if (error || !patient) {
    throw new ApiError(404, "Patient not found.");
  }

  res.status(200).json({
    success: true,
    message: "Patient updated successfully.",
    patient,
  });
});

export const deletePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: patient, error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id)
    .select(patientFields)
    .single();

  if (error || !patient) {
    throw new ApiError(404, "Patient not found.");
  }

  res.status(200).json({
    success: true,
    message: "Patient deleted successfully.",
    patient,
  });
});
