"use client";

import api from "@/api";
import RippleButton from "@/Component/RippleButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const CreateOrganizationModal = ({ open, setOpen }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    organizationName: "",
    domain: "",
  });

  const [debouncedName] = useDebounce(formData.organizationName, 500);
  const [debouncedDomain] = useDebounce(formData.domain, 500);

  // --- API CHECK FOR NAME ---
  const { data: nameCheck, isFetching: isCheckingName } = useQuery({
    queryKey: ["check-org-name", debouncedName],
    queryFn: async () => {
      if (!debouncedName || debouncedName.length < 3) return null;
      const res = await api.get(
        "/organization/check-availability-organization",
        {
          params: {
            name: debouncedName,
          },
        },
      );
      return res.data;
    },
    enabled: debouncedName.length >= 3,
  });

  // --- API CHECK FOR DOMAIN ---
  const { data: domainCheck, isFetching: isCheckingDomain } = useQuery({
    queryKey: ["check-org-domain", debouncedDomain],
    queryFn: async () => {
      if (!debouncedDomain || debouncedDomain.length < 3) return null;
      const res = await api.get(
        "/organization/check-availability-organization",
        {
          params: {
            domain: debouncedDomain,
          },
        },
      );
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (newOrg) => {
      // API endpoint logic unga backend-ku thagapadi mathikonga
      const response = await api.post(
        "/organization/create-organization",
        newOrg,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      router.refresh();
      toast.success("Organization created successfully!");
      setOpen(false);

      setFormData({ organizationName: "", domain: "" }); // Reset form
    },
    onError: (error) => {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create organization";
      toast.error(msg);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Domain input-la spaces allow panna koodathu, lowercase-ah irukanum
    if (name === "domain") {
      const formattedDomain = value
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9-]/g, "");
      setFormData((prev) => ({ ...prev, [name]: formattedDomain }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const handleCreate = () => {
    const newErrors = {};
    if (!formData.organizationName.trim()) newErrors.name = true;
    if (!formData.domain.trim() || formData.domain.length < 3)
      newErrors.domain = true;

    if (nameCheck?.exists || domainCheck?.exists) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields correctly");
      return;
    }
    mutation.mutate(formData);
  };

  // Re-usable status component
  const StatusIcon = ({ fetching, data, value }) => {
    if (!value || value.length < 3) return null;
    if (fetching)
      return <Loader2 className="size-4 animate-spin text-blue-500" />;
    if (data?.exists) return <AlertCircle className="size-4 text-red-500" />;
    return <CheckCircle2 className="size-4 text-green-500" />;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => !mutation.isPending && setOpen(val)}
    >
      <DialogContent
        className="sm:max-w-2xl rounded-4xl p-6 outline-none border-none shadow-2xl bg-white"
        onPointerDownOutside={(e) => mutation.isPending && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            Add new organization
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="relative">
            <label className="absolute -top-2.5 left-3 px-1 bg-white text-[13px] text-slate-700 z-10">
              Organization Name
            </label>
            <Input
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              //   placeholder="H.desk.tech Corp"
              className={`w-full rounded-xl h-12 bg-transparent transition-all ${errors.name ? "border-red-500 focus-visible:ring-red-300" : "border-slate-300"}`}
            />
            <div className="absolute right-3 top-4">
              <StatusIcon
                fetching={isCheckingName}
                data={nameCheck}
                value={formData.organizationName}
              />
            </div>
            {nameCheck?.exists && (
              <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                {nameCheck.message}
              </p>
            )}
          </div>
          {/* Domain / Email Setup Section */}
          <div className="bg-white/50 p-4 rounded-2xl border  border-slate-200">
            <p className="text-[13px] text-slate-600 mb-4">
              Create a custom email address for your new organization. Pick at
              least three alpha-numeric characters.
            </p>
            <div className="flex items-center relative">
              <div className="bg-neutral-200 h-12 px-4 flex items-center rounded-l-xl border border-r-0 border-slate-300 text-slate-600 ">
                help@
              </div>
              <Input
                name="domain"
                onChange={handleChange}
                placeholder="your-org"
                className={`flex-1 rounded-none h-12  bg-white transition-all ${errors.domain ? "border-red-500 focus-visible:ring-red-300" : "border-slate-300"}`}
              />
              <div className="absolute right-24 top-4">
                <StatusIcon
                  fetching={isCheckingDomain}
                  data={domainCheck}
                  value={formData.domain}
                />
              </div>
              <div className="bg-neutral-200 h-12 px-3 flex items-center rounded-r-xl border border-l-0 border-slate-300 text-[13px] text-slate-600">
                .vercel.app
              </div>
            </div>
            {domainCheck?.exists && (
              <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                {domainCheck.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button
            disabled={mutation.isPending}
            onClick={() => setOpen(false)}
            className=" px-4 py-2.5 text-xs font-black border rounded-2xl text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
          >
            Cancel
          </button>
          <RippleButton
            disabled={mutation.isPending}
            onClick={handleCreate}
            className=" rounded-2xl h-11 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200"
          >
            {mutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              "Create organization"
            )}
          </RippleButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrganizationModal;
