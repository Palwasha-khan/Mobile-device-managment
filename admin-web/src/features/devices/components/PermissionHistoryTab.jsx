export default function PermissionHistoryTab({ history }) {
  if (history.length === 0) {
    return <p className="text-slate-400 text-sm py-8 text-center">No permission changes recorded yet.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-left text-slate-500">
        <tr>
          <th className="py-2">Time</th>
          <th className="py-2">Permission</th>
          <th className="py-2">Old</th>
          <th className="py-2">New</th>
        </tr>
      </thead>
      <tbody>
        {history.map((entry) => (
          <tr key={entry._id} className="border-t border-slate-100">
            <td className="py-2 text-slate-600">{new Date(entry.timestamp).toLocaleString()}</td>
            <td className="py-2 text-slate-600 capitalize">{entry.permissionType}</td>
            <td className="py-2 text-slate-600">{entry.oldState}</td>
            <td className="py-2 text-slate-600">{entry.newState}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}