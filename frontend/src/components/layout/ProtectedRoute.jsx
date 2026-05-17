import { Navigate, Outlet } from "react-router-dom";
import { Activity } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 shadow-2xl backdrop-blur">
          <Activity className="animate-pulse text-cyan-300" size={24} />
          <span className="text-sm font-semibold">Loading CareTrack...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
