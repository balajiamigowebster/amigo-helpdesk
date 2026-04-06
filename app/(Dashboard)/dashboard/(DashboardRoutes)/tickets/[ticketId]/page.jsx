"use client"; // TanStack use panna idhu mukkiyam
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiMoreVertical,
  FiPaperclip,
  FiSend,
  FiUser,
  FiActivity,
  FiLoader,
  FiRefreshCw,
  FiAlertCircle,
  FiEdit2,
  FiChevronDown,
  FiLock,
  FiUnlock,
  FiInfo,
  FiCheckCircle,
  FiSmile,
  FiDownload,
  FiUserMinus,
  FiArrowUp,
} from "react-icons/fi";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { LoaderCircle, LucidePin } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  FiType,
  FiAlignLeft,
  FiList,
  FiPhone,
  FiCalendar,
  FiHash,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmojiPicker from "emoji-picker-react";
import useSound from "use-sound";
import { Switch } from "@/components/ui/switch"; // Shadcn Switch
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Shadcn Tooltip
import { toast } from "sonner";
import { CgSpinnerTwo } from "react-icons/cg";
import MessagesSkeleton from "@/app/portal/[slug]/ticket/[orgId]/[ticketId]/_Message-Skeleton/MessageSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import { FullTimeStamp, LiveTimeAgo } from "./_TimeStampComponets/TimeStamp";
import { FiFileText, FiImage } from "react-icons/fi";
import { BsFileEarmarkPdf } from "react-icons/bs"; // PDF icon-ku
import { IoIosClose } from "react-icons/io";
import { FiUserCheck } from "react-icons/fi"; // Related Icon
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AttachmentDisplay from "./AttachmentDisplay";

const AttachmentPreview = ({ file, isDone, onRemove }) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [progress, setProgress] = useState(0);

  // Preview handle panna
  useEffect(() => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // UI progress logic: Respose vara varaikum fake-ah move aagum
  useEffect(() => {
    let interval;
    if (!isDone) {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 3 : prev));
      }, 700);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isDone]);

  // File type check panni icon select panra helper

  const renderFileContent = () => {
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    const contentClass = `w-full h-full flex items-center justify-center transition-opacity duration-300 ${
      isDone ? "opacity-100" : "opacity-40"
    }`;

    if (isImage) {
      return (
        previewUrl && (
          <img
            src={previewUrl}
            className="w-full h-full object-cover"
            alt="preview"
          />
        )
      );
    }

    if (isPdf) {
      return (
        <div className={contentClass}>
          <BsFileEarmarkPdf size={28} className="text-red-500" />
        </div>
      );
    }

    return (
      <div className={contentClass}>
        <FiFileText size={28} className="text-blue-500" />
      </div>
    );
  };

  return (
    <div
      className={`relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group shadow-sm transition-all ${!isDone ? "border-blue-100" : "border-gray-200"}`}
    >
      {/* Dynamic Content Based on Type */}
      <div className={`w-full h-full ${!isDone ? "bg-gray-100" : "bg-white"}`}>
        {renderFileContent()}
      </div>

      {/* Circle Progress Overlay */}
      {!isDone && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px]">
          <svg className="w-10 h-10 transform -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              className="text-white/50"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={100}
              strokeDashoffset={100 - progress}
              className="text-blue-600 transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>
          {/* Percentage text (Optional) */}
          <span className="absolute text-[8px] font-bold text-blue-700">
            {progress}%
          </span>
        </div>
      )}

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg hover:bg-red-600"
      >
        <IoIosClose size={15} />
      </button>

      {/* File Extension Badge (Small) */}
      <div className="absolute bottom-1 left-1 bg-white/80 px-1 rounded text-[7px] font-bold uppercase text-gray-500 border border-gray-100">
        {file.name.split(".").pop()}
      </div>
    </div>
  );
};

