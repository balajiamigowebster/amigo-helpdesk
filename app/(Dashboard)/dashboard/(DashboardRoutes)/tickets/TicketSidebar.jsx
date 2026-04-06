"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Info } from "lucide-react";

// Sidebar data-vai inge store pannidalam
const SIDEBAR_SECTIONS = [
  {
    id: "recent",
    title: "All recent tickets",
    items: [
      { label: "Tickets to handle", count: 4, active: true },
      { label: "My open tickets", count: 0 },
    ],
  },
  {
    id: "views",
    title: "TICKET VIEWS",
    showManage: true,
    items: [{ label: "My tickets (7 days)", count: 0 }],
  },
  {
    id: "statuses",
    title: "STATUSES",
    showInfo: true,
    items: [
      { label: "Open", count: 0 },
      { label: "Pending", count: 0 },
      { label: "On hold", count: 0 },
      { label: "Solved", count: 0 },
      { label: "Closed", count: 0 },
    ],
  },
  {
    id: "folders",
    title: "FOLDERS",
    items: [{ label: "Archive" }, { label: "Spam" }, { label: "Trash" }],
  },
];

export default function TicketSidebar() {
  return (
    <aside className="w-70 border-r border-slate-200 h-screen flex flex-col bg-white">
      {/* Fixed Header */}
      <div className="p-4 space-y-4 shrink-0 border-b border-slate-50">
        <div className="flex items-center justify-between">
          <h2 className="text-neutral-900 text-lg font-bold">Tickets</h2>
          {/* <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            <Plus size={16} /> New ticket
          </Button> */}
        </div>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Search in all tickets..."
            className="pl-9 h-9 border-slate-200"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.id} className="space-y-5">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex justify-between items-center pr-2 gap-1">
                <p className="text-neutral-900 text-[12px] font-bold uppercase tracking-wider">
                  {section.title}
                </p>
                {section.showInfo && (
                  <Info size={14} className="text-slate-400" />
                )}
              </div>
              {section.showManage && (
                <button className="text-blue-600 text-[11px] font-bold hover:underline">
                  Manage
                </button>
              )}
            </div>

            {/* Section Items */}
            <ul className="space-y-3">
              {section.items.map((item) => (
                <li
                  key={item.label}
                  className={`flex items-center justify-between cursor-pointer group transition-all rounded-md`}
                >
                  <span
                    className={`text-sm ${
                      item.active
                        ? "text-blue-600 font-bold"
                        : "text-slate-500 font-medium"
                    } group-hover:text-blue-500`}
                  >
                    {item.label}
                  </span>

                  {/* Count Badge - Count iruntha mattum show aagum */}
                  {item.count !== undefined && (
                    <span className="bg-neutral-200 text-neutral-600 text-[10px] font-bold px-2 py-0.5 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600">
                      {item.count}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
