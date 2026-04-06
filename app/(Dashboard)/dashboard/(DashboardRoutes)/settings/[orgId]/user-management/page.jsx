"use client";

import React, { use, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Link as LinkIcon,
  Upload,
  Plus,
  MoreHorizontal,
  Check,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import RippleButton from "@/Component/RippleButton";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/hooks/useOrganization";
import { useRouter } from "next/navigation";
import { useDeleteOrganization } from "@/hooks/useDeleteOrganization";
import DeleteOrganizationDialog from "../../_setting-components/DeleteOrganizationDialog";

export default function UserManagement({ params }) {
  const { orgId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState(null); // Edit panna user state  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); // Delete confirmation kaga
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteHook = useDeleteOrganization(orgId);

  // Custom Attributes State
  // 1. Default-ah empty array
  const [attributes, setAttributes] = useState([
    {
      id: 1,
      firstName: "testing-1",
      lastName: "test",
      email: "testing@gmail.com",
      phoneNumber: 6786543567,
    },
  ]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  // --- 1. FETCH ORGANIZATION DATA (For Header & URL) ---
  const { data: response, isLoading: isOrgLoading } = useOrganization(orgId);
  const org = response?.data;

  const resetForm = () => {
    setFormData({ firstName: "", lastName: "", email: "", phoneNumber: "" });
    setEditingUser(null);
  };

  // --- 1. GET: Fetch Users (Unique Query Key based on orgId) ---
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-management", orgId],
    queryFn: async () => {
      const { data } = await api.get(`/organization/${orgId}/user-management`);
      return data;
    },
    enabled: !!orgId,
  });

  // --- 2. POST: Add User Mutation ---
  const addMutation = useMutation({
    mutationFn: async (newUser) => {
      const response = await api.post(
        `/organization/${orgId}/user-management`,
        newUser,
      );
      return response.data; // Response data-vai return pannanum
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users-management", orgId]); // Refresh list
      setIsDialogOpen(false);
      resetForm();
      toast.success("User added successfully!");
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Failed to add user"),
  });

  // --- 3. PUT: Update User Mutation ---
  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      // API call-ai await panni return pannanum
      const response = await api.put(
        `/organization/${orgId}/user-management`,
        updatedData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users-management", orgId]);
      setIsDialogOpen(false);
      setEditingUser(null);
      resetForm();
      toast.success("User updated!");
    },
    onError: (err) => {
      // Backend handleError function-la irunthu vara message-ai toast kaattum
      const errorMessage = err.response?.data?.error || "Failed to update user";
      toast.error(errorMessage);
    },
  });

  // --- 4. DELETE: Delete User Mutation ---
  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await api.delete(
        `/organization/${orgId}/user-management`,
        {
          params: { id: userId },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users-management", orgId]);
      toast.success("User deleted!");
      setShowDeleteDialog(false);
      setUserToDelete(null);
    },
    onError: () => toast.error("Failed to delete user."),
  });

  const { mutate: deleteOrganization, isPending } = useMutation({
    mutationFn: async () => {
      const response = await api.delete(
        `/organization/delete-organization/${orgId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      // CreateModal-la ulla athe key-ai ingum kudukkavum
      queryClient.invalidateQueries({
        queryKey: ["organizations"],
      });
      toast.success("Organization and all related data deleted.");
      setIsFinalModalOpen(false);
      // Employee Administration route-ku push panrom
      router.push("/dashboard/settings/employee-administration");
      router.refresh();
    },
    onError: (error) => {
      const msg =
        error.response?.data?.message || "Failed to delete organization";
      toast.error(msg);
    },
  });

  const orgData = {
    name: "Amigo",
    helpDeskUrl: "https://amigowebster.helpdesktech.in",
    email: "help@amigowebster.helpdesktech.in",
    displayName: "Amigo Help Desk",
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.id,
        ...formData,
      });
    } else {
      addMutation.mutate(formData);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  // 2. Select options array
  const attributeTypes = [
    { label: "Text Field", value: "text" },
    { label: "Text Area", value: "area" },
    { label: "List", value: "list" },
    { label: "Phone", value: "phone" },
    { label: "Date", value: "date" },
    { label: "Number", value: "number" },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- HEADER SECTION --- */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {org?.name || "Organization"}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
              <LinkIcon size={14} className="text-blue-500" />
              {org?.Settings?.helpDeskUrl || "URL not set"}
            </p>
          </div>
          <RippleButton
            onClick={() => deleteHook.states.setIsFirstModalOpen(true)}
            className="border-red-100 text-sm bg-red-100 cursor-pointer text-red-500 shadow-sm hover:bg-red-200/65 rounded-md px-6 py-5"
          >
            <Trash2 size={18} className="mr-2" />
            Delete organization
          </RippleButton>
          <DeleteOrganizationDialog
            orgName={org?.name}
            deleteHook={deleteHook}
          />
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white/60 border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-5 space-y-12">
            {/* --- CUSTOM ATTRIBUTES SECTION --- */}
            <section>
              <div className="flex items-center justify-between bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-50 py-3 px-4 border-l-4 border-slate-700 rounded-l-md">
                <h2 className="text-lg font-semibold text-slate-900">
                  User Management
                </h2>
                <Button
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                  className=" px-4 h-9 text-[13px] cursor-pointer bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm"
                >
                  <Plus size={16} className="mr-2" />
                  Add User
                </Button>
              </div>

              <div className="mt-10 border rounded-xl bg-white shadow-sm overflow-hidden">
                <Table className="border-collapse table-fixed w-full">
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="h-12 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-slate-200 last:border-r-0 w-[20%]">
                        Name
                      </TableHead>
                      <TableHead className="h-12 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-slate-200 last:border-r-0 w-[15%]">
                        Email
                      </TableHead>
                      <TableHead className="h-12 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-slate-200 last:border-r-0 w-[15%]">
                        Phone number
                      </TableHead>

                      <TableHead className="h-12 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center w-[20%]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* --- LOADING SKELETON STATE --- */}
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-5 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-24" />
                          </TableCell>
                          <TableCell className="flex justify-center gap-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : users.length > 0 ? (
                      /* --- REAL DATA STATE --- */
                      <TooltipProvider delayDuration={200}>
                        {users.map((user) => (
                          <TableRow
                            key={user.id}
                            className="group hover:bg-slate-50/50 transition-colors border-b last:border-0"
                          >
                            <TableCell className="py-4 px-4 font-medium text-slate-700 border-r border-slate-100 last:border-r-0 truncate">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-default">
                                    {user.firstName} {user.lastName}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded-md shadow-lg border-none">
                                  {user.firstName} {user.lastName}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            {/* Email Tooltip */}
                            <TableCell className="py-4 px-4 font-medium text-slate-700 border-r border-slate-100 last:border-r-0 truncate">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-default">
                                    {user.email}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded-md shadow-lg border-none">
                                  {user.email}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>

                            {/* Phone Number Tooltip */}
                            <TableCell className="py-4 px-4 text-slate-400 italic border-r border-slate-100 last:border-r-0 text-sm">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-default">
                                    {user.phoneNumber || "N/A"}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded-md shadow-lg border-none">
                                  {user.phoneNumber || "No number provided"}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>

                            <TableCell className="py-4 px-6 text-right">
                              <div className="flex justify-center items-center gap-1">
                                <div>
                                  <Button
                                    onClick={() => handleEdit(user)}
                                    className=" px-5 cursor-pointer  text-[13px]  tracking-tight"
                                  >
                                    Edit
                                  </Button>
                                </div>
                                <div>
                                  <Button
                                    onClick={() => confirmDelete(user)}
                                    className="text-[13px] px-3 bg-red-100 text-red-500 hover:bg-red-200 cursor-pointer transition-all"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TooltipProvider>
                    ) : (
                      /* --- NO USER FOUND STATE (Table Body kulla) --- */
                      <TableRow>
                        <TableCell colSpan={4} className="h-40 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <p className="text-slate-400 font-medium text-lg">
                              No users found.
                            </p>
                            <p className="text-slate-300 text-sm">
                              Click 'Add User' to get started.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-[1.5rem] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Delete User?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-900">
                {userToDelete?.firstName}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="bg-neutral-50 border-none rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(userToDelete.id)}
              disabled={deleteMutation.isPending}
              className="font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Custom Attribute Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!addMutation.isPending && !updateMutation.isPending) {
            setIsDialogOpen(open);
          }
        }}
      >
        <DialogContent
          onPointerDownOutside={(e) => {
            if (addMutation.isPending || updateMutation.isPending) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            if (addMutation.isPending || updateMutation.isPending) {
              e.preventDefault();
            }
          }}
          className="sm:max-w-md   overflow-hidden border-none shadow-2xl bg-white rounded-3xl"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              Add New User
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="  text-slate-700 tracking-wide  text-[14px]"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="h-11 "
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="  text-slate-700 tracking-wide  text-[14px]"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Last Name"
                className="h-11 "
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="  text-slate-700 tracking-wide  text-[14px]"
              >
                Email
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="Email"
                className="h-11 "
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phoneNumber"
                className="  text-slate-700 tracking-wide  text-[14px]"
              >
                Phone Number
              </Label>
              <Input
                type="number"
                id="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="h-11 "
              />
            </div>
          </div>
          <DialogFooter className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className=" border-slate-200 h-11 px-6"
            >
              Cancel
            </Button>
            <RippleButton
              onClick={handleSubmit}
              disabled={addMutation.isPending || updateMutation.isPending}
              className=" rounded-md cursor-pointer h-11 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200"
            >
              {addMutation.isPending || updateMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Processing...</span>
                </div>
              ) : editingUser ? (
                "Save Changes"
              ) : (
                "Add User"
              )}
            </RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
