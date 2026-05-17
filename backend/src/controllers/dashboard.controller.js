import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const getCount = async (tableName, filter = null) => {
  let query = supabase
    .from(tableName)
    .select("id", { count: "exact", head: true });

  if (filter) query = query.eq(filter.column, filter.value);

  const { count, error } = await query;
  if (error) throw new ApiError(500, error.message);

  return count || 0;
};

export const getDashboardStats = asyncHandler(async (req, res) => {
  if (req.user.role === "clinician") {
    if (!req.user.doctor_id) {
      return res.status(200).json({
        success: true,
        stats: {
          totalDoctors: 1,
          totalPatients: 0,
          totalDiagnoses: 0,
          criticalDiagnoses: 0,
          severeDiagnoses: 0,
        },
        recentPatients: [],
        recentDiagnoses: [],
      });
    }

    const { data: ownPatients, error: patientsError } = await supabase
      .from("patients")
      .select(
        `
        id,
        full_name,
        phone,
        created_at,
        doctor:doctors (
          id,
          full_name,
          specialty,
          department
        )
      `,
      )
      .eq("doctor_id", req.user.doctor_id)
      .order("created_at", { ascending: false });

    if (patientsError) throw new ApiError(500, patientsError.message);

    const patientIds = ownPatients.map((patient) => patient.id);

    if (patientIds.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalDoctors: 1,
          totalPatients: 0,
          totalDiagnoses: 0,
          criticalDiagnoses: 0,
          severeDiagnoses: 0,
        },
        recentPatients: [],
        recentDiagnoses: [],
      });
    }

    const { data: ownDiagnoses, error: diagnosesError } = await supabase
      .from("diagnoses")
      .select(
        `
        id,
        icd_code,
        description,
        severity,
        diagnosed_at,
        created_at,
        patient:patients (
          id,
          full_name
        )
      `,
      )
      .in("patient_id", patientIds)
      .order("created_at", { ascending: false });

    if (diagnosesError) throw new ApiError(500, diagnosesError.message);

    return res.status(200).json({
      success: true,
      stats: {
        totalDoctors: 1,
        totalPatients: ownPatients.length,
        totalDiagnoses: ownDiagnoses.length,
        criticalDiagnoses: ownDiagnoses.filter((d) => d.severity === "critical")
          .length,
        severeDiagnoses: ownDiagnoses.filter((d) => d.severity === "severe")
          .length,
      },
      recentPatients: ownPatients.slice(0, 5),
      recentDiagnoses: ownDiagnoses.slice(0, 5),
    });
  }

  const [
    totalDoctors,
    totalPatients,
    totalDiagnoses,
    criticalDiagnoses,
    severeDiagnoses,
  ] = await Promise.all([
    getCount("doctors"),
    getCount("patients"),
    getCount("diagnoses"),
    getCount("diagnoses", { column: "severity", value: "critical" }),
    getCount("diagnoses", { column: "severity", value: "severe" }),
  ]);

  const { data: recentPatients, error: patientsError } = await supabase
    .from("patients")
    .select(
      `
      id,
      full_name,
      phone,
      created_at,
      doctor:doctors (
        id,
        full_name,
        specialty,
        department
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  if (patientsError) throw new ApiError(500, patientsError.message);

  const { data: recentDiagnoses, error: diagnosesError } = await supabase
    .from("diagnoses")
    .select(
      `
      id,
      icd_code,
      description,
      severity,
      diagnosed_at,
      patient:patients (
        id,
        full_name
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  if (diagnosesError) throw new ApiError(500, diagnosesError.message);

  res.status(200).json({
    success: true,
    stats: {
      totalDoctors,
      totalPatients,
      totalDiagnoses,
      criticalDiagnoses,
      severeDiagnoses,
    },
    recentPatients,
    recentDiagnoses,
  });
});
