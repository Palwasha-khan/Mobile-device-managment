import { useState } from "react";
// import { promoteToAdmin } from "../../../api/endpoints/deviceApi";

export default function PromoteToAdminButton({ deviceId, employeeName }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handlePromote = async () => {
    if (!confirm(`Make ${employeeName} an admin? This gives them full dashboard access.`)) return;
    setLoading(true);
    try {
      await promoteToAdmin(deviceId);
      setDone(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to promote");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return <p className="text-sm text-green-600">✓ Now an admin</p>;
  }

  return (
    <button
      onClick={handlePromote}
      disabled={loading}
      className="text-sm text-slate-500 hover:text-blue-600 underline disabled:opacity-50"
    >
      {loading ? "Promoting..." : "Promote to Admin"}
    </button>
  );
}