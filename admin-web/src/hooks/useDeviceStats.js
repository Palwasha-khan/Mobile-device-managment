import { useQuery } from "@tanstack/react-query";
import { getDeviceStats } from "../api/endpoints/deviceApi";

export function useDeviceStats() {
  return useQuery({
    queryKey: ["deviceStats"],
    queryFn: async () => {
      const { data } = await getDeviceStats();
      return data;
    },
    refetchInterval: 30000, // auto-refresh every 30s, since counts change as devices ping in
  });
}