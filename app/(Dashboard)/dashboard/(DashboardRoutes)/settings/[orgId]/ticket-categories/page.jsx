"use client";

import React, { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Link as LinkIcon, Plus, Loader2 } from "lucide-react";
import RippleButton from "@/Component/RippleButton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDeleteOrganization } from "@/hooks/useDeleteOrganization";
import { useOrganization } from "@/hooks/useOrganization";
import api from "@/api";
import { Skeleton } from "@/components/ui/skeleton";
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
import DeleteOrganizationDialog from "../../_setting-components/DeleteOrganizationDialog";

export default function TicketCategories({ params }) {
  const { orgId } = use(params);
  const queryClient = useQueryClient();
  const deleteHook = useDeleteOrganization(orgId);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  // Delete State
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const closeModel = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  const itemsPerPage = 6;

  // --- 1. FETCH ORGANIZATION DATA ---
  const { data: orgRes, isLoading: isOrgLoading } = useOrganization(orgId);
  const org = orgRes?.data;

  // --- 2. GET: Fetch Categories with Pagination ---
  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["ticket-categories", orgId, currentPage],
    queryFn: async () => {
      const res = await api.get(`/organization/${orgId}/ticket-categories`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      return res.data;
    },
    enabled: !!orgId,
    placeholderData: (previousData) => previousData, // Smooth transition for pagination
  });

  const categories = data?.categories || [];
  const totalPages = data?.totalPages || 1;

  // --- 3. POST & PUT: Mutation for Add/Edit ---
  const upsertMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingCategory) {
        return await api.put(
          `/organization/${orgId}/ticket-categories`,
          payload,
        );
      }
      return await api.post(
        `/organization/${orgId}/ticket-categories`,
        payload,
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["ticket-categories", orgId]);
      toast.success(editingCategory ? "Category Updated!" : "Category added!");
      closeModel();
    },
    onError: (err) => toast.error(err.response?.data?.error || "Action failed"),
  });

  // --- 4. DELETE: Mutation ---
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/organization/${orgId}/ticket-categories`, {
        params: {
          id,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ticket-categories", orgId]);
      toast.success("Category deleted");
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    },
    onError: () => toast.error("Could not complete deletion"),
  });

  const confirmDelete = (cat) => {
    setCategoryToDelete(cat);
    setShowDeleteDialog(true);
  };

  const orgData = {
    name: "Amigo",
    helpDeskUrl: "https://amigowebster.helpdesktech.com",
  };

  // Sample data based on your image
  // Categories-ai state-ah mathunathan puthusa add panna mudiyaum
  const [allCategories, setAllCategories] = useState([
    "Email",
    "Hardware",
    "Maintenance",
    "Network",
    "Other",
    "Printer",
    "Software",
  ]);

  // --- 3. Current Page Data Calculation ---

  // Ippo irukura page-oda last item index (e.g., Page 2-na 2 * 6 = 12)
  const indexOfLastItems = currentPage * itemsPerPage;
  // Ippo irukura page-oda first item index (e.g., 12 - 6 = 6)
  const indexOfFirstItem = indexOfLastItems - itemsPerPage;
  // AllCategories list-la irunthu intha specific page-ku thevaiyana 6 items-ai mattum cut panni edukkurom
  const currentItems = allCategories.slice(indexOfFirstItem, indexOfLastItems);

  // // 🛠️ Debugging values for Data Calculation
  // console.log("--- Pagination Status ---");
  // console.log("Current Page:", currentPage);
  // console.log("Total Pages:", totalPages);
  // console.log("Showing Index Range:", indexOfFirstItem, "to", indexOfLastItems);
  // console.log("Current Items on Screen:", currentItems);

  // --- LOGIC: Page Numbers with Dots (...) Generate panna ---
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3; // Current page-ku rendu pakkamum evlo number kaatnum

    // Total-ah konjam page thaan irukuna, ellaa number-aiyumey array-la push pannidalaam
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Epovumae 1st page number-ah first-la vachupom
      pages.push(1);

      // Current page 3-ku mela poiduchuna, munnadi "..." (dots) kaatnum
      if (currentPage > 3) pages.push("ellipsis-start");

      // Current page-ku munnadi oru number, pinradi oru number-ah range-ah edukurom
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      // Last page-ku munnaadi innum gap irundha pinradi "..." (dots) kaatnum
      if (currentPage < totalPages - 2) pages.push("ellipsis-end");

      // Epovumae last page number array-oda mudivula irukum
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    // // 🛠️ Debugging the final pagination array
    // console.log("Generated Page Buttons Array:", pages);

    return pages;
  };

  const handleCreateCategory = () => {
    if (!categoryName.trim()) {
      toast.error("Category Name Requied");
      return;
    }
    // Puthu category-ah list-oda top-la (1st item-ah) push panrom
    setAllCategories([categoryName, ...allCategories]);
    // Reset fields
    setCategoryName("");
    setIsModalOpen(false);
    setCurrentPage(1); // Puthusa add panna category-ah paaka 1st page-ku porom
    toast.success("Category added successfully!");
  };

  const handleSubmit = () => {
    if (!categoryName.trim()) return toast.error("Name is required");
    upsertMutation.mutate({ id: editingCategory?.id, name: categoryName });
  };

  return (
    <div className="bg-[#f8fafc] min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isOrgLoading ? <Skeleton className="h-8 w-40" /> : org?.name}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
              <LinkIcon size={14} className="text-blue-500" />
              {org?.fullDomainUrl ? (
                org.fullDomainUrl
              ) : (
                <span className="text-slate-400 italic">
                  {isOrgLoading ? "Loading domain..." : "Domain not configured"}
                </span>
              )}
            </p>
          </div>
          <RippleButton
            onClick={() => deleteHook.states.setIsFirstModalOpen(true)}
            className="border-red-100 text-sm bg-red-100 text-red-500 shadow-sm hover:bg-red-200/65 cursor-pointer rounded-md px-6 py-5"
          >
            <Trash2 size={18} className="mr-2" /> Delete organization
          </RippleButton>
          <DeleteOrganizationDialog
            orgName={org?.name}
            deleteHook={deleteHook}
          />
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white/60 border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
          <div className="p-5 space-y-6 grow">
            {/* Title Bar */}
            <div className="flex items-center justify-between bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-50 py-3 px-4 border-l-4 border-slate-700 rounded-l-md">
              <h2 className="text-lg font-semibold text-slate-900">
                Ticket categories
              </h2>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryName("");
                  setIsModalOpen(true);
                }}
                className="px-4 h-9 text-[13px] bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm"
              >
                <Plus size={16} className="mr-2" /> Add ticket category
              </Button>
            </div>

            {/* --- TABLE AREA (FIXED HEIGHT) --- */}
            <div className="px-5 divide-y divide-slate-200 min-h-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between py-5">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                ))
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between py-5 group"
                  >
                    <p className="text-[13px] font-black text-slate-700 tracking-widest ">
                      {cat.name}
                    </p>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryName(cat.name);
                          setIsModalOpen(true);
                        }}
                        className="px-6 text-[13px]"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => confirmDelete(cat)}
                        className="text-[13px] bg-red-100 text-red-500 hover:bg-red-200"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-slate-400">
                  No categories found.
                </div>
              )}
            </div>
          </div>

          {/* --- STICKY PAGINATION SECTION --- */}
          {totalPages > 1 && (
            <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-100 p-5 flex justify-between items-center z-10">
              <p className="text-sm text-slate-500 font-medium">
                Showing Page {currentPage} of {totalPages}
              </p>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={`${currentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}`}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, idx) => (
                    <PaginationItem key={idx}>
                      {page === "ellipsis-start" || page === "ellipsis-end" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          className={
                            currentPage === page
                              ? "bg-slate-900 text-white"
                              : "cursor-pointer"
                          }
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      className={`${currentPage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-[1.5rem] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Delete Category?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-900">
                {categoryToDelete?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="bg-neutral-50 border-none rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(categoryToDelete.id)}
              disabled={deleteMutation.isPending}
              className="font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- ADD/EDIT DIALOG --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-125 p-0 overflow-hidden border-none shadow-2xl bg-white rounded-3xl">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <DialogTitle className="text-2xl font-medium text-slate-800 tracking-tight">
              {editingCategory ? "Edit ticket category" : "Add ticket category"}
            </DialogTitle>
          </div>

          <div className="p-6 space-y-3">
            <Label
              htmlFor="category-name"
              className="text-sm text-slate-700 tracking-wide text-[15px]"
            >
              Category Name
            </Label>
            <Input
              id="category-name"
              placeholder="e.g. Hardware"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full h-12"
            />
          </div>

          <div className="flex justify-end gap-3 p-4 bg-slate-50/50 border-t border-slate-100">
            <button
              onClick={closeModel}
              className="px-4 py-2.5 text-xs font-black border border-slate-500/55 rounded-md text-slate-600 hover:bg-neutral-100 cursor-pointer tracking-widest"
            >
              Cancel
            </button>
            <RippleButton
              onClick={handleSubmit}
              disabled={upsertMutation.isPending}
              className="rounded-md cursor-pointer h-11 text-xs font-black uppercase tracking-widest shadow-lg"
            >
              {upsertMutation.isPending
                ? "Processing..."
                : editingCategory
                  ? "Save Changes"
                  : "Add Category"}{" "}
            </RippleButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
