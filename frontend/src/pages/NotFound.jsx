import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-panel">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-700">
          <AlertTriangle size={26} />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          The page you are trying to access does not exist or you do not have
          permission to view it.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
