"use client";

import React, { useEffect } from "react";
import Sidebar from "./DashboardComponents/Sidebar";
import DashboardNavbar from "./DashboardComponents/DashboardNavbar";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/api";

const Layout = ({ children }) => {
  // API Call function
  const fetchUser = async () => {
    const { data } = await api.get("/me");
    console.log(data);
    return data;
  };

  const router = useRouter();

  const {
    data: response,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: fetchUser,
    retry: false, // User illana thirumba thirumba check panna vendaam, straight-ah error trigger pannu
    refetchOnWindowFocus: true, // Browser tab switch pannaalum check pannum (Security-ku nallathu)
    staleTime: 1000 * 60 * 5, // 5 mins data-vai fresh-ah vechukkum
  });

  // Error handle panni redirect pannuvom
  useEffect(() => {
    if (isError) {
      const handleInvalidSession = async () => {
        try {
          // 1. Backend-la cookie delete panna indha API-ai call panroam
          await api.post("/logout");
        } catch (error) {
          toast.error("Logout failed during session invalidation");
        } finally {
          // 2. Cookie clear aanalum illanalum, user-ai login-ku thalluvom
          toast.error("Session Invalid or Account Deleted");

          // Oru 2 seconds delay kudutha user-al message-ai padikka mudiyum
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      };

      handleInvalidSession();
    }
  }, [isError, router]);

  // Overlay Component: Idhu loading matrum background fetching (validation) pothu kaattum
  const LoadingOverlay = () => (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px] pointer-events-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center border border-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
        <p className="text-gray-700 font-semibold animate-pulse">
          Please wait...
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Verifying your secure session
        </p>
      </div>
    </div>
  );

  // // 1. Initial Loading (First time user kulla varumpothu)
  // if (isLoading) return <LoadingOverlay />;

  // --- NEW: Error Page Component ---
  const ErrorState = () => (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Session Invalid
        </h2>
        <p className="text-gray-600 mb-6">
          Your account might have been removed or your session has expired. You
          are being redirected to the login page.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Go to Login Now
        </button>
      </div>
    </div>
  );
  // 2. Background validation la error vandha content render panna koodathu
  if (isError) return <ErrorState />;

  return (
    <div className="flex h-screen  bg-gray-50">
      {/* Sidebar is fixed on the left */}
      <Sidebar user={response?.user} isUserLoading={isLoading} />

      {/* Main Content Area on the right */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <DashboardNavbar /> */}

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
