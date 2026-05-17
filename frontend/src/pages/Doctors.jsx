import { useCallback, useEffect, useState } from "react";
import { Edit, Plus, Search, Trash2, X } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  full_name: "",
  specialty: "",
  department: "",
  phone: "",
  email: "",
  account_password: "Password123!",
};

const departments = [
  "Cardiology",
  "Neurology",
  "Dermatology",
  "Orthopedics",
  "General Practice",
  "Diagnostics",
];

const Doctors = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);

    const params = new URLSearchParams();

    if (search.trim()) {
      params.append("search", search.trim());
    }

    if (department) {
      params.append("department", department);
    }

    const url = params.toString()
      ? `/doctors?${params.toString()}`
      : "/doctors";

    try {
      const { data } = await api.get(url);
      setDoctors(data.doctors || []);
    } finally {
      setLoading(false);
    }
  }, [search, department]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchDoctors]);

  const openCreateForm = () => {
    setEditingDoctor(null);
    setFormData(initialForm);
    setError("");
    setFormOpen(true);
  };

  const openEditForm = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      full_name: doctor.full_name,
      specialty: doctor.specialty,
      department: doctor.department,
      phone: doctor.phone,
      email: doctor.email,
      account_password: "",
    });
    setError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingDoctor(null);
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
      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor.id}`, formData);
      } else {
        await api.post("/doctors", formData);
      }

      await fetchDoctors();
      closeForm();
    } catch (err) {
      setError(err.response?.data?.message || "Doctor action failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (doctor) => {
    const confirmed = window.confirm(
      `Delete ${doctor.full_name}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await api.delete(`/doctors/${doctor.id}`);
      await fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.message || "Doctor delete failed.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
              Doctor Management
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-950">Doctors</h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Manage doctor profiles, specialties, departments and contact
              information for CareTrack Clinic.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-panel transition hover:bg-teal-800"
            >
              <Plus size={17} />
              Add doctor
            </button>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel">
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-100">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, specialty, department, email or phone..."
              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          >
            <option value="">All departments</option>
            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-bold">Doctor</th>
                <th className="px-5 py-3 font-bold">Specialty</th>
                <th className="px-5 py-3 font-bold">Department</th>
                <th className="px-5 py-3 font-bold">Contact</th>
                {isAdmin && (
                  <th className="px-5 py-3 text-right font-bold">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading && (
                <tr>
                  <td className="px-5 py-8 text-slate-500" colSpan="5">
                    Loading doctors...
                  </td>
                </tr>
              )}

              {!loading &&
                doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-slate-950">
                          {doctor.full_name}
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          {doctor.email}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      {doctor.specialty}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
                        {doctor.department}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-600">
                      {doctor.phone}
                    </td>

                    {isAdmin && (
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditForm(doctor)}
                            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                            title="Edit doctor"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(doctor)}
                            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                            title="Delete doctor"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

              {!loading && doctors.length === 0 && (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-slate-500"
                    colSpan="5"
                  >
                    No doctors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
                  {editingDoctor ? "Edit Doctor" : "New Doctor"}
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  {editingDoctor
                    ? "Update doctor profile"
                    : "Create doctor profile"}
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
                    placeholder="Dr. Ali Karimov"
                    required
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Specialty
                  </span>

                  <input
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                    placeholder="Cardiologist"
                    required
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Department
                  </span>

                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                    placeholder="Cardiology"
                    required
                  />
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
                    placeholder="+998901112233"
                    required
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Email
                  </span>

                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                    placeholder="doctor@caretrack.com"
                    required
                  />
                </label>

                {!editingDoctor && (
                  <label className="md:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Login password for doctor account
                    </span>

                    <input
                      name="account_password"
                      type="password"
                      value={formData.account_password}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                      placeholder="Password123!"
                      required
                    />

                    <p className="mt-2 text-xs font-medium text-slate-500">
                      This password will be used by the doctor to sign in as a
                      clinician.
                    </p>
                  </label>
                )}

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
                      : editingDoctor
                        ? "Save changes"
                        : "Create doctor"}
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

export default Doctors;
