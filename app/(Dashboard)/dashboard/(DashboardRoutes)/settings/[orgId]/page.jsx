"use client";

import React, { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Trash2,
  Globe,
  Mail,
  Link as LinkIcon,
  Building,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import RippleButton from "@/Component/RippleButton";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOrganization } from "@/hooks/useOrganization";
import GeneralSettingSkeleton from "../_setting-components/OrganizationSettingSkeleton/GeneralSettingSkeleton";

// Inga unga dynamic data-vai fetch pannalam
const orgData = {
  name: "Amigo",
  helpDeskUrl: "https://amigowebster.helpdesktech.in",
  portalUrl: "https://amigowebster.helpdesktech.in/portal",
  email: "help@amigowebster.helpdesktech.in",
};

export default function GeneralSettings({ params }) {
  // Next.js 15 unwrapping params
  const { orgId } = use(params);
  const router = useRouter();

  // Modal States
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFinalModalOpen, setIsFinalModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- COMMON HOOK CALL ---
  const { data: response, isLoading, isError } = useOrganization(orgId);
  const org = response?.data;

  // --- TANSTACK MUTATION ---

  const { mutate: deleteOrganization, isPending } = useMutation({
    mutationFn: async () => {
      const response = await api.delete(
        `/organization/delete-organization/${orgId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      // CreateModal-la ulla athe key-ai ingum kudukkavum
      queryClient.invalidateQueries({
        queryKey: ["organizations"],
      });
      toast.success("Organization and all related data deleted.");
      setIsFinalModalOpen(false);
      // Employee Administration route-ku push panrom
      router.push("/dashboard/settings/employee-administration");
      router.refresh();
    },
    onError: (error) => {
      const msg =
        error.response?.data?.message || "Failed to delete organization";
      toast.error(msg);
    },
  });

  // --- CONFIRMATION HANDLERS ---
  const handleFirstConfirm = () => {
    setIsFirstModalOpen(false);
    setIsVerifying(true);

    // 1 Second Simulation Delay
    setTimeout(() => {
      setIsVerifying(false);
      setIsFinalModalOpen(true);
    }, 1000);
  };

  const handleFinalDelete = (e) => {
    e.preventDefault();
    deleteOrganization();
    // setIsFinalModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="bg-[#f8fafc] min-h-full p-8">
        <GeneralSettingSkeleton />
      </div>
    );
  }

  if (isError || !org) {
    return (
      <div className="p-10 text-center text-red-500">Error loading data...</div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- HEADER SECTION --- */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {org.name}
            </h1>
            <p className="text-[14px] font-medium text-slate-500 mt-1 flex items-center gap-2">
              <LinkIcon size={14} className="text-blue-500" />
              {org.Settings?.helpDeskUrl}
            </p>
          </div>
          <RippleButton
            variant="outline"
            onClick={() => setIsFirstModalOpen(true)}
            className="border-red-100 text-sm bg-red-100 text-red-500 shadow-sm hover:bg-red-200/65 cursor-pointer  rounded-md transition-all px-6 py-5 "
          >
            <Trash2 size={18} className="mr-2" />
            Delete organization
          </RippleButton>
        </div>
        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white/60 border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-5 space-y-8">
            <section className="">
              <div className="relative flex items-center bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-50 py-3 px-4 border-l-4 border-slate-700 group rounded-l-md cursor-pointer transition-all duration-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  General
                </h2>
              </div>
              <div className="space-y-1 px-5 ">
                <div className="flex items-center justify-between py-5 group transition-all">
                  <p className="text-[13px] font-black text-slate-700  tracking-widest">
                    Name
                  </p>
                  <p className="text-[14px]  text-slate-700">{org.name}</p>

                  <Button className="font-bold px-6 h-8  text-[13px]  tracking-tight">
                    Edit
                  </Button>
                </div>
              </div>
              <Separator className="bg-slate-200" />

              {/* Row 2: Help Desk URL */}
              <div className="space-y-1 px-5 ">
                <div className="flex items-center justify-between py-5 group transition-all">
                  <p className="text-[13px] font-black text-slate-700  tracking-widest">
                    Help Desk URL
                  </p>
                  <p className="text-[14px]  text-slate-700">
                    {org.Settings?.helpDeskUrl}
                  </p>
                </div>
              </div>
              <Separator className="bg-slate-200" />
              {/* Row 3: Portal URL */}
              <div className="space-y-1 px-5 ">
                <div className="flex items-center justify-between py-5 group transition-all">
                  <p className="text-[13px] font-black text-slate-700  tracking-widest">
                    Portal URL
                  </p>
                  <p className="text-[14px]  text-slate-700">
                    {org.Settings?.portalUrl}
                  </p>
                </div>
              </div>
              <Separator className="bg-slate-200" />

              {/* Row 4: Email */}
              <div className="space-y-1 px-5 ">
                <div className="flex items-center justify-between py-5 group transition-all">
                  <p className="text-[13px] font-black text-slate-700  tracking-widest">
                    Email
                  </p>
                  <p className="text-[14px]  text-slate-700">
                    {org.Settings?.supportEmail}
                  </p>
                </div>
              </div>
              <Separator className="bg-slate-200" />
              {/* Row 5: Toggle Switch */}
              <div className="flex items-center justify-between py-6 group">
                <div className="max-w-[70%] space-y-1">
                  <p className="text-[15px] font-bold text-slate-700 leading-tight">
                    Auto-assign tickets to the first administrator to comment?
                  </p>
                  <p className="text-[14px] text-slate-400 font-medium">
                    Enabling this will automatically set the assignee when a
                    comment is made.
                  </p>
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <div className="flex items-center gap-4 bg-white p-2 px-4 rounded-2xl shadow-sm border border-blue-100">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
                      Status
                    </span>
                    <Switch className="data-[state=checked]:bg-blue-600" />
                  </div>
                </div>{" "}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* --- FIRST ALERT DIALOG --- */}
      <AlertDialog open={isFirstModalOpen} onOpenChange={setIsFirstModalOpen}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-900">
              Delete Organization?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium pt-2">
              Are you sure you want to delete{" "}
              <span className="text-slate-900 font-bold italic">
                "{orgData.name}"
              </span>
              ? This will impact all users connected to this organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="font-bold border-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFirstConfirm}
              className="bg-slate-900 text-white font-bold border-none shadow-lg px-6"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- INTERMEDIATE LOADING OVERLAY --- */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all">
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Verifying...
            </p>
          </div>
        </div>
      )}
      {/* --- FINAL ALERT DIALOG --- */}
      <AlertDialog open={isFinalModalOpen} onOpenChange={setIsFinalModalOpen}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl bg-white border-t-4 border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> Final Warning
            </AlertDialogTitle>
            <AlertDialogDescription
              asChild
              className="text-slate-500 font-medium pt-2 space-y-4"
            >
              <div>
                <p>
                  Deleting this organization is{" "}
                  <span className="text-red-600 font-black underline">
                    PERMANENT
                  </span>
                  . The following data will be lost forever:
                </p>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-700 text-xs font-bold leading-relaxed">
                  <ul className="list-disc ml-4 space-y-1 uppercase tracking-tight">
                    <li>All Support Tickets & History</li>
                    <li>Employee Associations & Settings</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel
              disabled={isPending}
              className="px-6 font-bold border-2 border-slate-100"
            >
              Abort Action
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleFinalDelete}
              className="px-6 bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-lg shadow-red-200 active:scale-95 transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete Everything"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
