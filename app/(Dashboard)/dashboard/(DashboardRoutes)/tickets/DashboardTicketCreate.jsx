"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Paperclip,
  Loader2,
  X,
  FileText,
  File,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence, progress } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import RippleButton from "@/Component/RippleButton";
import { useSelector } from "react-redux";

// Reusable Label Component with Mandatory indicator
const FormLabel = ({ children, mandatory = true }) => (
  <Label className="text-[13px]  text-slate-700 flex items-center gap-1 mb-1.5">
    {children}
    {mandatory && (
      <span className="text-red-500 flex items-center gap-1">
        *{" "}
        {/* <span className="text-[10px] font-medium  tracking-tighter">
          (required)
        </span> */}
      </span>
    )}
  </Label>
);

export default function DashboardTicketCreate({
  userId,
  orgData,
  isLoadingOrgs,
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  console.log("OrgData", orgData);

  const [formData, setFormData] = useState({
    summary: "",
    description: "",
    priority: "Medium",
    contactId: "",
    customFields: {},
  });

  const resetForm = () => {
    setFormData({
      summary: "",
      description: "",
      priority: "Medium",
      contactId: "",
      customFields: {},
    });
    setSelectedOrgId("");
    setSelectedFiles([]);
    localStorage.removeItem(storageKey);
  };
  // console.log("FormData", formData);

  const { user } = useSelector((state) => state.auth);

  // console.log(user);

  const storageKey = `pending_uploads_${selectedOrgId}`;

  useEffect(() => {
    if (open && selectedOrgId) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setSelectedFiles(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing localstorage", e);
        }
      }
    }
  }, [open, selectedOrgId, storageKey]);

  // --- 1. FETCH ORGANIZATIONS & DETAILS ---
  // Intha query unga `route.js` la irunthu Org, Contacts, matrum Attributes-ai edukkum
  // const { data: orgData, isLoading: isLoadingOrgs } = useQuery({
  //   queryKey: ["ticketCreateData", selectedOrgId],
  //   queryFn: async () => {
  //     const url = selectedOrgId
  //       ? `/tickets/organizations?orgId=${selectedOrgId}`
  //       : `/tickets/organizations`;
  //     const res = await api.get(url);
  //     return res.data.data;
  //   },
  //   enabled: open,
  // });

  // // Find selected org details from the list
  // const currentOrg = selectedOrgId
  //   ? orgData?.find((o) => o.id === selectedOrgId)
  //   : null;
  // const contacts = currentOrg?.Contacts || [];
  // const attributes = currentOrg?.Attributes || [];

  const currentOrg = selectedOrgId
    ? orgData?.find((o) => o.id === selectedOrgId)
    : null;

  const contacts = currentOrg?.Contacts || [];

  // 2. Antha org-oda attributes-ai edunga (Portal-la show panna allow pannatha mattum)
  const activeAttributes =
    currentOrg?.Attributes?.filter((att) => att.includeInPortal) || [];

  const handleDynamicChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [name]: value,
      },
    }));
  };

  // --- 2. FILE UPLOAD LOGIC ---
  const fileUploadMutation = useMutation({
    mutationFn: async ({ file, tempId }) => {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const res = await api.post(
        `/Tickets/${selectedOrgId}/upload-attachment`,
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted);
          },
        },
      );
      return { ...res.data, tempId };
    },
    onSuccess: (data) => {
      setSelectedFiles((prev) => {
        const updated = prev.map((f) =>
          f.id === data.tempId
            ? { ...f, url: data.url, publicId: data.publicId, isLocal: false }
            : f,
        );
        // Save only successfully uploaded files to localStorage
        const toStore = updated
          .filter((f) => !f.isLocal)
          .map(({ preview, ...rest }) => ({ ...rest, preview: rest.url }));
        localStorage.setItem(storageKey, JSON.stringify(toStore));
        return updated;
      });
      setUploadProgress(0);
      toast.success("File uploaded");
    },
    onError: (err, vars) => {
      setSelectedFiles((prev) => prev.filter((f) => f.id !== vars.tempId));
      setUploadProgress(0);
      console.log(err);
      toast.error(err?.response?.data?.message || "Upload failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (publicId) => {
      await api.delete(
        `Tickets/${selectedOrgId}/upload-attachment?publicId=${publicId}`,
      );
    },
    // onSuccess: () => {
    //   toast.success("Image Deleted");
    // },
    onError: (error) => {
      toast.error("Deleted Failed");
    },
  });

  const handleDelete = (file) => {
    setSelectedFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== file.id);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
      return filtered;
    });

    if (file.publicId) {
      deleteMutation.mutate(file.publicId);
    }
    toast.success("File removed");
  };

  // --- 3. CREATE TICKET MUTATION ---
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const submitData = new FormData();
      submitData.append("summary", payload.summary);
      submitData.append("description", payload.description);
      submitData.append("priority", payload.priority);
      submitData.append("organizationId", selectedOrgId);
      submitData.append("contactId", payload.contactId);
      submitData.append("creatorId", payload.contactId);
      submitData.append("creatorType", "portal_user");
      submitData.append(
        "customAttributes",
        JSON.stringify(payload.customFields),
      );

      const attachments = selectedFiles
        .filter((f) => !f.isLocal)
        .map((f) => ({
          url: f.url,
          publicId: f.publicId,
          name: f.name,
          type: f.type,
        }));
      submitData.append("attachmentUrl", JSON.stringify(attachments));

      const response = await api.post(
        `/Tickets/${selectedOrgId}/TicketRoutes`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log("Create Ticket", response.data.data);

      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Ticket created successfully!");
      setOpen(false);
      resetForm();
      queryClient.invalidateQueries(["tickets"]);
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedOrgId)
      return !selectedOrgId && toast.error("Select Organization first");

    const tempId = Date.now();
    setSelectedFiles((prev) => [
      ...prev,
      {
        id: tempId,
        name: file.name,
        type: file.type,
        isLocal: true,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      },
    ]);
    fileUploadMutation.mutate({ file, tempId });
  };

  const handleCreate = () => {
    const { summary, description, contactId, priority } = formData;
    // Validation Logic
    if (!selectedOrgId) {
      return toast.error("Please select an organization");
    }
    if (!contactId) {
      return toast.error("Please select a contact");
    }
    if (!summary.trim()) {
      return toast.error("Summary is required");
    }
    if (!description.trim()) {
      return toast.error("Description is required");
    }
    if (!priority) {
      return toast.error("Please select a priority");
    }

    // Dynamic Attributes Validation (Optional: activeAttributes-la irukura mandatory fields-um check pannanum-na ithai use pannalam)
    const missingAttribute = activeAttributes.find(
      (attr) => attr.isRequired && !formData.customFields[attr.name],
    );

    if (missingAttribute) {
      return toast.error(`${missingAttribute.name} is required`);
    }

    // All checks passed, now call mutation
    createMutation.mutate(formData);
  };

  const renderDynamicInput = (attr) => {
    const commonProps = {
      placeholder: `Enter ${attr.name}`,
      required: attr.isRequired,
      value: formData.customFields?.[attr.name] || "",
      onChange: (e) => handleDynamicChange(attr.name, e.target.value),
      className: `w-full rounded-md h-11 transition-all `,
      disabled: isLoadingOrgs, // Submit aagum pothu disable panna
    };

    switch (attr.type) {
      case "Text Field":
        return <Input {...commonProps} type="text" />;
      case "Number":
        return <Input {...commonProps} type="number" />;
      case "Text Area":
        return (
          <Textarea
            rows="3"
            {...commonProps}
            className={`w-full p-3 border rounded-lg text-sm resize-none `}
          />
        );
      case "Date":
        return <Input {...commonProps} type="date" />;
      case "List":
        return (
          <Select
            required={attr.isRequired}
            value={formData.customFields?.[attr.name] || ""}
            onValueChange={(val) => handleDynamicChange(attr.name, val)}
          >
            <SelectTrigger className={`py-5.5 w-full`}>
              <SelectValue placeholder={`Select ${attr.name}`} />
            </SelectTrigger>
            <SelectContent sideOffset={2} position="popper">
              {attr.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return <Input {...commonProps} type="text" />;
    }
  };

  const isUploading = fileUploadMutation.isPending;
  const isCreating = createMutation.isPending;
  const isActionLocked = isUploading || isCreating;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => !createMutation.isPending && setOpen(val)}
    >
      <DialogTrigger asChild>
        <button className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all shadow-md active:scale-95">
          <Plus size={16} /> New Ticket
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-175 rounded-4xl  p-6 outline-none border-none shadow-2xl flex flex-col overflow-hidden bg-white max-h-[95vh]">
        <DialogHeader className="p-4 border-b border-gray-800">
          <DialogTitle className="text-lg font-semibold">
            Create a ticket
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5 overflow-y-auto no-scrollbar flex-1">
          {/* Organization Select */}
          <div className="space-y-1.5">
            <FormLabel>Organization</FormLabel>
            <Select
              value={selectedOrgId}
              onValueChange={setSelectedOrgId}
              disabled={isLoadingOrgs || isActionLocked}
            >
              <SelectTrigger
                className={`py-5.5 w-full bg-white text-black border-slate-200 ${
                  isLoadingOrgs
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isLoadingOrgs && (
                    <Loader2
                      size={14}
                      className="animate-spin text-indigo-500"
                    />
                  )}
                  <SelectValue
                    placeholder={
                      isLoadingOrgs
                        ? "Loading organizations..."
                        : "Select Organization"
                    }
                  />
                </div>
              </SelectTrigger>
              <SelectContent className="" sideOffset={2} position="popper">
                {orgData?.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact Select (Based on Org) */}
          <div className="space-y-1.5">
            <FormLabel>Contact</FormLabel>
            <Select
              disabled={!selectedOrgId || isActionLocked}
              value={formData.contactId}
              onValueChange={(val) =>
                setFormData({ ...formData, contactId: val })
              }
            >
              <SelectTrigger className="py-5.5 w-full">
                <SelectValue
                  placeholder={
                    selectedOrgId
                      ? "Select Contact"
                      : "Select an organization first"
                  }
                />
              </SelectTrigger>
              <SelectContent className="" sideOffset={2} position="popper">
                {contacts.map((contact) => {
                  const initials =
                    `${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase();

                  return (
                    <SelectItem
                      key={contact.id}
                      value={contact.id}
                      className=""
                    >
                      <div className="flex items-center gap-3 ">
                        {/* Profile Avatar with Initials */}
                        <div className="h-9 w-9 rounded-full bg-blue-100 border border-indigo-200 flex items-center justify-center shadow-sm shrink-0">
                          <span className="text-blue-700 text-xs font-bold">
                            {initials || "???"}
                          </span>
                        </div>
                        {/* Contact Info (Name & Email) */}
                        <div className="flex flex-col items-start leading-tight">
                          <span className="text-sm text-gray-800 ">
                            {contact.firstName} {contact.lastName}
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium">
                            {contact.email}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <FormLabel>Summary</FormLabel>
            <Input
              className={`w-full rounded-md h-11 transition-all outline-none   border-slate-200`}
              value={formData.summary}
              placeholder="Summary"
              disabled={isActionLocked}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <FormLabel>Description</FormLabel>
            <Textarea
              className="  min-h-24 resize-none"
              value={formData.description}
              disabled={isActionLocked}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <FormLabel color="text-gray-400">Priority</FormLabel>
            <RadioGroup
              value={formData.priority}
              onValueChange={(val) =>
                setFormData({ ...formData, priority: val })
              }
              className="flex gap-4"
            >
              {["Low", "Medium", "High"].map((p) => (
                <div key={p} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={p}
                    id={p}
                    className="border-gray-500 text-indigo-500"
                  />
                  <Label
                    htmlFor={p}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {p}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {activeAttributes.length > 0 && (
            <div className="space-y-4 mt-4 pt-4 border-t border-gray-800">
              <h3 className="text-sm font-medium text-gray-400">
                Custom Attributes
              </h3>
              {activeAttributes.map((attr) => (
                <div
                  disabled={isActionLocked}
                  key={attr.id}
                  className="space-y-1.5"
                >
                  <FormLabel mandatory={attr.isRequired}>{attr.name}</FormLabel>
                  {renderDynamicInput(attr)}
                </div>
              ))}
            </div>
          )}

          {/* --- MODERN ATTACH FILE SECTION --- */}
          <div className="pt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />

            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                disabled={isActionLocked}
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-colors ${isActionLocked ? "opacity-50 cursor-not-allowed bg-slate-50" : "hover:bg-slate-50 bg-white shadow-sm"}`}
              >
                <Paperclip size={18} className="rotate-45 text-slate-600" />
                <span className="text-sm font-medium">Attach a file</span>
              </button>

              <AnimatePresence>
                {selectedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100"
                  >
                    <span className="text-[11px] font-bold">
                      {selectedFiles.length}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-tight">
                      {selectedFiles.length === 1 ? "File" : "Files"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 mt-4">
                <AnimatePresence>
                  {selectedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative group w-24 h-24 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shadow-sm"
                    >
                      <div
                        className={`w-full h-full flex items-center justify-center transition-opacity ${file.isLocal ? "opacity-30" : "opacity-100"}`}
                      >
                        {file.preview ? (
                          <img
                            src={file.preview}
                            className="w-full h-full object-cover"
                            alt="preview"
                          />
                        ) : (
                          <div className="flex flex-col items-center p-2">
                            <FileText
                              className={
                                file.type.includes("pdf")
                                  ? "text-red-500"
                                  : "text-blue-500"
                              }
                              size={24}
                            />
                            <span className="text-[8px] mt-1 text-center line-clamp-2 px-1">
                              {file.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {file.isLocal && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                          <svg className="w-10 h-10 transform -rotate-90">
                            <circle
                              cx="20"
                              cy="20"
                              r="16"
                              stroke="#e2e8f0"
                              strokeWidth="3"
                              fill="transparent"
                            />
                            <motion.circle
                              cx="20"
                              cy="20"
                              r="16"
                              stroke="#f97316"
                              strokeWidth="3"
                              fill="transparent"
                              strokeDasharray="100.5"
                              animate={{
                                strokeDashoffset:
                                  100.5 - (100.5 * uploadProgress) / 100,
                              }}
                            />
                          </svg>
                          <span className="absolute text-[9px] font-bold text-orange-600">
                            {uploadProgress}%
                          </span>
                        </div>
                      )}

                      {!file.isLocal && (
                        <button
                          onClick={() => handleDelete(file)}
                          disabled={isActionLocked}
                          className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2.5 sm:justify-between">
          <button
            onClick={() => setOpen(false)}
            disabled={isActionLocked}
            className="flex-1 px-4 py-2.5 text-xs font-black border rounded-2xl text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
          >
            Cancel
          </button>
          <RippleButton
            disabled={isActionLocked || !selectedOrgId}
            onClick={handleCreate}
            className="flex-1 justify-center rounded-2xl h-11 text-xs font-black  uppercase tracking-widest shadow-lg shadow-blue-100"
          >
            {createMutation.isPending && (
              <Loader2 size={16} className="animate-spin" />
            )}
            Create
          </RippleButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
