"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Zap,
  LayoutGrid,
  Wallet,
  Bell,
  UserIcon,
  LogOut,
  Loader2,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
  { id: "Wallet", icon: <Wallet />, href: "/dashboard/billing" },
  { id: "Settings", icon: <Settings />, href: "/dashboard/settings" },
  { id: "Notifications", icon: <Bell />, href: "/dashboard/notifications" },
];

const Sidebar = ({ user, isUserLoading }) => {
  // console.log("Settins", user);
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isForceRedirecting, setIsForceRedirecting] = useState(false);

  // 2. TanStack Mutation for Logout
  const { mutate: logoutMutation } = useMutation({
    mutationFn: async () => {
      return await api.post("/logout");
    },

    onMutate: () => {
      // 1. Instant-ah UI-la overlay kaatum
      setIsForceRedirecting(true);
      setShowLogoutDialog(false);
      queryClient.clear();
      // 3. 3 Seconds timer - user-ku loading theryum, but background-la redirect ready aagum
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    },
    // onSuccess: () => {
    //   toast.success("Logged out successfully");
    //   queryClient.clear(); // Cache ellam clear pannidum
    //   router.push("/login");
    //   router.refresh();
    // },
    onError: () => {
      toast.error("Logout failed. Try again.");
    },
  });

  const getInitials = () => {
    if (!user) return "?";
    return (
      user.firstName?.charAt(0) + user.lastName?.charAt(0) || ""
    ).toUpperCase();
  };

  const renderIcon = (item) => {
    const Icon = item.icon;
    const isActive =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href);

    return (
      <Tooltip key={item.id}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={`w-12 h-10 flex items-center justify-center  transition-all ${
              isActive
                ? "bg-white/10 text-white border-l-4 border-white"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            {Icon}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.id}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={3}>
      {/* 3. FULL SCREEN LOADING OVERLAY */}
      {isForceRedirecting && (
        <div className="fixed inset-0 z-9999 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto">
          <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
          <p className="text-white font-medium tracking-widest uppercase text-xs">
            Logging out...
          </p>
        </div>
      )}

      <aside className="w-16 h-screen bg-black flex flex-col items-center py-4">
        {/* TOP ICONS */}
        <div className="flex flex-col gap-4">{TOP_MENU.map(renderIcon)}</div>
        {/* SPACER */}
        <div className="flex-1" />
        {/* BOTTOM ICONS */}
        <div className="flex flex-col justify-center items-center gap-3 mb-4">
          {BOTTOM_MENU.filter((item) => {
            if (user?.role === "ORG_TECH" && item.id === "Settings") {
              return false;
            }
            return true;
          }).map(renderIcon)}

          {/* USER AVATAR WITH DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger disabled={isUserLoading} asChild>
              <div className="cursor-pointer mt-2">
                {isUserLoading ? (
                  /* --- AVATAR SKELETON --- */
                  <Skeleton className="h-11 w-11 rounded-full bg-neutral-500 animate-pulse" />
                ) : (
                  <Avatar className="h-11 w-11 select-none transition-all">
                    <AvatarImage src={user?.image} alt={user?.firstName} />
                    <AvatarFallback className="bg-purple-600 text-white font-bold">
                      {isUserLoading ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                      ) : (
                        getInitials()
                      )}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="end"
              className="w-64 p-2 ml-2 rounded-[1.2rem] shadow-2xl border-slate-100"
            >
              {isUserLoading ? (
                // --- SKELETON LOADING STATE ---
                <div className="p-3 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-slate-100" />{" "}
                    {/* Name Skeleton */}
                    <Skeleton className="h-3 w-1/2 bg-slate-100" />{" "}
                    {/* Email Skeleton */}
                  </div>
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-10 w-full rounded-xl bg-slate-50" />{" "}
                    {/* Menu Item 1 */}
                    <Skeleton className="h-10 w-full rounded-xl bg-slate-50" />{" "}
                    {/* Menu Item 2 */}
                  </div>
                </div>
              ) : (
                // --- ACTUAL CONTENT ---
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-black text-neutral-900 leading-none uppercase tracking-tight">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-[13px] font-medium text-neutral-600 truncate leading-relaxed">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-slate-100" />
                  <div className="space-y-1 mt-1">
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 px-3 py-3  cursor-pointer   text-[13px] transition-all  outline-none"
                      >
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowLogoutDialog(true)}
                      className="flex items-center gap-3 px-3 py-3 text-[13px]  text-red-600 focus:bg-red-500/10 focus:text-red-500 transition-colors duration-500 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4 hover:text-red-600" />
                      Log Out
                    </DropdownMenuItem>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold cursor-pointer">
                S
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">Profile</TooltipContent>
          </Tooltip> */}
        </div>
      </aside>

      {/* 4. LOGOUT CONFIRMATION DIALOG */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="rounded-[1.5rem] max-w-95">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Log Out?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Are you sure you want to log out? Your current session will be
              ended.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="bg-neutral-50 border-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                logoutMutation();
                setShowLogoutDialog(false);
              }}
              className=" font-bold bg-red-600 hover:bg-red-700 text-white"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

export default Sidebar;
