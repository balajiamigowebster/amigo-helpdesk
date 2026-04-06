"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Globe,
  Calendar,
  Building2,
  Filter,
  Trash2,
  Download,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion"; // Framer Motion imports
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import AllOrganizationSkeleton, {
  PaginationSkeleton,
} from "../_setting-components/OrganizationSettingSkeleton/AllOrganizationSkeleton";

const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Name (A-Z)", value: "name-az" },
  { label: "Name (Z-A)", value: "name-za" },
  { label: "Country", value: "country" },
  { label: "Admin ID", value: "admin-id" },
];

// --- DUMMY DATA GENERATION (100 Items for testing pagination) ---
const allDummyOrgs = Array.from({ length: 500 }).map((_, i) => ({
  id: `id-${i}`,
  name:
    i === 0 ? "amigoweb" : i === 1 ? "amigowebster" : `Organization ${i + 1}`,
  country: i % 3 === 0 ? "India" : i % 3 === 1 ? "USA" : "UK",
  adminId: `admin-${Math.floor(Math.random() * 1000000)}`,
  createdAt: new Date(2026, 1, 4 - i).toISOString(),
}));

export default function OrganizationManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeSearch, setActiveSearch] = useState(""); // Only updates on button click
  const [sortBy, setSortBy] = useState("newest");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // First page-la 20 records

  // --- ELLIPSIS LOGIC (Same as Ticket Category) ---

  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ["all-organizations", currentPage, activeSearch, sortBy],
    queryFn: async () => {
      const res = await api.get("/organization/all-organization", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: activeSearch,
          sortBy: sortBy,
        },
      });
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5, // 5 nimisham data 'fresh'-ah irukum
    refetchOnWindowFocus: false, // <--- Ippo tab switch panna API call aagaathu
    refetchOnReconnect: false, // (Optional) Net thirumba varum pothum call aagathu
  });

  const organizations = data?.data || [];
  const meta = data?.meta || {
    totalRecords: 0,
    totalPages: 1,
    initialTotal: 0,
  };

  // --- CALCULATION LOGIC ---
  const totalPages = meta.totalPages;
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  // Result: 1 to 20, 21 to 40... nu kaata
  const displayStart = meta.totalRecords === 0 ? 0 : indexOfFirstItem + 1;
  const displayEnd = indexOfFirstItem + organizations.length;

  // --- HANDLERS ---
  const handleSearch = () => {
    setActiveSearch(searchTerm);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis-start");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis-end");
      pages.push(totalPages);
    }
    return pages;
  };

  // --- LOGIC: Select/Deselect ---
  const toggleSelectAll = () => {
    if (selectedIds.length === organizations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(organizations.map((org) => org.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const isSelectionMode = selectedIds.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-40px)] w-full space-y-6 p-2 bg-[#fcfcfd]">
      {/* --- HEADER SECTION --- */}
      <div className="flex justify-between items-center px-4 pt-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Organizations
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage Organizations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <Filter size={14} className="text-slate-500" />
            <span className="text-[11px] font-medium uppercase text-slate-500 tracking-wider">
              Sort By:
            </span>
            <Select
              value={sortBy}
              onValueChange={(val) => {
                setSortBy(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-7 border-none bg-transparent shadow-none focus:ring-0 text-[11px] font-medium p-0 w-30">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                {sortOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-[12px]"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator className="mx-4" />

      {/* --- ANIMATED ACTION BAR / SEARCH BAR --- */}
      <div className="px-4 h-12 relative">
        <AnimatePresence mode="wait">
          {!isSelectionMode ? (
            <motion.div
              key="search-bar"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 w-full max-w-2xl"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, domain or ID..."
                  className="pl-11 h-12 bg-white border-slate-200 rounded-lg shadow-sm focus:ring-blue-500 transition-all font-normal"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white  shadow-md transition-all flex items-center gap-2 font-bold"
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    {" "}
                    <Loader2 className="animate-spin" /> Searching...
                  </span>
                ) : (
                  "Search"
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="action-bar"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between w-full h-12 bg-slate-900 text-white px-6 rounded-xl shadow-lg border border-slate-800"
            >
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedIds([])}
                  className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8 rounded-full"
                >
                  <X size={18} />
                </Button>
                <span className="text-sm font-medium">
                  {selectedIds.length} items selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="text-red-400 hover:bg-red-500/50 hover:text-red-100 cursor-pointer gap-2 h-9 text-xs font-bold uppercase tracking-widest px-4"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="flex-1 min-h-0 mx-4 bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1 custom-scrollbar relative">
          <Table className="w-full">
            <TableHeader className="bg-slate-50 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-20 pl-8">
                  <Checkbox
                    className="border-slate-400"
                    checked={
                      organizations.length > 0 &&
                      selectedIds.length === organizations.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-medium text-slate-600 uppercase text-[11px] tracking-widest py-6">
                  Organization Name
                </TableHead>
                <TableHead className="font-medium text-slate-600 uppercase text-[11px] tracking-widest">
                  Country
                </TableHead>
                <TableHead className="font-medium text-slate-600 uppercase text-[11px] tracking-widest">
                  Registration Date
                </TableHead>
                <TableHead className="font-medium text-slate-600 uppercase text-[11px] tracking-widest">
                  Admin Identity
                </TableHead>
                <TableHead className="text-right pr-8 font-medium text-slate-600 uppercase text-[11px] tracking-widest">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <AllOrganizationSkeleton />
              ) : isError ? (
                <TableRow className="hover:bg-slate">
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2 text-red-500">
                      <AlertCircle size={32} />
                      <p className="font-medium">
                        Failed to load: {error.message}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : organizations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-40 text-center text-slate-500"
                  >
                    No organizations found.
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => {
                  const isSelected = selectedIds.includes(org.id);
                  return (
                    <TableRow
                      key={org.id}
                      className={`group transition-all duration-200 border-b-slate-50 ${
                        isSelected ? "bg-blue-50/50" : "hover:bg-slate-50/50"
                      }`}
                    >
                      <TableCell className="pl-8">
                        <Checkbox
                          className="border-slate-400"
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectRow(org.id)}
                        />
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-2xl transition-all text-slate-500 ${isSelected ? "bg-white shadow-sm" : "bg-slate-100 group-hover:bg-white group-hover:shadow-sm"}`}
                          >
                            <Building2 size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-900 text-[15px] capitalize tracking-tight font-semibold">
                              {org.name}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-[13px] font-normal text-slate-600">
                          <Globe size={14} className="text-slate-400" />
                          {org.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-[13px] font-normal text-slate-600">
                          <Calendar size={14} className="text-slate-400" />
                          {format(new Date(org.createdAt), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-500 font-medium text-[10px] border-none px-3 py-1 rounded-lg"
                        >
                          ID: {org.adminId.split("-")[0]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <MoreHorizontal size={20} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* --- FIXED BOTTOM PAGINATION WITH AVATAR GROUP --- */}
        {isLoading ? (
          <PaginationSkeleton />
        ) : (
          <div className="bg-white border-t border-slate-100 px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AvatarGroup>
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarImage src="https://github.com/maxleiter.png" />
                  <AvatarFallback>LR</AvatarFallback>
                </Avatar>
                <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                  <AvatarImage
                    src="https://github.com/evilrabbit.png"
                    alt="@evilrabbit"
                  />
                  <AvatarFallback>ER</AvatarFallback>
                </Avatar>
                <AvatarGroupCount className="h-8 w-8 text-[10px] bg-slate-100 border-2 border-white">
                  +10k
                </AvatarGroupCount>
              </AvatarGroup>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-slate-900">
                  Showing {displayStart} - {displayEnd} of {meta.totalRecords}
                </span>
                <span className="text-[10px] text-slate-600 tracking-widest">
                  Page {currentPage} of {meta.totalPages}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Pagination className="justify-end w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none  opacity-40"
                          : "cursor-pointer hover:bg-neutral-200"
                      }
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, idx) => (
                    <PaginationItem key={idx}>
                      {page === "ellipsis-start" || page === "ellipsis-end" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                          className={`cursor-pointer transition-all duration-200  ${
                            currentPage === page
                              ? "bg-neutral-900 text-white shadow-lg shadow-slate-200 hover:bg-slate-800 hover:text-white"
                              : "hover:bg-neutral-200"
                          }`}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(meta.totalPages, p + 1))
                      }
                      className={
                        currentPage === meta.totalPages
                          ? "pointer-events-none opacity-40"
                          : "cursor-pointer hover:bg-neutral-200"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
