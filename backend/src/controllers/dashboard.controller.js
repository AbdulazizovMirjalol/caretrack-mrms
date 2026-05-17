import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const getCount = async (tableName, filter = null) => {
  let query = supabase
    .from(tableName)
    .select("id", { count: "exact", head: true });

  if (filter) {
    query = query.eq(filter.column, filter.value);
  }

  const { count, error } = await query;

  if (error) {
    throw new ApiError(500, error.message);
  }

  return count || 0;
};

export const getDashboardStats = asyncHandler(async (req, res) => {
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

  if (patientsError) {
    throw new ApiError(500, patientsError.message);
  }

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

  if (diagnosesError) {
    throw new ApiError(500, diagnosesError.message);
  }

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
