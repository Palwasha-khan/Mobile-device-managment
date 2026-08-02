import { useNavigate } from "react-router-dom";
import ComplianceBadge from "../../../components/shared/ComplianceBadge";

export default function DeviceTable({ devices }) {
  const navigate = useNavigate();

  if (devices.length === 0) {
    return <p className="text-slate-400 text-sm py-12 text-center">No devices found.</p>;
  }

  return (
    <table className="w-full text-sm bg-white rounded-lg border border-slate-200 overflow-hidden">
      <thead className="bg-slate-50 text-slate-500 text-left">
        <tr>
          <th className="px-4 py-3 font-medium">Employee</th>
          <th className="px-4 py-3 font-medium">Device ID</th>
          <th className="px-4 py-3 font-medium">Status</th>
          <th className="px-4 py-3 font-medium">Last Ping</th>
        </tr>
      </thead>
      <tbody>
        {devices.map((device) => (
          <tr
            key={device._id}
            onClick={() => navigate(`/devices/${device._id}`)}
            className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition"
          >
            <td className="px-4 py-3 font-medium text-slate-900">{device.employeeName}</td>
            <td className="px-4 py-3 text-slate-500">{device.deviceId}</td>
            <td className="px-4 py-3">
              <ComplianceBadge isCompliant={device.isCompliant} />
            </td>
            <td className="px-4 py-3 text-slate-500">
              {device.lastPingAt ? new Date(device.lastPingAt).toLocaleString() : "Never"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}