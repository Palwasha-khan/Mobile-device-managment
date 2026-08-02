import { useState } from "react";
import { updateDevice } from "../../../api/endpoints/deviceApi";
import { useQueryClient } from "@tanstack/react-query";

export default function EditDeviceForm({ device }) {
  const [employeeName, setEmployeeName] = useState(device.employeeName);
  const [email, setEmail] = useState(device.email);
  const [deviceId, setDeviceId] = useState(device.deviceId);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const queryClient = useQueryClient();

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateDevice(device._id, { employeeName, email, deviceId });
      setMessage("Saved successfully.");
      queryClient.invalidateQueries(["deviceHistory", device._id]);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
      <p className="text-sm font-medium text-slate-700">Edit Employee Details</p>
      <div>
        <label className="text-xs text-slate-500 block mb-1">Name</label>
        <input
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 block mb-1">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 block mb-1">Device ID</label>
        <input
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md px-4 py-2 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </form>
  );
}