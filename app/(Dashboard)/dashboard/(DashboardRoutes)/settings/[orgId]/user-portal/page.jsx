"use client";

import React, { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Link as LinkIcon,
  AlertTriangle,
  ExternalLink,
  Upload,
  ShieldCheck,
  UserCircle,
  MailCheck,
  Loader2,
  Copy,
  Check,
  X,
} from "lucide-react";
import RippleButton from "@/Component/RippleButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useOrganization } from "@/hooks/useOrganization";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { useDeleteOrganization } from "@/hooks/useDeleteOrganization";
import DeleteOrganizationDialog from "../../_setting-components/DeleteOrganizationDialog";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function UserPortalSettings({ params }) {
  const { orgId } = use(params);
  const queryClient = useQueryClient();
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [authType, setAuthType] = useState("email"); // Default selected
  const [editingField, setEditingField] = useState(null); // Enthe field edit-la iruku?
  const [tempValue, setTempValue] = useState(""); // Type panra values
  // 1. Image preview-kaaga puthu state
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // Actual file for upload
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  const [includeCategoryField, setIncludeCategoryField] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [requireCategory, setRequireCategory] = useState(false);
  const [portalTheme, setPortalTheme] = useState("orange");
  const [uploadProgress, setUploadProgress] = useState(0);
  const deleteHook = useDeleteOrganization(orgId);
  const [isRemoving, setIsRemoving] = useState(false);
  const [copied, setCopied] = useState(false);

  // console.log(authType);

  const { data: orgRes, isLoading: isOrgLoading } = useOrganization(orgId);
  const org = orgRes?.data;

  const { data: userPortal, isLoading: isPortalLoading } = useQuery({
    queryKey: ["userPortal", orgId],
    queryFn: async () => {
      const res = await api.get(`/organization/${orgId}/user-portal`);
      return res.data.data;
    },
    enabled: !!orgId,
    placeholderData: (previousData) => previousData,
  });

  // --- Update. Mutation Logic ---

  const updatePortalMutation = useMutation({
    mutationFn: async (updatedData) => {
      // Data-vai FormData-va maathuren (image upload support panna)
      const formData = new FormData();
      Object.entries(updatedData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const res = await api.put(
        `/organization/${orgId}/user-portal`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userPortal", orgId]);
      setEditingField(null);
      setSelectedFile(null);
      setIsRemoving(false); // Reset pannunga
      toast.success("Settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  useEffect(() => {
    if (userPortal) {
      setPortalEnabled(userPortal.isEnabled);
      setAuthType(userPortal.authType || "email");
      setIncludeCategoryField(userPortal.includeCategoryField || false);
      setRequireCategory(userPortal.requireCategory || false);
      setPortalTheme(userPortal.portalTheme || "orange");
    }
  }, [userPortal]);

  useEffect(() => {
    let interval;
    if (updatePortalMutation.isPending) {
      // Progress-ah 0-kku reset pannuvom
      setUploadProgress(0);
      // Konjam konjam-ma progress increase aagum (Simulating upload)
      interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 70) return prev; // 95% mela automatic-ah pogathu, API response-kaga wait pannum
          return prev + 2; // Ovvoru 200ms-kku 5% erum
        });
      }, 500);
    } else {
      setUploadProgress(100);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [updatePortalMutation.isPending]);

  // console.log(userPortal);
  // Loader condition check panni portal URL-ai eduthukalam
  const portalURL = isOrgLoading
    ? "Loading..."
    : org?.Settings?.portalUrl || "Not Configured";

  // Displayed email-kum real data use pannunga
  const supportEmail = isOrgLoading
    ? "Loading..."
    : org?.Settings?.supportEmail || "No email set";

  // console.log(org);

  const orgData = {
    name: "Amigo",
    helpDeskUrl: "https://amigowebster.helpdesktech.com",
    portalUrl: "https://amigowebster.helpdesktech.com/portal",
    email: "help@amigowebster.helpdesktech.com",
  };

  // 1. All text-based fields in an array for mapping
  const portalFields = [
    {
      label: "Page title",
      value: userPortal?.pageTitle || "N/A",
      type: "input",
      key: "pageTitle",
    },
    {
      label: "Form title",
      value: userPortal?.formTitle || "N/A",
      type: "input",
      key: "formTitle",
    },
    {
      label: "Form message",
      value: userPortal?.formMessage || "N/A",
      type: "textarea",
      key: "formMessage",
    },
    {
      label: "Success title",
      value: userPortal?.successTitle || "N/A",
      type: "input",
      key: "successTitle",
    },
    {
      label: "Success message",
      value: userPortal?.successMessage || "N/A",
      type: "textarea",
      key: "successMessage",
    },
    {
      label: "Login welcome message",
      value: userPortal?.loginWelcomeMessage || "N/A",
      type: "textarea",
      key: "loginWelcomeMessage",
    },
    {
      label: "Page announcements",
      value: userPortal?.announcements || "No announcements",
      type: "textarea",
      italic: true,
      key: "announcements",
    },
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
    // 1. Define allowed formats
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (file) {
      // 2. Format Validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Invalid file format. Please upload JPG, PNG or WebP.");
        e.target.value = ""; // Input-ah clear panna
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error("Image size must be less than 1MB");
        e.target.value = ""; // Clear the input
        return;
      }

      // Temporary URL create panrathu (browser preview-kaaga)
      const previewUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setSelectedImage(previewUrl);
      setIsImageDeleted(false);
      // Inga neenga unga API upload logic call pannikalam
      updatePortalMutation.mutate({ portalImage: file });
    }
  };

  // Background toggle for Checkboxes/Radios
  const handleToggle = (key, value) => {
    updatePortalMutation.mutate({ [key]: value });
  };

  const handleSaveText = (fieldKey) => {
    updatePortalMutation.mutate({ [fieldKey]: tempValue });
  };

  // --- Theme change handler ---
  const handleThemeChange = (newTheme) => {
    setPortalTheme(newTheme); // UI immediate-ah update aaga
    handleToggle("portalTheme", newTheme); // API-kku update panna
  };

  if (isPortalLoading) {
    return (
      <div className="bg-[#f8fafc] min-h-full p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 rounded-md" />
              <Skeleton className="h-4 w-64 rounded-md" />
            </div>
            <Skeleton className="h-12 w-44 rounded-md" />
          </div>

          {/* Main Card Skeleton */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            {/* Section Title Bar */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border-l-4 border-slate-200 mb-8">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>

            <div className="space-y-8 px-4">
              {/* List Items Skeleton (Portal URL, Page Title, etc.) */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0"
                >
                  <Skeleton className="h-4 w-32" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                </div>
              ))}

              {/* Portal Image Section Skeleton */}
              <div className="flex items-center justify-between py-6">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center gap-6">
                  <Skeleton className="h-24 w-24 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-40 rounded-xl" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>

              {/* Security Section Header */}
              <div className="pt-10">
                <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-lg border-l-4 border-slate-200">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-6 w-48" />
                </div>

                {/* Radio Options Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 py-10 gap-10">
                  <Skeleton className="h-4 w-40" />
                  <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <Skeleton className="h-32 w-full rounded-3xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentImageUrl =
    selectedImage ||
    (userPortal?.portalImageUrl && !isImageDeleted
      ? userPortal.portalImageUrl
      : null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portalURL);
      setCopied(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000); // 2 seconds kalithu icon thirumba maarum
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- HEADER SECTION --- */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isOrgLoading ? <Skeleton className="h-8 w-40" /> : org?.name}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
              <LinkIcon size={14} className="text-blue-500" />
              {org?.fullDomainUrl ? (
                org.fullDomainUrl
              ) : (
                <span className="text-slate-400 italic">
                  {isOrgLoading ? "Loading domain..." : "Domain not configured"}
                </span>
              )}
            </p>
          </div>
          <RippleButton
            onClick={() => deleteHook.states.setIsFirstModalOpen(true)}
            className="border-red-100 text-sm bg-red-100 text-red-500 shadow-sm hover:bg-red-200/65 rounded-md px-6 py-5 cursor-pointer"
          >
            <Trash2 size={18} className="mr-2" />
            Delete organization
          </RippleButton>
          <DeleteOrganizationDialog
            orgName={org?.name}
            deleteHook={deleteHook}
          />
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white/60 border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-5 space-y-8">
            <section>
              {/* Section Title Bar */}
              <div className="relative flex items-center  justify-between bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-50 py-3 px-4 border-l-4 border-slate-700 group rounded-l-md cursor-pointer transition-all duration-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  User Portal
                </h2>
                <Button
                  variant="outline"
                  className="bg-white   border-slate-200 cursor-pointer shadow-sm px-6 hover:bg-slate-50"
                  onClick={() => setPortalEnabled(!portalEnabled)}
                  disabled={isPortalLoading}
                >
                  {/* {updatePortalMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )} */}
                  {userPortal?.isEnabled ? "Disable" : "Enable"}
                </Button>
              </div>
              <div className="px-5 divide-y divide-slate-200">
                {/* 2. Static Portal URL Row */}
                <div className="flex items-center justify-between py-8">
                  <p className="text-[13px] font-black text-slate-700 tracking-widest ">
                    Portal URL
                  </p>
                  <div className="flex items-center gap-5">
                    <div
                      onClick={handleCopy}
                      className="group  gap-2 flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md cursor-pointer transition-all active:scale-95"
                    >
                      <span className="text-[13px] font-medium text-slate-600 group-hover:text-slate-900">
                        {portalURL}
                      </span>

                      {copied ? (
                        <Check
                          size={14}
                          className="text-green-600 animate-in zoom-in"
                        />
                      ) : (
                        <Copy
                          size={14}
                          className="text-slate-400 group-hover:text-slate-600 transition-colors"
                        />
                      )}
                    </div>
                    {!isOrgLoading && org?.Settings?.portalUrl && (
                      <a href={portalURL} target="_blank" rel="noreferrer">
                        <ExternalLink
                          size={14}
                          className="cursor-pointer hover:text-blue-800 text-blue-600"
                        />
                      </a>
                    )}
                  </div>
                </div>

                {/* 3. Mapping Portal Fields (DRY Code) */}
                {portalFields.map((field, idx) => {
                  const isEditing = editingField === field.label;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-6 group"
                    >
                      <p className="text-[13px] font-black text-slate-700  tracking-widest">
                        {field.label}
                      </p>

                      <div className="flex-1 px-10 justify-end">
                        {isEditing ? (
                          // Editing mode: Logic for Input vs Textarea
                          field.type === "textarea" ? (
                            <textarea
                              className="w-full max-w-md p-2 border border-blue-400 focus:ring-2 ring-blue-100 rounded-md text-sm focus:outline-none"
                              rows={3}
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <Input
                              className="w-full max-w-md border py-5 border-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              autoFocus
                            />
                          )
                        ) : (
                          // Display mode
                          <p
                            className={`text-[13px] text-slate-700 max-w-md text-right ${field.italic ? "text-slate-400 italic" : ""}`}
                          >
                            {field.value}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              className="px-4 h-8 text-[12px] bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
                              disabled={updatePortalMutation.isPending}
                              onClick={() => handleSaveText(field.key)}
                              // onClick={() => {
                              //   // Inga API call panni save pannanum
                              //   console.log("Saving:", item.label, tempValue);
                              //   setEditingField(null);
                              // }}
                            >
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              className="px-4 h-8 text-[12px] cursor-pointer border"
                              onClick={() => setEditingField(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            className="px-6 h-8 text-[13px] tracking-tight cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
                            onClick={() => {
                              setEditingField(field.label);
                              setTempValue(
                                field.value === "N/A" ? "" : field.value,
                              );
                            }}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {/* 4. Displayed Email Section */}
                <div className="flex items-center justify-between py-6">
                  <p className="text-[13px] font-black text-slate-700 tracking-widest">
                    Displayed email
                  </p>
                  <div className="flex flex-col gap-3">
                    <p className="text-[14px] text-slate-700">
                      {userPortal?.displayedEmail}
                    </p>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="ref-email"
                        checked={userPortal?.includeReferenceEmail}
                      />
                      <label
                        htmlFor="ref-email"
                        className="text-sm font-medium text-slate-600"
                      >
                        Include reference email
                      </label>
                    </div>
                  </div>
                  <div>
                    <Button className=" px-6 h-8 text-[13px] tracking-tight">
                      Edit
                    </Button>
                  </div>
                </div>

                {/* 5. Category Selection */}

                <div className="flex items-center justify-between max-w-2xl py-6">
                  <p className="text-[13px] font-black text-slate-700 tracking-widest">
                    Category
                  </p>
                  <div className="flex items-center justify-center">
                    <p className="text-[13px] max-w-md text-slate-700 text-right">
                      Settings for custom attributes in the user portal are
                      located in the{" "}
                      <span className="underline cursor-pointer text-gray-950 font-semibold">
                        custom attributes
                      </span>{" "}
                      settings
                    </p>
                  </div>
                </div>

                {/* 5. Portal image section with Preview logic */}
                <TooltipProvider delayDuration={200}>
                  <div className="flex items-center justify-between max-w-xl py-6">
                    <p className="text-[13px] font-black text-slate-700 tracking-widest">
                      Portal image
                    </p>

                    <div className="flex items-center gap-6">
                      {/* Image Preview Card */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            onClick={() =>
                              !updatePortalMutation.isPending &&
                              currentImageUrl &&
                              setIsPreviewOpen(true)
                            }
                            className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center group shrink-0 transition-all hover:border-blue-400"
                          >
                            {currentImageUrl ? (
                              <>
                                <motion.img
                                  initial={{ opacity: 0 }}
                                  animate={{
                                    opacity: updatePortalMutation.isPending
                                      ? 0.4
                                      : 1,
                                  }}
                                  // src={
                                  //   selectedImage
                                  //     ? selectedImage
                                  //     : userPortal.portalImageUrl
                                  // }
                                  src={currentImageUrl}
                                  alt="Portal Logo"
                                  className="absolute w-full h-full object-contain p-2"
                                />

                                {/* --- REALISTIC CIRCULAR PROGRESS --- */}
                                {updatePortalMutation.isPending &&
                                  !isRemoving && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                                      <div className="relative w-12 h-12 flex items-center justify-center">
                                        {/* Background Circle */}
                                        <svg className="absolute w-full h-full transform -rotate-90">
                                          <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            fill="transparent"
                                            className="text-slate-200"
                                          />
                                          {/* Animated Progress Circle */}
                                          <motion.circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            fill="transparent"
                                            strokeDasharray="125.6"
                                            // initial={{ strokeDashoffset: 125.6 }}
                                            animate={{
                                              strokeDashoffset:
                                                125.6 -
                                                (125.6 * uploadProgress) / 100,
                                            }}
                                            // transition={{
                                            //   duration: 2,
                                            //   repeat: Infinity,
                                            //   ease: "easeInOut",
                                            // }}
                                            transition={{
                                              duration: 0.3,
                                              ease: "linear",
                                            }}
                                            className="text-orange-500" // Unga theme orange-nalaa orange kuduthurukkaen
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  )}

                                {/* Loading illatha pothu mattum REMOVE button (Hover-la mattum) */}
                                {!updatePortalMutation.isPending && (
                                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Image click-ah prevent panna
                                        setIsRemoving(true);
                                        setSelectedImage(null);
                                        setIsImageDeleted(true);
                                        updatePortalMutation.mutate({
                                          isImageDeleted: true,
                                          portalImage: null,
                                        });
                                      }}
                                      className="bg-white cursor-pointer text-red-500 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg hover:bg-red-50 transition-colors mb-2"
                                    >
                                      REMOVE
                                    </button>
                                    <span className="text-white text-[9px] select-none font-medium">
                                      Click to zoom
                                    </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <div className="p-2 bg-slate-100 rounded-full">
                                  <UserCircle
                                    size={20}
                                    className="text-slate-400"
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        {currentImageUrl && !updatePortalMutation.isPending && (
                          <TooltipContent
                            side="bottom"
                            className="bg-slate-900 text-white border-none text-[12px]"
                          >
                            <p>Click to preview image</p>
                          </TooltipContent>
                        )}
                      </Tooltip>

                      {/* Upload Button */}
                      <div className="flex flex-col gap-2">
                        <label
                          className={`cursor-pointer text-[13px] inline-flex items-center gap-2 
        bg-white border-2 border-slate-200 
         transition-all px-5 py-2.5 rounded-xl 
        text-slate-700 shadow-sm font-semibold group ${isRemoving ? "opacity-50 cursor-not-allowed" : "hover:border-slate-900 hover:bg-slate-50 "} `}
                        >
                          {/* {updatePortalMutation.isPending && !isRemoving ? (
                            <Loader2
                              size={16}
                              className="animate-spin text-orange-500"
                            />
                          ) : (
                            <Upload
                              size={16}
                              className="text-slate-400 group-hover:text-slate-900"
                            />
                          )}
                          {updatePortalMutation.isPending && !isRemoving
                            ? `Uploading ${uploadProgress}%`
                            : "Choose image"} */}
                          <Upload
                            size={16}
                            className="text-slate-400 group-hover:text-slate-900"
                          />
                          Choose image
                          <input
                            type="file"
                            className="hidden"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            disabled={updatePortalMutation.isPending}
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="text-[11px] text-slate-400 font-medium ml-1">
                          PNG, JPG or WebP up to 1MB
                        </p>
                      </div>
                    </div>
                    {/* --- SMOOTH MODAL PREVIEW USING FRAMER MOTION & SHADCN --- */}
                    <Dialog
                      open={isPreviewOpen}
                      onOpenChange={setIsPreviewOpen}
                    >
                      <DialogContent className="max-w-5xl border-none bg-transparent shadow-none flex items-center justify-center p-0 overflow-hidden">
                        <DialogTitle className="sr-only">
                          Image Preview
                        </DialogTitle>
                        <AnimatePresence>
                          {isPreviewOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300,
                              }}
                              className="relative p-2 rounded-xl"
                            >
                              <img
                                src={currentImageUrl}
                                className="max-h-[90vh] w-auto rounded-xl shadow-2xl bg-white p-7"
                                alt="Preview"
                              />
                              {/* <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-xl hover:bg-slate-100 transition-colors"
                              >
                                <X size={20} className="text-slate-900" />
                              </button> */}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TooltipProvider>

                {/* 6. Custom attributes  */}
                <div className="flex items-center justify-between max-w-133  py-6">
                  <p className="text-[13px] font-black text-slate-700 tracking-widest">
                    Custom attributes
                  </p>
                  <div className="flex flex-col  gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="include-category"
                        checked={includeCategoryField}
                        onCheckedChange={(val) => {
                          setIncludeCategoryField(val);
                          handleToggle("includeCategoryField", val);
                        }}
                      />
                      <label
                        htmlFor="include-category"
                        className="text-sm font-medium text-slate-600"
                      >
                        Include category field in the form
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="require-category"
                        checked={requireCategory}
                        onCheckedChange={(val) => {
                          setRequireCategory(val);
                          handleToggle("requireCategory", val);
                        }}
                      />
                      <label
                        htmlFor="require-category"
                        className="text-sm font-medium text-slate-600"
                      >
                        Require the user to select a category
                      </label>
                    </div>
                  </div>
                </div>

                {/* 7. Theme & Image */}
                <div className="flex items-center justify-between max-w-133  py-6">
                  <p className="text-[13px] font-black text-slate-700 tracking-widest">
                    Portal theme
                  </p>
                  <Select
                    value={portalTheme}
                    onValueChange={handleThemeChange}
                    disabled={updatePortalMutation.isPending}
                  >
                    <SelectTrigger className="w-50 bg-white border-slate-200 font-medium">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="grey">Grey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* --- NEW SECTION: PORTAL AUTHENTICATION (From Images) --- */}
                <div className="py-10">
                  <div className=" mb-10 text-slate-900">
                    <div className="relative flex items-center  gap-2 bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-50 py-3 px-4 border-l-4 border-slate-700 group rounded-l-md cursor-pointer transition-all duration-200">
                      <ShieldCheck size={20} className="text-blue-600" />
                      <h3 className="text-lg font-semibold text-slate-900">
                        Security & Authentication
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 py-6 gap-10">
                      <div className="text-[13px] font-black text-slate-700 tracking-widest ">
                        Portal Access Control
                      </div>
                      <div className="md:col-span-2">
                        <RadioGroup
                          value={authType}
                          onValueChange={(val) => {
                            setAuthType(val);
                            handleToggle("authType", val);
                          }}
                          className="space-y-6"
                        >
                          {/* Option 1: Guest */}
                          <div
                            onClick={() => {
                              setAuthType("guest");
                              handleToggle("authType", "guest");
                            }}
                            className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                              authType === "guest"
                                ? "border-blue-500 bg-blue-50/50  shadow-sm"
                                : ""
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Radio Item: Selected state-la mattum Blue-ah theriyum */}
                              <div className="mt-1">
                                <RadioGroupItem
                                  value="guest"
                                  id="guest"
                                  className={`h-5 w-5 ${
                                    authType === "guest"
                                      ? "border-blue-600 text-blue-600"
                                      : "border-slate-300 bg-white"
                                  }`}
                                />
                              </div>

                              <div className="">
                                <div className="flex items-center gap-2">
                                  <UserCircle
                                    size={20}
                                    className={
                                      authType === "guest"
                                        ? "text-slate-600"
                                        : "text-slate-400"
                                    }
                                  />
                                  <span
                                    className={`text-[16px] ${authType === "guest" ? "text-slate-900 font-bold" : "text-slate-600"}`}
                                  >
                                    Guest User Allowed
                                  </span>
                                </div>
                                <p className="text-[15px] text-slate-500 mt-2 leading-relaxed">
                                  Users may submit a ticket without being logged
                                  into the portal. Guests will not be able to
                                  submit file attachments.
                                </p>

                                {/* Caution Alert Box: Image-la irukura maari Rounded design */}
                                <div className="mt-4 flex items-center gap-4 border-l-5 border-[#FFD60A] bg-yellow-100  p-4 rounded-xl shadow-sm">
                                  <div className="bg-yellow-400 p-2 rounded-full">
                                    <AlertTriangle
                                      size={20}
                                      className="text-black"
                                    />
                                  </div>
                                  <p className="text-[14px] text-yellow-900 font-medium leading-tight">
                                    Caution! You may be more at risk for
                                    phishing attempts if you enable this
                                    feature.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Option 2: Email Authorization */}
                          <div
                            onClick={() => {
                              setAuthType("email");
                              handleToggle("authType", "email");
                            }}
                            className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                              authType === "email"
                                ? "border-blue-500 bg-blue-50/50  shadow-sm"
                                : ""
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="mt-1">
                                <RadioGroupItem
                                  value="email"
                                  id="email"
                                  className={`h-5 w-5 ${
                                    authType === "email"
                                      ? "border-blue-600 text-blue-600"
                                      : "border-slate-300 bg-white"
                                  }`}
                                />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <MailCheck
                                    size={20}
                                    className={
                                      authType === "email"
                                        ? "text-slate-600"
                                        : "text-slate-400"
                                    }
                                  />
                                  <span
                                    className={`text-[16px] text-lg ${authType === "email" ? "text-slate-900 font-bold" : "text-slate-600"}`}
                                  >
                                    Email Authorization Required
                                  </span>
                                </div>
                                <p className="text-[15px] text-slate-500 mt-2 leading-relaxed">
                                  Users receive a secure magic link via email to
                                  log in to the portal safely.
                                </p>
                              </div>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
