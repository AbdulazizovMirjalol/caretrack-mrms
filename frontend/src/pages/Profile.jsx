import { useState } from "react";
import { KeyRound, Save, ShieldCheck, UserCircle } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const roleLabels = {
  admin: "Administrator",
  clinician: "Clinician",
  receptionist: "Receptionist",
};

const Profile = () => {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");

  const handleProfileChange = (event) => {
    setProfileData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handlePasswordChange = (event) => {
    setPasswordData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const updateProfile = async (event) => {
    event.preventDefault();
    setError("");
    setProfileMessage("");

    try {
      await api.put("/auth/profile", profileData);
      setProfileMessage(
        "Profile updated successfully. Please refresh if the sidebar does not update.",
      );
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed.");
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setError("");
    setPasswordMessage("");

    try {
      await api.put("/auth/change-password", passwordData);
      setPasswordMessage("Password changed successfully.");

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Password change failed.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
          Account Settings
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Profile & Security
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Manage your account details and password security.
        </p>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-xl border border-slate-200 bg-white shadow-panel">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-950">
              Account Overview
            </h2>
          </div>

          <div className="p-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-teal-700 ring-1 ring-slate-200">
                <UserCircle size={38} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                {user?.full_name}
              </h3>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {user?.email}
              </p>

              <span className="mt-4 inline-flex rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-bold uppercase text-teal-700">
                {roleLabels[user?.role] || user?.role}
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <ShieldCheck size={17} />
                Access role
              </div>

              <p className="mt-2 text-sm font-medium text-slate-600">
                Your permissions are controlled by your assigned role.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <form
            onSubmit={updateProfile}
            className="rounded-xl border border-slate-200 bg-white shadow-panel"
          >
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-bold text-slate-950">
                General Profile
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Update your name and email address.
              </p>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Full name
                </span>
                <input
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleProfileChange}
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
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
              <p className="text-sm font-semibold text-green-700">
                {profileMessage}
              </p>

              <button className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800">
                <Save size={16} />
                Save profile
              </button>
            </div>
          </form>

          <form
            onSubmit={changePassword}
            className="rounded-xl border border-slate-200 bg-white shadow-panel"
          >
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-bold text-slate-950">
                Password Security
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Change your account password.
              </p>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Current password
                </span>
                <input
                  name="current_password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  New password
                </span>
                <input
                  name="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Confirm new password
                </span>
                <input
                  name="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                  required
                />
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
              <p className="text-sm font-semibold text-green-700">
                {passwordMessage}
              </p>

              <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800">
                <KeyRound size={16} />
                Change password
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Profile;
