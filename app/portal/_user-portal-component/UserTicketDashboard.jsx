"use client";

import { Search, Inbox, Loader2, LogOut, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { memo, useEffect, useMemo, useState } from "react";
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
import { useRouter } from "next/navigation";
import { logoutAction } from "../logoutAction";
import { toast } from "sonner";
import SubmitTicketModal from "./SubmitTicketModal";
import { useQuery } from "@tanstack/react-query";
import { IoTicketOutline } from "react-icons/io5";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import api from "@/api";

// React.memo use pannuna, props (timestamp) maaruna mattum thaan
// indha component process aagum.
// const LiveTimeAgo = memo(({ timestamp }) => {
//   const [timeText, setTimeText] = useState("");

//   useEffect(() => {
//     const calculateTime = () => {
//       const now = new Date();
//       const createdDate = new Date(timestamp);
//       const diffInSeconds = Math.floor((now - createdDate) / 1000);

//       if (diffInSeconds < 1) {
//         setTimeText("Just now");
//         return;
//       }

//       const minutes = Math.floor(diffInSeconds / 60);
//       const seconds = diffInSeconds % 60;
//       const hours = Math.floor(minutes / 60);
//       const days = Math.floor(hours / 24);

//       if (days > 0) setTimeText(`${days}d ago`);
//       else if (hours > 0) setTimeText(`${hours}h ${minutes % 60}m ago`);
//       else if (minutes > 0) setTimeText(`${minutes}m ${seconds}s ago`);
//       else setTimeText(`${seconds}s ago`);
//     };

//     calculateTime();
//     const timer = setInterval(calculateTime, 1000);

//     return () => clearInterval(timer);
//   }, [timestamp]);

//   // Inga Console log panni paarunga, indha component mattum thaan update aagum
//   // console.log("Rendering only Time cell");

//   return (
//     <span className="font-medium text-gray-600">
//       {timeText}
//     </span>
//   );
// });\

// --- OPTIMIZED LIVE TIME AGO COMPONENT ---
const LiveTimeAgo = memo(({ timestamp }) => {
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // console.log("LiveTimeAgo Rerender");

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 10000); // 10 seconds-ku oru murai update pannum (Battery/Perf optimized)
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
  if (!mounted)
    return <span className="font-semibold text-slate-400">...</span>;

  return <span className="font-semibold text-slate-600">{timeText}</span>;
});

