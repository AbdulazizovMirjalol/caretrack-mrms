import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Phone,
  Stethoscope,
  User,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";

const severityClasses = {
  mild: "bg-green-50 text-green-700 border-green-100",
  moderate: "bg-amber-50 text-amber-700 border-amber-100",
  severe: "bg-orange-50 text-orange-700 border-orange-100",
  critical: "bg-red-50 text-red-700 border-red-100",
};

const PatientProfile = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/patients/${id}/profile`);
      setPatient(data.patient);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-sm font-semibold text-slate-500">
          Loading patient profile...
        </p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-sm font-semibold text-slate-500">
          Patient profile not found.
        </p>
      </div>
    );
  }

  const diagnoses = patient.diagnoses || [];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-panel">
        <div className="mb-5">
          <Link
            to="/patients"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800"
          >
            <ArrowLeft size={16} />
            Back to patients
          </Link>
        </div>

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
              Patient Profile
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-950">
              {patient.full_name}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Full patient profile showing personal details, assigned doctor and
              diagnosis history.
            </p>
          </div>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold capitalize text-slate-700">
            {patient.gender}
          </span>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-xl border border-slate-200 bg-white shadow-panel">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-950">
              Personal information
            </h2>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <User size={17} />
                Full name
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {patient.full_name}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Calendar size={17} />
                Date of birth
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {patient.date_of_birth}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Phone size={17} />
                Phone
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {patient.phone}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <FileText size={17} />
                Address
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {patient.address}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-panel">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-950">
              Assigned doctor
            </h2>
          </div>

          <div className="p-5">
            {patient.doctor ? (
              <div className="rounded-lg border border-teal-100 bg-teal-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-teal-700 ring-1 ring-teal-100">
                    <Stethoscope size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      {patient.doctor.full_name}
                    </p>
                    <p className="text-xs font-semibold text-teal-700">
                      {patient.doctor.specialty}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Department
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {patient.doctor.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Contact
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {patient.doctor.phone}
                    </p>
                    <p className="font-medium text-slate-600">
                      {patient.doctor.email}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-500">
                No doctor assigned.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-panel">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              Diagnosis history
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              All diagnosis records linked to this patient.
            </p>
          </div>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
            {diagnoses.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-bold">ICD code</th>
                <th className="px-5 py-3 font-bold">Description</th>
                <th className="px-5 py-3 font-bold">Severity</th>
                <th className="px-5 py-3 font-bold">Date</th>
                <th className="px-5 py-3 font-bold">Notes</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {diagnoses.map((diagnosis) => (
                <tr key={diagnosis.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold text-slate-950">
                    {diagnosis.icd_code}
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-700">
                    {diagnosis.description}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={[
                        "rounded-full border px-2.5 py-1 text-xs font-bold capitalize",
                        severityClasses[diagnosis.severity] ||
                          "border-slate-200 bg-slate-50 text-slate-700",
                      ].join(" ")}
                    >
                      {diagnosis.severity}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-600">
                    {diagnosis.diagnosed_at}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {diagnosis.notes || "No notes"}
                  </td>
                </tr>
              ))}

              {diagnoses.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-slate-500" colSpan="5">
                    No diagnosis records for this patient.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default PatientProfile;
