import api from "@/api";
import { useQuery } from "@tanstack/react-query";

export const useOrganization = (orgId) => {
  return useQuery({
    queryKey: ["organization", orgId],
    queryFn: async () => {
      const response = await api.get(
        `organization/get-single-organization/${orgId}`,
      );
      return response.data;
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 mins data-vai cache-la vachukum
  });
};
