import { memo, useEffect, useMemo, useState } from "react";

// --- OPTIMIZED TIME COMPONENT (Rerenders only itself) ---
export const LiveTimeAgo = memo(({ timestamp }) => {
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const timeText = useMemo(() => {
    const createdDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - createdDate) / 1000);
    if (diffInSeconds < 10) return "Just now";
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${diffInSeconds}s ago`;
  }, [timestamp, now]);

  if (!mounted) return <span className="text-slate-400 text-[10px]">...</span>;
  return <span className="text-gray-400 text-[10px]">{timeText}</span>;
});

export const FullTimeStamp = memo(({ timestamp }) => {
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Every 10 seconds refresh aagum
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const timeText = useMemo(() => {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    // Intha format-la "Mar 10, 2026, 12:54 PM" nu varum
    return date.toLocaleString("en-US", {
      month: "short", // Month (e.g., Mar)
      day: "2-digit", // Date (e.g., 10)
      year: "numeric", // Year (e.g., 2026)
      hour: "2-digit", // Hour
      minute: "2-digit", // Minute
      hour12: true, // AM/PM format
    });
  }, [timestamp, now]); // 'now' update aagum pothu trigger aagum

  if (!mounted) return <span className="text-slate-400 text-[10px]">...</span>;

  return (
    <span className="text-gray-400 text-[10px] font-medium">{timeText}</span>
  );
});
