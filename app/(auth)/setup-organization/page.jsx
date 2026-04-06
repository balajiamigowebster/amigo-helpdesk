"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Check, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import api from "@/api";
import { useDispatch, useSelector } from "react-redux";
import { updateSetupStatus } from "@/redux/authSlices/authSlice";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useRouter } from "next/navigation";
import HelpDeskLoader from "@/Component/HelpDeskLoader";

export default function SetupOrganization() {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    organizationName: "",
    domain: "",
    companyName: "",
    jobTitle: "",
    country: "India",
    username: "spiceuser-fv1p",
  });

  // 1. Redux-la irunthu user status edukkirom
  const { user } = useSelector((state) => state.auth);
  // Redux-la irundhu user data kidaitha udanae idhu false aagidhum.
  const [isPageLoading, setIsPageLoading] = useState(true);

  // useEffect(() => {
  //   // 1. User data load aayiduchaa nu check panrom
  //   if (user !== undefined) {
  //     // 2. Oru vaelai setup munjirundha, udanae dashboard-ku thallanum
  //     if (user?.isSetupCompleted) {
  //       router.replace("/dashboard");
  //     } else {
  //       // Setup mudiyala na mattum thaan form-ah kaattanum
  //       setIsPageLoading(false);
  //     }
  //   }
  // }, [user, router]);

  useEffect(() => {
    // User data load aayiduchaa nu check panrom
    if (user !== undefined && user !== null) {
      // 1. Oru vaelai setup munjirundha, dashboard-ku anuppuvom
      // 2. Or, user employee-ah irundhaalum setup page kedaika koodathu
      if (user?.isSetupCompleted || user?.role !== "ORG_ADMIN") {
        router.replace("/dashboard");
      } else {
        setIsPageLoading(false);
      }
    }
  }, [user, router]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const orgMutation = useMutation({
    mutationFn: async (orgData) => {
      const { data } = await api.post(
        "/organization/create-organization",
        orgData,
      );
      return data;
    },
    onSuccess: (data) => {
      // 1. Auth Slice-la user-oda setup status-ai true nu mathuroam
      dispatch(updateSetupStatus(true));

      // 3. Dashboard-ku move aagurom
      router.push("/dashboard");
    },
    onError: (err) => {
      setError(err.response?.data?.error || "Organization creation failed");
      // Step 1-ke poga vendam, error kaatuna pothum
    },
  });

  const nextStep = () => {
    setError("");
    setCurrentStep((prev) => prev + 1);
  };
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const steps = [1, 2, 3];

  const handleFinalSubmit = () => {
    setError("");
    orgMutation.mutate(form);
  };

  if (isPageLoading) {
    return <HelpDeskLoader />;
  }

  // Blank screen-ai thavirkka, logic check pannum pothu
  // setup mudinjirundha loading-la irukkura mathiriye irukkum, apparam redirect aagidhum.

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* --- INFINITE ANIMATED BACKGROUND --- */}

      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            backgroundColor: ["#eff6ff", "#f5f3ff", "#fdf2f8", "#eff6ff"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-50"
        />

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -120, 0],
            backgroundColor: ["#dbeafe", "#ede9fe", "#fae8ff", "#dbeafe"],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-50"
        />
      </div>

      {/* --- FIXED STEPPER INDICATOR --- */}
      <div className="relative z-20 w-full max-w-sm px-4 mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

          {steps.map((step) => (
            <div
              key={step}
              className="relative z-10 flex flex-col items-center"
            >
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: currentStep >= step ? "#2563eb" : "#ffffff",
                  borderColor: currentStep >= step ? "#2563eb" : "#e2e8f0",
                  scale: currentStep === step ? 1.2 : 1,
                }}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                  currentStep >= step
                    ? "text-white shadow-blue-500/20"
                    : "text-slate-400"
                }`}
              >
                {currentStep > step ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  step
                )}
              </motion.div>
              <motion.span
                animate={{ color: currentStep >= step ? "#1e293b" : "#94a3b8" }}
                className="absolute -bottom-6 text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap"
              >
                Step {step}
              </motion.span>
            </div>
          ))}
        </div>
      </div>

      {/* --- FORM CARD --- */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl mx-4 bg-white/90 backdrop-blur-2xl border border-white/40 p-8 md:p-12 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="min-h-75 flex flex-col justify-center"
          >
            {/* STEP 1: ORGANIZATION */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-[10px] font-black mb-4 uppercase tracking-[0.2em]">
                    <Sparkles size={12} /> New Account
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 leading-none">
                    Organization
                  </h1>
                  <p className="text-slate-500 mt-3 text-sm">
                    Tell us about your workplace environment.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-slate-600 uppercase ml-1">
                      Org Name
                    </Label>
                    <Input
                      value={form.organizationName}
                      onChange={(e) =>
                        handleChange("organizationName", e.target.value)
                      }
                      placeholder="e.g. Acme Corp"
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-slate-600 uppercase ml-1">
                      Domain URL
                    </Label>
                    <div className="relative">
                      <Input
                        value={form.domain}
                        onChange={(e) => handleChange("domain", e.target.value)}
                        placeholder="your-workspace"
                        className="h-14 rounded-2xl pr-36 border-slate-100 bg-slate-50/50"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-slate-400">
                        .helpdesk.com
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={nextStep}
                  disabled={!form.organizationName || !form.domain}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-md shadow-xl shadow-blue-500/25 transition-all"
                >
                  Continue
                </Button>
              </div>
            )}

            {/* STEP 2: PROFILE DETAILS (UPDATED) */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h1 className="text-3xl font-black text-slate-900 leading-none">
                    Your Profile
                  </h1>
                  <p className="text-slate-500 mt-3 text-sm">
                    Set up your admin credentials.
                  </p>
                </div>

                {/* <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-slate-600 uppercase ml-1">
                      First Name
                    </Label>
                    <Input
                      value={form.firstName}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-slate-600 uppercase ml-1">
                      Last Name
                    </Label>
                    <Input
                      value={form.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50/50"
                    />
                  </div>
                </div> */}

                {/* Job Title Select Field */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold text-slate-600 uppercase ml-1">
                    Job Title (Required)
                  </Label>
                  <Select
                    value={form.jobTitle}
                    onValueChange={(v) => handleChange("jobTitle", v)}
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50">
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it-admin">IT Administrator</SelectItem>
                      <SelectItem value="it-manager">IT Manager</SelectItem>
                      <SelectItem value="developer">Lead Developer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Country Select Field */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold text-slate-600 uppercase ml-1">
                    Country (Required)
                  </Label>
                  <Select
                    value={form.country}
                    onValueChange={(v) => handleChange("country", v)}
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50">
                      <SelectValue placeholder="India" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="United States">
                        United States
                      </SelectItem>
                      <SelectItem value="United Kingdom">
                        United Kingdom
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Community Username with Instructions */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold text-slate-600 uppercase ml-1">
                    Community Username
                  </Label>
                  <Input
                    value={form.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50"
                  />
                  <div className="mt-2 p-4 bg-slate-50/80 border border-slate-100 rounded-2xl text-[12px] text-slate-600">
                    <p className="font-bold mb-1">Your username must:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>be between 6-25 characters,</li>
                      <li>start and end with a letter or a number.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button
                    variant="ghost"
                    onClick={prevStep}
                    className="h-14 rounded-2xl font-bold px-8"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={!form.jobTitle || !form.country || !form.username}
                    className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: FINISH */}
            {currentStep === 3 && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-2 rotate-3">
                  <Check size={32} strokeWidth={3} />
                </div>
                <h1 className="text-3xl font-black text-slate-900">
                  Finish Up
                </h1>
                <p className="text-slate-500 text-sm">
                  Everything looks perfect!
                </p>

                <div className="bg-blue-50/50 border border-blue-100/50 rounded-[2rem] p-6 text-left space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">
                      Org:
                    </span>
                    <span className="font-bold text-slate-700">
                      {form.organizationName}
                    </span>
                  </div>
                  {/* <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">
                      Admin:
                    </span>
                    <span className="font-bold text-slate-700">
                      {form.firstName} {form.lastName}
                    </span>
                  </div> */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">
                      Username:
                    </span>
                    <span className="font-bold text-slate-700">
                      {form.username}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="ghost"
                    onClick={prevStep}
                    className="h-14 rounded-2xl font-bold"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={handleFinalSubmit}
                    className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-xl shadow-green-500/20"
                  >
                    {orgMutation.isPending ? (
                      <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                    ) : (
                      "Finish"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
