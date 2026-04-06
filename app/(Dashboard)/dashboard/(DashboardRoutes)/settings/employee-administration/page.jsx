"use client";

import React, { useEffect, useRef, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import api from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import RippleButton from "@/Component/RippleButton";
import AddEmployeeModal from "./AddEmployeeModal";
import EditEmployeeModal from "./EditEmployeeModal";
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
import { toast } from "sonner";

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

const ScrollableOrgs = ({ orgs }) => {
  const scrollRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);

  console.log(orgs);

  // Orgs string-ah illaiya nu check panni array-ah mathurom
  const orgList =
    typeof orgs === "string"
      ? orgs.split(",").map((item) => item.trim())
      : Array.isArray(orgs)
        ? orgs
        : [];

  // Logic to check if content is overflowing
  const checkOverflow = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      // Content width > Visible width ah irundha scroll thevai
      setCanScroll(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkOverflow();
    // Org list change aanaalum, window resize aanaalum check pannu
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [orgs]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left" ? scrollLeft - 100 : scrollLeft + 100;
      scrollRef.current.scrollTo({
        left: scrollTo,
        behaviour: "smooth",
      });
    }
  };

  return (
    <div className="max-w-45 relative flex items-center group/scroll ">
      {/* Left Arrow - Show only if overflow exists */}
      {canScroll && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-5 z-10 bg-white/80 rounded-full shadow-sm border p-0.5 opacity-0 group-hover/scroll:opacity-100 transition-opacity"
        >
          <ChevronLeft size={12} />
        </button>
      )}
      {/* Chips Container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-2 py-1 items-center"
      >
        {orgList.map((org, index) => (
          <Badge
            key={index}
            className="
        whitespace-nowrap 
        /* Amazing Multi-Tone Gradient */
        bg-linear-to-br from-blue-100 via-blue-50 to-blue-100
        text-blue-500 
        
        /* Premium Borders & Glass effect */
        border border-indigo-200/50
        backdrop-blur-[2px]

        /* Shape & High-End Typography */
        text-[10px] font-black tracking-widest 
        px-3 py-1 h-6
        rounded-full 
        
        /* Static 3D Shadow & Inner Depth */
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_2px_4px_rgba(79,70,229,0.1)]
        
        /* Layout */
        flex items-center gap-1.5
        cursor-default
      "
          >
            {/* Static Indigo Dot - Premium look */}
            <span className="relative flex h-1 w-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1 w-1 bg-green-600"></span>
            </span>

            {org.trim()}
          </Badge>
        ))}
      </div>
      {/* Right Arrow */}
      {/* Right Arrow - Show only if overflow exists */}
      {canScroll && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-5 z-10 bg-white/80 rounded-full shadow-sm border p-0.5 opacity-0 group-hover/scroll:opacity-100 transition-opacity"
        >
          <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
};

