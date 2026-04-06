const { Skeleton } = require("@/components/ui/skeleton");

const MessagesSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className={`flex gap-4 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}
      >
        {/* Avatar Skeleton - Darker */}
        <Skeleton className="w-10 h-10 rounded-full shrink-0 bg-slate-200/80" />

        <div className="flex-1 space-y-2">
          <div
            className={`flex items-center gap-2 ${i % 2 === 0 ? "justify-end" : ""}`}
          >
            {/* Name and Time Skeletons */}
            <Skeleton className="h-4 w-24 bg-slate-200" />
            <Skeleton className="h-3 w-12 bg-slate-200/60" />
          </div>

          {/* Message Bubble Skeleton - Darker with more opacity */}
          <Skeleton
            className={`h-20 w-full max-w-2xl rounded-2xl bg-slate-200/70 ${
              i % 2 === 0 ? "rounded-tr-none" : "rounded-tl-none"
            }`}
          />
        </div>
      </div>
    ))}
  </div>
);

export default MessagesSkeleton;
