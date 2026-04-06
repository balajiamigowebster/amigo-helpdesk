"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Info, LinkIcon, Plus, Trash2 } from "lucide-react";
import RippleButton from "@/Component/RippleButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const orgData = {
  name: "Amigo",
  helpDeskUrl: "https://amigowebster.helpdesktech.in",
  email: "help@amigowebster.helpdesktech.in",
  displayName: "Amigo Help Desk",
};

export default function MonitorAlertSettings() {
  // Conditions array - Screenshot-la irukara mathiriye
  const conditions = [
    "Ticket is opened",
    "Ticket is assigned",
    "Comments made on ticket",
    "Ticket is closed",
    "Ticket is closed as duplicate",
    "Ticket is re-opened",
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-[#f8fafc] min-h-full">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* --- HEADER SECTION --- */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {orgData.name}
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                <LinkIcon size={14} className="text-blue-500" />
                {orgData.helpDeskUrl}
              </p>
            </div>
            <RippleButton className="border-red-100 select-none text-sm bg-red-100 text-red-500 shadow-sm hover:bg-red-200/65 cursor-pointer  rounded-md transition-all px-6 py-5 ">
              <Trash2 size={18} className="mr-2" />
              Delete organization
            </RippleButton>
          </div>

          {/* --- MAIN CONTENT CARD --- */}
          <div className="bg-white/60 border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-5 space-y-8">
              {/* --- MONITORING ALERTS SECTION --- */}
              <section>
                <div className="flex items-center justify-between bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-50 py-3 px-4 border-l-4 border-slate-700 rounded-l-md">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Monitoring alerts
                    </h2>
                    {/* --- TOOLTIP START --- */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info
                          size={16}
                          className="text-slate-400 cursor-help hover:text-slate-600 transition-colors"
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-white border-none p-3 max-w-62.5">
                        <p className="text-xs font-medium leading-relaxed">
                          Muted tickets will not send any email notifications
                          that you have turned on below
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    {/* --- TOOLTIP END --- */}
                  </div>
                  <Button className=" px-4 h-9 text-[13px] cursor-pointer bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm">
                    <Plus size={16} className="mr-2" />
                    Add ticket monitor
                  </Button>
                </div>
                <div className="px-5 py-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 text-[11px] font-black  uppercase tracking-widest pb-4 border-b  h-12 px-4    text-slate-500 border-r border-slate-200 last:border-r-0 ">
                    <span>Conditions</span>
                    <span className="text-center">Send email alert</span>
                    <span className="text-right">Enabled</span>
                  </div>
                  <p className="py-10 text-center text-sm text-slate-400 italic">
                    No monitoring alerts set up yet.
                  </p>
                </div>
              </section>

              <section>
                <div className="relative flex items-center bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-50 py-3 px-4 border-l-4 border-slate-700 rounded-l-md mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Employee notifications
                  </h2>
                </div>
                <div className="px-5">
                  {/* Header Row */}
                  <div className="flex justify-between gap-4 text-[11px] font-black text-slate-500 uppercase tracking-widest pb-4 border-b border-slate-100 ">
                    <span className="self-end">Conditions</span>
                    <span className="text-center ">Unassigned Tickets</span>
                    <span className="text-center ">Assigned Tickets</span>
                    <span className="text-right self-end">Action</span>
                  </div>
                  <div className="flex justify-between gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest pb-4 border-b border-slate-100">
                    <span></span> {/* Empty for Conditions */}
                    <span className="text-center pl-16">
                      All Admins and <br /> Managers
                    </span>
                    <div className="gap-4 flex">
                      <span className="text-center">Assignee</span>
                      <span className="text-center">CC'd Employees</span>
                    </div>
                    <span></span> {/* Empty for Action */}
                  </div>
                  <div className="divide-y divide-slate-100">
                    {conditions.map((condition, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-4 gap-4 py-5 items-center hover:bg-slate-50/50 transition-colors px-2 rounded-lg"
                      >
                        <span className="text-[13px] font-black text-slate-700 tracking-widest ">
                          {condition}
                        </span>
                        <div className="flex justify-center">
                          <Switch
                            size="sm"
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                        <div className="flex justify-center">
                          <Switch
                            size="sm"
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            className="text-[12px] cursor-pointer  decoration-2"
                          >
                            Edit email template
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* --- END USER NOTIFICATIONS SECTION --- */}
              <section>
                <div className="relative flex items-center bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-50 py-3 px-4 border-l-4 border-slate-700 rounded-l-md mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    End user notifications
                  </h2>
                </div>
                <div className="px-5">
                  <div className="grid grid-cols-[1fr_1fr_1.2fr_0.8fr] gap-4 text-[11px] font-black text-slate-500 uppercase tracking-widest pb-4 border-b border-slate-100">
                    <span>Conditions</span>
                    <span className="text-center uppercase">Submitter</span>
                    <span className="text-center uppercase md:pr-12">
                      CC'd User
                    </span>
                    <span className="text-right uppercase">Action</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {conditions.map((condition, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[2fr_1.2fr_1.2fr_0.8fr] gap-4 py-5 items-center hover:bg-slate-50/50 transition-colors px-2 rounded-lg"
                      >
                        <span className="text-[14px] text-slate-700 font-medium">
                          {condition}
                        </span>
                        <div className="flex justify-start">
                          <Switch
                            size="sm"
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                        <div className="flex justify-start">
                          <Switch
                            size="sm"
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            className="text-[12px] cursor-pointer  decoration-2"
                          >
                            Edit email template
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
