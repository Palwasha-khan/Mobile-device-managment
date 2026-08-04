import { usePendingDevices } from "../../hooks/usePendingDevices";
import PendingRow from "./components/PendingRow";

export default function PendingApprovalsPage() {
  const { data: pending, isLoading, isError } = usePendingDevices();

  if (isLoading) return <p className="text-slate-500">Loading...</p>;
  if (isError) return <p className="text-red-600">Failed to load pending approvals.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Pending Approvals</h1>

      {pending.length === 0 ? (
        <p className="text-slate-400 text-sm py-12 text-center bg-white rounded-lg border border-slate-200">
          No pending registrations right now.
        </p>
      ) : (
        <table className="w-full text-sm bg-white rounded-lg border border-slate-200 overflow-hidden">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Device ID</th>
              <th className="px-4 py-3 font-medium">Registered</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((device) => (
              <PendingRow key={device._id} device={device} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
