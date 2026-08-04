import { useDeviceStats } from "../../hooks/useDeviceStats";
import SummaryCards from "./components/SummaryCards";
import ComplianceChart from "./components/ComplianceChart";
import { SkeletonCards } from "../../components/ui/Skeleton";

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useDeviceStats();

  if (isError) return <p className="text-red-600">Failed to load dashboard data.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Fleet Overview</h1>
      {isLoading ? (
        <SkeletonCards />
      ) : (
        <>
          <SummaryCards stats={stats} />
          <ComplianceChart compliant={stats.compliantDevices} nonCompliant={stats.nonCompliantDevices} />
        </>
      )}
    </div>
  );
}