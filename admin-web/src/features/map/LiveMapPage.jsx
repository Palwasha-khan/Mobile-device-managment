import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDevices } from "../../hooks/useDevices";
import { useSocket } from "../../context/SocketContext";
import DeviceMap from "./components/DeviceMap";

export default function LiveMapPage() {
  const { data, isLoading, isError } = useDevices({ page: 1, search: "", compliance: "" });
  const socket = useSocket();
  const queryClient = useQueryClient();
  const [liveDevices, setLiveDevices] = useState([]);

  useEffect(() => {
    if (data?.devices) setLiveDevices(data.devices);
  }, [data]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (updatedDevice) => {
      setLiveDevices((prev) => {
        const exists = prev.some((d) => d._id === updatedDevice._id);
        if (exists) {
          return prev.map((d) => (d._id === updatedDevice._id ? { ...d, ...updatedDevice } : d));
        }
        return [...prev, updatedDevice];
      });
      // Also keep the dashboard/devices list fresh if the user navigates there
      queryClient.invalidateQueries(["devices"]);
      queryClient.invalidateQueries(["deviceStats"]);
    };

    socket.on("device-update", handleUpdate);
    return () => socket.off("device-update", handleUpdate);
  }, [socket, queryClient]);

  if (isLoading) return <p className="text-slate-500">Loading map...</p>;
  if (isError) return <p className="text-red-600">Failed to load devices.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Live Map</h1>
      <DeviceMap devices={liveDevices} />
    </div>
  );
}