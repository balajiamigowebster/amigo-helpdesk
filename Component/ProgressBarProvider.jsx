"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import nProgress from "nprogress";
import "nprogress/nprogress.css";

// NProgress Configuration (Optional)
nProgress.configure({
  showSpinner: false,
  speed: 1400,
  minimum: 0.3,
});

export default function ProgressBarProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Route change start aagumbothu (Initial render or URL change)
    nProgress.done();

    return () => {
      nProgress.start();
    };
  }, [pathname, searchParams]);

  return <>{children}</>;
}
