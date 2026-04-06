"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Settings2,
  Paperclip,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Shadcn Import
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const ticketsData = [
  {
    id: 2,
    summary: "Import tickets from your previous Spiceworks Desktop",
    assignee: "Kali Raja",
    creator: "Kali Raja",
    org: "Amigo",
    priority: "Medium",
    status: "waiting",
    updated: "5h ago",
    responseTime: "37 minutes",
  },
  {
    id: 1,
    summary: "Welcome to the Spiceworks Cloud Help Desk!",
    assignee: "Kali Raja",
    creator: "Kali Raja",
    org: "Amigo",
    priority: "Medium",
    status: "closed",
    updated: "5h ago",
    responseTime: "37 minutes",
    closeTime: "37 minutes",
  },
  ...Array(25)
    .fill(null)
    .map((_, i) => ({
      id: i + 3,
      summary: `Sample Ticket #${i + 3} for layout testing`,
      assignee: "Support Team",
      creator: "User Admin",
      org: "Amigo",
      priority: "Low",
      status: "open",
      updated: "1d ago",
      responseTime: "1 hour",
    })),
];

const TicketsPage = () => {
  const [open, setOpen] = useState(false);
  return (
    /* max-w-[1600px] and mx-auto use panni page width increase pannirukom periya screen-ku */
    <div className="flex flex-col h-full space-y-2 max-w-300 px-2">
      {/* Table Header - Background dark gray aaki blue contrast-a koraichutom */}
      {/* Table Top Header - Neutral-300 bathila Indigo Theme */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 rounded-t-lg   shadow-lg">
        <div className="flex items-center gap-4">
          {/* Shadcn Select Dropdown with Indigo Styling */}
          <Select defaultValue="all">
            <SelectTrigger className="w-35  text-md  focus:ring-1  ">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-indigo-100 text-black">
              <SelectItem value="open" className="">
                Open
              </SelectItem>
              <SelectItem value="waiting" className="">
                Waiting
              </SelectItem>
              <SelectItem value="closed" className="">
                Closed
              </SelectItem>
              <SelectItem value="unassigned" className="">
                Unassigned
              </SelectItem>
              <SelectItem value="my-tickets" className="">
                My Tickets
              </SelectItem>
              <SelectItem value="all" className="">
                All
              </SelectItem>
              <SelectItem value="active-alerts" className="">
                Active Alerts
              </SelectItem>
              <SelectItem value="past-due" className="">
                Past Due
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Search Box with Indigo Border Focus */}
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300/70"
              size={14}
            />
            <Input
              type="text"
              placeholder="Search"
              className="  rounded-md py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 w-48 lg:w-72 placeholder:text-indigo-400/90"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="hover:bg-indigo-100">
            Bulk Update
          </Button>

          <div className="flex items-center gap-2">
            {/* CREATE TICKET MODAL START */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="hover:bg-indigo-100">
                  <Plus size={16} /> New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-137.5 bg-[#1e1e1e] text-gray-200 border-gray-800 p-0 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header: Fixed height */}
                <DialogHeader className="p-4 border-b border-gray-800 flex flex-row items-center justify-between shrink-0">
                  <DialogTitle className="text-lg font-semibold">
                    Create a ticket
                  </DialogTitle>
                </DialogHeader>

                {/* Body: Scrollable area with height adjustment */}
                <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                  {/* Organization */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                      Organization (required)
                    </Label>
                    <Select defaultValue="amigo">
                      <SelectTrigger className="bg-[#2a2d30] border-gray-700 focus:ring-1 focus:ring-cyan-500">
                        <SelectValue placeholder="Select Organization" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2d30] text-white border-gray-700">
                        <SelectItem value="amigo">Amigo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Contact */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                      Contact (required)
                    </Label>
                    <Select>
                      <SelectTrigger className="bg-[#2a2d30] border-gray-700 focus:ring-1 focus:ring-cyan-500">
                        <SelectValue placeholder="Select Contact" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2d30] text-white border-gray-700">
                        <SelectItem value="kali">Kali Raja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                      Summary (required)
                    </Label>
                    <Input className="bg-[#2a2d30] border-gray-700 focus:ring-cyan-500 h-9" />
                    <p className="text-[10px] text-right text-gray-500">
                      0 / 255
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold  uppercase tracking-tight text-cyan-500">
                      Description (required)
                    </Label>
                    <Textarea className="bg-[#2a2d30] border-cyan-500/50 focus:ring-cyan-500 min-h-25 resize-none" />
                  </div>

                  {/* Assignee */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                      Assignee
                    </Label>
                    <Select defaultValue="unassigned">
                      <SelectTrigger className="bg-[#2a2d30] border-gray-700 h-9">
                        <SelectValue placeholder="Select Assignee" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2d30] text-white border-gray-700">
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-3">
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                      Priority
                    </Label>
                    <RadioGroup
                      defaultValue="medium"
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="high"
                          id="high"
                          className="border-gray-500 text-cyan-500"
                        />
                        <Label htmlFor="high" className="text-sm font-normal">
                          High
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="medium"
                          id="medium"
                          className="border-gray-500 text-cyan-500"
                        />
                        <Label htmlFor="medium" className="text-sm font-normal">
                          Medium
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="low"
                          id="low"
                          className="border-gray-500 text-cyan-500"
                        />
                        <Label htmlFor="low" className="text-sm font-normal">
                          Low
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                      Category
                    </Label>
                    <Select defaultValue="unspecified">
                      <SelectTrigger className="bg-[#2a2d30] border-gray-700 h-9">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2d30] text-white border-gray-700">
                        <SelectItem value="unspecified">Unspecified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Attachment Button */}
                  <button className="flex items-center gap-2 text-xs font-bold bg-[#2a2d30] border border-gray-700 px-3 py-2 rounded hover:bg-gray-700 transition-colors">
                    <Paperclip size={14} /> Attach a file
                  </button>
                </div>

                {/* Footer: Fixed bottom */}
                <DialogFooter className="p-4 bg-[#1a1c1e] border-t border-gray-800 gap-2 shrink-0">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 text-sm font-bold bg-[#2a2d30] hover:bg-gray-700 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="px-6 py-2 text-sm font-bold bg-cyan-500 hover:bg-cyan-600 text-black rounded transition-colors shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                    Create
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* CREATE TICKET MODAL END */}
          </div>

          {/* New Ticket Button - Teal/Cyan mixed with Indigo feel */}

          <div className="w-px h-5 bg-black mx-1"></div>

          <RefreshCw
            size={16}
            className="text-black/90 cursor-pointer hover:text-black/85 transition-transform hover:rotate-180 duration-500"
          />

          <div className="flex items-center gap-2 text-[11px] text-black">
            <span>
              1 - {ticketsData.length} of {ticketsData.length}
            </span>
            <div className="flex items-center">
              <ChevronLeft
                size={18}
                className="cursor-not-allowed opacity-30"
              />
              <ChevronRight
                size={18}
                className="cursor-pointer hover:text-white"
              />
            </div>
          </div>
          <MoreHorizontal
            size={18}
            className="text-indigo-300 cursor-pointer hover:text-white"
          />
        </div>
      </div>

      {/* Table Area - Height-a konjam koraichu scroll logic adjust panniruken */}
      <div className="flex-1 overflow-auto  rounded-b-lg  shadow-inner max-h-[calc(100vh-180px)] 2xl:max-h-[calc(100vh-150px)]">
        <table className="w-full text-left border-collapse min-w-325">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="text-black text-[10px] uppercase tracking-widest font-bold border-b border-gray-600/20">
              {/* <th className="p-3 w-10 border-r border-gray-800/30">
                <Settings2 size={14} />
              </th> */}
              <th className="p-3 ">ID</th>
              <th className="p-3 ">Summary</th>
              <th className="p-3 ">Assignee</th>
              <th className="p-3 ">Creator</th>
              <th className="p-3 ">Organization</th>
              <th className="p-3 ">Priority</th>
              <th className="p-3 ">Status</th>
              <th className="p-3 ">Updated</th>
              <th className="p-3">Response</th>
            </tr>
          </thead>
          <tbody className="text-black text-xs">
            {ticketsData.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b border-gray-500/20  hover:bg-blue-900/10 transition-colors cursor-pointer group"
              >
                {/* <td className="p-2 text-center border-r border-gray-800/30">
                  <input
                    type="checkbox"
                    className="accent-blue-600 opacity-50 group-hover:opacity-100"
                  />
                </td> */}
                <td className="p-3 font-mono text-gray-500 border-r border-gray-500/20">
                  {ticket.id}
                </td>
                <td className="p-3 font-medium  max-w-lg truncate border-r border-gray-500/20">
                  {ticket.summary}
                </td>
                <td className="p-3 border-r border-gray-500/20">
                  {ticket.assignee}
                </td>
                <td className="p-3 border-r border-gray-500/20">
                  {ticket.creator}
                </td>
                <td className="p-3 border-r border-gray-500/20">
                  {ticket.org}
                </td>
                <td className="p-3 border-r border-gray-500/20">
                  <div className="flex items-center gap-2 capitalize">
                    <div className="w-3 h-0.5 bg-yellow-500/50"></div>
                    {ticket.priority}
                  </div>
                </td>
                <td className="p-3 border-r border-gray-800/30">
                  <span
                    className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                      ticket.status === "closed"
                        ? "bg-gray-800 text-white"
                        : "bg-blue-900/30 text-neutral-700"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td className="p-3 text-gray-500 border-r border-gray-500/20">
                  {ticket.updated}
                </td>
                <td className="p-3 text-gray-500 font-mono">
                  {ticket.responseTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketsPage;
