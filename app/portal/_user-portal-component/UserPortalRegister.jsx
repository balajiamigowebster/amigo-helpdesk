"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  MailCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import api from "@/api";
import { toast } from "sonner";
import Loading from "../[slug]/loading";

export default function UserPortalRegister({ org, portalData, themeConfig }) {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  // --- EMAIL VALIDATION REGEX ---
  // Intha regex email format-ai (e.g., name@domain.com) check pannum
  const isValidEmail = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);

  // --- TANSTACK MUTATION: Login logic ---
  const loginMutation = useMutation({
    mutationFn: async (loginData) => {
      const response = await api.post(`/portal/login`, loginData);
      return response.data;
    },
    onSuccess: () => {
      setIsSent(true);
      toast.success("User Verification Email Sent to Successfully");
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.error || "Failed to send login link";
      toast.error(errorMsg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail) return toast.error("Please enter a valid email address");

    loginMutation.mutate({
      email: email.toLowerCase().trim(),
      orgId: org.id,
      slug: org.slug,
    });
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <MailCheck className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">
            Check Your Inbox
          </h2>
          <p className="text-gray-500 leading-relaxed">
            We've sent a secure login link to{" "}
            <span className="font-bold text-gray-800">{email}</span>. The link
            will expire in 15 minutes.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setIsSent(false);
              setEmail("");
            }}
            className="mt-4 border-2 font-bold"
          >
            Try another email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-hidden">
      {/* --- HEADER SECTION --- */}
      <div className="flex justify-between items-start p-4 w-full">
        {/* HelpDeskTech Logo */}
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="Logo" className="w-36 h-auto" />
        </div>

        {/* GIBS Advertisement (Top Right) */}
        <div className="flex  items-center gap-3 px-4 py-2 ">
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-gray-800  tracking-tighter">
              {org.name}
            </h2>
          </div>
          {portalData.portalImageUrl ? (
            <img
              src={portalData.portalImageUrl}
              alt={`${org.name} Logo`}
              className="w-20 h-20 object-cover rounded-full"
            />
          ) : (
            // First letter-ai mattum eduthu kaatum (Example: Google -> G)
            <div
              className={`w-10 h-10 rounded-md flex items-center justify-center text-white font-black text-xl shadow-sm ${themeConfig.avatar || "bg-blue-600"}`}
            >
              {org.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <div className="text-center pb-5">
        <h1 className="text-3xl lg:text-5xl font-light text-gray-800 tracking-tight">
          {portalData.loginWelcomeMessage || "Welcome to"}{" "}
          {/* <span className="font-bold uppercase">
                  {org?.name || "HELPDESKTECH"}
                </span> */}
        </h1>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex flex-1 flex-col lg:flex-row items-center px-4 lg:px-12 gap-8">
        {/* LEFT SIDE: DYNAMIC BANNER (GoDaddy Style) */}
        <div className="lg:w-3/5 w-full">
          <div className="relative">
            {/* Portal image dynamic-ah varum, illana default banner */}
            <img
              src={
                portalData?.bannerImage ||
                "https://img1.wsimg.com/cdn/Image/All/All/1/All/f6e48ede-79b6-4d78-aa96-a96be2d5716b/og-web-hosting.jpg"
              }
              alt="Welcome Banner"
              className="w-full h-auto rounded-sm shadow-xl"
            />
          </div>
        </div>

        {/* RIGHT SIDE: REGISTRATION FORM */}
        <div className="lg:w-2/5 w-full flex flex-col items-center justify-center py-5">
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">
                Login
              </h2>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700">
                  Email address
                </label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className={`py-6 px-4 rounded-md border-gray-200 transition-all ${
                    email && !isValidEmail
                      ? "border-red-400 focus-visible:ring-red-100"
                      : "focus-visible:ring-blue-100"
                  }`}
                />
                {email && !isValidEmail && (
                  <span className="text-[10px] text-red-500 font-bold  tracking-wider mt-1">
                    Please enter a valid email format
                  </span>
                )}
              </div>

              <Button
                type="submit"
                disabled={!isValidEmail || loginMutation.isPending}
                className={`w-full py-6 text-white font-bold text-lg rounded-md transition-all active:scale-95 shadow-lg ${
                  !isValidEmail
                    ? "opacity-50 grayscale cursor-not-allowed"
                    : "shadow-blue-500/20"
                } ${themeConfig.button || "bg-blue-600 hover:bg-blue-700"}`}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Continue to portal
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Maggi Advertisement (Bottom Right of Form Area) */}
            <div className="flex flex-col  mt-4">
              <span className="text-[10px] text-gray-400 mb-1 uppercase tracking-widest">
                Advertisement
              </span>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgaQZ9Tk-yHAmfTLJvbn0IbITg6hD0QSh1XA&s"
                alt="Maggi Ad"
                className="w-full h-45 rounded-md shadow-md border border-gray-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      {/* <footer className="mt-auto border-t border-gray-100 bg-gray-50/50 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:row justify-between items-center gap-4 text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center text-[10px] text-white font-bold">
              H
            </div>
            <span className="text-xs font-bold uppercase tracking-tighter text-gray-600">
              HelpDeskTech
            </span>
          </div>
          <p className="text-[11px] font-medium tracking-widest uppercase">
            &copy; {new Date().getFullYear()} {org.name} • Secured Portal
          </p>
        </div>
      </footer> */}
    </div>
  );
}
