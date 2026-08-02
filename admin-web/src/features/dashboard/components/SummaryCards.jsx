export default function SummaryCards({ stats }) {
  const cards = [
    { label: "Total Devices", value: stats.totalDevices, color: "text-slate-900" },
    { label: "Active (last 15 min)", value: stats.activeDevices, color: "text-blue-600" },
    { label: "Compliant", value: stats.compliantDevices, color: "text-green-600" },
    { label: "Non-Compliant", value: stats.nonCompliantDevices, color: "text-red-600" },
    { label: "Pending Approval", value: stats.pendingDevices, color: "text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm"
        >
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}