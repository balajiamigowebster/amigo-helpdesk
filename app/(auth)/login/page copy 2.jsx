"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import api from "@/api";
import { toast } from "sonner";
import { setCredentials } from "@/redux/authSlices/authSlice";
import { useDispatch } from "react-redux";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

// --- LOGIN FORM COMPONENT ---
const LoginForm = ({ onForgotClick }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Email Regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  const isPasswordValid = password.length >= 8;

  // Form valid-ah nu check panna (Button enable/disable-kaga)
  const isFormValid = isEmailValid && isPasswordValid;

  const { mutate: login, isPending } = useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post("/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setError("");
      // 1. Redux Store-ai update pannugirom
      dispatch(setCredentials(data.user));

      const { role, isSetupCompleted } = data.user;

      // 2. Logic: Employee vs Admin

      // A. Employee-ah irundha direct Dashboard (Avangaluku setup page kedaikaathu)
      if (role === "ORG_TECH") {
        // Unga employee roles ennavo adhai inga podunga
        toast.info("Welcome back!");
        router.push("/dashboard");
        return;
      }

      // B. Org Admin-ah irundha setup status check pannuvom
      if (isSetupCompleted) {
        toast.info("Welcome to Dashboard!");
        router.push("/dashboard");
      } else {
        // Setup mudikalana kandippa setup page
        toast.info("Please complete your organization setup.");
        router.push("/setup-organization");
      }
    },
    onError: (error) => {
      const errorMsg =
        error.response?.data?.error || "Invalid email or password!";
      toast.error(errorMsg);
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      login({ email, password });
    }
  };

  return (
    <form className="space-y-4 w-full max-w-sm" onSubmit={handleSubmit}>
      <div className="flex items-center gap-2">
        <label className="text-sm font-bold text-gray-700 min-w-25">
          Email address
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="py-4 px-4 rounded-md border-gray-200 mt-2 focus-visible:ring-blue-500/20"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-bold text-gray-700 min-w-25">
          Password
        </label>
        <div className="relative w-full">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="py-4 px-4 rounded-md border-gray-200 mt-2 focus-visible:ring-blue-500/20"
          />
          {password.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-[40%] text-gray-400"
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          )}
        </div>
      </div>
      {/* Password Hint */}
      <p
        className={`text-[11px] ml-1 ${
          password.length > 0 && !isPasswordValid
            ? "text-red-500"
            : "text-gray-400"
        }`}
      >
        * Password must be at least 8 characters.
      </p>

      <div className="text-right">
        <button
          type="button"
          onClick={onForgotClick}
          className="text-sm text-gray-800 hover:underline"
        >
          Forget password?
        </button>
      </div>

      <Button
        type="submit"
        disabled={!isFormValid || isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md mt-4"
      >
        {isPending ? (
          <AiOutlineLoading3Quarters className="animate-spin" />
        ) : (
          "Login"
        )}
      </Button>

      {/* <p className="text-center text-xs text-red-600 font-bold mt-2">
        (admin portal)
      </p> */}
    </form>
  );
};

// --- 2. FORGOT PASSWORD FORM COMPONENT ---
const ForgotPasswordForm = ({ onBackClick }) => {
  const [email, setEmail] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  // --- API CALL LOGIC ---
  const { mutate: sendLink, isPending } = useMutation({
    mutationFn: async (emailData) => {
      // Inga unga backend forgot-password API route path-ai check pannikonga
      const response = await api.post("/forgot-password", emailData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Reset link sent to your email!");
      onBackClick(); // Reset link anupunathum login screen-ku kootitu poiduvom
    },
    onError: (error) => {
      // Backend-la irunthu vara exact error message-ai toast-la kaatuvom
      const errorMsg = error.response?.data?.message || "Something went wrong!";
      toast.error(errorMsg);
    },
  });

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (isEmailValid) {
      sendLink({ email });
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleForgotSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 ml-1">
          Registered Email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          className="py-6 px-4 rounded-xl border-gray-200 mt-2 focus-visible:ring-blue-500/20"
        />
      </div>
      <Button
        type="submit"
        disabled={!isEmailValid || isPending}
        className="w-full py-6 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/20"
      >
        {isPending ? (
          <AiOutlineLoading3Quarters className="animate-spin text-xl" />
        ) : (
          "Send Reset Link"
        )}
      </Button>
    </form>
  );
};

// --- MAIN LOGIN PAGE ---
const LoginPage = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start p-4 w-full">
        {/* HelpDeskTech Logo */}
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="Logo" className="w-36 h-auto" />
          {/* <h1 className="text-blue-700 font-bold text-xl leading-none">
            HelpDeskTech
          </h1> */}
        </div>

        {/* GIBS Advertisement (Top Right) */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-400 mb-1">ADVERTISEMENT</span>
          <img
            src="https://gibs.edu.in/wp-content/uploads/2025/10/522-Beyond-CAT-XAT-Other-Top-MBA-Entrance-Exams-for-GIBS-2026.png"
            alt="GIBS Ad"
            className="w-48 h-auto border rounded-sm shadow-lg"
          />
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col lg:flex-row items-center px-4 lg:px-12 gap-2">
        {/* LEFT SIDE: BIG IMAGE (GoDaddy Style) */}

        <div className="lg:w-3/5 w-full">
          <div className="relative">
            <img
              src="https://img1.wsimg.com/cdn/Image/All/All/1/All/f6e48ede-79b6-4d78-aa96-a96be2d5716b/og-web-hosting.jpg"
              alt="Welcome Banner"
              className="w-full h-auto rounded-sm shadow-lg"
            />
            <div className="absolute -top-10 left-10 -translate-y-1/2">
              <h2 className="text-4xl font-light text-gray-800">
                Welcome to <span className="font-bold">HELPDESKTECH</span>
              </h2>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: LOGIN FORM & MAGGI AD */}
        <div className="lg:w-2/5 w-full flex flex-col items-center justify-between h-full py-5">
          {/* Form */}
          <div className="">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {isForgotPassword && "Reset Password"}
              </h2>
              <p className="text-sm text-gray-500 mt-3">
                {isForgotPassword && "Enter your email for the link"}
              </p>
            </div>

            {isForgotPassword ? (
              <ForgotPasswordForm
                onBackClick={() => setIsForgotPassword(false)}
              />
            ) : (
              <LoginForm onForgotClick={() => setIsForgotPassword(true)} />
            )}

            <div className="mt-8 text-center border-t border-gray-100 pt-6">
              {isForgotPassword ? (
                <button
                  onClick={() => setIsForgotPassword(false)}
                  className="flex items-center justify-center gap-2 w-full text-sm text-gray-500 hover:text-blue-600 font-bold transition-all"
                >
                  <ArrowLeft size={16} /> Back to login
                </button>
              ) : (
                <p className="text-sm text-gray-500 font-medium">
                  New here?{" "}
                  <Link
                    href="/signUp"
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Maggi Advertisement (Bottom Right) */}
      <div className="max-w-6xl">
        <div className=" flex flex-col   items-end">
          <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
            Advertisement
          </span>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgaQZ9Tk-yHAmfTLJvbn0IbITg6hD0QSh1XA&s"
            alt="Maggi Ad"
            className="w-72 h-auto rounded-md shadow-md border"
          />
        </div>
      </div>

      {/* FOOTER AREA (Optional grid lines or spacing) */}
      <div className="h-10 bg-gray-50/50 w-full border-t border-gray-100 mt-auto"></div>
    </div>
  );
};

export default LoginPage;
