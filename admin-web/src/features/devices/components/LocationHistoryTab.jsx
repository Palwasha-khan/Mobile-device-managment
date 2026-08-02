export default function LocationHistoryTab({ history }) {
  if (history.length === 0) {
    return <p className="text-slate-400 text-sm py-8 text-center">No location pings recorded yet.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-left text-slate-500">
        <tr>
          <th className="py-2">Time</th>
          <th className="py-2">Latitude</th>
          <th className="py-2">Longitude</th>
        </tr>
      </thead>
      <tbody>
        {history.map((entry) => (
          <tr key={entry._id} className="border-t border-slate-100">
            <td className="py-2 text-slate-600">{new Date(entry.timestamp).toLocaleString()}</td>
            <td className="py-2 text-slate-600">{entry.lat}</td>
            <td className="py-2 text-slate-600">{entry.lng}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}