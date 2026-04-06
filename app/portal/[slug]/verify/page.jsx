"use client";

import api from "@/api";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect } from "react";

export default function VerifyPortalLogin({ params }) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // --- TANSTACK QUERY: Verification Logic ---
  const { data, isPending, isError, isSuccess } = useQuery({
    queryKey: ["user-portal-verify-token", token, slug],
    queryFn: async () => {
      // Token illana fetch nadakkathu (enabled property-ai paarunga)
      const response = await api.get(
        `/portal/verify-userPortal?token=${token}&slug=${slug}&email=${email}`,
      );
      return response.data;
    },
    // Restriction: Token irundha mattum thaan intha query run aagum
    enabled: !!token && !!slug && !!email,
    retry: false, // Error vandha thirumba thirumba try panna vendam
    staleTime: 0,
  });

  // --- REDIRECTION LOGIC ---
  useEffect(() => {
    if (isSuccess) {
      // 2 seconds kazhithu automatic-ah dashboard-ku redirect aagum
      const timer = setTimeout(() => {
        router.push(`/portal/${slug}`);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, slug, router]);

  // 1. MANUAL ENTRY RESTRICTION: Token illama direct-ah vantha intha UI kaatum
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl text-center border border-orange-100">
          <ShieldAlert className="w-16 h-16 mx-auto text-orange-500 mb-4" />
          <h2 className="text-2xl font-black text-gray-900 uppercase italic">
            Access Denied
          </h2>
          <p className="text-gray-500 mt-2">
            Manual entry is not allowed. Please use the link sent to your email.
          </p>
          <button
            onClick={() => router.push(`/portal/${slug}`)}
            className="mt-6 w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-10 bg-white rounded-2xl shadow-2xl text-center relative overflow-hidden">
        {/* --- INITIAL PENDING / LOADING STATE --- */}
        {isPending && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="relative flex justify-center">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">
                Verifying Email
              </h2>
              <p className="text-gray-500 font-medium animate-pulse">
                Please wait while we secure your session...
              </p>
            </div>
          </div>
        )}
        {/* --- SUCCESS STATE --- */}
        {isSuccess && (
          <div className="space-y-8 animate-in zoom-in fade-in duration-500 text-center">
            {/* Success Icon with Pulse Effect */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                Login Successful
              </h2>
              <p className="text-blue-600 font-bold tracking-wide">
                Authentication verified. Preparing your portal...
              </p>
            </div>

            {/* Professional Progress Bar Animation */}
            <div className="max-w-xs mx-auto">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-blue-600 h-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                  style={{
                    animation: "progressLoader 2s ease-in-out forwards",
                  }}
                ></div>
              </div>
            </div>

            {/* Global CSS for the progress animation - Itha unga globals.css la sethukonga */}
            <style jsx>{`
              @keyframes progressLoader {
                0% {
                  width: 0%;
                }
                100% {
                  width: 100%;
                }
              }
            `}</style>
          </div>
        )}

        {/* --- ERROR STATE --- */}
        {isError && (
          <div className="space-y-6 animate-in shake duration-500">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 uppercase italic">
                Invalid Link
              </h2>
              <p className="text-gray-500">
                This magic link has expired or has already been used.
              </p>
            </div>
            <button
              onClick={() => router.push(`/portal/${slug}`)}
              className="mt-4 px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-lg shadow-red-200"
            >
              Request New Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
