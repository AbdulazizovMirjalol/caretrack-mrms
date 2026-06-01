# API Documentation

Base URL: `/api`

All protected endpoints require an `Authorization: Bearer <token>` header.

## POST /api/auth/login

| Field | Details |
| --- | --- |
| Role | Public |
| Request body | `{ "email": "admin@caretrack.com", "password": "Password123!" }` |
| Response | `{ "success": true, "message": "Login successful.", "token": "...", "user": { "id": "...", "full_name": "...", "email": "...", "role": "admin", "doctor_id": null } }` |

## GET /api/auth/me

| Field | Details |
| --- | --- |
| Role | Authenticated users |
| Request body | None |
| Response | `{ "success": true, "user": { "id": "...", "full_name": "...", "email": "...", "role": "...", "doctor_id": "..." } }` |

## /api/doctors

| Method | Role | Request body | Response |
| --- | --- | --- | --- |
| GET | Admin, clinician, receptionist | None. Optional query: `search`, `department`, `specialty`. | `{ "success": true, "count": 1, "doctors": [...] }` |
| POST | Admin | `{ "full_name": "Dr. Name", "specialty": "Cardiology", "department": "Cardiology", "phone": "+998...", "email": "doctor@caretrack.com", "account_password": "Password123!" }` | `{ "success": true, "message": "Doctor and clinician login account created successfully.", "doctor": {...}, "userAccount": {...} }` |

## /api/doctors/:id

| Method | Role | Request body | Response |
| --- | --- | --- | --- |
| GET | Admin, clinician, receptionist | None | `{ "success": true, "doctor": {...} }` |
| PUT | Admin | Any editable doctor fields. | `{ "success": true, "message": "Doctor updated successfully.", "doctor": {...} }` |
| DELETE | Admin | None | `{ "success": true, "message": "Doctor and linked clinician account deleted successfully.", "doctor": {...}, "deletedLinkedClinicianAccounts": 1 }` |

## /api/patients

| Method | Role | Request body | Response |
| --- | --- | --- | --- |
| GET | Admin, clinician, receptionist | None. Optional query: `search`, `gender`, `doctorId`. | `{ "success": true, "count": 1, "patients": [...] }` |
| POST | Admin, receptionist | `{ "full_name": "Patient Name", "date_of_birth": "1998-04-12", "gender": "male", "phone": "+998...", "address": "Tashkent", "doctor_id": "uuid" }` | `{ "success": true, "message": "Patient created successfully.", "patient": {...} }` |

## /api/patients/:id/profile

| Field | Details |
| --- | --- |
| Method | GET |
| Role | Admin, clinician |
| Request body | None |
| Response | `{ "success": true, "patient": { "id": "...", "full_name": "...", "doctor": {...}, "diagnoses": [...] } }` |

## /api/diagnoses

| Method | Role | Request body | Response |
| --- | --- | --- | --- |
| GET | Admin, clinician | None. Optional query: `search`, `severity`, `patientId`. | `{ "success": true, "count": 1, "diagnoses": [...] }` |
| POST | Admin | `{ "patient_id": "uuid", "icd_code": "I10", "description": "Essential primary hypertension", "severity": "moderate", "notes": "Notes", "diagnosed_at": "2026-01-10" }` | `{ "success": true, "message": "Diagnosis record created successfully.", "diagnosis": {...} }` |

## /api/diagnoses/:id

| Method | Role | Request body | Response |
| --- | --- | --- | --- |
| GET | Admin, clinician | None | `{ "success": true, "diagnosis": {...} }` |
| PUT | Admin, clinician | Any editable diagnosis fields. Clinicians cannot reassign records. | `{ "success": true, "message": "Diagnosis record updated successfully.", "diagnosis": {...} }` |
| DELETE | Admin | None | `{ "success": true, "message": "Diagnosis record deleted successfully.", "diagnosis": {...} }` |

## GET /api/dashboard/stats

| Field | Details |
| --- | --- |
| Role | Admin, clinician, receptionist |
| Request body | None |
| Response | `{ "success": true, "stats": { "totalDoctors": 3, "totalPatients": 3, "totalDiagnoses": 3, "criticalDiagnoses": 0, "severeDiagnoses": 0 }, "recentPatients": [...], "recentDiagnoses": [...] }` |

## /api/users

| Method | Role | Request body | Response |
| --- | --- | --- | --- |
| GET | Admin | None. Optional query: `search`, `role`. | `{ "success": true, "count": 1, "users": [...] }` |
| POST | Admin | `{ "full_name": "Staff Name", "email": "staff@caretrack.com", "role": "receptionist", "password": "Password123!", "doctor_id": null }` | `{ "success": true, "message": "Staff account created successfully.", "user": {...} }` |

## PUT /api/users/:id/password

| Field | Details |
| --- | --- |
| Role | Admin |
| Request body | `{ "new_password": "Password123!" }` |
| Response | `{ "success": true, "message": "Password reset successfully." }` |

## DELETE /api/users/:id

| Field | Details |
| --- | --- |
| Role | Admin |
| Request body | None |
| Response | `{ "success": true, "message": "Staff account deleted successfully.", "user": {...} }` |
