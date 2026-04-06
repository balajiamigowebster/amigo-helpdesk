"use client";

import React, { memo, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ChevronUp,
  ChevronDown,
  UserX,
  AlertCircle,
  LoaderCircle,
  Ticket,
  CircleDot,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const LiveTimeAgo = memo(({ timestamp, labelColor = "text-slate-600" }) => {
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 10 seconds-ku oru murai 'now' state-ai update pannum

    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const timeText = useMemo(() => {
    if (!timestamp) return "---";
    const eventDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - eventDate) / 1000);

    if (diffInSeconds < 0) return "Just now"; // Future date handle panna
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
    return (
      <span className="text-slate-400 animate-pulse italic text-[11px]">
        Calculating...
      </span>
    );

  return (
    <span className={`font-bold tracking-tight text-[12px] ${labelColor}`}>
      {timeText}
    </span>
  );
});

LiveTimeAgo.displayName = "LiveTimeAgo";

const TABLE_HEADERS = [
  { id: "id", label: "ID", width: "w-20" }, // specific width
  { id: "summary", label: "Summary", width: "w-[350px]" }, // 320px approx
  { id: "assignee", label: "Assignee", width: "w-48" },
  { id: "creator", label: "Creator", width: "w-48" },
  { id: "organization", label: "Organization", width: "w-[250px]" },
  { id: "priority", label: "Priority", width: "w-[150px]" },
  { id: "category", label: "Category", width: "w-32" },
  { id: "status", label: "Status", width: "w-32" },
  { id: "created", label: "Created", width: "w-[160px]" },
  { id: "updated", label: "Updated", width: "w-[160px]" },
  { id: "ResponseTime", label: "Response", width: "w-[160px]", hasIcon: true },
  { id: "DueDate", label: "Due Date", width: "w-[160px]" },
  { id: "CloseTime", label: "Close Time", width: "w-[160px]" },
];

// --- PRIORITY UI HELPER ---
const PriorityBadge = ({ priority }) => {
  const styles = {
    High: "bg-red-50 text-red-600 border-red-100 shadow-[0_0_8px_rgba(239,68,68,0.2)]",
    Medium:
      "bg-amber-50 text-amber-600 border-amber-100 shadow-[0_0_8px_rgba(245,158,11,0.2)]",
    Low: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-[0_0_8px_rgba(16,185,129,0.2)]",
  };

  const dotColors = {
    High: "bg-red-500 animate-pulse",
    Medium: "bg-amber-500",
    Low: "bg-emerald-500",
  };

  const currentStyle =
    styles[priority] || "bg-slate-50 text-slate-500 border-slate-100";
  const currentDot = dotColors[priority] || "bg-slate-400";

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold tracking-wide uppercase ${currentStyle}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${currentDot}`}></span>
      {priority}
    </div>
  );
};

// --- STATUS UI HELPER ---
const StatusBadge = ({ status }) => {
  const config = {
    open: {
      color: "bg-blue-50 text-blue-600 border-blue-200",
      icon: <CircleDot className="w-3 h-3" />,
      label: "Open",
    },
    waiting: {
      color: "bg-purple-50 text-purple-600 border-purple-200",
      icon: <Clock className="w-3 h-3" />,
      label: "Waiting",
    },
    closed: {
      color:
        "bg-slate-100 text-slate-500 border-slate-200 line-through opacity-70",
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: "Closed",
    },
  };

  const active = config[status?.toLowerCase()] || config.open;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-extrabold uppercase transition-all ${active.color}`}
    >
      {active.icon}
      {active.label}
    </div>
  );
};

// const allTickets = [...initialTickets, ...extraTickets];

