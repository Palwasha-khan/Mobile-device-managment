import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div>Dashboard placeholder - built in Phase 4</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}