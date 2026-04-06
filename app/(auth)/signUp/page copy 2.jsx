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
import { Eye, EyeOff } from "lucide-react";
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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isOtpSent && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, resendTimer]);

  const isFormValid =
    formData.email && formData.password.length >= 8 && formData.firstName;
  const isOtpValid = otp.length === 6;

  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const { data } = await api.post("/register", userData);
      return data;
    },
    onSuccess: () => {
      setIsOtpSent(true);
      setResendTimer(60);
      setError("");
    },
    onError: (err) =>
      setError(err.response?.data?.error || "Registration failed"),
  });

  const verifyMutation = useMutation({
    mutationFn: async (otpData) => {
      const { data } = await api.post("/verify-otp", otpData);
      return data;
    },
    onSuccess: (data) => {
      dispatch(setCredentials(data.user));
      router.push("/setup-organization");
    },
    onError: (err) => setError(err.response?.data?.error || "Invalid OTP"),
  });

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleVerifySubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    verifyMutation.mutate({ email: formData.email, otp });
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      setOtp("");
      setError("");
      registerMutation.mutate(formData);
    }
  };

  return (
    // Main Container - Flex Row use pannirukaen
    <div className="min-h-screen flex bg-white font-sans">
      {/* --- LEFT SIDE: ADVERTISEMENT/IMAGE SECTION --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center p-12">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        <div className="relative z-10 text-white max-w-lg text-center">
          {/* Lays chips packet mathiri oru crisp image or product mockup */}
          <img
            src="/ads/lays.jpg" // Inga unga ad image path
            alt="Crisp Helpdesk Experience"
            className="w-full h-auto rounded-3xl shadow-2xl mb-10 transform -rotate-3 hover:rotate-0 transition-transform duration-700 ease-out"
          />

          <div className="space-y-4">
            {/* <h1 className="text-5xl font-black mb-4 tracking-tighter leading-tight">
              No one can handle <br />
              <span className="text-yellow-400 italic underline decoration-wavy">
                just one
              </span>{" "}
              ticket!
            </h1> */}

            <p className="text-blue-100 text-xl font-medium px-6">
              Experience the{" "}
              <span className="font-bold text-white">"Crisp & Crunchy"</span>{" "}
              way of managing your helpdesk. So fast, so light, you'll keep
              coming back for more.
            </p>

            {/* Optional: Lay's style flavor badge mathiri oru element */}
            <div className="inline-block bg-yellow-400 text-blue-900 font-black px-4 py-1 rounded-full text-sm uppercase tracking-widest mt-4">
              100% Fresh Inside
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: SIGNUP FORM SECTION --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50/50 relative">
        {/* Absolute Logo on Mobile/Desktop */}
        <div className="absolute -top-2 left-8 lg:-left-4">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-32 h-32 object-contain"
          />
        </div>

        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {isOtpSent ? "Check your inbox" : "Get Started"}
            </h2>
            <p className="text-sm text-gray-500 mt-3">
              {isOtpSent
                ? `Enter the code sent to ${formData.email}`
                : "Create an account to start your journey"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          {!isOtpSent ? (
            <form className="space-y-4" onSubmit={handleRegisterSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 ml-1">
                    First Name
                  </label>
                  <Input
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="py-6 rounded-xl focus-visible:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 ml-1">
                    Last Name
                  </label>
                  <Input
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="py-6 rounded-xl focus-visible:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 ml-1">
                  Email address
                </label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="py-6 rounded-xl focus-visible:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="py-6 rounded-xl focus-visible:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!isFormValid || registerMutation.isPending}
                className="w-full py-7 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                {registerMutation.isPending ? (
                  <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          ) : (
            /* OTP Section remains same, but styled for this container */
            <div className="flex flex-col items-center space-y-8 animate-in slide-in-from-right-4">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                onComplete={handleVerifySubmit}
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2].map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="w-12 h-14 text-xl rounded-xl border-gray-200"
                    />
                  ))}
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup className="gap-2">
                  {[3, 4, 5].map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="w-12 h-14 text-xl rounded-xl border-gray-200"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <Button
                onClick={handleVerifySubmit}
                disabled={!isOtpValid || verifyMutation.isPending}
                className="w-full py-6 bg-neutral-900 rounded-xl"
              >
                {verifyMutation.isPending ? (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                ) : (
                  "Verify and Continue"
                )}
              </Button>

              <button
                disabled={resendTimer > 0}
                onClick={handleResendOtp}
                className="text-sm font-semibold text-gray-600 disabled:opacity-50"
              >
                {resendTimer > 0
                  ? `Resend in ${resendTimer}s`
                  : "Didn't get the code? Resend"}
              </button>
            </div>
          )}

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500 font-medium">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 font-bold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
