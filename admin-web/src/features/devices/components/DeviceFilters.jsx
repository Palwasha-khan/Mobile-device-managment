export default function DeviceFilters({ search, setSearch, compliance, setCompliance }) {
  return (
    <div className="flex gap-3 mb-4">
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-slate-300 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={compliance}
        onChange={(e) => setCompliance(e.target.value)}
        className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All statuses</option>
        <option value="compliant">Compliant</option>
        <option value="non-compliant">Non-Compliant</option>
      </select>
    </div>
  );
}