export default function UserTicketDashboard({
  org,
  portalData,
  userEmail,
  themeConfig,
  userId,
  onLogout, // Logout function call panna ithe add pannikonga
}) {
  const bannerColor = themeConfig.banner;
  const buttonColor = themeConfig.button;
  const textColor = themeConfig.text;
  const [isImageOpen, setIsImageOpen] = useState(false); // Modal state
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  // --- NEW: Status filter state ---
  const [statusFilter, setStatusFilter] = useState("open");

  // console.log("orgId", org.id);
  // console.log("userId", userId);

  const {
    data: tickets = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["userTickets", org.id, userId, statusFilter],
    queryFn: async () => {
      const response = await api.get(`/Tickets/${org.id}/TicketRoutes`, {
        params: {
          creatorId: userId,
          role: "portal_user",
          status: statusFilter,
        },
      });
      // console.log(response.data.data);
      return response.data.data;
    },
    refetchOnWindowFocus: true, // Focus varum pothu refresh aagum
    // staleTime: 1000 * 60 * 2, // 2 mins varai data-vai fresh-aa vachirukkum
  });

  // Filter logic
  // Filter logic
  const filteredTickets = tickets.filter(
    (t) =>
      t.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  console.log("filteredTickets", filteredTickets);

  // --- LOGOUT LOGIC WITH 2 SEC DELAY ---
  const handleFinalLogout = async () => {
    setIsLoggingOut(true); // Show "Ending Session" overlay
    setShowLogoutDialog(false); // Close the dialog immediately

    try {
      const response = await logoutAction();

      if (response.success || response.code === "NO_SESSION") {
        setTimeout(() => {
          // Note: Refresh aagum pothu Server Component thirumba run aagi
          // isLoggedIn false aagidum, automatic-ah login page vandhidum.
          setIsLoggingOut(false);
          router.refresh();
        }, 2000);
      } else {
        setIsLoggingOut(false);
        toast.error(response.message || "Logout failed. Please try again.");
      }
    } catch (error) {
      // console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  // console.log(portalData);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* 1. LOGGING OUT OVERLAY */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-100 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
            <p className="text-white font-black tracking-widest uppercase text-xs italic">
              Ending Session...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Professional Navbar */}

      <AnimatePresence>
        {isImageOpen && portalData.portalImageUrl && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-10">
            {/* Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImageOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-zoom-out"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full flex flex-col items-center"
            >
              <button
                onClick={() => setIsImageOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors bg-white/10 p-2 rounded-full"
              >
                <X size={24} />
              </button>

              <img
                src={portalData.portalImageUrl}
                alt={org.name}
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10"
              />

              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white mt-4 font-black uppercase tracking-widest  text-lg"
              >
                {org.name}
              </motion.p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-20">
        <div className="flex items-center gap-8">
          {portalData.portalImageUrl ? (
            <motion.img
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsImageOpen(true)}
              src={portalData.portalImageUrl}
              alt={org.name}
              className="w-10 h-10 object-cover rounded-full cursor-zoom-in border-2 border-slate-100 shadow-sm"
            />
          ) : (
            <div className="w-0"></div>
          )}

          <span className="font-black text-xl tracking-tighter uppercase text-gray-800">
            {org.name}
          </span>
          {/* <a
            href="#"
            className={`font-semibold border-b-2 ${themeConfig.border} pb-1 ${textColor}`}
          >
            Home
          </a> */}
        </div>

        <div className="flex items-center gap-4">
          <SubmitTicketModal
            buttonColor={buttonColor}
            orgId={org.id}
            themeConfig={themeConfig}
            user={{ id: userId, email: userEmail }}
          />

          <div className="flex items-center gap-3 border-l pl-4">
            {/* Avatar - bannerColor dynamic update */}
            <div
              className={`${bannerColor} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white cursor-pointer`}
              //onClick={onLogout} // Avatar-ai click panna logout aagura mathiri vachirukaen
              //title="Click to Logout"
            >
              {userEmail ? userEmail.substring(0, 2).toUpperCase() : "KK"}
            </div>
            <span className="text-sm font-medium text-gray-500 hidden md:block">
              {userEmail || "Guest"}
            </span>
            {/* LOGOUT BUTTON WITH ICON */}
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="p-2.5 rounded-xl flex items-center gap-3 cursor-pointer bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 group shadow-sm border border-red-100"
              title="Logout"
            >
              <LogOut
                size={18}
                className="group-hover:rotate-12 transition-transform"
              />{" "}
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Welcome Banner - bannerColor added here */}
      <div className={`${bannerColor} py-16 text-center text-white relative`}>
        <h1 className="text-4xl md:text-5xl font-black  tracking-tighter uppercase drop-shadow-md">
          {portalData.loginWelcomeMessage}
        </h1>
      </div>

      {/* Ticket List Section */}
      <main className="max-w-6xl mx-auto w-full px-4 -mt-10 mb-20 z-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
          {/* --- HEADER CONTROLS --- */}
          <div className="p-5 border-b flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <Select
                // defaultValue="open"
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val)}
              >
                <SelectTrigger
                  className={`w-45 bg-white  text-slate-700  transition-all  ${themeConfig.focusBorder} `}
                  // style={{
                  //   borderColor: themeConfig.ring,
                  //   "--tw-ring-color": themeConfig.ring,
                  // }}
                >
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open" className=" text-slate-600">
                    Open Tickets
                  </SelectItem>
                  <SelectItem value="closed" className=" text-slate-600">
                    Closed Tickets
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full md:w-80">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search ticket ID or summary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 rounded-md h-11 transition-all outline-none border-slate-200 ${themeConfig.focusBorder} border-slate-200`}
                // style={{
                //   borderColor: themeConfig.ring,
                //   "--tw-ring-color": themeConfig.ring,
                // }}
              />
            </div>
          </div>

          {/* --- TABLE CONTAINER WITH FIXED HEIGHT & SCROLL --- */}
          <div
            className={`overflow-x-auto overflow-y-auto max-h-75 scrollbar-thin scrollbar-thumb-slate-200`}
          >
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10 shadow-sm">
                <tr className="text-slate-500 font-bold uppercase text-[11px] tracking-widest">
                  <th className="px-6 py-4 border-b border-slate-200">
                    Ticket ID
                  </th>
                  <th className="px-6 py-4 border-b border-slate-200">
                    Summary
                  </th>
                  <th className="px-6 py-4 border-b border-slate-200">
                    Description
                  </th>
                  <th className="px-6 py-4 border-b border-slate-200">
                    Assignee
                  </th>
                  <th className="px-6 py-4 border-b border-slate-200">
                    Updated
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr className="max-h-60">
                    <td colSpan="5" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-10 w-10 animate-spin text-slate-300 mb-3" />
                        <p className="text-slate-400 font-bold italic tracking-tight">
                          Syncing with server...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => {
                        // Unique ID use panni navigate panrom
                        // org slug generate panrom (e.g., "My Org" -> "my-org")
                        const orgSlug =
                          org.slug ||
                          org.name.toLowerCase().replace(/\s+/g, "-");
                        router.push(
                          `/portal/${orgSlug}/ticket/${org.id}/${ticket.id}`,
                        );
                      }}
                      className="hover:bg-slate-50 transition-all cursor-pointer group border-transparent hover:border-slate-200"
                    >
                      <td className="px-6 py-5">
                        <span className="font-black text-[13px] text-slate-600 bg-neutral-100 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm group-hover:bg-neutral-800 group-hover:text-white transition-colors">
                          {ticket.displayId}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-800 text-sm leading-tight max-w-50 truncate">
                          {ticket.summary}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">
                        <div className="text-sm max-w-62.5 truncate">
                          {ticket.description || "No description provided."}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {/* <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase border border-white shadow-sm">
                            {ticket.assigneeName
                              ? ticket.assigneeName.substring(0, 2)
                              : "UN"}
                          </div> */}
                          <span className="text-sm font-bold text-slate-600">
                            {ticket.assigneeName || "Unassigned"}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 text-start">
                        <div className="text-[13px] font-black ml-5 text-slate-500 whitespace-nowrap  px-2 py-1 rounded">
                          <LiveTimeAgo timestamp={ticket.updatedAt} />
                        </div>
                        {/* <div className="text-[13px] font-black text-slate-500 whitespace-nowrap  py-1 ">
                          N/A
                        </div> */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center">
                      {" "}
                      {/* py-32 koraichu 16 vachiruken height koraika */}
                      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="bg-slate-100 p-6 rounded-full mb-4">
                          <IoTicketOutline
                            size={48}
                            className="text-slate-500"
                          />
                        </div>
                        <p className="font-black uppercase tracking-widest text-slate-500 text-sm">
                          No Tickets Found
                        </p>
                        <p className="text-slate-400 text-xs mt-2 font-medium">
                          Adjust your filters or search query.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- FOOTER INFO --- */}
          <div className="px-6 py-3 bg-slate-50/50 border-t text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex justify-between">
            <span>Total: {filteredTickets.length} Tickets</span>
            {/* <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />{" "}
              Live updates active
            </span> */}
          </div>
        </div>
      </main>

      {/* --- ALERT DIALOG FOR LOGOUT --- */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="rounded-[1.5rem] max-w-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl   tracking-tight text-gray-900">
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-medium leading-relaxed">
              Are you sure you want to log out from{" "}
              <span className="font-bold text-gray-800">{org.name}</span>{" "}
              portal? Your session will be cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="bg-slate-100 border-none rounded-xl font-bold text-gray-600 hover:bg-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Default closing-ai prevent panni namma manual logic handle pandrom
                handleFinalLogout();
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-black  tracking-tight rounded-xl shadow-lg shadow-red-200"
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
