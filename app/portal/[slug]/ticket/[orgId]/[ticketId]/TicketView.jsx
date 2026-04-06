"use client"; // TanStack use panna idhu mukkiyam
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiPaperclip,
  FiSend,
  FiActivity,
  FiRefreshCw,
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiSmile,
} from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { LoaderCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  FiType,
  FiAlignLeft,
  FiList,
  FiPhone,
  FiCalendar,
  FiHash,
} from "react-icons/fi";
import { toast } from "sonner";
import { CgSpinnerTwo } from "react-icons/cg";
import MessagesSkeleton from "./_Message-Skeleton/MessageSkeleton";
import EmojiPicker from "emoji-picker-react";
import useSound from "use-sound";
import { motion, AnimatePresence } from "framer-motion";

// --- OPTIMIZED TIME COMPONENT (Rerenders only itself) ---
const LiveTimeAgo = memo(({ timestamp }) => {
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const timeText = useMemo(() => {
    const createdDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - createdDate) / 1000);
    if (diffInSeconds < 10) return "Just now";
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${diffInSeconds}s ago`;
  }, [timestamp, now]);

  if (!mounted) return <span className="text-slate-400 text-[10px]">...</span>;
  return <span className="text-gray-400 text-[10px]">{timeText}</span>;
});

const TicketView = () => {
  const router = useRouter();
  const params = useParams(); // URL path-la irunthu ticketId eduka
  const { orgId, ticketId } = params;
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false); // Emoji picker toggle
  const scrollRef = useRef(null);
  const emojiRef = useRef(null);

  // console.log(orgId, ticketId);

  // public folder-la 'send.mp3' file irukanum. Illati intha URL placeholder use pannikalam.
  const [play] = useSound("/sound/msg-tone.mp3", { volume: 1 });

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

  const {
    data: ticket,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["ticketView", orgId, ticketId],
    queryFn: async () => {
      // Ippo unga API-ku rendaiyum pass pannalam
      const response = await api.get(
        `/Tickets/${orgId}/${ticketId}/ticket-view`,
      );
      // console.log(response.data.data);
      return response.data.data;
    },
    enabled: !!ticketId && !!orgId,
  });

  // --- TOGGLE STATUS MUTATION ---
  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      // Backend logic handles the toggle based on current status
      const response = await api.patch(
        `/Tickets/${orgId}/${ticketId}/status-toggle`,
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["ticketView", orgId, ticketId]);
      toast.success(res.message || "Status updated");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  // --- 3. SEND MESSAGE MUTATION (Fully Optimized with Optimistic UI) ---
  const sendMessageMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post(
        `/Tickets/${orgId}/${ticketId}/messages`,
        payload,
      );
      // Response-la varra data-va return pandrom (e.g., actual ID from DB)
      return response.data.data;
    },
    onMutate: async (newMessage) => {
      // 1. Cancel outgoing refetches (to prevent overwrite)
      await queryClient.cancelQueries({
        queryKey: ["messages", ticketId],
      });

      // 2. Snapshot the previous value (for rollback on error)
      const previousMessages = queryClient.getQueryData([
        "messages",
        orgId,
        ticketId,
      ]);

      // 3. Create optimistic message object
      const optimisticId = `temp-${Date.now()}`;
      const optimisticMsg = {
        ...newMessage,
        id: optimisticId,
        createdAt: new Date().toISOString(),
        status: "sending",
        isOptimistic: true, // Identifying flag
      };

      // 4. Optimistically update the list
      queryClient.setQueryData(["messages", ticketId], (old = []) => {
        return [...old, optimisticMsg];
      });

      // 5. Clear the input field immediately
      setContent("");

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
      // Replace the optimistic message with the real server data
      queryClient.setQueryData(["messages", ticketId], (old = []) => {
        return old.map((msg) =>
          msg.id === context.optimisticId
            ? { ...serverData, isOptimistic: false }
            : msg,
        );
      });
      play();
      // toast.success("Message sent!");
    },
    // onSettled: () => {
    //   // Background-la data-va fresh-a sync pannikuvom
    //   queryClient.invalidateQueries({
    //     queryKey: ["messages", orgId, ticketId],
    //   });
    // },
  });

  // --- 2. FETCH MESSAGES DATA (Dynamic Info with Polling) ---
  const {
    data: messages,
    isLoading: messagesLoading,
    isError: messagesError,
  } = useQuery({
    queryKey: ["messages", ticketId],
    queryFn: async () => {
      const response = await api.get(
        `/Tickets/${orgId}/${ticketId}/messages?role=USER`,
      );
      console.log(response.data.data.messages);
      return response.data.data.messages || [];
    },

    enabled: !!ticketId && !!orgId,
    refetchInterval: sendMessageMutation.isPending ? false : 10000,

    refetchOnWindowFocus: true,
  });

  // --- 4. SUBMIT HANDLER WITH VALIDATION ---
  const handleSendMessage = (e) => {
    e?.preventDefault();

    // Validation 1: Content check
    if (!content.trim()) {
      toast.error("Message content cannot be empty!");
      return;
    }

    // Validation 2: Profile Check
    if (!ticket?.senderProfile) {
      toast.error("User profile not found. Please refresh.");
      return;
    }

    // Validation 3: Prevent Multiple Clicks
    if (sendMessageMutation.isPending) return;

    const payload = {
      content: content.trim(),
      senderId: ticket.senderProfile.id,
      senderName: ticket.senderProfile.name,
      senderMail: ticket.senderProfile.email,
      senderRole: ticket.senderProfile.role,
      type: "message",
      isPrivate: false,
      showToUser: true,
    };

    sendMessageMutation.mutate(payload);
  };

  const onEmojiClick = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  const isClosed = ticket.status === "closed";

  return (
    <div className="flex h-screen bg-[#f9fafb] text-[#1a1c21] overflow-hidden">
      {/* --- Main Content: Middle Section --- */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
        {/* Header (HelpDesk Style) */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg  flex items-center gap-2">
                {ticket.Organization?.name || "Ticket View"}
                {/* <span className="text-gray-400 font-normal">#D1</span> */}
              </h1>
            </div>
          </div>
          {/* <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <FiMoreVertical />
            </button>
          </div> */}
        </header>

        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar scroll-smooth"
        >
          {/* Ticket Opener Message */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
              {ticket?.creatorEmail?.[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-bold text-sm">
                  {ticket?.creatorEmail}
                </span>
                <LiveTimeAgo timestamp={ticket?.createdAt} />
              </div>
              <div className="bg-white border border-gray-200 p-5 rounded-2xl rounded-tl-none shadow-sm max-w-2xl text-[15px]">
                {ticket?.description}
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
            messages?.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex gap-4 ${msg.senderRole !== "USER" ? "flex-row-reverse text-right" : ""}`}
                >
                  {/* <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${msg.senderRole === "USER" ? "bg-orange-500" : "bg-teal-600"}`}
                >
                  {msg.senderName?.[0].toUpperCase()}
                </div> */}
                  <div className="flex-1">
                    <div
                      className={`flex items-baseline gap-2 mb-1 ${msg.senderRole !== "USER" ? "justify-end items-center" : ""}`}
                    >
                      <span className="font-bold text-[12px]">
                        {msg.senderRole === "USER"
                          ? msg.senderMail
                          : msg.senderName}
                      </span>
                      <LiveTimeAgo timestamp={msg.createdAt} />
                    </div>
                    <div
                      className={`relative p-4 rounded-2xl shadow-sm text-[12px]  inline-block max-w-2xl ${msg.senderRole === "USER" ? "bg-white border border-gray-200 rounded-tl-none" : "bg-teal-50 text-teal-900 border border-teal-100 rounded-tr-none"}`}
                    >
                      {msg.content}
                      {/* <div className="absolute -bottom-5 right-0 flex items-center gap-1">
                        {typeof msg.id === "number" ? (
                          <FiCheck className="text-gray-400" size={14} />
                        ) : (
                          <FiCheckCircle className="text-blue-500" size={14} />
                        )}
                      </div> */}
                      <div className="absolute -bottom-5 right-0 flex items-center gap-1">
                        {msg.status === "sending" || msg.isOptimistic ? (
                          <CgSpinnerTwo
                            className="animate-spin text-blue-400"
                            size={14}
                          />
                        ) : (
                          <FiCheckCircle className="text-blue-500" size={14} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </main>

        {/* Reply Box Section (Sticky at bottom) */}
        <div className="p-4 bg-white border-t border-gray-100 relative">
          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }} // Keelayirunthu mela varum
                animate={{ opacity: 1, scale: 1, y: 0 }} // Normal position
                exit={{ opacity: 0, scale: 0.9, y: 20 }} // Close aagumbothu fade out
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute bottom-24 left-4 z-50 shadow-2xl origin-bottom-left"
                ref={emojiRef}
              >
                <EmojiPicker onEmojiClick={onEmojiClick} theme="light" />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Section padding p-6 -> p-4 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-lg shadow-gray-200/40 ring-1 ring-black/5">
            {" "}
            {/* Internal padding p-4 -> p-3 */}
            <Textarea
              className="w-full resize-none text-sm placeholder-gray-400 min-h-15  p-1"
              // min-h-20 (80px) -> min-h-[60px] (Kammi height)
              placeholder={
                isClosed
                  ? "This ticket is closed. Reopen to reply."
                  : "Type your response..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isClosed || sendMessageMutation.isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <div className="flex items-center justify-between mt-2 border-t pt-2 border-gray-50">
              {" "}
              {/* Margin/Padding mt-3/pt-3 -> mt-2/pt-2 */}
              <div className="flex gap-4 text-gray-400 pl-1 items-center">
                <FiPaperclip
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                  size={18}
                />
                <FiSmile
                  size={20}
                  onClick={() => setShowEmoji(!showEmoji)}
                  className={`cursor-pointer transition-colors ${showEmoji ? "text-blue-600" : "hover:text-blue-600"}`}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={
                  isClosed || sendMessageMutation.isPending || !content.trim()
                }
                className="px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none disabled:active:scale-100 disabled:grayscale-[0.5]"
                // Button size-um konjam trim pannirukkaen (py-2.5 -> py-2, text-sm -> text-xs)
              >
                {sendMessageMutation.isPending ? (
                  <>
                    Sending <CgSpinnerTwo className="animate-spin" size={14} />
                  </>
                ) : (
                  <>
                    Submit Response <FiSend size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Right Sidebar: Spiceworks Info Panel --- */}
      <aside className="w-95 bg-white overflow-y-auto border-l border-gray-200 shrink-0 hidden lg:block">
        <div className="p-6 space-y-8">
          {/* Main Actions */}
          <div className="flex gap-3">
            {/* <button className="flex-1 bg-white border border-gray-200 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              Assign Agent
            </button> */}

            {/* --- TOGGLE BUTTON SECTION --- */}
            <button
              disabled={toggleStatusMutation.isPending}
              onClick={() => toggleStatusMutation.mutate()}
              // className={`flex-1 bg-red-500 text-white py-3 rounded-md text-xs font-bold hover:opacity-90 shadow-lg shadow-[#006080]/20 transition-all active:scale-95`}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-xs  transition-all shadow-md ${toggleStatusMutation.isPending ? "opacity-70 cursor-not-allowed" : "active:scale-95 "} ${isClosed ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200" : "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200"}`}
            >
              {toggleStatusMutation.isPending ? (
                <CgSpinnerTwo className="animate-spin w-4 h-4" />
              ) : isClosed ? (
                "Reopen Ticket"
              ) : (
                "Close Ticket"
              )}
            </button>
          </div>

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

          {/* Spiceworks Attributes (The Content you wanted) */}

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
              Custom Attributes
            </h3>
            <span className="h-px flex-1 bg-slate-100"></span>
            <div className="space-y-4">
              {ticket.customAttributes && ticket.customAttributes.length > 0 ? (
                ticket.customAttributes.map((attr, idx) => {
                  const getFieldIcon = (label) => {
                    switch (label?.toLowerCase()) {
                      case "text area":
                        return <FiAlignLeft className="text-orange-500" />;
                      case "list":
                        return <FiList className="text-purple-500" />;
                      case "phone":
                        return <FiPhone className="text-green-500" />;
                      case "date":
                        return <FiCalendar className="text-blue-500" />;
                      case "number":
                        return <FiHash className="text-pink-500" />;
                      default:
                        return <FiType className="text-[#00a3bf]" />;
                    }
                  };

                  const isTextArea = attr.label?.toLowerCase() === "text area";
                  return (
                    <div
                      key={idx}
                      className="group animate-in fade-in slide-in-from-right-4 duration-300"
                      style={{ delay: `${idx * 100}ms` }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-1 bg-slate-50 rounded text-[14px]">
                          {getFieldIcon(attr.label)}
                        </span>
                        <label className="text-[10px]  text-slate-500 uppercase tracking-tight group-hover:text-slate-900 transition-colors">
                          {attr.label}
                        </label>
                      </div>
                      <div
                        className={`
                          text-sm  p-3 rounded-xl border border-slate-100 bg-white shadow-sm transition-all 
                          group-hover:border-slate-200 group-hover:shadow-md overflow-y-auto custom-scrollbar
                          ${
                            isTextArea
                              ? "max-h-32 min-h-20 leading-relaxed whitespace-pre-wrap font-normal"
                              : "flex items-center"
                          }
                        `}
                      >
                        {attr.value || (
                          <span className="text-slate-300 italic font-normal text-xs">
                            No value set
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-[11px] text-slate-400 italic">
                    No additional attributes found
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Responsibility */}
          {/* <section className="pt-6 border-t border-gray-100">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
              Ownership
            </h3>
            <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500">
                <FiUser size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-blue-600 uppercase">
                  Support Heroes
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Assigned to: <span className="italic">Unassigned</span>
                </p>
              </div>
            </div>
          </section> */}
        </div>
      </aside>
    </div>
  );
};

export default TicketView;
