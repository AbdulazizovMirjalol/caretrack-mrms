create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'clinician', 'receptionist')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  specialty text not null,
  department text not null,
  phone text not null,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  date_of_birth date not null,
  gender text not null check (gender in ('male', 'female', 'other')),
  phone text not null,
  address text not null,
  doctor_id uuid not null references doctors(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists diagnoses (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  icd_code text not null,
  description text not null,
  severity text not null check (severity in ('mild', 'moderate', 'severe', 'critical')),
  notes text,
  diagnosed_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_email on users(email);
create index if not exists idx_users_role on users(role);

create index if not exists idx_doctors_full_name on doctors(full_name);
create index if not exists idx_doctors_specialty on doctors(specialty);
create index if not exists idx_doctors_department on doctors(department);

create index if not exists idx_patients_full_name on patients(full_name);
create index if not exists idx_patients_doctor_id on patients(doctor_id);

create index if not exists idx_diagnoses_patient_id on diagnoses(patient_id);
create index if not exists idx_diagnoses_icd_code on diagnoses(icd_code);
create index if not exists idx_diagnoses_severity on diagnoses(severity);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_users_updated_at on users;
create trigger update_users_updated_at
before update on users
for each row
execute function update_updated_at_column();

drop trigger if exists update_doctors_updated_at on doctors;
create trigger update_doctors_updated_at
before update on doctors
for each row
execute function update_updated_at_column();

drop trigger if exists update_patients_updated_at on patients;
create trigger update_patients_updated_at
before update on patients
for each row
execute function update_updated_at_column();

drop trigger if exists update_diagnoses_updated_at on diagnoses;
create trigger update_diagnoses_updated_at
before update on diagnoses
for each row
execute function update_updated_at_column();

alter table users enable row level security;
alter table doctors enable row level security;
alter table patients enable row level security;
alter table diagnoses enable row level security;