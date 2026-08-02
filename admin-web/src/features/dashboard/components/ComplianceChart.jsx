import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = { Compliant: "#16a34a", "Non-Compliant": "#dc2626" };

export default function ComplianceChart({ compliant, nonCompliant }) {
  const data = [
    { name: "Compliant", value: compliant },
    { name: "Non-Compliant", value: nonCompliant },
  ];

  const hasData = compliant + nonCompliant > 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <p className="text-sm text-slate-500 mb-2">Compliance Breakdown</p>
      {hasData ? (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-slate-400 text-sm py-16 text-center">
          No devices enrolled yet
        </p>
      )}
    </div>
  );
}