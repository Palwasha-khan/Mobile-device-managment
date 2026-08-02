import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDeviceHistory } from "../../hooks/useDeviceHistory";
import ComplianceBadge from "../../components/shared/ComplianceBadge";
import LocationHistoryTab from "./components/LocationHistoryTab";
import PermissionHistoryTab from "./components/PermissionHistoryTab";
import EditDeviceForm from "./components/EditDeviceForm";
import CommandPanel from "./components/CommandPanel";
import PromoteToAdminButton from "./components/PromoteToAdminButton";

export default function DeviceDetailPage() {
  const { id } = useParams();
  const [tab, setTab] = useState("location");
  const { data, isLoading, isError } = useDeviceHistory(id);

  if (isLoading) return <p className="text-slate-500">Loading...</p>;
  if (isError) return <p className="text-red-600">Failed to load device.</p>;

  const { device, locationHistory, permissionHistory } = data;

  return (
    <div className="space-y-6">
      <Link to="/devices" className="text-sm text-blue-600 hover:underline">
        ← Back to Devices
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{device.employeeName}</h1>
          <p className="text-slate-500 text-sm">{device.email} · {device.deviceId}</p>
        </div>
        <ComplianceBadge isCompliant={device.isCompliant} />
      </div>

      <PromoteToAdminButton deviceId={device._id} employeeName={device.employeeName} />

      <CommandPanel deviceId={device._id} />

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="flex border-b border-slate-200">
          {["location", "permissions"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium capitalize ${
                tab === t
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t} History
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === "location" ? (
            <LocationHistoryTab history={locationHistory} />
          ) : (
            <PermissionHistoryTab history={permissionHistory} />
          )}
        </div>
      </div>

      <EditDeviceForm device={device} />
    </div>
  );
}