// --- TICKET ROW COMPONENT ---
const TicketRow = ({ ticket, onRowClick }) => {
  const formattedDueDate = ticket.dueDate
    ? format(new Date(ticket.dueDate), "MMM dd, yyyy")
    : "---";

  return (
    <tr
      onClick={() => onRowClick(ticket.id)}
      className="border-b border-slate-100 hover:bg-blue-50/50 text-center cursor-pointer text-[13px] transition-colors group"
    >
      <td className="pl-2 py-4 w-10">
        <Checkbox className="border-slate-300" />
      </td>
      <td className="p-3 font-mono text-slate-700 border-r border-slate-200 ">
        {ticket.displayId}
      </td>
      <td className="p-3 font-medium text-slate-700 border-r border-slate-200 max-w-72 truncate ">
        {ticket.summary}
      </td>
      <td className="p-4 text-[13px] border-r min-w-40 border-slate-200 text-slate-700">
        {ticket.assigneeName || "Unassigned"}
      </td>
      <td className="p-4 text-[13px] border-r min-w-40 truncate border-slate-200 text-slate-700">
        {ticket.Creator?.email || "---"}
      </td>
      <td className="p-4 text-[13px] border-r min-w-40 truncate border-slate-200 text-slate-700">
        {ticket.Organization?.name || ticket.orgSlug}
      </td>
      <td className="p-4 border-r border-slate-100">
        <PriorityBadge priority={ticket.priority} />
      </td>
      <td className="p-4 text-[13px] border-r border-slate-200 text-slate-500">
        {ticket.category}
      </td>
      <td className="p-4 border-r border-slate-100">
        <StatusBadge status={ticket.status} />
      </td>
      <td className="p-4 text-[13px] text-slate-500 border-r border-slate-200">
        <LiveTimeAgo timestamp={ticket.createdAt} />
      </td>
      <td className="p-4 text-[13px] text-slate-500 border-r border-slate-200">
        <LiveTimeAgo timestamp={ticket.updatedAt} />
      </td>
      <td className="p-4 border-r border-slate-200">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[12px] text-slate-500">
            {ticket.responseTime || "---"}
          </span>
          {/* <MoreHorizontal
            size={16}
            className="text-slate-400 opacity-0 group-hover:opacity-100 cursor-pointer"
          /> */}
        </div>
      </td>
      <td className="p-4 text-[13px] text-slate-500 border-r border-slate-200">
        {formattedDueDate}
      </td>
      <td className="p-4 text-[13px] text-slate-500 border-r border-slate-200">
        {ticket.closeTime || "---"}
      </td>
    </tr>
  );
};

