import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function GeneralSettingSkeleton() {
  return (
    <div className="bg-[#f8fafc] min-h-full">
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        {/* --- HEADER SECTION SKELETON --- */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            {/* Title (Amigo Help Desk-1) */}
            <Skeleton className="h-9 w-64 rounded-lg bg-slate-200" />
            {/* Link/URL (https://amigo...) */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full bg-slate-200" />
              <Skeleton className="h-4 w-80 rounded-md bg-slate-200" />
            </div>
          </div>
          {/* Delete Button */}
          <Skeleton className="h-12 w-48 rounded-xl bg-red-50" />
        </div>

        {/* --- MAIN CONTENT CARD SKELETON --- */}
        <div className="bg-white/60 border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-5 space-y-8">
            <section>
              {/* Blue Sidebar Style Header (General) */}
              <div className="relative flex items-center bg-slate-100 py-4 px-4 border-l-4 border-slate-300 rounded-l-md mb-6">
                <Skeleton className="h-6 w-24 bg-slate-200" />
              </div>

              {/* Rows: Name, URL, Portal, Email */}
              <div className="space-y-1 px-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between py-6">
                      {/* Left Side Label (Name, Email etc) */}
                      <Skeleton className="h-4 w-20 bg-slate-200" />

                      {/* Right Side Value/Button */}
                      <div className="flex items-center gap-6">
                        <Skeleton className="h-4 w-64 bg-slate-100" />
                        {/* Edit Button (Only for first row) */}
                        {i === 1 && (
                          <Skeleton className="h-8 w-16 rounded-md bg-slate-900/10" />
                        )}
                      </div>
                    </div>
                    {i !== 4 && <Separator className="bg-slate-100" />}
                  </div>
                ))}
              </div>

              {/* Toggle Row (Auto-assign) */}
              <div className="flex items-center justify-between py-8 px-5 mt-4">
                <div className="space-y-2 max-w-[70%]">
                  <Skeleton className="h-5 w-full bg-slate-200" />
                  <Skeleton className="h-4 w-3/4 bg-slate-100" />
                </div>
                <Skeleton className="h-10 w-32 rounded-2xl bg-slate-100" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
