import bcrypt from "bcryptjs";
import { supabase } from "../src/config/supabase.js";

const password = "Password123!";

const throwIfError = (label, error) => {
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
};

const clearTable = async (tableName) => {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .not("id", "is", null);

  throwIfError(`Failed to clear ${tableName}`, error);
};

const seedDatabase = async () => {
  console.log("Seeding database...");

  await clearTable("diagnoses");
  await clearTable("patients");
  await clearTable("doctors");
  await clearTable("users");

  const password_hash = await bcrypt.hash(password, 10);


  const { data: insertedDoctors, error: doctorsError } = await supabase
    .from("doctors")
    .insert(doctors)
    .select();

  throwIfError("Failed to insert doctors", doctorsError);

  const users = [
    {
      full_name: "System Administrator",
      email: "admin@caretrack.com",
      password_hash,
      role: "admin",
      doctor_id: null,
    },
    {
      full_name: "Dr. Clinical User",
      email: "clinician@caretrack.com",
      password_hash,
      role: "clinician",
      doctor_id: insertedDoctors[0].id,
    },
    {
      full_name: "Reception Desk",
      email: "receptionist@caretrack.com",
      password_hash,
      role: "receptionist",
      doctor_id: null,
    },
  ];

  const { error: usersError } = await supabase.from("users").insert(users);

  throwIfError("Failed to insert users", usersError);

  const patients = [
    {
      full_name: "Azizbek Sobirov",
      date_of_birth: "1998-04-12",
      gender: "male",
      phone: "+998941234567",
      address: "Tashkent, Yunusabad district",
      doctor_id: insertedDoctors[0].id,
    },
    {
      full_name: "Madina Abdullayeva",
      date_of_birth: "1992-09-25",
      gender: "female",
      phone: "+998935556677",
      address: "Tashkent, Chilanzar district",
      doctor_id: insertedDoctors[1].id,
    },
    {
      full_name: "Sardor Rakhmonov",
      date_of_birth: "1987-01-30",
      gender: "male",
      phone: "+998977778899",
      address: "Tashkent, Mirabad district",
      doctor_id: insertedDoctors[2].id,
    },
  ];

  const { data: insertedPatients, error: patientsError } = await supabase
    .from("patients")
    .insert(patients)
    .select();

  throwIfError("Failed to insert patients", patientsError);

  const diagnoses = [
    {
      patient_id: insertedPatients[0].id,
      icd_code: "I10",
      description: "Essential primary hypertension",
      severity: "moderate",
      notes: "Blood pressure monitoring recommended.",
      diagnosed_at: "2026-01-10",
    },
    {
      patient_id: insertedPatients[1].id,
      icd_code: "G43",
      description: "Migraine",
      severity: "mild",
      notes: "Patient reports recurring headaches.",
      diagnosed_at: "2026-01-12",
    },
    {
      patient_id: insertedPatients[2].id,
      icd_code: "L20",
      description: "Atopic dermatitis",
      severity: "moderate",
      notes: "Skin irritation and allergy symptoms.",
      diagnosed_at: "2026-01-14",
    },
  ];

  const { error: diagnosesError } = await supabase
    .from("diagnoses")
    .insert(diagnoses);

  throwIfError("Failed to insert diagnoses", diagnosesError);

  console.log("Database seeded successfully.");
  console.log("");
  console.log("Login accounts:");
  console.log("admin@caretrack.com / Password123!");
  console.log("clinician@caretrack.com / Password123!");
  console.log("receptionist@caretrack.com / Password123!");
};

seedDatabase().catch((error) => {
  console.error("Seed failed:");
  console.error(error.message);
  process.exit(1);
});
