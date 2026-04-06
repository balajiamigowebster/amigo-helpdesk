"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// --- TICKET DATA GENERATION ---
const initialTickets = [
  {
    id: 1,
    requester: "HelpDesk",
    email: "support@helpdesk.com",
    subject: "Step 1: 👋 Welcome to HelpDesk! See the next steps",
    status: "Open",
    time: "about 1 hour ago",
    avatar: "H",
    color: "bg-purple-600",
  },
  {
    id: 2,
    requester: "HelpDesk",
    email: "support@helpdesk.com",
    subject: "Step 2: 🤝 Work together with your team",
    status: "Open",
    time: "about 1 hour ago",
    avatar: "H",
    color: "bg-purple-600",
  },
];

// Inga 60 extra tickets generate panrom
const extraTickets = Array.from({ length: 60 }, (_, i) => ({
  id: i + 3,
  requester: "Kali Raja",
  email: "kali@example.com",
  subject: `Sample Ticket #${i + 3}: Learning to solve tickets effectively`,
  status: "Open",
  time: `${i + 2} hours ago`,
  avatar: "KR",
  color: "bg-orange-500",
}));

const TABLE_HEADERS = [
  {
    id: "requester",
    label: "REQUESTER",
    align: "text-left",
  },
  { id: "subject", label: "SUBJECT", align: "text-left" },
  { id: "agent", label: "AGENT", align: "text-left" },
  { id: "status", label: "STATUS", align: "text-left" },
  {
    id: "lastMessage",
    label: "LAST MESSAGE",
    align: "text-left",
    hasIcon: true,
  },
];

const allTickets = [...initialTickets, ...extraTickets];

// --- TICKET ROW COMPONENT ---
const TicketRow = ({ ticket }) => {
  return (
    <tr className="border-b border-slate-100 hover:bg-blue-50/50 cursor-pointer transition-colors group">
      <td className="pl-4 py-4 w-10">
        <Checkbox className="border-slate-300" />
      </td>

      <td className="p-4 min-w-55">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 shrink-0 rounded-full ${
              ticket.color || "bg-slate-400"
            } text-white flex items-center justify-center font-semibold text-sm`}
          >
            {ticket.avatar}
          </div>
          <div className="flex flex-col leading-tight">
            <p className="text-[13px] font-medium text-slate-900">
              {ticket.requester}
            </p>
            <p className="text-[12px] text-slate-500">{ticket.email}</p>
          </div>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[10px]">●</span>
          <p className="text-[13px] text-slate-800  cursor-pointer line-clamp-1">
            {ticket.subject}
          </p>
        </div>
      </td>

      <td className="p-4 text-[13px] text-slate-600">unassigned</td>

      <td className="p-4">
        <Badge
          variant="secondary"
          className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none font-medium text-[11px] px-2.5 py-0.5 rounded-full"
        >
          {ticket.status}
        </Badge>
      </td>

      <td className="p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[12px] text-slate-500 whitespace-nowrap">
            {ticket.time}
          </span>
          <MoreHorizontal
            className="text-slate-400 cursor-pointer hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
            size={18}
          />
        </div>
      </td>
    </tr>
  );
};

// --- MAIN TABLE COMPONENT ---
export default function TicketTable() {
  return (
    <div className="w-full flex flex-col bg-white min-h-[60vh]">
      {/* Header Info */}
      <div className="px-4 py-2 border-b border-slate-100 bg-white">
        <p className="text-[11px] font-semibold text-slate-400">
          {allTickets.length} tickets
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse min-w-200">
          <thead className="bg-white border-b border-slate-100 sticky top-0 z-10">
            <tr className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              {/* Checkbox Column (Always First) */}
              <th className="pl-2 py-4 w-10 bg-white">
                <Checkbox className="border-slate-300" />
              </th>
              {/* Mapping Headers from Array */}
              {TABLE_HEADERS.map((header) => (
                <th
                  key={header.id}
                  className={`p-4 ${header.align} font-bold text-neutral-500 bg-white`}
                >
                  <div
                    className={`flex items-center text-neutral-900 text-[12px] font-bold uppercase tracking-wider gap-1 ${
                      header.id === "lastMessage" ? "justify-start" : ""
                    }`}
                  >
                    {header.label}
                    {header.hasIcon && (
                      <ArrowDown size={14} className="text-slate-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allTickets.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
