"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ResetPasswordPage = () => {
  const [showPass, setShowPass] = useState({
    password: false,
    confirm: false,
  });
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // Success state added
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const token = searchParams.get("token");

  // --- 1. Instant Mismatch Logic ---
  const isMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const isFormValid = password.length >= 8 && password === confirmPassword;

  // --- 2. Browser Reload/Leave Warning ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (password.length > 0) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [password]);

  const {
    data: validation,
    isLoading: isValidating,
    isError,
  } = useQuery({
    queryKey: ["validate-token", token],
    queryFn: async () => {
      const response = await api.get(`/reset-password?token=${token}`);
      return response.data;
    },
    enabled: !!token, // Token iruntha mattum run aagum
    retry: false,
  });

  // --- 2. PASSWORD UPDATE MUTATION ---
  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post("/reset-password", payload);
      return response.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
      // toast.success("Password reset successful! Please login.");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Reset failed.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    resetPassword({ token, password });
  };

  // --- SUCCESS UI STATE ---
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-50 rounded-full blur-3xl opacity-50" />
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
              className="bg-green-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-100"
            >
              <CheckCircle2 className="text-white size-10" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-black text-slate-900 tracking-tight mb-3"
            >
              Updated!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-slate-500 text-lg leading-relaxed"
            >
              Your password has been reset. <br />
              <span className="text-slate-400 text-sm font-medium">
                Redirecting to login...
              </span>
            </motion.p>
            <div className="mt-10 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="bg-green-500 h-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- UI STATES ---
  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600 size-10" />
        <p className="text-slate-500 font-medium">Verifying your link...</p>
      </div>
    );
  }

  if (isError || !validation?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900">
            Invalid or Expired Link
          </h2>
          <p className="text-gray-500 mt-2 mb-6">
            This password reset link is no longer valid. Please request a new
            one.
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-600"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
          <p className="text-sm text-gray-500 mt-2">
            Hi {validation?.firstName}, secure your account now.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* New Password Field */}
          <div className="relative space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">
              New Password
            </label>
            <div className="relative mt-2">
              <Input
                type={showPass.password ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-6 px-4 rounded-xl  focus-visible:ring-blue-500/20"
              />
              {password.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowPass((p) => ({ ...p, password: !p.password }))
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass.password ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              )}
            </div>
            {password.length > 0 && password.length < 8 && (
              <p className="text-[11px] text-amber-600 italic ml-1">
                Password must be 8+ characters
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="relative space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">
              Confirm Password
            </label>
            <div className="relative mt-2">
              <Input
                type={showPass.confirm ? "text" : "password"}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`py-6 px-4 rounded-xl focus-visible:ring-blue-500/20 transition-colors ${
                  isMismatch
                    ? "border-red-500 focus-visible:ring-red-500/20"
                    : ""
                }`}
              />
              {confirmPassword.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowPass((p) => ({ ...p, confirm: !p.confirm }))
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass.confirm ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              )}
            </div>

            {/* Framer Motion Mismatch Error */}
            <AnimatePresence>
              {isMismatch && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-[12px] text-red-500 font-medium flex items-center gap-1 ml-1"
                >
                  <AlertCircle size={14} /> Passwords do not match
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isPending}
            className="w-full py-6 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="animate-spin text-xl" />
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
