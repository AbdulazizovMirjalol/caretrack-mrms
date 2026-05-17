import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "admin@caretrack.com",
    password: "Password123!",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f9]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden border-r border-slate-200 bg-white lg:flex lg:flex-col lg:justify-between">
          <div className="p-12">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-700">
                <ShieldCheck size={26} />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-950">
                  CareTrack MRMS
                </h1>
                <p className="text-sm font-medium text-slate-500">
                  Medical Records System
                </p>
              </div>
            </div>

            <div className="mt-24 max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
                CareTrack Clinic
              </p>

              <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-950">
                Institutional medical records management for clinic staff.
              </h2>

              <p className="mt-5 text-base leading-7 text-slate-600">
                A secure internal system for managing doctors, patient records
                and diagnosis histories with role-based access control.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-12">
            <div className="grid grid-cols-3 gap-4">
              {["Doctors", "Patients", "Diagnoses"].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-panel"
                >
                  <p className="text-sm font-bold text-slate-950">{item}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    CRUD module
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-700">
                <ShieldCheck size={26} />
              </div>

              <h1 className="text-2xl font-bold text-slate-950">
                CareTrack MRMS
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Medical Records System
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-elevated">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
                  Secure Staff Login
                </p>

                <h2 className="mt-3 text-2xl font-bold text-slate-950">
                  Sign in to CareTrack
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Use your authorised clinic account to access medical records.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Email address
                  </span>

                  <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-100">
                    <Mail size={18} className="text-slate-400" />

                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="admin@caretrack.com"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Password
                  </span>

                  <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-100">
                    <Lock size={18} className="text-slate-400" />

                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="Password123!"
                      required
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-panel transition hover:bg-teal-800 disabled:opacity-60"
                >
                  {submitting ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                <p className="font-bold text-slate-800">Test accounts</p>
                <p>admin@caretrack.com / Password123!</p>
                <p>clinician@caretrack.com / Password123!</p>
                <p>receptionist@caretrack.com / Password123!</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
