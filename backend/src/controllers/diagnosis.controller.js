import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const diagnosisFields = `
  id,
  patient_id,
  icd_code,
  description,
  severity,
  notes,
  diagnosed_at,
  created_at,
  updated_at,
  patient:patients (
    id,
    full_name,
    phone,
    gender,
    date_of_birth,
    doctor:doctors (
      id,
      full_name,
      specialty,
      department
    )
  )
`;

const allowedSeverities = ["mild", "moderate", "severe", "critical"];

const ensurePatientExists = async (patientId) => {
  const { data: patient, error } = await supabase
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .single();

  if (error || !patient) {
    throw new ApiError(400, "Related patient does not exist.");
  }
};

export const getDiagnoses = asyncHandler(async (req, res) => {
  const { search, severity, patientId } = req.query;

  let query = supabase
    .from("diagnoses")
    .select(diagnosisFields)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `icd_code.ilike.%${search}%,description.ilike.%${search}%,notes.ilike.%${search}%`,
    );
  }

  if (severity) {
    query = query.eq("severity", severity);
  }

  if (patientId) {
    query = query.eq("patient_id", patientId);
  }

  if (req.user.role === "clinician") {
    if (!req.user.doctor_id) {
      return res.status(200).json({
        success: true,
        count: 0,
        diagnoses: [],
      });
    }

    const { data: ownPatients, error: patientsError } = await supabase
      .from("patients")
      .select("id")
      .eq("doctor_id", req.user.doctor_id);

    if (patientsError) {
      throw new ApiError(500, patientsError.message);
    }

    const ownPatientIds = ownPatients.map((patient) => patient.id);

    if (ownPatientIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        diagnoses: [],
      });
    }

    query = query.in("patient_id", ownPatientIds);
  }

  const { data: diagnoses, error } = await query;

  if (error) {
    throw new ApiError(500, error.message);
  }

  res.status(200).json({
    success: true,
    count: diagnoses.length,
    diagnoses,
  });
});

export const getDiagnosisById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: diagnosis, error } = await supabase
    .from("diagnoses")
    .select(diagnosisFields)
    .eq("id", id)
    .single();

  if (error || !diagnosis) {
    throw new ApiError(404, "Diagnosis record not found.");
  }

  if (
    req.user.role === "clinician" &&
    diagnosis.patient?.doctor?.id !== req.user.doctor_id
  ) {
    throw new ApiError(
      403,
      "You can only access diagnoses for your own patients.",
    );
  }

  res.status(200).json({
    success: true,
    diagnosis,
  });
});

export const createDiagnosis = asyncHandler(async (req, res) => {
  const { patient_id, icd_code, description, severity, notes, diagnosed_at } =
    req.body;

  if (!patient_id || !icd_code || !description || !severity) {
    throw new ApiError(
      400,
      "Patient ID, ICD code, description and severity are required.",
    );
  }

  if (!allowedSeverities.includes(severity)) {
    throw new ApiError(
      400,
      "Severity must be mild, moderate, severe or critical.",
    );
  }

  await ensurePatientExists(patient_id);

  const insertData = {
    patient_id,
    icd_code: icd_code.toUpperCase(),
    description,
    severity,
    notes: notes || null,
  };

  if (diagnosed_at) {
    insertData.diagnosed_at = diagnosed_at;
  }

  const { data: diagnosis, error } = await supabase
    .from("diagnoses")
    .insert(insertData)
    .select(diagnosisFields)
    .single();

  if (error) {
    throw new ApiError(500, error.message);
  }

  res.status(201).json({
    success: true,
    message: "Diagnosis record created successfully.",
    diagnosis,
  });
});

export const updateDiagnosis = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role === "clinician") {
    const { data: existingDiagnosis, error: existingDiagnosisError } =
      await supabase
        .from("diagnoses")
        .select(
          `
      id,
      patient:patients (
        id,
        doctor_id
      )
    `,
        )
        .eq("id", id)
        .single();

    if (existingDiagnosisError || !existingDiagnosis) {
      throw new ApiError(404, "Diagnosis record not found.");
    }

    if (existingDiagnosis.patient?.doctor_id !== req.user.doctor_id) {
      throw new ApiError(
        403,
        "You can only update diagnoses for your own patients.",
      );
    }
  }

  const { patient_id, icd_code, description, severity, notes, diagnosed_at } =
    req.body;

  const updateData = {};

  if (patient_id !== undefined) {
    if (req.user.role === "clinician") {
      throw new ApiError(403, "Clinicians cannot reassign diagnosis records.");
    }

    await ensurePatientExists(patient_id);
    updateData.patient_id = patient_id;
  }

  if (icd_code !== undefined) updateData.icd_code = icd_code.toUpperCase();
  if (description !== undefined) updateData.description = description;
  if (notes !== undefined) updateData.notes = notes;
  if (diagnosed_at !== undefined) updateData.diagnosed_at = diagnosed_at;

  if (severity !== undefined) {
    if (!allowedSeverities.includes(severity)) {
      throw new ApiError(
        400,
        "Severity must be mild, moderate, severe or critical.",
      );
    }

    updateData.severity = severity;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "At least one field is required to update.");
  }

  const { data: diagnosis, error } = await supabase
    .from("diagnoses")
    .update(updateData)
    .eq("id", id)
    .select(diagnosisFields)
    .single();

  if (error || !diagnosis) {
    throw new ApiError(404, "Diagnosis record not found.");
  }

  res.status(200).json({
    success: true,
    message: "Diagnosis record updated successfully.",
    diagnosis,
  });
});

export const deleteDiagnosis = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: diagnosis, error } = await supabase
    .from("diagnoses")
    .delete()
    .eq("id", id)
    .select(diagnosisFields)
    .single();

  if (error || !diagnosis) {
    throw new ApiError(404, "Diagnosis record not found.");
  }

  res.status(200).json({
    success: true,
    message: "Diagnosis record deleted successfully.",
    diagnosis,
  });
});
