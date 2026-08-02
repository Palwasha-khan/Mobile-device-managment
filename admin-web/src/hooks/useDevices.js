import { useQuery } from "@tanstack/react-query";
import { getDevices } from "../api/endpoints/deviceApi";

export function useDevices({ page, search, compliance }) {
  return useQuery({
    queryKey: ["devices", page, search, compliance],
    queryFn: async () => {
      const { data } = await getDevices(page, 20, search, compliance);
      return data;
    },
    keepPreviousData: true, // avoids a flash of empty state while changing pages
  });
}