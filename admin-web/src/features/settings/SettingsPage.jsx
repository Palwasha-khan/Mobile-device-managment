import { useAuth } from "../../context/AuthContext";
import ChangePasswordForm from "./components/ChangePasswordForm";

export default function SettingsPage() {
  const { admin } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <div className="bg-white rounded-lg border border-slate-200 p-4 max-w-sm">
        <p className="text-sm font-medium text-slate-700 mb-3">Your Profile</p>
        <p className="text-sm text-slate-600">Name: {admin?.name}</p>
        <p className="text-sm text-slate-600">Email: {admin?.email}</p>
        <p className="text-sm text-slate-600 capitalize">Role: {admin?.role}</p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}