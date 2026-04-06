"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Dashboard redirect panna
import { FcGoogle } from "react-icons/fc";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Spinner icon
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import api from "@/api";
import { toast } from "sonner";
import { setCredentials } from "@/redux/authSlices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Eye, EyeOff } from "lucide-react"; // Eye icons import panniyachu

const LoginForm = ({ onForgotClick }) => {
  const router = useRouter();

  // States for inputs and loading
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Eye toggle state
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  // 1. Redux-la irunthu user details-ai edukkirom
  const { user } = useSelector((state) => state.auth);

  // Email Regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  const isPasswordValid = password.length >= 8;

  // Form valid-ah nu check panna (Button enable/disable-kaga)
  const isFormValid = isEmailValid && isPasswordValid;

  // useEffect(() => {
  //   // User login aagi irunthaal, avargalai login page-la irukka vida koodathu
  //   if (user) {
  //     if (user.isSetupCompleted) {
  //       router.replace("/dashboard");
  //     } else {
  //       router.replace("/setup-organization");
  //     }
  //   }
  // }, [user, router]);

  // --- TANSTACK MUTATION ---
  const { mutate: login, isPending } = useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post("/login", credentials);
      // console.log(response.data);

      return response.data;
    },
    // onSuccess: (data) => {
    //   setError("");
    //   // 1. Redux Store-ai update pannugirom
    //   dispatch(setCredentials(data.user));

    //   const step = Number(data.user.setupStep); // Number-ah mathidunga

    //   if (data.user.isSetupCompleted) {
    //     toast.info("Welcome to Dashboard!");
    //     router.push("/dashboard");
    //   } else if (step === 2) {
    //     // Organization setup mudikalana antha page-ku anuppuvom
    //     toast.info("Please complete your organization setup.");
    //     router.push("/setup-organization");
    //   } else {
    //     // Step 3 or higher mela irunthaal success!
    //     router.push("/setup-organization");
    //   }
    //   // router.push("/dashboard");
    // },

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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 ml-1">
          Email address
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          className=" px-4 rounded-xl border-gray-200 mt-2 focus-visible:ring-blue-500/20"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 ml-1">
          Password
        </label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className=" px-4 rounded-xl mt-2 border-gray-200 focus-visible:ring-blue-500/20"
          />
          {password.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[60%] cursor-pointer-translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
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
      </div>
      <div className="flex justify-between items-center ml-1">
        <button
          type="button"
          onClick={onForgotClick}
          className="text-xs text-blue-600 font-semibold cursor-pointer italic underline"
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        disabled={!isFormValid || isPending}
        className="w-full py-6 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
      >
        {isPending ? (
          <AiOutlineLoading3Quarters className="animate-spin text-xl" />
        ) : (
          "Continue"
        )}
      </Button>
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

// --- 3. MAIN LOGIN PAGE ---
const LoginPage = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Toggle state

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* --- LEFT SIDE: ADVERTISEMENT (LAY'S STYLE) --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center p-12">
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
          <img
            src="/ads/lays.jpg"
            alt="Crisp Experience"
            className="w-full h-auto rounded-3xl shadow-2xl mb-10 transform -rotate-3 hover:rotate-0 transition-transform duration-700 ease-out"
          />
          <div className="space-y-4">
            <p className="text-blue-100 text-xl font-medium px-6 italic">
              Experience the{" "}
              <span className="font-bold text-white">"Crisp & Crunchy"</span>{" "}
              way of managing your helpdesk.
            </p>
            <div className="inline-block bg-yellow-400 text-blue-900 font-black px-4 py-1 rounded-full text-sm uppercase tracking-widest mt-4">
              100% Fresh Inside
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50/50 relative">
        {/* Logo Positioned Like Signup */}
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
              {isForgotPassword ? "Reset Password" : "Welcome Back"}
            </h2>
            <p className="text-sm text-gray-500 mt-3">
              {isForgotPassword
                ? "Enter your email for the link"
                : "Sign in to manage your tickets"}
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
  );
};

export default LoginPage;