const AdminTicketView = () => {
  const router = useRouter();
  const params = useParams(); // URL path-la irunthu ticketId eduka
  const [attachments, setAttachments] = useState([]); // Final uploaded objects for DB
  const [tempFiles, setTempFiles] = useState([]); // Files currently being uploaded
  const [showScrollTop, setShowScrollTop] = useState(false); // Scroll top button visibility state
  // Ticket status state
  const [currentStatus, setCurrentStatus] = useState("");
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    content: "",
  });
  const [isPrivate, setIsPrivate] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_isPrivate");
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  }); // Private Note Toggle
  const [showToUser, setShowToUser] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_showToUser");
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  }); // User Visibility Toggle

  // console.log(attachments);

  const { ticketId } = params;

  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth.user);
  const adminId = user?.id;

  const [content, setContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef(null);
  const emojiRef = useRef(null);
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window !== "undefined" && adminId) {
      const saved = localStorage.getItem(`isPinned_${adminId}`);
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const fileInputRef = useRef(null);
  // public folder-la 'send.mp3' file irukanum. Illati intha URL placeholder use pannikalam.
  const [play] = useSound("/sound/msg-tone.mp3", { volume: 1 });
  // console.log(orgId, ticketId);

  // Emoji picker-ah veliya click panna close panna
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem("admin_isPrivate", JSON.stringify(isPrivate));
  }, [isPrivate]);

  useEffect(() => {
    localStorage.setItem("admin_showToUser", JSON.stringify(showToUser));
  }, [showToUser]);

  // Update effect
  useEffect(() => {
    if (adminId) {
      localStorage.setItem(`isPinned_${adminId}`, JSON.stringify(isPinned));
    }
  }, [isPinned, adminId]); // Update effect
  useEffect(() => {
    if (adminId) {
      localStorage.setItem(`isPinned_${adminId}`, JSON.stringify(isPinned));
    }
  }, [isPinned, adminId]);

  const {
    data: ticket,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["AdminTicketView", adminId, ticketId],
    queryFn: async () => {
      // Ippo unga API-ku rendaiyum pass pannalam
      const response = await api.get(
        `/OrgAdminAllTickets/${adminId}/ticket-view/${ticketId}`,
      );
      console.log(response.data.data);
      return response.data.data;
    },
    enabled: !!adminId && !!ticketId,
  });

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) {
      // console.log("❌ scrollRef is null!"); // இது வந்தா அதுதான் problem
      return;
    }

    // console.log("scrollContainer", scrollContainer);

    const handleScroll = () => {
      // Current scroll position-ah direct-ah check pannunga
      const isScrolled = scrollContainer.scrollTop > 300;

      // Previous state-oda compare panni state update-ah optimize pannalaam
      setShowScrollTop((prev) => {
        if (prev !== isScrolled) return isScrolled;
        return prev;
      });
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [isLoading]); // Empty array ok, but state update-ah function-ah kudukanum (setShowScrollTop(prev => ...))

  const scrollToTop = () => {
    console.log("Scroll", scrollToTop);
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  console.log("Ticket View", ticket);

  const fetchedOrgId = ticket?.organizationId;
  const role = ticket?.senderProfile.senderRole; // Unga API response-padi field name check pannikonga

  // --- FETCH MESSAGES WITH POLLING ---

  // --- OPTIMISTIC SEND MESSAGE ---
  const sendMessageMutation = useMutation({
    mutationFn: async (payload) => {
      const orgId = ticket.organizationId;
      const response = await api.post(
        `/Tickets/${orgId}/${ticketId}/messages`,
        payload,
      );
      // console.log(response.data);
      return response.data;
    },
    onMutate: async (newMessage) => {
      console.log("1. Mutation Triggered with:", newMessage); // Inga content irukannu check pannunga
      // 1. Cancel outgoing refetches (to prevent overwrite)
      await queryClient.cancelQueries({
        queryKey: ["messages", ticketId],
      });

      // 2. Snapshot the previous value (for rollback on error)
      const previousMessages = queryClient.getQueryData(["messages", ticketId]);
      console.log("2. Previous Messages from Cache:", previousMessages);

      // 3. Create optimistic message object
      const optimisticId = crypto.randomUUID();

      const optimisticMsg = {
        ...newMessage,
        id: optimisticId,
        senderId: adminId,
        createdAt: new Date().toISOString(),
        status: "sending",
        isOptimistic: true, // Identifying flag
      };

      console.log("3. Final Optimistic Object:", optimisticMsg); // Idhu dhaan UI-la render aagum

      // 4. Optimistically update the list
      queryClient.setQueryData(["messages", ticketId], (old = []) => {
        return [...old, optimisticMsg];
      });

      // 5. Clear the input field immediately
      setContent("");
      setAttachments([]); // Message sent aana apram attachments clear pannanum
      setTempFiles([]);

      // Return context with rollback data and temp ID
      return { previousMessages, optimisticId };
    },
    onError: (err, newMessage, context) => {
      // Rollback to previous state if error occurs
      queryClient.setQueryData(
        ["messages", ticketId],
        context.previousMessages,
      );
      toast.error(err.response?.data?.error || "Failed to send message");
    },
    onSuccess: (serverData, variables, context) => {
      // serverData-la { message: "...", data: { content: "hii", ... } } nu varudhu
      const realMessage = serverData.data;

      queryClient.setQueryData(["messages", ticketId], (old = []) => {
        return old.map((msg) =>
          // Optimistic message-oda ID-ah vachu find panni replace panrom
          msg.id === context.optimisticId
            ? { ...realMessage, isOptimistic: false, status: "sent" }
            : msg,
        );
      });
      play();
    },
    // onSettled: () => {
    //   // Sync issues varaama irukka final-ah oru refetch
    //   queryClient.invalidateQueries({ queryKey: ["messages", ticketId] });
    // },
  });

  const {
    data: messages,
    isLoading: messagesLoading,
    isError: messagesError,
  } = useQuery({
    queryKey: ["messages", ticketId],
    queryFn: async () => {
      const response = await api.get(
        `/Tickets/${fetchedOrgId}/${ticketId}/messages?role=${role}`,
      );
      console.log(response.data.data.messages);
      return response.data.data.messages || [];
    },
    enabled: !!ticketId && !!fetchedOrgId,
    refetchInterval: sendMessageMutation.isPending ? false : 10000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (ticket?.status) {
      setCurrentStatus(ticket.status);
    }
  }, [ticket?.status]);

  const handleAssigneeChange = (newAssigneeId) => {
    // "unassigned" nu select panna null-ah anupanum
    const valueToSend = newAssigneeId === "unassigned" ? null : newAssigneeId;

    attributeUpdateMutation.mutate({
      field: "assigneeId",
      newValue: valueToSend,
    });
  };

  // --- OPTIMISTIC STATUS UPDATE ---
  const attributeUpdateMutation = useMutation({
    mutationFn: async ({ field, newValue }) => {
      const orgId = ticket.organizationId;
      const response = await api.patch(
        `/Tickets/${orgId}/${ticketId}/update-message-attributes`,
        {
          field,
          newValue,
          adminId: ticket.senderProfile.senderId,
          adminName: ticket.senderProfile.senderName,
          senderRole: ticket.senderProfile.senderRole,
        },
      );
      console.log(response.data);
      return response.data;
    },
    onMutate: async ({ field, newValue }) => {
      if (field === "status") setCurrentStatus(newValue);
    },
    onSuccess: () => {
      // 2. Update aana udane toast message kaaturoam
      toast.success("Ticket updated successfully");

      // 3. Cache Invalidation:
      // Ithu thaan main. API success aana udane, TanStack Query moolama
      // Messages (Activity-oda saerthu) mattrum Ticket details-ah fresh-ah fetch panrom.
      // Appo thaan backend-la create aana antha 'Activity Message' automatic-ah UI-la varum.
      queryClient.invalidateQueries({
        queryKey: ["messages", ticketId],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["AdminTicketView", adminId, ticketId],
        refetchType: "all",
      });
    },
    onError: (err) => {
      // 4. Ethavathu error vantha toast-la kaata
      const errorMsg = err.response?.data?.error || "Update failed!";
      toast.error(errorMsg);
    },
  });

  // --- MUTATION: UPLOAD ATTACHMENT ---
  const uploadAttachmentMutation = useMutation({
    mutationFn: async ({ file, tempId }) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(
        `Tickets/${fetchedOrgId}/${ticketId}/upload-message-attachment`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          // Optional: Progress track pannanum na inga palam
        },
      );
      return { data: res.data, tempId };
    },
    onSuccess: (response) => {
      const { data, tempId } = response;
      if (data.success) {
        // 1. Move to final attachments for the next message/ticket update

        const newAttachment = {
          ...data.attachments,
          tempId,
        };

        setAttachments((prev) => [...prev, newAttachment]);
        // 2. Mark as done in temp UI
        setTempFiles((prev) =>
          prev.map((t) =>
            t.id === tempId
              ? { ...t, isDone: true, url: data.attachments.url }
              : t,
          ),
        );
        toast.success("File uploaded!");
      }
    },
    onError: (err, variables) => {
      toast.error("Upload failed");
      setTempFiles((prev) => prev.filter((t) => t.id !== variables.tempId));
    },
  });

  // --- HANDLER ---
  const handleFileChange = (e) => {
    // return toast.error("upload failed");
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "text/plain",
      "application/zip",
      "application/x-zip-compressed", // Windows zip support-kaga
      "application/x-zip", // Matha zip formats-kaga
    ];
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes

    if (!allowedTypes.includes(file.type)) {
      toast.error("Format not supported!");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 3. Size Check (1MB)
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large! Maximum size allowed is 1MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const tempId = crypto.randomUUID();
    // UI-la preview kaata temp list-la add panrom
    setTempFiles((prev) => [...prev, { id: tempId, file, isDone: false }]);

    // Trigger Mutation
    uploadAttachmentMutation.mutate({ file, tempId });

    // Reset input so user can upload same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();

    const trimmedContent = content.trim();
    const hasAttachments = attachments.length > 0;

    // ✅ Validation 1: Content AND Attachment check
    // Content-um illa, attachments-um illana thaan error kaatanum
    if (!trimmedContent && !hasAttachments) {
      toast.error("Please enter a message or attach a file!");
      return;
    }

    // Validation 2: Profile Check
    if (!ticket?.senderProfile) {
      toast.error("User profile not found. Please refresh.");
      return;
    }

    // Validation 3: Prevent Multiple Clicks
    if (sendMessageMutation.isPending) return;

    const messageContent = content.trim() || "Sent an attachment";

    const basePayload = {
      content: messageContent,
      senderId: ticket.senderProfile.senderId,
      senderName: ticket.senderProfile.senderName,
      senderMail: ticket.senderProfile.senderMail,
      senderRole: ticket.senderProfile.senderRole,
      type: "message",
      isPrivate: isPrivate, // Inga oru toggle switch vecha internal note-kum use pannalam
      showToUser: showToUser,
    };

    // 2. Base payload spread panni, attachmentUrl condition check panrom
    const finalPayload = {
      ...basePayload,
      // attachments array-la data irundha atha anupum, illana null pogum
      attachmentUrl: attachments.length > 0 ? attachments : null,
    };

    sendMessageMutation.mutate(finalPayload);
  };

  const onEmojiClick = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  // 2. Helper function to trigger mutation
  const handleAttributeUpdate = (field, newValue) => {
    attributeUpdateMutation.mutate({ field, newValue });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName; // 👈 original filename with extension
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      window.open(fileUrl, "_blank");
    }
  };

  // 1. Loading State: Content hide aagi spinner mattum theriyum
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <LoaderCircle className="w-10 h-10 text-[#00a3bf] animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading ticket...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f9fafb]">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAlertCircle className="w-10 h-10 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            We couldn't load the ticket details. This might be due to a network
            issue or an invalid Ticket ID.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl transition-all active:scale-95 shadow-lg shadow-[#00a3bf]/25"
            >
              <FiRefreshCw className="w-4 h-4" /> Try Again
            </button>

            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-2xl border border-gray-200 transition-all active:scale-95"
            >
              <FiArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- LOGIC: Filter only attributes that have a value ---
  const visibleAttributes =
    ticket?.customAttributes?.filter(
      (attr) => attr.value && attr.value.toString().trim() !== "",
    ) || [];

  return (
    <div className="flex h-screen bg-[#f9fafb] text-[#1a1c21] overflow-hidden">
      {/* --- Main Content: Middle Section --- */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
        {/* Header (HelpDesk Style) */}
        {/* --- UPDATED HEADER (As per your screenshot requirement) --- */}

        <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shadow-sm shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-semibold text-base">
                  #{ticket?.displayId}
                </span>
                <button className="p-1 text-gray-500 hover:bg-gray-100 rounded-md transition">
                  <FiEdit2 size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <button
                  className="text-left group"
                  onClick={() =>
                    setModalConfig({
                      isOpen: true,
                      title: "Ticket Summary",
                      content: ticket?.summary,
                    })
                  }
                >
                  <p className="text-sm font-medium text-gray-700 line-clamp-1 cursor-pointer group-hover:text-blue-600 transition-colors">
                    {ticket?.summary || "No Summary"}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {modalConfig.isOpen && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() =>
                  setModalConfig({ ...modalConfig, isOpen: false })
                }
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-101"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {modalConfig.title}
                    </h3>
                    <button
                      onClick={() =>
                        setModalConfig({ ...modalConfig, isOpen: false })
                      }
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <IoIosClose size={24} className="text-gray-500" />
                    </button>
                  </div>

                  <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <p className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                      {modalConfig.content || "No content available."}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() =>
                        setModalConfig({ ...modalConfig, isOpen: false })
                      }
                      className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- Scroll to Top Button --- */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              onClick={scrollToTop}
              className="fixed top-16 right-[60%] z-50 p-3 bg-white border border-gray-200 text-[#00a3bf] rounded-full shadow-xl hover:bg-gray-50 transition-all active:scale-90 group"
            >
              <FiArrowUp
                size={20}
                className="group-hover:-translate-y-0.5 transition-transform"
              />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Scroll to top
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Conversation Area (Scrollable) */}
        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar scroll-smooth"
        >
          {/* --- SUMMARY SECTION (STICKY LOGIC) --- */}
          <div
            className={` pb-2 transition-all mx-0 duration-300 ${isPinned ? "sticky -top-8  z-10 bg-[#f9fafb]/80 backdrop-blur-md" : "relative"}`}
          >
            <div className="bg-white border border-gray-200   p-6 rounded-2xl   ">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col  gap-2 text-[10px] font-black  tracking-widest overflow-hidden  w-full">
                  <h1
                    className="text-lg font-bold truncate w-150 leading-tight cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() =>
                      setModalConfig({
                        isOpen: true,
                        title: "Full Description",
                        content: ticket?.description, // Inga unga description field (.description) iruntha kuduthukonga
                      })
                    }
                  >
                    {ticket?.description}
                  </h1>
                  <div className="mt-1 flex  gap-3 text-xs text-slate-400">
                    <FullTimeStamp timestamp={ticket?.createdAt} />
                  </div>
                  {ticket?.attachmentUrl && (
                    <div className="mt-4 border-t border-gray-50">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Attachments
                      </h3>
                      {/* Scroll area starts here */}
                      <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                        <div className="flex flex-nowrap gap-4 min-w-max">
                          <AttachmentDisplay
                            attachments={ticket.attachmentUrl}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-5">
                  <button className="p-1 text-gray-500 hover:text-gray-400 cursor-pointer rounded-md transition">
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => setIsPinned(!isPinned)}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${isPinned ? "bg-slate-700 text-white hover:text-white/85" : ""}`}
                  >
                    <LucidePin
                      size={16}
                      className={isPinned ? "fill-current" : ""}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Messages Loop */}
          {messagesLoading && (!messages || messages.length === 0) ? (
            <MessagesSkeleton />
          ) : messagesError ? (
            <div className="p-6 border border-red-100 bg-red-50 rounded-2xl text-center">
              <FiAlertCircle className="mx-auto text-red-500 mb-2" size={24} />
              <p className="text-sm text-red-600 font-medium">
                Failed to load messages.
              </p>
              <button
                onClick={() =>
                  queryClient.invalidateQueries(["messages", ticketId])
                }
                className="mt-2 text-xs text-red-700 underline font-bold"
              >
                Retry
              </button>
            </div>
          ) : (
            messages?.map((msg, index) => {
              // LOGIC: Login panni irukura "adminId" anupuna message LEFT-layum,
              // matha yaaru (User/Other Admins) anupunalum RIGHT-layum varum.
              const isMine = String(msg.senderId) === String(adminId);
              const isActivity = msg.type === "activity";
              // console.log(isMine);

              // if (msg.isOptimistic) {
              //   console.log("Checking Mine Status:", {
              //     msgSenderId: msg.senderId,
              //     adminId: adminId,
              //     isMine: isMine,
              //   });
              // }

              return (
                <div key={index}>
                  <div
                    className={`flex gap-4 ${isMine ? "flex-row" : "flex-row-reverse text-right"}`}
                  >
                    <div className="flex-1">
                      <div
                        className={`flex items-baseline gap-2 mb-1 ${!isMine ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {/* Sender Name Section */}
                        <div className="flex items-center gap-1.5">
                          {msg.senderRole === "SUPER_ADMIN" ? (
                            // SUPER_ADMIN Style: Gradient text with a subtle badge effect
                            <div className="flex items-center gap-1 bg-blue-50/50 px-2 py-0.5 rounded-full border border-blue-100 shadow-sm">
                              <span className=" text-[13px] bg-linear-to-r  from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-normal">
                                helpdesktech
                              </span>
                              {/* Optional: Oru chinna icon SUPER_ADMIN-ku mattum */}
                              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            </div>
                          ) : (
                            // Normal User Style
                            <span className="font-bold text-[12px] text-slate-700">
                              {msg.senderName}
                            </span>
                          )}
                        </div>
                        <LiveTimeAgo timestamp={msg.createdAt} />
                      </div>

                      <div
                        className={`relative p-4 rounded-2xl shadow-sm text-[12px] inline-block max-w-2xl 
                          ${
                            msg.isPrivate || isActivity
                              ? "bg-slate-800 text-slate-100 border border-slate-700 ring-1 ring-amber-500/20 shadow-lg"
                              : isMine
                                ? "bg-white border border-gray-200"
                                : "bg-teal-50 text-teal-900 border border-teal-100"
                          } 
                          ${isMine ? "rounded-tl-none" : "rounded-tr-none"}`}
                      >
                        {/* Private Note Indicator Badge */}
                        {msg.isPrivate && (
                          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-amber-500 mb-2 border-b border-slate-700 pb-1">
                            <FiLock size={12} /> Internal Note
                          </div>
                        )}

                        <div className="whitespace-pre-wrap flex items-center gap-2 flex-wrap ">
                          {isActivity && msg.activityMeta ? (
                            <>
                              <span>{msg.content.split("from")[0]}</span>
                              <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                                {msg.activityMeta.from || "none"}
                              </span>
                              <span className="text-slate-400 mx-1">→</span>
                              <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/30">
                                {msg.activityMeta.to}
                              </span>
                            </>
                          ) : (
                            msg.content
                          )}
                        </div>

                        {msg.attachmentUrl &&
                          Array.isArray(msg.attachmentUrl) &&
                          msg.attachmentUrl.length > 0 && (
                            <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-gray-100/20">
                              {msg.attachmentUrl.map((file, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 bg-black/5 p-2 rounded-lg group"
                                >
                                  <div className="w-10 h-10 shrink-0 rounded bg-white overflow-hidden flex items-center justify-center border border-gray-100">
                                    {file.type?.startsWith("image/") ? (
                                      <img
                                        src={file.url}
                                        alt="att"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : file.type === "application/pdf" ? (
                                      <BsFileEarmarkPdf
                                        size={20}
                                        className="text-red-500"
                                      />
                                    ) : (
                                      <FiFileText
                                        size={20}
                                        className="text-blue-500"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] truncate opacity-70">
                                      {file.name}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleDownload(file.url, file.name)
                                    }
                                    className="p-1.5 hover:bg-white rounded-full transition-colors text-blue-500"
                                  >
                                    <FiDownload size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                        <div className="absolute -bottom-5 right-0 flex items-center gap-1">
                          {msg.status === "sending" || msg.isOptimistic ? (
                            <CgSpinnerTwo
                              className="animate-spin text-blue-400"
                              size={14}
                            />
                          ) : (
                            <FiCheckCircle
                              className="text-blue-500"
                              size={11}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>
        {/* Reply Box Section (Sticky at bottom) */}
        <div className="p-6 bg-white border-t border-gray-100 relative">
          {/* --- EMOJI PICKER WITH FRAMER MOTION --- */}
          <AnimatePresence>
            {showEmoji && !sendMessageMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute bottom-32 right-6 z-50 shadow-2xl origin-bottom-left"
                ref={emojiRef}
              >
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme={isPrivate ? "dark" : "light"} // Private note-la irukkumbothu dark theme Picker
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xl shadow-gray-200/50 ring-1 ring-black/5">
            {/* --- ATTACHMENT PREVIEWS (Horizontal Scroll) --- */}

            {tempFiles.length > 0 && (
              <div className="flex flex-nowrap items-center gap-3 mb-3 p-2 border-b border-gray-50 overflow-x-auto custom-scrollbar min-h-25">
                {tempFiles.map((t) => (
                  <div key={t.id} className="shrink-0">
                    <AttachmentPreview
                      file={t.file}
                      isDone={t.isDone}
                      onRemove={() => {
                        setTempFiles((prev) =>
                          prev.filter((item) => item.id !== t.id),
                        );
                        setAttachments((prev) =>
                          prev.filter((a) => a.tempId !== t.id),
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={
                uploadAttachmentMutation.isPending ||
                sendMessageMutation.isPending
              }
              className={`w-full resize-none  text-sm placeholder-gray-400 min-h-20 transition-colors duration-300 ${isPrivate ? "bg-amber-500/20  " : "bg-transparent text-gray-800"} disabled:cursor-not-allowed`}
              placeholder={
                isPrivate
                  ? "Write a private note for the team..."
                  : "Type your response to the user..."
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <div
              className={`flex items-center justify-between mt-3 border-t pt-3 border-gray-50 ${isPrivate ? "border-slate-700" : "border-gray-50"}`}
            >
              <div className="flex items-center gap-6">
                {/* Private Toggle Button */}
                <button
                  disabled={sendMessageMutation.isPending}
                  onClick={() =>
                    !sendMessageMutation.isPending && setIsPrivate(!isPrivate)
                  }
                  className={`flex items-center gap-2 text-[10px]  select-none uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg transition-all
                    ${
                      isPrivate
                        ? "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/50"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }${sendMessageMutation.isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                >
                  {isPrivate ? <FiLock size={12} /> : <FiUnlock size={12} />}{" "}
                  Private Note
                </button>
                {/* Show to User Toggle (Only when Private) */}
                {/* {isPrivate && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                    <Switch
                      id="show-user"
                      checked={showToUser}
                      onCheckedChange={setShowToUser}
                      className="data-[state=checked]:bg-blue-500"
                    />
                    <label
                      htmlFor="show-user"
                      className="text-[10px] font-bold text-slate-400 uppercase tracking-tight"
                    >
                      Show to User
                    </label>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-slate-500 hover:text-slate-300">
                            <FiInfo size={14} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-slate-800 text-white border-slate-700 text-xs max-w-xs"
                        >
                          <p>
                            If enabled, this private activity will be visible in
                            the user's timeline but marked as an update.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )} */}
              </div>

              <div className="flex items-center gap-3 ml-2">
                <div className="flex items-center gap-3 ml-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    onClick={() => {
                      !sendMessageMutation.isPending &&
                        fileInputRef.current?.click();
                    }}
                    disabled={
                      sendMessageMutation.isPending ||
                      uploadAttachmentMutation.isPending
                    }
                    className={` transition-colors ${sendMessageMutation.isPending || uploadAttachmentMutation.isPending ? "cursor-not-allowed opacity-40" : "cursor-pointer" + (isPrivate ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-blue-600")}`}
                  >
                    <FiPaperclip size={18} />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={
                    sendMessageMutation.isPending ||
                    uploadAttachmentMutation.isPending
                  }
                  onClick={() => setShowEmoji(!showEmoji)}
                  className={`transition-colors ${
                    showEmoji
                      ? "text-blue-500"
                      : isPrivate
                        ? "text-slate-500 hover:text-slate-300"
                        : "text-gray-400 hover:text-blue-600"
                  }`}
                >
                  <FiSmile size={20} />
                </button>
                <Button
                  disabled={
                    sendMessageMutation.isPending ||
                    (!content.trim() && attachments.length === 0) ||
                    uploadAttachmentMutation.isPending
                  }
                  onClick={handleSendMessage}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95
                    ${
                      isPrivate
                        ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                        : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20"
                    }${sendMessageMutation.isPending || uploadAttachmentMutation.isPending || (!content.trim() && attachments.length === 0) ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {sendMessageMutation.isPending
                    ? "Sending..."
                    : isPrivate
                      ? "Add Note"
                      : "Submit Response"}
                  {!sendMessageMutation.isPending && <FiSend />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Right Sidebar: Spiceworks Info Panel --- */}
      <aside className="w-95 bg-white overflow-y-auto border-l border-gray-200 shrink-0 hidden lg:block">
        <div className="p-6 space-y-8">
          {/* Main Actions */}

          {ticket?.senderProfile?.senderRole !== "ORG_TECH" && (
            <div className="flex items-center justify-end gap-2">
              {/* --- Dynamic Button Group --- */}
              <div className="flex items-center">
                <Button
                  onClick={() => {
                    // Main button click panna "Close" status pogaum (except if already waiting/closed)

                    const nextStatus =
                      currentStatus === "waiting" || currentStatus === "closed"
                        ? "open"
                        : "closed";
                    handleAttributeUpdate("status", nextStatus);
                  }}
                  className="h-10 w-28 px-4 select-none rounded-r-none  bg-blue-500 hover:bg-blue-600 shadow-lg shadow-[#00a3bf]/20 transition-all  text-white  text-md border-r border-blue-600"
                >
                  {attributeUpdateMutation.isPending ? (
                    <CgSpinnerTwo className="animate-spin" />
                  ) : currentStatus === "waiting" ? (
                    "Resume"
                  ) : currentStatus === "closed" ? (
                    "Reopen"
                  ) : (
                    "Close"
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      className="h-10 px-3 rounded-l-none 
        bg-blue-500 hover:bg-blue-600 
        text-white
        border border-blue-600 border-l
        shadow-sm"
                    >
                      <FiChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48"
                    side="bottom"
                  >
                    {/* Wait for user option - Only show if not already waiting */}
                    {currentStatus !== "waiting" && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleAttributeUpdate("status", "waiting")
                        }
                        className="text-xs py-3 cursor-pointer"
                      >
                        Wait for user
                      </DropdownMenuItem>
                    )}
                    {/* Resume option in dropdown if status is waiting */}
                    {currentStatus === "waiting" && (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange("status", "open")}
                        className="text-xs py-3 cursor-pointer"
                      >
                        Resume
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-xs py-3 cursor-pointer">
                      Merge into another ticket
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      // onClick={() => {/* Delete Logic */}}
                      className="text-xs cursor-pointer py-3 data-highlighted:bg-red-50 data-highlighted:text-red-600 text-red-600 font-medium"
                    >
                      Delete ticket
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          {/* Info Card Section */}
          <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5 flex justify-between items-center">
              Ticket Parameters <span className="text-[14px]">⬎</span>
            </h3>
            <div className="space-y-5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Ticket ID</span>
                <span className="font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                  {ticket.displayId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">
                  Current Status
                </span>
                <span className="bg-orange-100 text-orange-700 font-bold py-1 px-3 rounded-full text-[10px] uppercase">
                  {ticket.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Priority</span>
                <span className="text-red-600 font-black text-[10px] uppercase border-b-2 border-red-200">
                  {ticket.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Assignee Section */}
          {ticket?.senderProfile?.senderRole !== "ORG_TECH" && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 bg-blue-50 rounded-lg">
                  <FiUserCheck className="text-blue-600 w-4 h-4" />
                </span>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Assignee
                </h3>
              </div>

              <Select
                defaultValue={ticket?.assigneeId || "unassigned"}
                onValueChange={handleAssigneeChange}
              >
                <SelectTrigger className="w-full py-6 bg-white border-gray-200 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all">
                  {/* Loading state indicator (Optional but good) */}
                  {attributeUpdateMutation.isPending &&
                  attributeUpdateMutation.variables?.field ===
                    "assignedToId" ? (
                    <div className="flex items-center gap-2 text-blue-500 font-bold">
                      <CgSpinnerTwo className="animate-spin" /> Updating...
                    </div>
                  ) : (
                    <SelectValue placeholder="Select Assignee" />
                  )}
                </SelectTrigger>

                <SelectContent
                  sideOffset={2}
                  position="popper"
                  className="rounded-xl shadow-xl border-gray-100 p-1"
                >
                  <p className="text-[10px] font-bold text-gray-400 px-3 py-2 uppercase tracking-tight">
                    Assignment Options
                  </p>

                  <SelectItem
                    value="unassigned"
                    className="rounded-lg py-5 mb-0.5 focus:bg-red-50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border-2 border-dashed border-gray-300 shadow-sm">
                        <AvatarFallback className="bg-gray-100 text-gray-400 text-xs font-bold">
                          <FiUserMinus className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-md text-gray-500">
                          Unassigned
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          No employee assigned
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                  {/* Dynamic Assignees from Response */}
                  {ticket?.attributes?.assignee?.all?.map((emp) => {
                    // Role based color logic
                    const getRoleColor = (role) => {
                      switch (role) {
                        case "OWNER":
                          return "bg-yellow-500";
                        case "ORG_ADMIN":
                          return "bg-orange-500";
                        case "ORG_TECH":
                          return "bg-blue-500";
                        default:
                          return "bg-gray-500";
                      }
                    };
                    return (
                      <SelectItem
                        key={emp.id}
                        value={emp.id}
                        className="rounded-lg py-5 mb-0.5 focus:bg-blue-50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                            <AvatarFallback
                              className={`${getRoleColor(emp.role)} text-white text-xs font-bold`}
                            >
                              {emp.name
                                ? emp.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .substring(0, 2)
                                    .toUpperCase()
                                : "???"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex flex-col items-start leading-tight">
                            <span className="text-md text-gray-800 font-medium">
                              {emp.name}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {emp.email} ,{" "}
                              <span className="text-blue-600/80 font-semibold uppercase">
                                {emp.role}
                              </span>
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </section>
          )}
          {/* Custom Attributes Section */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5">
              Custom Attributes
            </h3>
            <div className="space-y-4">
              {visibleAttributes && visibleAttributes.length > 0 ? (
                visibleAttributes.map((attr, idx) => {
                  const getFieldIcon = (label) => {
                    switch (label?.toLowerCase()) {
                      case "text area":
                        <FiAlignLeft className="text-orange-500" />;
                      case "list":
                        return <FiList className="text-purple-500" />;
                      case "phone":
                        return <FiPhone className="text-green-500" />;
                      case "date":
                        return <FiCalendar className="text-blue-500" />;
                      case "number":
                        return <FiHash className="text-pink-500" />;
                      default:
                        return <FiType className="text-blue-400" />;
                    }
                  };

                  // --- Dynamic Input Rendering Logic ---
                  const renderInput = () => {
                    const commonClass =
                      "w-full bg-white border-gray-200 focus:ring-blue-500";
                    switch (attr.type) {
                      case "textarea":
                        return (
                          <Textarea
                            defaultValue={attr.value}
                            className="min-h-20"
                          />
                        );
                      case "select":
                        return (
                          <Select defaultValue={attr.value}>
                            <SelectTrigger className="w-full min-h-10">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent sideOffset={2} position="popper">
                              {attr.options?.map((opt, idx) => (
                                <SelectItem key={idx} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      case "date":
                        return (
                          <Input
                            type="date"
                            defaultValue={attr.value}
                            className="min-h-10"
                          />
                        );
                      case "number":
                        return (
                          <Input
                            className="min-h-10"
                            type="number"
                            onChange={() => {}}
                            value={attr.value}
                          />
                        );
                      default:
                        return (
                          <Input
                            type="text"
                            onChange={() => {}}
                            value={attr.value}
                            className="min-h-10"
                          />
                        );
                    }
                  };

                  return (
                    <div key={idx} className="group">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-1 bg-gray-50 rounded text-sm">
                          {getFieldIcon(attr.label)}
                        </span>
                        <label className="text-[12px] text-gray-500 uppercase font-bold">
                          {attr.label}
                        </label>
                      </div>
                      <div className="relative">{renderInput()}</div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[11px] text-gray-400 italic text-center py-4 border border-dashed rounded-xl">
                  No custom attributes
                </p>
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
};

export default AdminTicketView;
