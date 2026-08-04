import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { approveDevice, rejectDevice } from "../../../api/endpoints/deviceApi";

export default function PendingRow({ device }) {
  const [actioning, setActioning] = useState(null);
  const queryClient = useQueryClient();

  const handleApprove = async () => {
    setActioning("approve");
    try {
      await approveDevice(device._id);
      queryClient.invalidateQueries(["pendingDevices"]);
      queryClient.invalidateQueries(["devices"]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve");
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async () => {
    if (!confirm(`Reject ${device.employeeName}'s registration?`)) return;
    setActioning("reject");
    try {
      await rejectDevice(device._id);
      queryClient.invalidateQueries(["pendingDevices"]);
      queryClient.invalidateQueries(["devices"]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject");
    } finally {
      setActioning(null);
    }
  };

  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-3 font-medium text-slate-900">{device.employeeName}</td>
      <td className="px-4 py-3 text-slate-500">{device.email}</td>
      <td className="px-4 py-3 text-slate-500">{device.deviceId}</td>
      <td className="px-4 py-3 text-slate-400 text-xs">
        {new Date(device.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={actioning !== null}
            className="px-3 py-1 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50"
          >
            {actioning === "approve" ? "..." : "Approve"}
          </button>
          <button
            onClick={handleReject}
            disabled={actioning !== null}
            className="px-3 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50"
          >
            {actioning === "reject" ? "..." : "Reject"}
          </button>
        </div>
      </td>
    </tr>
  );
}