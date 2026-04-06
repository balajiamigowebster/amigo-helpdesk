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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomAttributes({ params }) {
  const { orgId } = use(params);
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const [editingAttribute, setEditingAttribute] = useState(null);

  // Custom Attributes State
  // 1. Default-ah empty array
  // const [attributes, setAttributes] = useState([
  //   { id: 1, name: "testing-1", type: "number", include: true, require: false },
  // ]);

  const closeModel = () => {
    setIsDialogOpen(false);
    setEditingAttribute(null); // setEditingCategory-ku pathila
    setFormData(initialForm); // CategoryName-ku pathila unga form data-vai reset pannunga
  };

  // --- ADD INTHA FUNCTION ---
  const handleAddOpen = () => {
    setEditingAttribute(null); // Edit mode-la iruntha clear pannidum
    setFormData(initialForm); // Form values-ai reset pannidum
    setIsDialogOpen(true); // Dialog-ai open pannum
  };

  const initialForm = {
    name: "",
    type: "Text Field",
    includeInPortal: false,
    isRequired: false,
    options: "",
  };

  const [formData, setFormData] = useState(initialForm);

  // console.log(formData);

  const { data: attributes = [], isLoading } = useQuery({
    queryKey: ["customAttributes", orgId],
    queryFn: async () => {
      const res = await api.get(`/organization/${orgId}/custom-attributes`);
      return res.data.data;
    },
    enabled: !!orgId,
    placeholderData: (previousData) => previousData, // Smooth transition for pagination
  });

  console.log(attributes);

  const upsertMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingAttribute) {
        return await api.put(`/organization/${orgId}/custom-attributes`, {
          id: editingAttribute.id,
          ...payload,
        });
      }
      return api.post(`/organization/${orgId}/custom-attributes`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["customAttributes", orgId]);
      toast.success(
        editingAttribute ? "Attribute Updated" : "Attribute Created",
      );
      closeModel();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Action failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/organization/${orgId}/custom-attributes`, {
        params: {
          id,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["customAttributes", orgId]);
      toast.success("Attribute deleted");
    },
  });

  const handleEdit = (attr) => {
    setEditingAttribute(attr);
    setFormData({
      name: attr.name,
      type: attr.type,
      includeInPortal: attr.includeInPortal,
      isRequired: attr.isRequired,
      options: attr.options ? attr.options.join(", ") : "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return toast.error("Name is required");

    // Convert comma string to Array for backend
    const payload = {
      ...formData,
      options:
        formData.type === "List"
          ? formData.options
              .split(",")
              .map((opt) => opt.trim())
              .filter((opt) => opt !== "")
          : [],
    };

    upsertMutation.mutate(payload);
  };

  const orgData = {
    name: "Amigo",
    helpDeskUrl: "https://amigowebster.helpdesktech.in",
    email: "help@amigowebster.helpdesktech.in",
    displayName: "Amigo Help Desk",
  };

  // 2. Select options array
  const attributeTypes = [
    { label: "Text Field", value: "Text Field" },
    { label: "Text Area", value: "Text Area" },
    { label: "List", value: "List" },
    { label: "Phone", value: "Phone" },
    { label: "Date", value: "Date" },
    { label: "Number", value: "Number" },
  ];

  return (
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
          <RippleButton className="border-red-100 text-sm bg-red-100 text-red-500 shadow-sm hover:bg-red-200/65 rounded-md px-6 py-5">
            <Trash2 size={18} className="mr-2" />
            Delete organization
          </RippleButton>
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white/60 border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-5 space-y-12">
            {/* --- CUSTOM ATTRIBUTES SECTION --- */}
            <section>
              <div className="flex items-center justify-between bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-50 py-3 px-4 border-l-4 border-slate-700 rounded-l-md">
                <h2 className="text-lg font-semibold text-slate-900">
                  Custom attributes
                </h2>
                <Button
                  onClick={handleAddOpen}
                  className=" px-4 h-9 text-[13px] cursor-pointer bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm"
                >
                  <Plus size={16} className="mr-2" />
                  Add custom attribute
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
                        Type
                      </TableHead>
                      <TableHead className="h-12 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-slate-200 last:border-r-0 w-[15%]">
                        Options
                      </TableHead>
                      <TableHead className="h-12 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center border-r border-slate-200 last:border-r-0 w-[15%]">
                        Include
                      </TableHead>
                      <TableHead className="h-12 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center border-r border-slate-200 last:border-r-0 w-[15%]">
                        Require
                      </TableHead>
                      <TableHead className="h-12 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center w-[20%]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? ( // --- SKELETON LOADING STATE ---
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="p-4 border-r">
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                          <TableCell className="p-4 border-r">
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell className="p-4 border-r">
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell className="p-4 border-r text-center">
                            <Skeleton className="h-6 w-12 mx-auto rounded-lg" />
                          </TableCell>
                          <TableCell className="p-4 border-r text-center">
                            <Skeleton className="h-6 w-12 mx-auto rounded-lg" />
                          </TableCell>
                          <TableCell className="p-4 text-center">
                            <Skeleton className="h-8 w-20 mx-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : attributes.length > 0 ? (
                      <TooltipProvider delayDuration={200}>
                        {attributes.map((attr) => (
                          <TableRow
                            key={attr.id}
                            className="group hover:bg-slate-50/50 transition-colors border-b last:border-0"
                          >
                            {/* 1. Name Tooltip */}
                            <TableCell className="py-4 px-4 font-medium text-slate-700 border-r border-slate-100 truncate">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-default">
                                    {attr.name}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded-md shadow-lg border-none">
                                  {attr.name}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            {/* 2. Type Tooltip */}
                            <TableCell className="py-4 px-4 text-slate-500 border-r border-slate-100">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="bg-neutral-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 uppercase cursor-default">
                                    {attr.type}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded-md shadow-lg border-none">
                                  {attr.type}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            {/* 3. Options Tooltip */}
                            <TableCell className="py-4 px-4 border-r border-slate-100 truncate">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex flex-wrap gap-1 cursor-default">
                                    {attr.options && attr.options.length > 0 ? (
                                      <Badge
                                        variant="secondary"
                                        className="text-[12px] px-1 py-0 italic"
                                      >
                                        {attr.options.length} options...
                                      </Badge>
                                    ) : (
                                      <span className="text-slate-500 italic">
                                        None
                                      </span>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                {attr.options && attr.options.length > 0 && (
                                  <TooltipContent className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded-md shadow-lg border-none max-w-50">
                                    {attr.options.join(", ")}
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TableCell>
                            {/* --- Include Column (Yes/No) --- */}
                            <TableCell className="py-4 px-4 border-r border-slate-100 last:border-r-0">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex justify-center">
                                    <span
                                      className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all duration-300 ${
                                        attr.includeInPortal
                                          ? "bg-emerald-100/80 text-emerald-700 border border-emerald-200 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.3)]"
                                          : "bg-red-50 text-red-500 border border-red-100 shadow-[0_2px_10px_-3px_rgba(239,68,68,0.2)]"
                                      }`}
                                    >
                                      {attr.includeInPortal ? (
                                        <>
                                          <Check size={12} strokeWidth={3} />
                                          Yes
                                        </>
                                      ) : (
                                        <>
                                          <X size={12} strokeWidth={3} />
                                          No
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded-md shadow-lg border-none">
                                  {attr.includeInPortal
                                    ? "Included in Portal"
                                    : "Hidden in Portal"}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            {/* --- Require Column (Yes/No) --- */}
                            <TableCell className="py-4 px-4 border-r border-slate-100 last:border-r-0">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex justify-center">
                                    <span
                                      className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all duration-300 ${
                                        attr.isRequired
                                          ? "bg-emerald-100/80 text-emerald-700 border border-emerald-200 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.3)]"
                                          : "bg-red-50 text-red-500 border border-red-100 shadow-[0_2px_10px_-3px_rgba(239,68,68,0.2)]"
                                      }`}
                                    >
                                      {attr.isRequired ? (
                                        <>
                                          <Check
                                            size={12}
                                            strokeWidth={3}
                                            className="animate-in zoom-in duration-300"
                                          />
                                          <span>Yes</span>
                                        </>
                                      ) : (
                                        <>
                                          <X
                                            size={12}
                                            strokeWidth={3}
                                            className="animate-in zoom-in duration-300"
                                          />
                                          <span>No</span>
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded-md shadow-lg border-none">
                                  {attr.isRequired
                                    ? "Mandatory Field"
                                    : "Optional Field"}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-right">
                              <div className="flex justify-center items-center gap-1">
                                <div>
                                  <Button
                                    onClick={() => handleEdit(attr)}
                                    className=" px-5 cursor-pointer  text-[13px]  tracking-tight"
                                  >
                                    Edit
                                  </Button>
                                </div>

                                {/* --- ALERT DIALOG FOR DELETE --- */}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      disabled={deleteMutation.isPending}
                                      className="text-[13px] px-3 bg-red-100 text-red-500 hover:bg-red-200 cursor-pointer transition-all"
                                    >
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-2xl">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you absolutely sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the{" "}
                                        <strong>{attr.name}</strong> attribute.
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="rounded-md">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          deleteMutation.mutate(attr.id)
                                        }
                                        className="bg-red-600 hover:bg-red-700 text-white rounded-md"
                                      >
                                        {deleteMutation.isPending
                                          ? "Deleting..."
                                          : "Delete"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TooltipProvider> /* Empty state rendering... */
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-20 border-none hover:bg-transparent"
                        >
                          <div className="flex flex-col items-center justify-center space-y-4 text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/30">
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                              <Plus size={32} className="text-slate-300" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-600 font-bold text-lg">
                                There are no attributes
                              </p>
                              <p className="text-sm text-slate-400 max-w-70">
                                Click the button above to add your first custom
                                attribute.
                              </p>
                            </div>
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

      {/* Add Custom Attribute Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md   overflow-hidden border-none shadow-2xl bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              {editingAttribute
                ? "Edit custom attribute"
                : "Add custom attribute"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="  text-slate-700 tracking-wide  text-[14px]"
              >
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                placeholder="Attribute name"
                className="h-11 "
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="type"
                className=" text-slate-700 tracking-wide  text-[14px]"
              >
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger className="w-full  py-5.5 border-slate-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {/* Array mapping for Select Items */}
                  {attributeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* SHOW OPTIONS ONLY IF TYPE IS LIST */}
            {formData.type === "List" && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <Label className="text-slate-700 text-[14px]">
                  Options (Comma separated)
                </Label>
                <Input
                  value={formData.options}
                  onChange={(e) =>
                    setFormData({ ...formData, options: e.target.value })
                  }
                  placeholder="e.g. High, Medium, Low"
                  className="h-11"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-1">
              <Label className="text-[14px]  text-slate-700">
                Include in portal
              </Label>
              <Switch
                checked={formData.includeInPortal}
                onCheckedChange={(val) =>
                  setFormData({ ...formData, includeInPortal: val })
                }
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            <div className="flex items-center justify-between p-1">
              <Label className="text-[14px]  text-slate-700">
                Require in portal
              </Label>
              <Switch
                checked={formData.isRequired}
                onCheckedChange={(val) =>
                  setFormData({ ...formData, isRequired: val })
                }
                className="data-[state=checked]:bg-blue-600"
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
              disabled={upsertMutation.isPending}
              onClick={handleSubmit}
              className=" rounded-md cursor-pointer h-11 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200"
            >
              {upsertMutation.isPending
                ? "Processing..."
                : editingAttribute
                  ? "Update Attribute"
                  : "Add Attribute"}
            </RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
