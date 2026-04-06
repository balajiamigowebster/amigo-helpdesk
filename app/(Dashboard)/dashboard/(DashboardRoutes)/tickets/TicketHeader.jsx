"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Paperclip,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  LayoutGrid, // Icon for 'All'
  CircleDot, // Icon for 'Open'
  Clock, // Icon for 'Waiting'
  CheckCircle2, // Icon for 'Closed'
  UserX, // Icon for 'Unassigned'
  User, // Icon for 'My Tickets'
  AlertTriangle, // Icon for 'Past Due'
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import DashboardTicketCreate from "./DashboardTicketCreate";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";

// --- CONFIGURATION ARRAYS ---
// --- UPDATED CONFIGURATION WITH ICONS ---
const FILTER_OPTIONS = [
  {
    value: "all",
    label: "All",
    icon: <LayoutGrid size={14} className="text-slate-500" />,
  },
  {
    value: "open",
    label: "Open",
    icon: <CircleDot size={14} className="text-blue-500" />,
  },
  {
    value: "waiting",
    label: "Waiting",
    icon: <Clock size={14} className="text-purple-500" />,
  },
  {
    value: "closed",
    label: "Closed",
    icon: <CheckCircle2 size={14} className="text-emerald-500" />,
  },
  {
    value: "unassigned",
    label: "Unassigned",
    icon: <UserX size={14} className="text-orange-500" />,
  },
  {
    value: "my-tickets",
    label: "My Tickets",
    icon: <User size={14} className="text-indigo-500" />,
  },
  {
    value: "past-due",
    label: "Past Due",
    icon: <AlertTriangle size={14} className="text-red-500" />,
  },
];

const MODAL_FIELDS = [
  {
    id: "org",
    label: "Organization (required)",
    type: "select",
    options: ["Amigo"],
    defaultValue: "amigo",
  },
  {
    id: "contact",
    label: "Contact (required)",
    type: "select",
    options: ["Kali Raja"],
    defaultValue: "kali",
  },
  {
    id: "summary",
    label: "Summary (required)",
    type: "input",
    placeholder: "",
  },
  {
    id: "desc",
    label: "Description (required)",
    type: "textarea",
    color: "text-cyan-500",
  },
];

const PRIORITIES = ["high", "medium", "low"];

export default function TicketHeader({
  totalTickets = 62,
  currentStatus,
  onStatusChange,
}) {
  const [open, setOpen] = useState(false);

  const selectedOption = FILTER_OPTIONS.find(
    (opt) => opt.value === currentStatus,
  );

  const {
    data: orgs,
    isLoading: isLoadingOrgs,
    refetch,
  } = useQuery({
    queryKey: ["ticket-organizations"],
    queryFn: async () => {
      const res = await api.get("/OrgAdminAllTickets/ticket-show-organization");
      console.log("ticket-organization", res.data);
      return res.data.data;
    },
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 border-b border-slate-200 shrink-0">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        <Select
          value={currentStatus}
          defaultValue="open"
          onValueChange={onStatusChange}
        >
          <SelectTrigger className="w-36 h-9 text-sm focus:ring-1 focus:ring-indigo-400 border-slate-200">
            <div className="flex items-center gap-2">
              {/* Icon-ai manual-aa pottutu, label-ai SelectValue-ve handle panna viduvom */}
              {selectedOption?.icon}
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent
            sideOffset={2}
            position="popper"
            className="bg-white text-black border-slate-200 min-w-50 shadow-xl"
          >
            {FILTER_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="cursor-pointer hover:bg-slate-50 py-2.5 px-3"
              >
                <div className="flex items-center gap-3">
                  {opt.icon}
                  <span className="font-medium text-slate-700">
                    {opt.label}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500"
            size={14}
          />
          <input
            type="text"
            placeholder="Search"
            className="h-9 rounded-md py-1.5 pl-9 pr-4 text-sm border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 w-48 lg:w-72"
          />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-9 hover:bg-indigo-50 border-slate-200 text-slate-700"
        >
          Bulk Update
        </Button>

        <DashboardTicketCreate orgData={orgs} isLoading={isLoadingOrgs} />

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        <RefreshCw
          size={16}
          className="text-slate-500 cursor-pointer hover:rotate-180 duration-500 transition-transform"
        />

        <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium select-none">
          <span>
            1 - {totalTickets} of {totalTickets}
          </span>
          <div className="flex items-center">
            <ChevronLeft size={18} className="cursor-not-allowed opacity-30" />
            <ChevronRight
              size={18}
              className="cursor-pointer hover:text-indigo-600"
            />
          </div>
        </div>

        <MoreHorizontal
          size={18}
          className="text-slate-400 cursor-pointer hover:text-indigo-600"
        />
      </div>
    </div>
  );
}
