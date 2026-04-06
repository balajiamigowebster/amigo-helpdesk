"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import api from "@/lib/axios";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react"; // Eye icons import panniyachu

// Shadcn OTP Components
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { setCredentials } from "@/redux/authSlices/authSlice";

const SignupPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // --- States ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Eye toggle state

  const [resendTimer, setResendTimer] = useState(0); // Timer state in seconds

  // --- Resend OTP Timer Logic ---
  useEffect(() => {
    let interval = null;
    if (isOtpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, resendTimer]);

  // --- Form Validations ---
  const isFormValid =
    formData.email && formData.password.length >= 8 && formData.firstName;
  const isOtpValid = otp.length === 6;

  // --- Mutation 1: Register (Send OTP) ---
  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const { data } = await api.post("/register", userData);
      return data;
    },
    onSuccess: () => {
      setIsOtpSent(true);
      setResendTimer(60); // OTP anupuna udane timer-ah 60s (1 min) set pandrom
      setError("");
    },
    onError: (err) =>
      setError(err.response?.data?.error || "Registration failed"),
  });

  // --- Mutation 2: Verify OTP ---
  const verifyMutation = useMutation({
    mutationFn: async (otpData) => {
      const { data } = await api.post("/verify-otp", otpData);
      return data;
    },
    onSuccess: (data) => {
      dispatch(setCredentials(data.user)); // Redux Persist automatic-ah save pannidum
      router.push("/setup-organization");
    },
    onError: (err) => setError(err.response?.data?.error || "Invalid OTP"),
  });

  // --- Handlers ---
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  // handleVerifySubmit function-ah ippadi mathunga
  const handleVerifySubmit = (e) => {
    // Check if 'e' is a real event object (from Button click)
    // event objects-la 'preventDefault' nu function irukkum
    if (e && typeof e === "object" && e.preventDefault) {
      e.preventDefault();
    }

    // mutation trigger aagum
    verifyMutation.mutate({ email: formData.email, otp });
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      setOtp(""); // Clear previous OTP
      setError("");
      registerMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-12 font-sans">
      {/* --- TOP CORNER LOGO --- */}
      {/* <div className="absolute top-8 left-8 flex items-center gap-2">
        <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" />
      </div> */}

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300">
        <div className="flex justify-center">
          {/* --- LOGO SECTION --- */}
          {/* <div className="flex flex-col items-center justify-center mb-6">
            <div className=" p-3 rounded-2xl mb-3">
              
              <img
                src="/logo.png"
                alt="Logo"
                className="w-14 h-14 object-contain"
              />
            </div>
          </div> */}
          {/* Header Section */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isOtpSent ? "Check your inbox" : "Create an account"}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {isOtpSent
                ? `We've sent a 6-digit code to ${formData.email}`
                : "Start managing your helpdesk effortlessly"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium animate-in fade-in duration-300">
            {error}
          </div>
        )}

        {!isOtpSent ? (
          /* --- SIGNUP FORM --- */
          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium  text-gray-700 ml-1">
                  First Name
                </label>
                <Input
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="py-6 px-4 rounded-xl mt-2 focus-visible:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium  text-gray-700 ml-1">
                  Last Name
                </label>
                <Input
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="py-6 px-4 rounded-xl mt-2 focus-visible:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium  text-gray-700 ml-1">
                Email
              </label>
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="py-6 px-4 rounded-xl mt-2 focus-visible:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium  text-gray-700 ml-1">
                Password
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="py-6 px-4  mt-2 rounded-xl focus-visible:ring-blue-500/20"
              />
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || registerMutation.isPending}
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold shadow-lg shadow-blue-500/10 transition-all"
            >
              {registerMutation.isPending ? (
                <AiOutlineLoading3Quarters className="animate-spin text-xl" />
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        ) : (
          /* --- SHADCN OTP FORM --- */
          <div className="flex flex-col items-center space-y-8 animate-in slide-in-from-right-4 duration-500">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              onComplete={handleVerifySubmit} // 6 digits type panna udane automatic-ah verify call pogum
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                  index={0}
                  className="w-12 h-14 text-xl rounded-lg border-gray-300"
                />
                <InputOTPSlot
                  index={1}
                  className="w-12 h-14 text-xl rounded-lg border-gray-300"
                />
                <InputOTPSlot
                  index={2}
                  className="w-12 h-14 text-xl rounded-lg border-gray-300"
                />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                  index={3}
                  className="w-12 h-14 text-xl rounded-lg border-gray-300"
                />
                <InputOTPSlot
                  index={4}
                  className="w-12 h-14 text-xl rounded-lg border-gray-300"
                />
                <InputOTPSlot
                  index={5}
                  className="w-12 h-14 text-xl rounded-lg border-gray-300"
                />
              </InputOTPGroup>
            </InputOTP>

            <div className="w-full space-y-4">
              <Button
                onClick={handleVerifySubmit}
                disabled={!isOtpValid || verifyMutation.isPending}
                className="w-full py-6 bg-neutral-900 hover:bg-neutral-800 cursor-pointer rounded-xl font-semibold"
              >
                {verifyMutation.isPending ? (
                  <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                ) : (
                  "Verify and Continue"
                )}
              </Button>

              <div className=" text-center flex items-center justify-center gap-2">
                {registerMutation.isPending && isOtpSent && (
                  <AiOutlineLoading3Quarters className="animate-spin text-blue-600 text-xs" />
                )}
                <button
                  type="button"
                  disabled={resendTimer > 0 || registerMutation.isPending}
                  onClick={handleResendOtp}
                  className="text-sm font-medium cursor-pointer text-neutral-900 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {resendTimer > 0
                    ? `Resend code in ${resendTimer}s`
                    : "Didn't receive a code? Resend"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <p className="text-sm text-gray-500">
            {isOtpSent ? (
              <button
                onClick={() => {
                  setIsOtpSent(false);
                  setOtp("");
                }}
                className="text-blue-600 font-semibold hover:underline transition-all"
              >
                ← Use a different email
              </button>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
