import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "clinician", "receptionist"],
  },
  {
    label: "Doctors",
    path: "/doctors",
    icon: Stethoscope,
    roles: ["admin", "clinician", "receptionist"],
  },
  {
    label: "Patients",
    path: "/patients",
    icon: Users,
    roles: ["admin", "clinician", "receptionist"],
  },
  {
    label: "Diagnoses",
    path: "/diagnoses",
    icon: ClipboardList,
    roles: ["admin", "clinician"],
  },
];

const roleLabels = {
  admin: "Administrator",
  clinician: "Clinician",
  receptionist: "Receptionist",
};

const SidebarContent = ({ user, onLogout, onClose }) => {
  const allowedNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  return (
    <>
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 text-teal-700">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-950">
              CareTrack MRMS
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Medical Records System
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5">
        {allowedNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition",
                  isActive
                    ? "bg-teal-700 text-white shadow-panel"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-teal-700 ring-1 ring-slate-200">
              <ShieldCheck size={18} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">
                {user?.full_name}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {roleLabels[user?.role] || user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f3f6f9]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white text-slate-900 lg:flex lg:flex-col">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="relative flex h-full w-80 flex-col bg-white shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 rounded-lg border border-slate-200 bg-white p-2 text-slate-700"
            >
              <X size={18} />
            </button>

            <SidebarContent
              user={user}
              onLogout={handleLogout}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
                  CareTrack Clinic
                </p>
                <h2 className="text-lg font-bold text-slate-950 md:text-xl">
                  Medical Records Management
                </h2>
              </div>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-teal-700">
                <Activity size={18} />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                {roleLabels[user?.role] || user?.role}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
