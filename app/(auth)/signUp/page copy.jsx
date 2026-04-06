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
          {/* Food Delivery Mockup/Image */}
          <div className="relative inline-block">
            <img
              src="/ads/food.jpg" // Unga food delivery style image
              alt="Hungry for Resolution"
              className="w-full h-80  rounded-[3rem] shadow-2xl mb-10 transform rotate-2 hover:rotate-0 transition-transform duration-700 ease-in-out border-4 border-white/20"
            />
            {/* Floating Badge - "Fast" icon mathiri */}
            <div className="absolute -top-4 -right-4 bg-red-500 text-white font-black px-4 py-4 rounded-full shadow-lg animate-bounce text-xs flex flex-col items-center justify-center border-2 border-white">
              <span>FAST</span>
              <span>DELIVERY</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Main Headline - Food delivery punchline style */}
            {/* <h1 className="text-5xl font-black mb-4 tracking-tighter leading-tight drop-shadow-md">
              Hungry for <br />
              <span className="text-yellow-400 uppercase italic">
                Faster Resolutions?
              </span>
            </h1> */}

            <div className="space-y-3">
              <p className="text-white text-2xl font-bold tracking-tight">
                Food served <span className="text-yellow-400">Hot & Fresh</span>{" "}
                in seconds!
              </p>

              <p className="text-blue-100 text-lg font-medium px-10 leading-relaxed opacity-90">
                Don't let your customers wait. Get the world's tastiest helpdesk
                experience delivered straight to your team.
              </p>
            </div>

            {/* Food Delivery Style Promo Ribbon */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-0.5 w-12 bg-yellow-400/50"></div>
              <div className="bg-white text-blue-900 font-extrabold px-6 py-2 rounded-lg transform -skew-x-12 shadow-md">
                ZERO DELAY GUARANTEED
              </div>
              <div className="h-0.5 w-12 bg-yellow-400/50"></div>
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
                  <label className="text-xs font-bold  text-gray-500 ml-1">
                    First Name
                  </label>
                  <Input
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="py-6 mt-2 rounded-xl focus-visible:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold  text-gray-500 ml-1">
                    Last Name
                  </label>
                  <Input
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="py-6 mt-2 rounded-xl focus-visible:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold  text-gray-500 ml-1">
                  Email address
                </label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="py-6 mt-2 rounded-xl focus-visible:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold  text-gray-500 ml-1">
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
                    className="py-6 mt-2 rounded-xl focus-visible:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[55%] -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
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
