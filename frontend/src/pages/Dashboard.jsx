import { useEffect, useState } from "react";
import { AlertTriangle, ClipboardList, Stethoscope, Users } from "lucide-react";
import { api, getApiErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

const statCards = [
  {
    key: "totalDoctors",
    label: "Total Doctors",
    icon: Stethoscope,
    tone: "teal",
  },
  {
    key: "totalPatients",
    label: "Total Patients",
    icon: Users,
    tone: "blue",
  },
  {
    key: "totalDiagnoses",
    label: "Total Diagnoses",
    icon: ClipboardList,
    tone: "slate",
  },
  {
    key: "criticalDiagnoses",
    label: "Critical Cases",
    icon: AlertTriangle,
    tone: "red",
  },
];

const toneClasses = {
  teal: "bg-teal-50 text-teal-700 border-teal-100",
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  slate: "bg-slate-50 text-slate-700 border-slate-200",
  red: "bg-red-50 text-red-700 border-red-100",
};

const severityClasses = {
  mild: "bg-green-50 text-green-700 border-green-100",
  moderate: "bg-amber-50 text-amber-700 border-amber-100",
  severe: "bg-orange-50 text-orange-700 border-orange-100",
  critical: "bg-red-50 text-red-700 border-red-100",
};

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get("/dashboard/stats");
      setDashboard(data);
      setError("");
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Unable to load dashboard data. Please refresh the page or try again shortly.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-sm font-semibold text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-panel">
        <p className="text-sm font-bold text-red-700">{error}</p>
      </div>
    );
  }

  const stats = dashboard?.stats || {};
  const recentPatients = dashboard?.recentPatients || [];
  const recentDiagnoses = dashboard?.recentDiagnoses || [];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
              Dashboard
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-950">
              {user?.role === "clinician"
                ? "My Clinical Overview"
                : "Clinical Operations Overview"}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {user?.role === "clinician"
                ? "Monitor your assigned patients and diagnosis records from your CareTrack clinician workspace."
                : "Monitor doctors, registered patients and diagnosis activity across CareTrack Clinic’s medical records system."}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
            Live system data
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.key}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel"
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-lg border",
                    toneClasses[card.tone],
                  ].join(" ")}
                >
                  <Icon size={21} />
                </div>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Live
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-slate-950">
                {stats[card.key] ?? 0}
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                {card.label}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white shadow-panel">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-950">
              Recent Patients
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Latest patient registrations in the system.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-bold">Patient</th>
                  <th className="px-5 py-3 font-bold">Doctor</th>
                  <th className="px-5 py-3 font-bold">Phone</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {recentPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {patient.full_name}
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {patient.doctor?.full_name || "Not assigned"}
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {patient.phone}
                    </td>
                  </tr>
                ))}

                {recentPatients.length === 0 && (
                  <tr>
                    <td className="px-5 py-6 text-slate-500" colSpan="3">
                      No recent patients.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-panel">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-950">
              Recent Diagnoses
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Latest diagnosis records and severity levels.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-bold">ICD</th>
                  <th className="px-5 py-3 font-bold">Description</th>
                  <th className="px-5 py-3 font-bold">Severity</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {recentDiagnoses.map((diagnosis) => (
                  <tr key={diagnosis.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {diagnosis.icd_code}
                    </td>

                    <td className="px-5 py-3 text-slate-600">
                      {diagnosis.description}
                    </td>

                    <td className="px-5 py-3">
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
                  </tr>
                ))}

                {recentDiagnoses.length === 0 && (
                  <tr>
                    <td className="px-5 py-6 text-slate-500" colSpan="3">
                      No recent diagnoses.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