// --- MAIN TABLE COMPONENT ---
export default function TicketTable({ statusFilter }) {
  // Sorting state: columnId and direction ('asc', 'desc', or null)
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });
  const router = useRouter();

  const user = useSelector((state) => state.auth.user);
  const adminId = user?.id;

  const handleTicketClick = (orgId, ticketId) => {
    // console.log("ORGID", orgId);
    // Unga route structure-padi: /dashboard/tickets/[ticketId]
    if (!orgId) {
      toast.error("Organization ID missing");
      return;
    }
    router.push(`/dashboard/tickets/${ticketId}`);
  };

  // console.log("adminId", adminId);

  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orgAdminTickets", adminId, statusFilter],
    queryFn: async () => {
      const response = await api.get(
        `/OrgAdminAllTickets/${adminId}/getAll-tickets?status=${statusFilter}`,
        // `/OrgAdminAllTickets/${adminId}/getAll-tickets`,
      );
      // console.log(response.data);
      return response.data;
    },
    enabled: !!adminId,
  });

  // console.log("Ticket Table", apiResponse);

  const tickets = apiResponse?.data || [];

  const handleSort = (columnId, direction) => {
    // Click panna highlight logic
    setSortConfig({ key: columnId, direction });
    // console.log(`Sorting ${columnId} in ${direction} order`);
  };

  // 1. Admin ID illana
  if (!adminId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200 m-4">
        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
          <UserX className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">
          Authentication Required
        </h3>
        <p className="text-slate-500 text-sm max-w-xs text-center">
          We couldn't find your admin profile. Please log in again to view
          tickets.
        </p>
      </div>
    );
  }

  // 2. Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoaderCircle className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        {/* <p className="text-slate-500 font-medium animate-pulse">
          Fetching tickets from server...
        </p> */}
      </div>
    );
  }

  // 3. API Error vanthaal
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="bg-red-50 p-6 rounded-full mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">
          Oops! Something went wrong
        </h3>
        <p className="text-slate-500 text-sm mt-2 mb-6 max-w-md">
          {error?.response?.data?.message ||
            "We encountered an error while loading the tickets. Please check your connection or try again later."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // 3. Ticket Illana - Empty State (No Table Header)
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] bg-white rounded-2xl shadow-sm border border-slate-100 m-4">
        <div className="relative mb-6">
          <div className="absolute -inset-1 bg-blue-100 rounded-full blur animate-pulse"></div>
          <div className="relative bg-white p-5 rounded-full border border-blue-50 shadow-inner">
            <Ticket className="w-14 h-14 text-blue-500" />
          </div>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          No Tickets Found
        </h3>
        <p className="text-slate-400 mt-2 text-center max-w-xs">
          Your inbox is clear! There are no tickets assigned to this
          organization at the moment.
        </p>
      </div>
    );
  }

  return (
    <div
      // className=" flex flex-col bg-white min-h-[60vh] max-w-50 md:max-w-125 lg:max-w-250  "
      className=" flex flex-col bg-white w-full max-w-50 md:max-w-125 lg:max-w-250 border border-slate-200 rounded-lg shadow-sm h-fit max-h-[calc(100vh-180px)]  "
    >
      {/* Header Info */}
      <div className="px-4 py-2 border-b border-slate-100 bg-white">
        <p className="text-[11px] font-semibold tracking-wide">
          {isLoading
            ? "Fetching..."
            : `${apiResponse?.count || 0} Tickets Found`}
        </p>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full min-w-max border-collapse table-fixed  ">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr className="text-slate-500 font-bold uppercase tracking-tighter">
              {/* Checkbox Column (Always First) */}
              <th className="pl-2 py-4 w-10 bg-white">
                <Checkbox className="border-slate-300" />
              </th>
              {/* Mapping Headers from Array */}
              {TABLE_HEADERS.map((header) => {
                const isCurrentCol = sortConfig.key === header.id;
                return (
                  <th
                    key={header.id}
                    className={`p-4 ${header.width} font-bold text-neutral-500 bg-white border-r border-slate-200 last:border-r-0 hover:bg-slate-50 transition-colors cursor-pointer group`}
                  >
                    <div
                      className={`flex items-center text-neutral-900 text-[12px] font-bold justify-center tracking-wider gap-1.5 ${
                        header.id === "lastMessage" ? "justify-start" : ""
                      }`}
                    >
                      <span className="text-neutral-900 text-[12px] font-bold tracking-wider">
                        {header.label}
                      </span>
                      {/* Separate Up and Down Icon Container */}
                      <div className="flex flex-col -space-y-1">
                        <ChevronUp
                          size={13}
                          strokeWidth={5}
                          className={`cursor-pointer transition-colors ${
                            isCurrentCol && sortConfig.direction === "asc"
                              ? "text-neutral-950" // Highlight Up
                              : !isCurrentCol || sortConfig.direction === null
                                ? "text-neutal-800" // Normal/Both active state
                                : "text-slate-200" // Dimmed
                          }`}
                          onClick={() => handleSort(header.id, "asc")}
                        />
                        <ChevronDown
                          size={13}
                          strokeWidth={5}
                          className={`cursor-pointer transition-colors ${
                            isCurrentCol && sortConfig.direction === "desc"
                              ? "text-neutral-950" // Highlight Down
                              : !isCurrentCol || sortConfig.direction === null
                                ? "text-neutal-800" // Normal/Both active state
                                : "text-slate-200" // Dimmed
                          }`}
                          onClick={() => handleSort(header.id, "desc")}
                        />
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                onRowClick={() => {
                  const oId = ticket.organizationId || ticket.Organization?.id;
                  handleTicketClick(oId, ticket.id);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
