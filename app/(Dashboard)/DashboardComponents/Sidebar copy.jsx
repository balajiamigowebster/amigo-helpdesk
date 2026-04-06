"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  FileText,
  BarChart3,
  Download,
  Settings,
  Monitor,
  Database,
  HelpCircle,
  Users,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  // {
  //   id: "Dashboard",
  //   icon: <LayoutDashboard size={20} />,
  //   href: "/dashboard",
  // },
  { id: "Tickets", icon: <Ticket size={20} />, href: "/dashboard/tickets" },
];

const TOP_MENU = [
  {
    id: "Tickets",
    icon: <Ticket />,
    href: "/dashboard/tickets",
  },
  {
    id: "Users",
    icon: <Users />,
    href: "/dashboard/users",
  },
  {
    id: "Analytics",
    icon: <BarChart3 />,
    href: "/dashboard/analytics",
  },
  {
    id: "Automation",
    icon: <Zap />,
    href: "/dashboard/automation",
  },
  {
    id: "Dashboard",
    icon: <LayoutGrid />,
    href: "/dashboard",
  },
];

const BOTTOM_MENU = [
  { id: "Wallet", icon: Wallet, href: "/dashboard/billing" },
  { id: "Settings", icon: Settings, href: "/dashboard/settings" },
  { id: "Notifications", icon: Bell, href: "/dashboard/notifications" },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-16 flex flex-col items-center py-4 bg-white border-r border-gray-200 shadow-sm h-screen sticky top-0">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={`p-3 my-1 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 rounded-none"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                }`}
              >
                {item.icon}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.id}
            </TooltipContent>
          </Tooltip>
        );
      })}

      <div className="mt-auto p-3 text-gray-400 hover:text-gray-600 cursor-pointer">
        <HelpCircle size={20} />
      </div>
    </div>
  );
};

export default Sidebar;
