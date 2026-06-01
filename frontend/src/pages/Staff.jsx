import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, Search, Trash2, X } from "lucide-react";
import { api, getApiErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  full_name: "",
  email: "",
  role: "receptionist",
  password: "Password123!",
  doctor_id: "",
};

const roleLabels = {
  admin: "Administrator",
  clinician: "Clinician",
  receptionist: "Receptionist",
};

const Staff = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState("Password123!");

  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get("/doctors");
      setDoctors(data.doctors || []);
    } catch (err) {
      setDoctors([]);
      setLoadError(
        getApiErrorMessage(
          err,
          "Unable to load doctors for staff links. Please try again shortly.",
        ),
      );
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (search.trim()) params.append("search", search.trim());
    if (role) params.append("role", role);

    const url = params.toString() ? `/users?${params.toString()}` : "/users";

    try {
      const { data } = await api.get(url);
      setUsers(data.users || []);
      setLoadError("");
    } catch (err) {
      setUsers([]);
      setLoadError(
        getApiErrorMessage(
          err,
          "Unable to load staff accounts. Please refresh the page or try again shortly.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const openCreate = () => {
    setFormData(initialForm);
    setError("");
    setFormOpen(true);
  };

  const closeCreate = () => {
    setFormOpen(false);
    setFormData(initialForm);
    setError("");
  };

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const createUser = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.post("/users", formData);
      await fetchUsers();
      closeCreate();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Staff account could not be created. Please check the form and try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUser = async (user) => {
    if (user.id === currentUser?.id) return;

    const confirmed = window.confirm(`Delete account for ${user.full_name}?`);
    if (!confirmed) return;

    try {
      await api.delete(`/users/${user.id}`);
      await fetchUsers();
    } catch (err) {
      alert(
        getApiErrorMessage(
          err,
          "Staff account could not be deleted. Please try again.",
        ),
      );
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    if (!resetUser) return;

    try {
      await api.put(`/users/${resetUser.id}/password`, {
        new_password: newPassword,
      });

      setResetUser(null);
      setNewPassword("Password123!");
      alert("Password reset successfully.");
    } catch (err) {
      alert(
        getApiErrorMessage(
          err,
          "Password could not be reset. Please try again.",
        ),
      );
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
              Staff Management
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">
              Staff Accounts
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Manage staff login accounts, roles and password resets.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-panel hover:bg-teal-800"
          >
            <Plus size={17} />
            Add staff account
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-100">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-transparent text-sm font-medium outline-none"
            />
          </div>

          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          >
            <option value="">All roles</option>
            <option value="admin">Administrator</option>
            <option value="clinician">Clinician</option>
            <option value="receptionist">Receptionist</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-panel">
        {loadError && (
          <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700">
            {loadError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-bold">Staff</th>
                <th className="px-5 py-3 font-bold">Role</th>
                <th className="px-5 py-3 font-bold">Linked Doctor</th>
                <th className="px-5 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading && (
                <tr>
                  <td className="px-5 py-8 text-slate-500" colSpan="4">
                    Loading staff accounts...
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((staffUser) => {
                  const isCurrentUser = staffUser.id === currentUser?.id;

                  return (
                    <tr key={staffUser.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-950">
                          {staffUser.full_name}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {staffUser.email}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
                          {roleLabels[staffUser.role] || staffUser.role}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-700">
                          {staffUser.doctor?.full_name || "Not linked"}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {staffUser.doctor?.department || ""}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setResetUser(staffUser)}
                            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                            title="Reset password"
                          >
                            <KeyRound size={16} />
                          </button>

                          <button
                            onClick={() => deleteUser(staffUser)}
                            disabled={isCurrentUser}
                            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-600"
                            title={
                              isCurrentUser
                                ? "You cannot delete your own account"
                                : "Delete account"
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!loading && users.length === 0 && (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-slate-500"
                    colSpan="4"
                  >
                    No staff accounts found.
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
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
                  New Staff Account
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Create login account
                </h2>
              </div>

              <button
                onClick={closeCreate}
                className="rounded-lg border border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={createUser}
              className="grid gap-4 p-6 md:grid-cols-2"
            >
              {error && (
                <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Full name
                </span>
                <input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
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
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Password
                </span>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Role
                </span>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="admin">Administrator</option>
                  <option value="clinician">Clinician</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </label>

              {formData.role === "clinician" && (
                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Linked doctor
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
              )}

              <div className="mt-3 flex justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={closeCreate}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  disabled={submitting}
                  className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Create account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <form
            onSubmit={resetPassword}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
                  Reset Password
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  {resetUser.full_name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setResetUser(null)}
                className="rounded-lg border border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  New password
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </label>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetUser(null)}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800">
                  Reset password
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Staff;
