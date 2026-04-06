"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Edit2,
  UserMinus,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserX,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import api from "@/api";
import { useQuery } from "@tanstack/react-query";
import RippleButton from "@/Component/RippleButton";
import AddEmployeeModal from "./AddEmployeeModal";

// Shimmer/Skeleton Component for Employee Row
const EmployeeSkeleton = () => (
  <div className="flex flex-col md:flex-row items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] animate-pulse">
    <div className="flex items-center gap-5 w-full">
      <div className="h-14 w-14 bg-slate-200 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
    <div className="flex items-center gap-8 w-full md:w-auto mt-5 md:mt-0">
      <div className="h-8 bg-slate-100 rounded-full w-24" />
      <div className="h-4 bg-slate-100 rounded w-12" />
    </div>
  </div>
);

const EmployeeAdministration = () => {
  // Static Employee Data
  const employees = [
    {
      id: 1,
      name: "Jk Raja",
      email: "test245qwrt@gmail.com",
      role: "Administrator",
      initials: "JR",
    },
    {
      id: 2,
      name: "Kali Raja",
      email: "kali.raja@example.com",
      role: "Employee",
      initials: "KR",
    },
  ];

  const fetchMe = async () => {
    const { data } = await api.get("/me");
    return data;
  };

  const {
    data,
    isLoading: userLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["currentUser"], // Unique key for caching
    queryFn: fetchMe,
    staleTime: 1000 * 60 * 5, // 5 mins cache-la vechukkum (refresh panna fast-ah varum)
  });

  // 2. Employee List Fetch (Puthu API)
  const {
    data: employeeData,
    isLoading: employeesLoading,
    isError: employeeError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data } = await api.get(
        "/settings/employee-administration/employee-get-ownerId",
      );
      return data.data; // Backend structure-padi 'data.data'
    },
  });

  // 3. Organizations Fetch (Add Employee Modal-kaga)
  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data } = await api.get("/organization/get-owner-organization");
      return data.data; // Backend structure-padi 'data.data' or 'data'
    },
  });

  const owner = data?.user;

  return (
    <div className="space-y-6">
      {/* --- Header Section --- */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Employee Administration
        </h1>
        {/* <Button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none flex gap-2 shadow-lg shadow-blue-200/50 transition-all active:scale-95 font-bold px-6">
          <Plus size={18} strokeWidth={3} />
          Add employee
        </Button> */}
        {/* <RippleButton className="cursor-pointer">
          <Plus size={18} strokeWidth={3} />
          Add employee
        </RippleButton> */}
        <AddEmployeeModal
          ownerId={owner?.id}
          organizations={orgData || []}
          isLoadingOrgs={orgLoading}
        />
      </div>

      <Separator />

      {/* --- Enhanced Upgrade Section --- */}
      {/* <Card className="relative overflow-hidden border-none shadow-md bg-linear-to-br from-sky-50 to-white ring-1 ring-sky-100">
        
        <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden z-20 pointer-events-none">
          <div className="absolute top-4 -left-13 w-40 bg-blue-600 text-white text-[9px] font-black uppercase tracking-tighter py-1 text-center -rotate-45 shadow-sm border-b border-blue-400/50">
            comming soon
          </div>
        </div>

       
        <div className="absolute -top-10 -right-10 h-32 w-32 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-blue-200/20 rounded-full blur-3xl" />

        <CardContent className="relative pt-8 pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Unlock Premium Features
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  PRO
                </span>
              </h3>
              <p className="text-sm text-slate-500 max-w-md">
                To enjoy an ad-free experience and manage more employees,
                upgrade your account.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="bg-white/80 backdrop-blur-sm border border-sky-100 px-4 py-2 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black text-sky-600 uppercase tracking-tighter">
                  Current Plan
                </p>
                <p className="text-sm font-bold text-slate-800">Core Free</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-sky-100 px-4 py-2 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black text-sky-600 uppercase tracking-tighter">
                  Seats Left
                </p>
                <p className="text-sm font-bold text-slate-800">Unlimited</p>
              </div>
            </div>
          </div>

         
          <div className="grid md:grid-cols-2 gap-4 relative z-10">
        
            <div className="group relative bg-white border border-sky-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">
                    Annual Subscription
                  </p>
                  <p className="text-2xl font-black text-blue-600">
                    $5{" "}
                    <span className="text-xs text-slate-400 font-medium">
                      /mo
                    </span>
                  </p>
                </div>
                <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-lg">
                  SAVE 15%
                </span>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11 shadow-lg shadow-blue-200 active:scale-95 transition-all">
                Upgrade Yearly
              </Button>
            </div>

         
            <div className="group bg-white border border-sky-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-300">
              <div className="space-y-1 mb-4">
                <p className="font-bold text-slate-900">Monthly Flexible</p>
                <p className="text-2xl font-black text-slate-800">
                  $6{" "}
                  <span className="text-xs text-slate-400 font-medium">
                    /mo
                  </span>
                </p>
              </div>
              <Button className="w-full bg-slate-900 hover:bg-black text-white font-bold rounded-xl h-11 shadow-lg shadow-slate-200 active:scale-95 transition-all">
                Upgrade Monthly
              </Button>
            </div>
          </div>

        
          <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-400 font-medium border-t border-sky-100 pt-4">
            <span className="flex items-center gap-1">
              Need help? Contact{" "}
              <a
                href="mailto:support@example.com"
                className="text-blue-500 hover:underline font-bold"
              >
                subscriptions@example.com
              </a>
            </span>
            <span className="hidden md:inline">•</span>
            <span>Tax-exempt options available</span>
            <span className="hidden md:inline">•</span>
            <span>Invoice billing for teams</span>
          </div>
        </CardContent>
      </Card> */}

      {/* --- Employee List Section --- */}
      <div className="space-y-4">
        {userLoading ? (
          // Data fetch aagura varai skeleton mattum kaatum
          <>
            <EmployeeSkeleton />
          </>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-red-100 rounded-3xl bg-red-50/30">
            <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
            <p className="text-red-600 font-bold">Failed to load owner data</p>
          </div>
        ) : owner ? (
          <div className="group flex flex-col md:flex-row items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl hover:shadow-slate-200/40 hover:border-blue-100 transition-all duration-500">
            <div className="flex items-center gap-5 w-full">
              <div className="relative">
                <Avatar className="h-14 w-14 border-4 border-white shadow-md">
                  <AvatarFallback className="bg-orange-500 text-white font-black text-base shadow-inner">
                    {owner.firstName[0]?.toUpperCase()}
                    {owner.lastName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-black text-slate-900 text-lg capitalize tracking-tight">
                    {owner.firstName} {owner.lastName}
                  </h4>
                  <span className="text-[10px] bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-orange-200">
                    Help_desk_super_admin
                  </span>
                </div>
                <p className="text-[13px] text-slate-400 font-bold tracking-tight">
                  {owner.email}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto mt-5 md:mt-0 gap-8 border-t md:border-0 pt-4 md:pt-0">
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  {owner.role}
                </span>
                <Mail
                  size={16}
                  className="text-slate-400 group-hover:text-blue-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-6">
                <RippleButton className="text-[13px]   uppercase tracking-tighter">
                  Edit
                </RippleButton>
                {/* {owner.role !== "owner" && (
                  <button className="text-[13px] font-black text-slate-400 hover:text-red-600 uppercase tracking-tighter">
                    Deactivate
                  </button>
                )} */}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              No active directory entry
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-2">
        <Separator className="flex-1" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
          Manage Employees
        </span>
        <Separator className="flex-1" />
      </div>

      {/* --- Employees List Section --- */}
      <div className="space-y-3">
        {employeesLoading ? (
          <EmployeeSkeleton />
        ) : employeeError ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-red-100 rounded-2xl bg-red-50/30">
            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
            <p className="text-red-600 font-bold text-xs text-center uppercase tracking-wide">
              Failed to load directory
            </p>
          </div>
        ) : employeeData?.length > 0 ? (
          employeeData.map((emp) => (
            <div
              key={emp.id}
              className="group flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-3xl hover:shadow-lg hover:shadow-slate-200/30 hover:border-blue-200 transition-all duration-300"
            >
              {/* Left Side: Avatar & Info */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 border-2 border-slate-50">
                    <AvatarImage src={emp.employeeImage} />
                    <AvatarFallback className="bg-orange-500 text-white uppercase font-bold text-sm">
                      {emp?.firstName?.[0]}
                      {emp?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {emp.isVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* FIX: 'flex-1' kudutha thaan adhu balance space-ai edukkum, 
       'min-w-0' kudutha thaan truncate class activate aagum.
    */}
                    <h4 className="font-black max-w-40 text-slate-900 text-[15px] truncate capitalize leading-tight  ">
                      {emp.firstName} {emp.lastName}
                    </h4>

                    <TooltipProvider delayDuration={100}>
                      {emp.isVerified ? (
                        <span className="shrink-0 text-[9px] bg-green-50 text-green-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border border-amber-100 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Verified
                        </span>
                      ) : (
                        /* --- Pending Badge with Tooltip (Amber) --- */
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="shrink-0 cursor-help text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border border-amber-100 flex items-center gap-1">
                              <AlertCircle size={10} /> Pending
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="bg-slate-900 text-white border-none text-[11px] font-bold"
                          >
                            <p>Please email verified</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TooltipProvider>
                  </div>
                  <p className="text-[12px] text-slate-400 font-medium truncate">
                    {emp.email}
                  </p>
                </div>
              </div>

              {/* Right Side: Role & Actions */}
              <div className="flex items-center gap-6 shrink-0">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">
                      {emp.role}
                    </span>
                    <Mail size={12} className="text-slate-400" />
                  </div>
                  <p className="text-[9px] font-bold text-blue-500 mt-1 uppercase truncate max-w-30">
                    {emp.displayOrganizations}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <RippleButton className="h-8 px-4 text-[11px] font-black uppercase tracking-tight">
                    Edit
                  </RippleButton>
                  <RippleButton className="h-8 px-4 text-[11px] font-black text-red-500 bg-red-50 hover:bg-red-100 uppercase tracking-tight  border-none">
                    Delete
                  </RippleButton>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
            <UserX className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              No employees found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAdministration;
