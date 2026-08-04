import { useState } from "react";
import { sendCommand } from "../../../api/endpoints/deviceApi";
import toast from "react-hot-toast";

const commands = [
  { type: "ring_alert", label: "🔔 Ring Alert" },
  { type: "lock_warning", label: "🔒 Lock Warning" },
  { type: "compliance_warning", label: "⚠️ Compliance Warning" },
];

export default function CommandPanel({ deviceId }) {
  const [sending, setSending] = useState(null); 

  const handleSend = async (commandType) => {
  setSending(commandType);
  try {
    await sendCommand(deviceId, commandType);
    toast.success("Command sent to device");
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to send command");
  } finally {
    setSending(null);
  }
};

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <p className="text-sm font-medium text-slate-700 mb-3">Send Remote Command</p>
      <div className="flex gap-2 flex-wrap">
        {commands.map((cmd) => (
          <button
            key={cmd.type}
            onClick={() => handleSend(cmd.type)}
            disabled={sending !== null}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
          >
            {sending === cmd.type ? "Sending..." : cmd.label}
          </button>
        ))}
      </div>
      {message && <p className="text-sm text-blue-600 mt-3">{message}</p>}
    </div>
  );
}