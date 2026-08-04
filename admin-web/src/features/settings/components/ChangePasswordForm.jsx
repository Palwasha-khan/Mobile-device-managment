import { useState } from "react";
import toast from "react-hot-toast";
import { changePasswordRequest } from "../../../api/endpoints/authApi";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await changePasswordRequest(currentPassword, newPassword);
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 max-w-sm">
      <p className="text-sm font-medium text-slate-700">Change Password</p>
      <div>
        <label className="text-xs text-slate-500 block mb-1">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 block mb-1">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md px-4 py-2 disabled:opacity-50"
      >
        {saving ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}