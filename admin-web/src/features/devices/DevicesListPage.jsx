import { useState } from "react";
import { useDevices } from "../../hooks/useDevices";
import DeviceFilters from "./components/DeviceFilters";
import DeviceTable from "./components/DeviceTable";
import { useSearchParams } from "react-router-dom";

export default function DevicesListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const search = searchParams.get("search") || "";
  const [compliance, setCompliance] = useState("");

  const { data, isLoading, isError } = useDevices({ page, search, compliance });

  const handleSearchSubmit = (searchTerm) => {
    setSearchParams({ page: "1", search: searchTerm, compliance });
  };

  const handleComplianceChange = (val) => {
    setCompliance(val);
    setPage(1); // Reset to page 1 when filter changes
  };

  const handleClear = () => {
  setSearchParams({ page: "1", search: "", compliance: "" });
};

  if (isLoading) return <p className="text-slate-500">Loading devices...</p>;
  if (isError) return <p className="text-red-600">Failed to load devices.</p>;

  const { devices, pagination } = data;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Devices</h1>
      <DeviceFilters
        search={search}
        onSearchSubmit={handleSearchSubmit}
        compliance={compliance}
        setCompliance={handleComplianceChange}
        onClear={handleClear}
      />
      {devices.length === 0 ? (
        <p className="text-slate-500">No devices found.</p>
      ) : (
        <>
          <DeviceTable devices={devices} />

      <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
        <span>
          Page {pagination.page} of {pagination.totalPages || 1} ({pagination.totalCount} total)
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-40"
          >
            Previous
          </button>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
     