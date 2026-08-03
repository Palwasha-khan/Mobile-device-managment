import { useEffect } from "react";
import { useState } from "react";

export default function DeviceFilters({
  search,
  onSearchSubmit,
  compliance,
  setCompliance,
  onClear,
}) {
  // Local state to keep track of typing without triggering API calls immediately
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit(localSearch); // Sends the local search term to parent state
  };

  const hasActiveFilters = search || compliance;

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      </div>

      <select
        value={compliance}
        onChange={(e) => setCompliance(e.target.value)}
        className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All statuses</option>
        <option value="compliant">Compliant</option>
        <option value="non-compliant">Non-Compliant</option>
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-slate-500 hover:text-red-600 underline"
        >
          Clear filters
        </button>
      )}
    </form>
  );
}