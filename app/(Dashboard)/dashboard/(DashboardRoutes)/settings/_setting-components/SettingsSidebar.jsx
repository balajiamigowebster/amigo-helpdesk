"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { is } from "date-fns/locale";
import {
  ChevronRight,
  Plus,
  ChevronDown,
  RotateCw,
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import CreateOrganizationModal from "./CreateOrganizationModal";
import { useSelector } from "react-redux";

const publicLinks = [
  {
    name: "Global settings",
    href: "/dashboard/settings/global-settings",
    isPremium: false,
  },
  {
    name: "My settings",
    href: "/dashboard/settings/my-settings",
    isPremium: false,
  },
  {
    name: "Permission",
    href: "/dashboard/settings/permission",
    isPremium: false,
    requiresSuperAdmin: true, // Intha flag-ai add panniruken
  },
  {
    name: "Employee administration",
    href: "/dashboard/settings/employee-administration",
    isPremium: false,
  },
  {
    name: "TaskLists",
    href: "/dashboard/settings/task-lists",
    isPremium: true,
  }, // Mark as Premium
  {
    name: "Ticket rules",
    href: "/dashboard/settings/ticket-rules",
    isPremium: true,
  },
  {
    name: "Ticket views",
    href: "/dashboard/settings/ticket-views",
    isPremium: true,
  },
  {
    name: "Canned responses",
    href: "/dashboard/settings/canned-responses",
    isPremium: true,
  },
  {
    name: "Ads Management",
    href: "/dashboard/settings/all-organizations",
    isPremium: false,
  },
];
// Static Organizations Array
const staticOrgs = [
  { id: 1, name: "Global Technology " },
  { id: 2, name: "Systronics Pvt Ltd" },
  //   { id: 3, name: "TECHNET SYSTEMS" },
  //   { id: 4, name: "AMIGO PROJECTS" },
  //   { id: 5, name: "NEXTGEN SOLUTIONS" },
];

const orgSubLinks = [
  { name: "General", slug: "" },
  { name: "Import/export tickets", slug: "import-export" },
  { name: "Email", slug: "email" },
  { name: "Monitors and alerts", slug: "monitors-alerts" },
  { name: "User portal", slug: "user-portal" },
  { name: "Ticket categories", slug: "ticket-categories" },
  { name: "Custom attributes", slug: "custom-attributes" },
  { name: "User management", slug: "user-management" },
];

const SettingsSidebar = ({ isAdmin, organizations = [], error }) => {
  // console.log(organizations);
  const pathname = usePathname();
  const router = useRouter();

  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role; // Backend-la irunthu varra role name-ai poruthu "SUPER_ADMIN" nu check pannuvom

  const [isPending, startTransition] = useTransition(); // Refresh loading state
  const [expandedOrg, setExpandedOrg] = useState(null);
  // 1. Modal state add pannunga
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // 1. Search State
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Filter Logic (Client-side)
  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // console.log(organizations);

  const toggleOrg = (id) => {
    // If clicking the same one, close it. Otherwise, open the new one and close the previous.
    setExpandedOrg(expandedOrg === id ? null : id);
    router.push(`/dashboard/settings/${id}`);
  };

  // Refresh Function
  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <aside className="w-64 border-r border-gray-200 bg-white/30 flex flex-col h-full shrink-0">
        {/* 🔒 FIXED HEADER */}
        <div className="px-5 py-4 border-b bg-white/20 sticky top-0 z-20">
          <h2 className="text-[22px] font-bold">Settings</h2>
        </div>

        {/* 🔽 SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto py-3">
          <nav className="space-y-0.5">
            {publicLinks.map((link) => {
              // --- Logic to hide Permission if not SUPER_ADMIN ---
              if (link.requiresSuperAdmin && userRole !== "SUPER_ADMIN") {
                return null; // Side-bar-la render aagathu
              }

              const isActive = link.isPremium;

              if (isActive) {
                return (
                  <Tooltip key={link.name}>
                    <TooltipTrigger asChild>
                      <div className="px-6 py-2 text-sm font-medium text-gray-400 cursor-not-allowed opacity-60">
                        {link.name}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-slate-900 text-white border-none shadow-xl"
                    >
                      Premium features only
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-6 py-3 text-sm border-l-4 transition-colors
                ${
                  pathname === link.href
                    ? "bg-blue-100/40 text-blue-700 border-blue-500"
                    : "border-transparent text-gray-600 hover:bg-gray-200"
                }
             
              `}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4" />

          {/* ORGANIZATIONS (Scrollable) */}
          {isAdmin && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3 px-6">
                <h3 className="text-[11px] font-bold text-neutral-800 uppercase tracking-widest">
                  Organizations
                </h3>
                <div className="flex items-center gap-2">
                  {/* REFRESH ICON - Error irukkum pothu mattum kaatum or always */}
                  <button
                    onClick={handleRefresh}
                    disabled={isPending}
                    className={`text-gray-400 hover:text-blue-600 transition-all ${
                      isPending ? "animate-spin" : ""
                    }`}
                  >
                    <RotateCw size={14} />
                  </button>
                  {!(userRole === "ORG_ADMIN" || userRole === "ORG_TECH") && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="text-gray-400 hover:text-black cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* 🔍 SEARCH BAR UI */}
              <div className="px-5 mb-4">
                <div className="relative group">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="Search organizations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-100 border-none rounded-lg py-2 pl-9 pr-8 text-xs focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all placeholder:text-gray-400 font-medium"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Error handle panrathu with Refresh button */}
              {error && (
                <div className="px-6 py-2 mb-2 bg-red-50 border-y border-red-100 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-red-600">
                    <AlertCircle size={12} />
                    <p className="text-[10px] font-bold uppercase tracking-tight">
                      Sync Failed
                    </p>
                  </div>
                  <p className="text-[10px] text-red-500 leading-tight italic">
                    {error}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="text-[9px] font-black text-blue-600 uppercase text-left hover:underline mt-1"
                  >
                    Try Refreshing
                  </button>
                </div>
              )}

              <div className="space-y-1">
                {filteredOrganizations.length > 0
                  ? filteredOrganizations.map((org) => {
                      const isExpanded = expandedOrg === org.id;

                      return (
                        <div key={org.id}>
                          <button
                            onClick={() => toggleOrg(org.id)}
                            className={`flex items-center justify-between w-full py-3 px-6 text-sm font-bold  transition-all hover:bg-gray-100 ${
                              isExpanded ? "text-neutral-900" : "text-gray-700"
                            }`}
                          >
                            <span>{org.name}</span>
                            <ChevronRight
                              size={16}
                              className={`transition-transform ${
                                isExpanded
                                  ? "rotate-90 text-blue-600"
                                  : "text-gray-400"
                              }`}
                            />
                          </button>
                          {/* Sub-menu with Animation */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isExpanded
                                ? "max-h-125 opacity-100"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="bg-gray-50/50 py-1">
                              {orgSubLinks.map((sub) => {
                                // Dynamic URL construction
                                const fullHref = `/dashboard/settings/${org.id}${sub.slug ? `/${sub.slug}` : ""}`;

                                // Current link active-ah nu check panna
                                const isSubActive = pathname === fullHref;
                                return (
                                  <Link
                                    key={sub.name}
                                    href={fullHref}
                                    className={`block pl-10 pr-6 py-2 text-[13px] border-l-4 font-medium transition-colors ${
                                      isSubActive
                                        ? "bg-blue-100/40 text-blue-700 border-blue-500"
                                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                                    }`}
                                  >
                                    {sub.name}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : !error && (
                      <p className="px-6 text-[11px] text-gray-400 italic">
                        No organizations found.
                      </p>
                    )}
              </div>
            </div>
          )}
        </div>
        <CreateOrganizationModal
          open={isCreateModalOpen}
          setOpen={setIsCreateModalOpen}
        />
      </aside>
    </TooltipProvider>
  );
};

export default SettingsSidebar;
