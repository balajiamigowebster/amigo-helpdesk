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
import { Textarea } from "@/components/ui/textarea"; // Description-kaga
import { Plus, Paperclip, Loader2 } from "lucide-react";
import RippleButton from "@/Component/RippleButton";
import { toast } from "sonner";
import { X, FileText, Image as ImageIcon, File, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function SubmitTicketModal({
  buttonColor,
  orgId,
  themeConfig,
  user,
}) {
  // console.log(orgId);

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const { button: themeButton, ring: themeRing, focusBorder } = themeConfig;
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    summary: "",
    description: "",
    customFields: {}, // Dynamic field values inga dhaan store aagum
  });

  // console.log(selectedFiles);

  const storageKey = `pending_uploads_${orgId}_${user?.id}`;

  // --- 0. RESTORE FROM LOCALSTORAGE ---
  useEffect(() => {
    if (open && orgId && user?.id) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setSelectedFiles(JSON.parse(saved));
      }
    }
  }, [open, orgId, user?.id, storageKey]);

  // console.log(formData);

  const resetForm = () => {
    setFormData({ summary: "", description: "", customFields: {} });
    setSelectedFiles([]);
    localStorage.removeItem(storageKey);
  };

  // --- 1. TANSTACK QUERY FETCHING ---
  const { data: attributes = [], isLoading: isLoadingAttrs } = useQuery({
    queryKey: ["portalAttributes", orgId],
    queryFn: async () => {
      const response = await api.get(
        `/organization/${orgId}/custom-attributes`,
      );
      console.log(response);
      // Filter: Admin portal-la allow panna fields mattum
      return response.data.data.filter((attr) => attr.includeInPortal);
    },
    //  so component mount aagum bothe fetch aagidum
    enabled: !!orgId, // Modal open aana mattum fetch pannum
    // Cache settings: Idhu romba mukkiyam
    // staleTime: 1000 * 60 * 10, // 10 mins varaikkum data fresh-aa irukkum, thirumba fetch pannaadhu
    // gcTime: 1000 * 60 * 30, // 30 mins varaikkum memory-la vachurukkum
  });

  // --- 1. File Upload Mutation ---
  // File select panna udane indha API call trigger aagum
  const fileUploadMutation = useMutation({
    mutationFn: async ({ file, tempId }) => {
      const uploadData = new FormData();
      uploadData.append("file", file);

      // Unga backend-la file upload panna oru endpoint irukanum
      const response = await api.post(
        `/Tickets/${orgId}/upload-attachment`,
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return { ...response.data, tempId }; // Ethu { url: '...', fileName: '...' } nu tharanum
    },
    onSuccess: (data) => {
      // Upload success aanathum preview list-la add pandrom
      setSelectedFiles((prev) => {
        const updatedFiles = prev.map(
          (f) =>
            f.id === data.tempId
              ? { ...f, url: data.url, publicId: data.publicId, isLocal: false }
              : f, // URL update aaguthu
        );

        // Success aana files-ai mattum storage-la vaikirom (blob preview illama)
        const toStore = updatedFiles
          .filter((f) => !f.isLocal)
          .map(({ preview, ...rest }) => ({ ...rest, preview: rest.url }));

        localStorage.setItem(storageKey, JSON.stringify(toStore));

        return updatedFiles;
      });

      toast.success("File uploaded successfully");
    },
    onError: (error, variables) => {
      // Remove the local preview if upload fails
      setSelectedFiles((prev) => {
        const filtered = prev.filter((f) => f.id !== variables.tempId);
        localStorage.setItem(
          storageKey,
          JSON.stringify(filtered.filter((f) => !f.isLocal)),
        );
        return filtered;
      });
      toast.error("Upload failed. File removed.");
    },
  });

  // --- 3. DELETE MUTATION ---
  const deleteMutation = useMutation({
    mutationFn: async (publicId) => {
      await api.delete(
        `Tickets/${orgId}/upload-attachment?publicId=${publicId}`,
      );
    },
    // onSuccess: () => {
    //   setSelectedFiles((prev) => prev.filter((f) => f.url !== url));
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

  // 3. TanStack Mutation for Ticket Creation
  const mutation = useMutation({
    mutationFn: async (payload) => {
      // Ellathaiyum ore object-ah
      const attachmentUrl = selectedFiles
        .filter((f) => !f.isLocal && f.url)
        .map((f) => ({
          url: f.url,
          publicId: f.publicId, // URL koodave ID-yum iruku
          name: f.name,
          type: f.type,
        }));

      // // File list-la irundhu data-vai pirirom
      // const urls = selectedFiles.filter((f) => !f.isLocal).map((f) => f.url);
      // const publicIds = selectedFiles
      //   .filter((f) => !f.isLocal)
      //   .map((f) => f.publicId);

      // // Multiple files-na namma first file-oda type-ai eduthukalam or generic 'multipart' nu vaikalam.
      // const fileType = selectedFiles[0]?.type || "";

      const submitData = new FormData();

      // Basic Fields
      submitData.append("summary", payload.summary);
      submitData.append("description", payload.description);
      submitData.append("creatorId", user?.id);
      submitData.append("creatorEmail", user?.email);
      submitData.append("creatorType", "portal_user");

      // Custom Dynamic Fields (Converting Object to JSON String)
      submitData.append(
        "customAttributes",
        JSON.stringify(payload.customFields),
      );

      // // IMPORTANT: FormData-la object anupuna backend-la verum "[object Object]" nu kidaikum.
      // // Athunala JSON.stringify panni anupuna dhaan backend-la parse panna mudiyum.
      // if (attachmentObjects.length > 0) {
      //   submitData.append("attachments", JSON.stringify(attachmentObjects));
      // }

      submitData.append("attachmentUrl", JSON.stringify(attachmentUrl));
      // submitData.append("attachmentPublicId", JSON.stringify(publicIds));
      // submitData.append("attachmentType", fileType);

      const response = await api.post(
        `/Tickets/${orgId}/TicketRoutes`,
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
      toast.success("Ticket submitted successfully!");
      localStorage.removeItem(storageKey); // Clear user-specific storage
      setOpen(false);
      resetForm();
      queryClient.invalidateQueries(["tickets", orgId]);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.message || "Something went wrong";
      console.log(error);
      toast.error(errorMsg);
    },
  });

  const handleCreate = () => {
    if (!formData.summary || !formData.description) {
      return toast.error("Please fill summary and description");
    }
    mutation.mutate(formData);
  };

  useEffect(() => {
    let intervel;
    if (fileUploadMutation.isPending) {
      setUploadProgress(0);
      intervel = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 93) return prev; // Wait at 85% until API responds
          return prev + 3;
        });
      }, 900);
    } else {
      setUploadProgress(100);
      clearInterval(intervel);
    }
    return () => clearInterval(intervel);
  }, [fileUploadMutation.isPending]);

  // Handle Input Changes
  const handleDynamicChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [name]: value,
      },
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Frontend Size Validation (1MB)
    // Frontend Size Validation (1MB)
    if (file.size > 1024 * 1024) {
      toast.error("File size is too large! It must be within 1MB.");
      e.target.value = ""; // Reset input
      return;
    }

    // Create Instant Preview Object
    const tempId = Date.now();
    const localFile = {
      id: tempId,
      name: file.name,
      type: file.type,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      isLocal: true, // Marker to show it's currently uploading
    };

    setSelectedFiles((prev) => [...prev, localFile]);
    fileUploadMutation.mutate({ file, tempId });
    e.target.value = "";
  };

  const removeFile = (url) => {
    setSelectedFiles((prev) => prev.filter((f) => f.url !== url));
  };

  // Icon selector logic
  const getFileIcon = (file) => {
    if (file.type === "application/pdf")
      return <FileText className="text-red-500" size={24} />;
    return <File className="text-slate-500" size={24} />;
  };

  // --- 2. DYNAMIC INPUT RENDERER ---
  const renderDynamicInput = (attr) => {
    const commonProps = {
      placeholder: `Enter ${attr.name}`,
      required: attr.isRequired,
      value: formData.customFields?.[attr.name] || "",
      onChange: (e) => handleDynamicChange(attr.name, e.target.value),
      className: `w-full rounded-md h-11 transition-all ${focusBorder} `,
      disabled: mutation.isPending, // Submit aagum pothu disable panna
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
            className={`w-full p-3 border rounded-lg text-sm resize-none ${focusBorder}`}
          />
        );
      case "Date":
        return <Input {...commonProps} type="date" />;
      case "List":
        return (
          <Select
            required={attr.isRequired}
            onValueChange={(val) => handleDynamicChange(attr.name, val)}
          >
            <SelectTrigger className={`py-5.5 w-full ${focusBorder}`}>
              <SelectValue placeholder={`Select ${attr.name}`} />
            </SelectTrigger>
            <SelectContent>
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

  return (
    <Dialog
      open={open}
      onOpenChange={(val) =>
        (!mutation.isPending || !fileUploadMutation.isPending) && setOpen(val)
      }
    >
      <DialogTrigger asChild>
        <button
          className={`${buttonColor} text-white px-5 py-2.5 rounded-md font-black text-xs flex items-center gap-2 shadow-lg tracking-widest transition-transform active:scale-95`}
        >
          <Plus size={15} />
          Create Ticket
        </button>
      </DialogTrigger>
      <DialogContent
        // LOCK LOGIC: Submitting pothu outside click or escape key block panrom
        onInteractOutside={(e) =>
          (mutation.isPending || fileUploadMutation.isPending) &&
          e.preventDefault()
        }
        onEscapeKeyDown={(e) =>
          (mutation.isPending || fileUploadMutation.isPending) &&
          e.preventDefault()
        }
        className={`sm:max-w-175 rounded-4xl  p-6 outline-none border-none shadow-2xl flex flex-col overflow-hidden bg-white max-h-[95vh] ${mutation.isPending || fileUploadMutation.isPending ? "[&>button]:hidden pointer-events-none" : ""}`}
      >
        <DialogHeader className="p-6 bg-slate-50 border-b">
          <DialogTitle className="text-xl font-bold text-slate-800">
            Submit a help desk ticket
          </DialogTitle>
          <p className="text-xs text-slate-500 mt-1">
            Simply create a ticket below. A technician will respond promptly.
          </p>
        </DialogHeader>
        <div className="p-6 flex-1 overflow-y-auto no-scrollbar space-y-4">
          {/* Form Fields */}
          <div className="space-y-1">
            <FormLabel>Summary</FormLabel>
            <Input
              disabled={mutation.isPending}
              type="text"
              placeholder="Summary"
              value={formData.summary}
              className={`w-full rounded-md h-11 transition-all outline-none border-slate-200 ${focusBorder} border-slate-200`}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <FormLabel>Description</FormLabel>
            <Textarea
              disabled={mutation.isPending}
              placeholder="Description"
              rows={5}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`w-full rounded-md h-11 transition-all outline-none border-slate-200 ${focusBorder} border-slate-200`}
            />
          </div>

          {/* --- DYNAMIC CUSTOM FIELDS --- */}
          {isLoadingAttrs ? (
            <div className="flex items-center gap-2 text-slate-400 py-4 italic text-sm">
              <Loader2 size={16} className="animate-spin" /> Fetching
              organization fields...
            </div>
          ) : (
            attributes.map((attr) => (
              <div key={attr.id} className="space-y-1">
                <FormLabel mandatory={attr.isRequired}>{attr.name}</FormLabel>
                {renderDynamicInput(attr)}
              </div>
            ))
          )}

          {/* --- ATTACH FILE UI SECTION (As per screenshot) --- */}
          <div className="pt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={fileUploadMutation.isPending} // Upload aagum pothu input disable
              multiple
            />

            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                disabled={fileUploadMutation.isPending || mutation.isPending}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Paperclip size={18} className="rotate-45 text-slate-600" />
                <span className="text-sm font-medium">Attach a file</span>
              </button>
              {/* Attachment Count Badge - Show only if count > 0 */}
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

            {/* Screenshot-la irukura athe design button */}

            {/* Selected Files Display (Optional - list style) */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 mt-4 grid grid-cols-4 gap-4">
                <AnimatePresence>
                  {selectedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative group w-24 h-24 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center"
                    >
                      {/* File Preview Content */}
                      <div
                        className={`w-full h-full flex items-center justify-center transition-opacity ${file.isLocal ? "opacity-40" : "opacity-100"}`}
                      >
                        {file.preview ? (
                          <img
                            src={file.preview}
                            className="w-full h-full object-cover"
                            alt="preview"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            {file.type.includes("pdf") ? (
                              <FileText className="text-red-500" />
                            ) : (
                              <File className="text-blue-500" />
                            )}
                            <span className="text-[8px] mt-1 px-1 truncate w-20 text-center">
                              {file.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress Circle (Only while isLocal is true) */}
                      {file.isLocal && (
                        <div className="absolute inset-0 flex items-center justify-center">
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
                              transition={{ ease: "linear" }}
                            />
                          </svg>
                          <span className="absolute text-[9px] font-bold text-orange-600">
                            {uploadProgress}%
                          </span>
                        </div>
                      )}

                      {/* Remove Button */}
                      {!file.isLocal && (
                        <button
                          onClick={() => handleDelete(file)}
                          className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
            disabled={mutation.isPending || fileUploadMutation.isPending}
            onClick={() => setOpen(false)}
            className="flex-1 px-4 py-2.5 text-xs font-black border rounded-2xl text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
          >
            Close
          </button>
          <RippleButton
            disabled={mutation.isPending || fileUploadMutation.isPending}
            className={`${themeButton} flex-1 justify-center rounded-2xl h-11 text-xs font-black  uppercase tracking-widest shadow-lg shadow-blue-100`}
            onClick={handleCreate}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Submit"
            )}
          </RippleButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
