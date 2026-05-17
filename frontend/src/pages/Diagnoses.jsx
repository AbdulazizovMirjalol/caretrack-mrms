import { useCallback, useEffect, useState } from "react";
import { Edit, Plus, Search, Trash2, X } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  patient_id: "",
  icd_code: "",
  description: "",
  severity: "mild",
  notes: "",
  diagnosed_at: "",
};

const severityClasses = {
  mild: "bg-green-50 text-green-700 border-green-100",
  moderate: "bg-amber-50 text-amber-700 border-amber-100",
  severe: "bg-orange-50 text-orange-700 border-orange-100",
  critical: "bg-red-50 text-red-700 border-red-100",
};

const Diagnoses = () => {
  const { user } = useAuth();

  const canCreate = user?.role === "admin";
  const canEdit = user?.role === "admin" || user?.role === "clinician";
  const canDelete = user?.role === "admin";

  const [diagnoses, setDiagnoses] = useState([]);
  const [patients, setPatients] = useState([]);

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [patientId, setPatientId] = useState("");

  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPatients = async () => {
    const { data } = await api.get("/patients");
    setPatients(data.patients || []);
  };

  const fetchDiagnoses = useCallback(async () => {
    setLoading(true);

    const params = new URLSearchParams();

    if (search.trim()) params.append("search", search.trim());
    if (severity) params.append("severity", severity);
    if (patientId) params.append("patientId", patientId);

    const url = params.toString()
      ? `/diagnoses?${params.toString()}`
      : "/diagnoses";

    try {
      const { data } = await api.get(url);
      setDiagnoses(data.diagnoses || []);
    } finally {
      setLoading(false);
    }
  }, [search, severity, patientId]);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDiagnoses();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchDiagnoses]);

  const openCreateForm = () => {
    const today = new Date().toISOString().split("T")[0];

    setEditingDiagnosis(null);
    setFormData({
      ...initialForm,
      patient_id: patients[0]?.id || "",
      diagnosed_at: today,
    });
    setError("");
    setFormOpen(true);
  };

  const openEditForm = (diagnosis) => {
    setEditingDiagnosis(diagnosis);
    setFormData({
      patient_id: diagnosis.patient_id || "",
      icd_code: diagnosis.icd_code || "",
      description: diagnosis.description || "",
      severity: diagnosis.severity || "mild",
      notes: diagnosis.notes || "",
      diagnosed_at: diagnosis.diagnosed_at || "",
    });
    setError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingDiagnosis(null);
    setFormData(initialForm);
    setError("");
  };

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (editingDiagnosis) {
        await api.put(`/diagnoses/${editingDiagnosis.id}`, formData);
      } else {
        await api.post("/diagnoses", formData);
      }

      await fetchDiagnoses();
      closeForm();
    } catch (err) {
      setError(err.response?.data?.message || "Diagnosis action failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (diagnosis) => {
    const confirmed = window.confirm(
      `Delete diagnosis ${diagnosis.icd_code}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await api.delete(`/diagnoses/${diagnosis.id}`);
      await fetchDiagnoses();
    } catch (err) {
      alert(err.response?.data?.message || "Diagnosis delete failed.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
              Diagnosis Management
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-950">
              Diagnoses
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Manage ICD diagnosis records, severity levels and patient-linked
              clinical history.
            </p>
          </div>

          {canCreate && (
            <button
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-panel transition hover:bg-teal-800"
            >
              <Plus size={17} />
              Add diagnosis
            </button>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel">
        <div className="grid gap-4 xl:grid-cols-[1fr_200px_280px]">
          <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-100">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by ICD code, description or notes..."
              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          >
            <option value="">All severities</option>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={patientId}
            onChange={(event) => setPatientId(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          >
            <option value="">All patients</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-bold">ICD Code</th>
                <th className="px-5 py-3 font-bold">Description</th>
                <th className="px-5 py-3 font-bold">Patient</th>
                <th className="px-5 py-3 font-bold">Assigned Doctor</th>
                <th className="px-5 py-3 font-bold">Severity</th>
                <th className="px-5 py-3 font-bold">Date</th>
                {(canEdit || canDelete) && (
                  <th className="px-5 py-3 text-right font-bold">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading && (
                <tr>
                  <td className="px-5 py-8 text-slate-500" colSpan="7">
                    Loading diagnoses...
                  </td>
                </tr>
              )}

              {!loading &&
                diagnoses.map((diagnosis) => (
                  <tr key={diagnosis.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-950">
                      {diagnosis.icd_code}
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {diagnosis.description}
                        </p>
                        <p className="mt-0.5 max-w-xs truncate text-xs font-medium text-slate-500">
                          {diagnosis.notes || "No notes"}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">
                        {diagnosis.patient?.full_name || "Unknown patient"}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {diagnosis.patient?.phone || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-700">
                        {diagnosis.patient?.doctor?.full_name || "Not assigned"}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {diagnosis.patient?.doctor?.department || ""}
                      </p>
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

                    {(canEdit || canDelete) && (
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {canEdit && (
                            <button
                              onClick={() => openEditForm(diagnosis)}
                              className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                              title="Edit diagnosis"
                            >
                              <Edit size={16} />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleDelete(diagnosis)}
                              className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                              title="Delete diagnosis"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

              {!loading && diagnoses.length === 0 && (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-slate-500"
                    colSpan="7"
                  >
                    No diagnosis records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
                  {editingDiagnosis ? "Edit Diagnosis" : "New Diagnosis"}
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  {editingDiagnosis
                    ? "Update diagnosis record"
                    : "Create diagnosis record"}
                </h2>
              </div>

              <button
                onClick={closeForm}
                className="rounded-lg border border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="grid gap-4 md:grid-cols-2"
              >
                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Patient
                  </span>

                  <select
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                    required
                  >
                    <option value="">Select patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.full_name} —{" "}
                        {patient.doctor?.full_name || "No doctor"}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    ICD code
                  </span>

                  <input
                    name="icd_code"
                    value={formData.icd_code}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium uppercase outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                    placeholder="I10"
                    required
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Severity
                  </span>

                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                    required
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                    <option value="critical">Critical</option>
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Diagnosed date
                  </span>

                  <input
                    name="diagnosed_at"
                    type="date"
                    value={formData.diagnosed_at}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Description
                  </span>

                  <input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                    placeholder="Essential primary hypertension"
                    required
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Notes
                  </span>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                    placeholder="Clinical notes and follow-up recommendations..."
                  />
                </label>

                <div className="mt-3 flex justify-end gap-3 md:col-span-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
                  >
                    {submitting
                      ? "Saving..."
                      : editingDiagnosis
                        ? "Save changes"
                        : "Create diagnosis"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnoses;
