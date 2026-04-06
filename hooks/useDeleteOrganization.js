import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/api";
import { toast } from "sonner";

export function useDeleteOrganization(orgId) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFinalModalOpen, setIsFinalModalOpen] = useState(false);

  const { mutate: deleteOrg, isPending } = useMutation({
    mutationFn: async () => {
      const response = await api.delete(
        `/organization/delete-organization/${orgId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organization and all related data deleted.");
      setIsFinalModalOpen(false);
      router.push("/dashboard/settings/employee-administration");
      router.refresh();
    },
    onError: (error) => {
      const msg =
        error.response?.data?.message || "Failed to delete organization";
      toast.error(msg);
    },
  });

  const handleFirstConfirm = () => {
    setIsFirstModalOpen(false);
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsFinalModalOpen(true);
    }, 1000);
  };

  return {
    deleteOrg,
    isPending,
    states: {
      isFirstModalOpen,
      setIsFirstModalOpen,
      isVerifying,
      isFinalModalOpen,
      setIsFinalModalOpen,
    },
    handleFirstConfirm,
  };
}
