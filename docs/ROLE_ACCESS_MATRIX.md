# Role Access Matrix

| Feature | Admin | Clinician | Receptionist |
| --- | --- | --- | --- |
| Dashboard | Full dashboard access | Own clinical overview | Basic dashboard access |
| Doctors | Create, view, update, delete | View doctors | View doctors |
| Patients | Create, view, update, delete | View/update own assigned patients | Create/view patients |
| Patient profile | View all profiles | View own assigned patient profiles | No access |
| Diagnoses | Create, view, update, delete | View/update own assigned patient diagnoses | No access |
| Staff management | Create users, reset passwords, delete users except own account | No access | No access |
| Profile update | Yes | Yes | Yes |
| Password change | Yes | Yes | Yes |

## Summary

| Role | Permission Summary |
| --- | --- |
| Admin | Full access. |
| Clinician | View doctors, view/update own patients, view/update own diagnoses. |
| Receptionist | View doctors, create/view patients, no diagnoses, no staff. |
