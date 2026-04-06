"use client";

import api from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function SetupPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Success animation-ku
  const searchParams = useSearchParams();
  const [logoutFinished, setLogoutFinished] = useState(false); // To trigger fast completion
  const router = useRouter();

  const token = searchParams.get("token");
  const emailParam = searchParams.get("email"); // URL-la irunthu email edukkuroam

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const isMismatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  // --- 1. Browser Reload Warning ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue =
        "Changes you made may not be saved. Are you sure you want to leave?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // --- 1. LOGOUT MUTATION (With Dynamic Speed Control) ---
  const { mutate: handleLogout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      return api.post("/logout");
    },
    onSuccess: () => {
      setLogoutFinished(true); // Response vanthathum progress speed-aagum
      setTimeout(() => {
        router.push("/login");
      }, 1500); // Progress bar full-aagura time kudunga
    },
    onError: () => {
      setLogoutFinished(true);
      setTimeout(() => router.push("/login"), 800);
    },
  });

  // --- 1. GET: TOKEN VALIDATION (TanStack Query) ---
  const {
    data: verifyData,
    isLoading: isVerifying,
    isError,
  } = useQuery({
    queryKey: ["verify-token", token],
    queryFn: async () => {
      const response = await api.get(
        `/settings/employee-administration/verify-employee?token=${token}`,
      );
      return response.data;
    },
    enabled: !!token, // Token irundha mattume call aagum
    retry: false,
  });

  // --- 2. POST: ACTIVATION (TanStack Mutation) ---
  const { mutate: activateAccount, isPending: isActivating } = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post(
        "/settings/employee-administration/verify-employee",
        payload,
      );
      return response.data;
    },
    onSuccess: (data) => {
      // 1. First state-ah mathunuvom (UI switch aagum)
      setIsSuccess(true);
      // 2. Direct-aa ingaye logout call panniduvom
      handleLogout();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Activation failed");
    },
  });

  // INITIAL LOAD CHECK: Link-ai click panna udanae password irundha mattum ithu run aaganum

  useEffect(() => {
    // isActivating false-aa irundha mattum thaan ithu run aaganum (To avoid double call)
    if (verifyData?.hasPassword && !isActivating && !isSuccess) {
      setIsSuccess(true);
      handleLogout();
    }
  }, [verifyData, handleLogout, isActivating, isSuccess]);

  // --- Validation Logic ---
  const isFormValid =
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return toast.error("Invalid Credentials");

    activateAccount({
      token,
      password: formData.password,
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-100"
            >
              <CheckCircle2 className="text-white size-10" />
            </motion.div>

            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
              Verified!
            </h2>

            <p className="text-slate-500 text-lg leading-relaxed">
              Your account is now active. <br />
              <span className="text-slate-400 text-sm font-medium">
                {logoutFinished
                  ? "Redirecting to login..."
                  : "Securing your session..."}
              </span>
            </p>

            {/* --- DYNAMIC PROGRESS BAR --- */}
            <div className="mt-10 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                // Logout pending-la irukkum pothu 90% varaikum slow-aa pogum
                // Response vanthathum (logoutFinished) 100% full-aa fast-aa complete aagum
                animate={{ width: logoutFinished ? "100%" : "90%" }}
                transition={{
                  duration: logoutFinished ? 0.5 : 8, // Logout wait panna 8s (slow), mudinthaal 0.5s (fast)
                  ease: logoutFinished ? "easeOut" : "linear",
                }}
                className="bg-green-500 h-full"
              />
            </div>

            <motion.div className="mt-8 flex justify-center items-center gap-2 text-slate-400 text-xs uppercase tracking-[0.2em] font-bold">
              <Loader2
                className={`size-3 ${!logoutFinished ? "animate-spin" : "hidden"}`}
              />
              {logoutFinished ? "Success" : "Logging Out"}
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 1. Loading State
  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600 size-10" />
        <p className="text-slate-500 font-medium">Verifying your link...</p>
      </div>
    );
  }

  // 2. Error State (Invalid/Expired Token)
  if (isError || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] p-6">
        <div className="max-w-lg w-full bg-white rounded-xl p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
          {/* Top subtle accent line for enterprise feel */}
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>

          <div className="flex flex-col items-center">
            <div className="bg-red-50 p-4 rounded-full mb-6">
              <AlertCircle className="text-red-600 size-10 stroke-[1.5]" />
            </div>

            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Invalid or Expired Link
            </h2>

            <div className="w-12 h-1 bg-red-100 my-4 rounded-full"></div>

            <p className="text-slate-600 leading-relaxed text-[15px] max-w-sm mx-auto">
              This security link has expired or has already been used. For
              security reasons, verification links are time-sensitive.
            </p>

            <div className="mt-8 pt-6 border-t border-slate-50 w-full">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-6">
                Need assistance? Contact IT Support
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all font-medium py-6"
                >
                  Go Back Home
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-all font-medium py-6 shadow-sm shadow-red-200"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 ">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-blue-600 size-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Setup Password
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Almost there! Create your secure password below.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">
              Employee Email
            </label>
            <Input
              value={verifyData?.email || emailParam}
              readOnly
              className="bg-slate-50 border-gray-200 mt-2 focus-visible:ring-blue-500/20 h-12 rounded-xl  text-slate-500 cursor-not-allowed"
            />
          </div>
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700 ml-1">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                // placeholder="New Password"
                required
                className="py-6 px-4 rounded-xl mt-2 border-gray-200 focus-visible:ring-blue-500/20"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              {formData.password.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              )}
              {formData.password && formData.password.length < 8 && (
                <p className="text-[11px] text-red-500 ml-1 italic">
                  * Password must be 8+ characters
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700 ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                // Error irundha border-a red-ah maathum
                className={`py-6 px-4 rounded-xl  mt-2 transition-all border-gray-200 focus-visible:ring-blue-500/20 ${
                  isMismatch
                    ? " border-red-500 focus-visible:ring-red-500/20 focus:border-red-500"
                    : ""
                }`}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />

              {formData.confirmPassword.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              )}
            </div>

            {/* Instant Error Message with Animation */}
            <AnimatePresence>
              {isMismatch && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-[12px] text-red-500 ml-1 font-medium flex items-center gap-1"
                >
                  <AlertCircle size={12} />
                  Passwords do not match
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <Button
            type="submit"
            // disabled={!isFormValid || isPending}
            className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isActivating ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <Lock className="mr-2" size={18} />
            )}
            Activate Account
          </Button>
        </form>
      </div>
    </div>
  );
}
