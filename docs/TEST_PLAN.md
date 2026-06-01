# Test Plan

| Test ID | Scenario | Role | Steps | Expected Result | Status |
| --- | --- | --- | --- | --- | --- |
| T01 | Login admin | Admin | Log in with `admin@caretrack.com` and `Password123!`. | Admin dashboard loads and admin navigation is visible. | Ready |
| T02 | Login clinician | Clinician | Log in with `clinician@caretrack.com` and `Password123!`. | Clinician dashboard loads with own clinical overview. | Ready |
| T03 | Login receptionist | Receptionist | Log in with `receptionist@caretrack.com` and `Password123!`. | Receptionist dashboard loads without diagnoses or staff access. | Ready |
| T04 | Doctors CRUD | Admin | Create, view, update and delete a doctor with no assigned patients. | Doctor changes persist; linked clinician account is removed on doctor delete. | Ready |
| T05 | Patients CRUD | Admin/Receptionist/Admin | Create and view patient as receptionist, update/delete as admin where permitted. | Patient records behave according to role permissions. | Ready |
| T06 | Diagnoses CRUD | Admin/Clinician | Create/delete as admin, view/update permitted diagnosis as clinician. | Diagnosis records save correctly and role restrictions are enforced. | Ready |
| T07 | Clinician cannot see other doctor patients | Clinician | Log in as clinician and inspect patient list/profile access. | Only patients assigned to the clinician's linked doctor are visible/accessed. | Ready |
| T08 | Receptionist cannot access diagnoses/staff | Receptionist | Try navigating directly to `/diagnoses` and `/staff`. | Access is blocked or redirected by protected routes/API roles. | Ready |
| T09 | Profile update | Any authenticated role | Update profile name/email from profile page. | Profile is saved; email is normalized to lowercase. | Ready |
| T10 | Password change | Any authenticated role | Change password with valid current password and matching new password. | Password changes successfully and new password works on next login. | Ready |
| T11 | Responsive test | All roles | Test login, dashboard and tables on mobile/tablet/desktop widths. | Layout remains usable with horizontal table scrolling where needed. | Ready |
| T12 | Browser compatibility test | All roles | Test latest Chrome, Edge and Firefox. | Core workflows load and operate consistently. | Ready |

## Test Data

Seeded accounts use the password `Password123!`. Run `npm run seed` in the backend folder after configuring Supabase.

## Defect Logging

Record each failed test with the test ID, browser, role, exact steps, expected result, actual result, screenshot and fix status.
