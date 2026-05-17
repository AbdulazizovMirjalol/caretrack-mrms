import { useCallback, useEffect, useState } from "react";
import { Edit, Eye, Plus, Search, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  full_name: "",
  date_of_birth: "",
  gender: "male",
  phone: "",
  address: "",
  doctor_id: "",
};

const Patients = () => {
  const { user } = useAuth();

  const canCreate = user?.role === "admin" || user?.role === "receptionist";
  const canEdit = user?.role === "admin" || user?.role === "clinician";
  const canDelete = user?.role === "admin";

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [doctorId, setDoctorId] = useState("");

  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = async () => {
    const { data } = await api.get("/doctors");
    setDoctors(data.doctors || []);
  };

  const fetchPatients = useCallback(async () => {
    setLoading(true);

    const params = new URLSearchParams();

    if (search.trim()) params.append("search", search.trim());
    if (gender) params.append("gender", gender);
    if (doctorId) params.append("doctorId", doctorId);

    const url = params.toString()
      ? `/patients?${params.toString()}`
      : "/patients";

    try {
      const { data } = await api.get(url);
      setPatients(data.patients || []);
    } finally {
      setLoading(false);
    }
  }, [search, gender, doctorId]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchPatients]);

  const openCreateForm = () => {
    setEditingPatient(null);
    setFormData({
      ...initialForm,
      doctor_id: doctors[0]?.id || "",
    });
    setError("");
    setFormOpen(true);
  };

  const openEditForm = (patient) => {
    setEditingPatient(patient);
    setFormData({
      full_name: patient.full_name || "",
      date_of_birth: patient.date_of_birth || "",
      gender: patient.gender || "male",
      phone: patient.phone || "",
      address: patient.address || "",
      doctor_id: patient.doctor_id || "",
    });
    setError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingPatient(null);
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
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}`, formData);
      } else {
        await api.post("/patients", formData);
      }

      await fetchPatients();
      closeForm();
    } catch (err) {
      setError(err.response?.data?.message || "Patient action failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (patient) => {
    const confirmed = window.confirm(
      `Delete ${patient.full_name}? Related diagnosis records will also be deleted.`,
    );

    if (!confirmed) return;

    try {
      await api.delete(`/patients/${patient.id}`);
      await fetchPatients();
    } catch (err) {
      alert(err.response?.data?.message || "Patient delete failed.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
              Patient Management
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-950">
              {user?.role === "clinician" ? "My Patients" : "Patients"}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {user?.role === "clinician"
                ? "View and update patients assigned to your clinician account."
                : "Register patients, assign doctors and manage personal clinical information."}
            </p>
          </div>

          {canCreate && (
            <button
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-panel transition hover:bg-teal-800"
            >
              <Plus size={17} />
              Add patient
            </button>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel">
        <div className="grid gap-4 xl:grid-cols-[1fr_180px_260px]">
          <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-100">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by patient name, phone or address..."
              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          >
            <option value="">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <select
            value={doctorId}
            onChange={(event) => setDoctorId(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          >
            <option value="">All doctors</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.full_name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-bold">Patient</th>
                <th className="px-5 py-3 font-bold">Gender</th>
                <th className="px-5 py-3 font-bold">Date of birth</th>
                <th className="px-5 py-3 font-bold">Assigned doctor</th>
                <th className="px-5 py-3 font-bold">Phone</th>
                <th className="px-5 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading && (
                <tr>
                  <td className="px-5 py-8 text-slate-500" colSpan="6">
                    Loading patients...
                  </td>
                </tr>
              )}

              {!loading &&
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-slate-950">
                          {patient.full_name}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          {patient.address}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold capitalize text-slate-700">
                        {patient.gender}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-600">
                      {patient.date_of_birth}
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-slate-900">
                          {patient.doctor?.full_name || "Not assigned"}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {patient.doctor?.department || ""}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-600">
                      {patient.phone}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/patients/${patient.id}`}
                          className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                          title="View profile"
                        >
                          <Eye size={16} />
                        </Link>

                        {canEdit && (
                          <button
                            onClick={() => openEditForm(patient)}
                            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                            title="Edit patient"
                          >
                            <Edit size={16} />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => handleDelete(patient)}
                            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                            title="Delete patient"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && patients.length === 0 && (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-slate-500"
                    colSpan="6"
                  >
                    No patients found.
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
                  {editingPatient ? "Edit Patient" : "New Patient"}
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  {editingPatient
                    ? "Update patient record"
                    : "Register new patient"}
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
                    Full name
                  </span>
                  <input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                    placeholder="Azizbek Sobirov"
                    required
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Date of birth
                  </span>
                  <input
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                    required
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Gender
                  </span>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Phone
                  </span>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                    placeholder="+998901234567"
                    required
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Assigned doctor
                  </span>
                  <select
                    name="doctor_id"
                    value={formData.doctor_id}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                    required
                  >
                    <option value="">Select doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.full_name} — {doctor.department}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Address
                  </span>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                    placeholder="Tashkent, Yunusabad district"
                    required
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
                      : editingPatient
                        ? "Save changes"
                        : "Create patient"}
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

export default Patients;
