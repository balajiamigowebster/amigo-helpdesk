// Table Skeleton Component

import { TableRow, TableCell } from "@/components/ui/table";

const AllOrganizationSkeleton = () => {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent border-slate-50">
          <TableCell className="pl-8 w-20">
            <div className="h-4 w-4 rounded bg-slate-100 animate-pulse" />
          </TableCell>
          <TableCell className="py-5">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-2xl bg-slate-100 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
          </TableCell>
          <TableCell>
            <div className="h-5 w-16 bg-slate-100 rounded-lg animate-pulse" />
          </TableCell>
          <TableCell className="text-right pr-8">
            <div className="h-8 w-8 ml-auto rounded-xl bg-slate-100 animate-pulse" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default AllOrganizationSkeleton;

// Pagination Skeleton
export const PaginationSkeleton = () => {
  return (
    <div className="bg-white border-t border-slate-100 px-8 py-5 flex items-center justify-between w-full">
      {/* Left Side: Avatar Group & Text Skeleton */}
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 animate-pulse"
            />
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
          <div className="h-2 w-20 bg-slate-50 rounded animate-pulse" />
        </div>
      </div>

      {/* Right Side: Pagination Buttons Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />{" "}
        {/* Previous */}
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 w-9 bg-slate-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
        <div className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />{" "}
        {/* Next */}
      </div>
    </div>
  );
};
