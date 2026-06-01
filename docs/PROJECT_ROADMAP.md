# Project Roadmap

## Project Goal

CareTrack MRMS provides a secure clinic records system for managing doctors, patients, diagnoses and staff accounts with clear role-based access.

## Completed Scope

| Area | Status | Evidence |
| --- | --- | --- |
| Authentication | Complete | JWT login, protected routes, profile update and password change. |
| Role access | Complete | Admin, clinician and receptionist permissions are enforced in backend routes and frontend navigation. |
| Doctor management | Complete | Admin CRUD with linked clinician login account creation and deletion. |
| Patient management | Complete | Admin/receptionist create, all roles view, clinician restricted to own assigned patients. |
| Diagnosis management | Complete | Admin creates/deletes, clinicians view/update only their own patient diagnoses. |
| Dashboard | Complete | Role-aware statistics and recent records. |
| Staff management | Complete | Admin user creation, password reset and delete protection for own account. |
| Deployment readiness | Complete | Production `.env.example`, Render/Vercel guidance and health endpoint. |
| Evidence documentation | Complete | Test plan, API documentation, deployment guide, screenshot checklist and role matrix. |

## Final Submission Tasks

| Task | Status |
| --- | --- |
| Remove backend `node_modules` from ZIP | Required before submission |
| Remove frontend `node_modules` from ZIP | Required before submission |
| Remove frontend `dist` from ZIP | Required before submission |
| Exclude `.git` from ZIP | Required before submission |
| Exclude real `.env` files from ZIP | Required before submission |
| Keep `.env.example` files | Required |

## Future Improvements

- Add automated unit and integration tests.
- Add audit logs for medical record changes.
- Add pagination for large doctor, patient, diagnosis and staff lists.
- Add CSV export for administrative reports.
- Add email-based password reset flow.
