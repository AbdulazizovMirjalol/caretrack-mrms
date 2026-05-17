import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import Diagnoses from "./pages/Diagnoses";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Staff from "./pages/Staff";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute roles={["admin", "clinician", "receptionist"]} />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id" element={<PatientProfile />} />
          <Route path="/profile" element={<Profile />} />

          <Route element={<ProtectedRoute roles={["admin", "clinician"]} />}>
            <Route path="/diagnoses" element={<Diagnoses />} />
          </Route>
          
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/staff" element={<Staff />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