const EmployeeAdministration = () => {
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isFinalConfirmOpen, setIsFinalConfirmOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  // Static Employee Data

  const handleEditClick = (emp) => {
    setSelectedEmployee(emp);
    setIsEditOpen(true);
  };

  const fetchMe = async () => {
    const { data } = await api.get("/me");
    console.log(data);
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

  const owner = data?.user;
  // ORG_ADMIN login panni irundha avaroda current organization ID
  // Unga logic padi user object-layo illa context-layo intha ID irukkum

  const currentOrgId = owner?.organizationId;
  // 2. Employee List Fetch (Puthu API)
  // console.log(currentOrgId);
  const {
    data: employeeData,
    isLoading: employeesLoading,
    isError: employeeError,
  } = useQuery({
    queryKey: ["employees", currentOrgId],
    queryFn: async () => {
      // currentOrgId irundha query param-ah anupuvom, illana normal-ah kupiduvom
      const url = currentOrgId
        ? `/settings/employee-administration/employee-get-ownerId?orgId=${currentOrgId}`
        : "/settings/employee-administration/employee-get-ownerId";
      const { data } = await api.get(url);
      console.log(data.data);
      return data.data; // Backend structure-padi 'data.data'
    },
    enabled: !!owner,
  });

  console.log(employeeData);

  // --- TanStack Delete Mutation (Optimistic UI) ---
  const deleteMutation = useMutation({
    mutationFn: async (empId) => {
      await api.delete(
        `/settings/employee-administration/employee-delete/${empId}`,
      );
    },
    // 1. Mutation start aagum pothu (Instant update)
    onMutate: async (empId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["employees"],
      });

      // Snapshot the previous value
      const previousEmployees = queryClient.getQueryData(["employees"]);

      // Optimistically update to the new value (Remove the employee instantly)
      queryClient.setQueryData(["employees"], (old) =>
        old?.filter((emp) => emp.id !== empId),
      );

      return { previousEmployees };
    },
    // 2. Error vantha thirumba pazhaya data-vai set pannuvom
    onError: (err, empId, context) => {
      queryClient.setQueryData(["employees"], context.previousEmployees);
      toast.error("Failed to delete employee. Please try again.");
    },
    // 3. Success or Error ethu nadanthaalum, backend kooda sync panni refresh pannuvom
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
    },
    onSuccess: () => {
      toast.success("Employee deleted successfully");
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

  // First Alert-la Confirm panna intha function trigger aagum
  const handleFirstConfirm = () => {
    setIsDeleteDialogOpen(false);
    setIsConfirming(true); // Loading start

    // 1 Second Delay
    setTimeout(() => {
      setIsConfirming(false); // Loading stop
      setIsFinalConfirmOpen(true); // Second modal open
    }, 1000);
  };

  const handleFinalDelete = () => {
    if (employeeToDelete) {
      deleteMutation.mutate(employeeToDelete.id);
      setIsFinalConfirmOpen(false);
      setEmployeeToDelete(null);
    }
  };

  // const handleDeleteConfirm = () => {
  //   if (employeeToDelete) {
  //     deleteMutation.mutate(employeeToDelete.id);
  //     setIsDeleteDialogOpen(false);
  //     setEmployeeToDelete(null);
  //   }
  // };

  const allowedRoles = ["SUPER_ADMIN", "HDT_ADMIN", "HDT_MANAGER", "HDT_TECH"];

  const canAddEmployee = allowedRoles.includes(owner?.role);

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
        {canAddEmployee && (
          <AddEmployeeModal
            ownerId={owner?.id}
            organizations={orgData || []}
            isLoadingOrgs={orgLoading}
          />
        )}
      </div>

      <Separator />
      {/* -------------See this page copy.jsx  Card billing section----------- */}
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
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h4 className="font-black text-slate-900 text-lg capitalize tracking-tight">
                    {/* {owner.firstName} {owner.lastName} */}
                    helpdesktech
                  </h4>

                  {/* Role Badge - Default ORG_ADMIN */}
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-blue-100">
                    {owner.role || "ORG_ADMIN"}
                  </span>

                  {/* Account Owner Indicator */}
                  {owner.role === "SUPER_ADMIN" && (
                    <span className="text-[10px] bg-slate-900 text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
                      <span className="size-1 bg-green-400 rounded-full animate-pulse" />
                      Account Owner
                    </span>
                  )}
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
              {employeeError}
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
                  {/* Puthu logic: Chip-based Horizontal Scroll */}
                  <div className="mt-1.5 w-full max-w-45">
                    {emp.displayOrganizations === "ALL" ||
                    emp.displayOrganizations === "All Organizations" ? (
                      <p className="text-[11px]  text-blue-500 ">
                        All Organizations
                      </p>
                    ) : (
                      <ScrollableOrgs orgs={emp.displayOrganizations} />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RippleButton
                    onClick={() => handleEditClick(emp)} // Edit click handler
                    className="h-8 px-4 text-[11px] font-black uppercase tracking-tight"
                  >
                    Edit
                  </RippleButton>
                  <RippleButton
                    onClick={() => {
                      setEmployeeToDelete(emp);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="h-8 px-4 text-[11px] font-black text-red-500 bg-red-50 hover:bg-red-100 uppercase tracking-tight  border-none"
                  >
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

      {/* --- FIRST ALERT DIALOG --- */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-900">
              Delete Employee?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              Are you sure you want to remove{" "}
              <span className="text-slate-900 font-bold italic underline underline-offset-2">
                {employeeToDelete?.firstName} {employeeToDelete?.lastName}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="font-bold border-slate-200 ">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFirstConfirm}
              className=" text-white font-bold border-none shadow-lg "
            >
              confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- INTERMEDIATE LOADING OVERLAY --- */}
      {isConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all">
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Verifying...
            </p>
          </div>
        </div>
      )}

      {/* --- FINAL ALERT DIALOG --- */}
      <AlertDialog
        open={isFinalConfirmOpen}
        onOpenChange={setIsFinalConfirmOpen}
      >
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl bg-white border-t-4 border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-red-600 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" /> Final Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium  pt-2">
              This action is . All data for
              {/* <span className="text-red-600 font-black underline underline-offset-4">
                IRREVERSIBLE
              </span> */}
              will be permanently erased. Proceed?
              <span className="mx-1 px-2 py-1  bg-red-50 text-red-600 font-black rounded-lg border border-red-100 italic inline-block">
                {employeeToDelete?.firstName} {employeeToDelete?.lastName}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className=" px-6 font-bold border-2 border-slate-100">
              Abort
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalDelete}
              className=" px-6 bg-red-600 hover:bg-red-700 text-white font-bold  border-none shadow-lg shadow-red-200 active:scale-95 transition-all"
            >
              Yes, Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditEmployeeModal
        open={isEditOpen}
        setOpen={setIsEditOpen}
        employee={selectedEmployee}
        organizations={orgData || []}
        isLoadingOrgs={orgLoading}
      />
    </div>
  );
};

export default EmployeeAdministration;
