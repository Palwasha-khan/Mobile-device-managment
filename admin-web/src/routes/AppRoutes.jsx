import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardPage from "../features/dashboard/DashboardPage";
import DevicesListPage from "../features/devices/DevicesListPage";
import DeviceDetailPage from "../features/devices/DeviceDetailPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
               <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
            path="/devices"
            element={
                <ProtectedRoute>
                <DashboardLayout>
                    <DevicesListPage />
                </DashboardLayout>
                </ProtectedRoute>
            }
            />
            <Route
            path="/devices/:id"
            element={
                <ProtectedRoute>
                <DashboardLayout>
                    <DeviceDetailPage />
                </DashboardLayout>
                </ProtectedRoute>
            }
            />
    </Routes>
  );
}