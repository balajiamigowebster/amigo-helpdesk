"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserPortalRegister({ org, portalData, themeConfig }) {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-hidden">
      {/* --- HEADER SECTION --- */}
      <div className="flex justify-between items-start p-4 w-full">
        {/* HelpDeskTech Logo */}
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="Logo" className="w-36 h-auto" />
        </div>

        {/* GIBS Advertisement (Top Right) */}
        <div className="flex flex-col items-center">
          {/* <span className="text-[10px] text-gray-400 mb-1 tracking-widest uppercase">
            Advertisement
          </span> */}
          <img
            src="https://gibs.edu.in/wp-content/uploads/2025/10/522-Beyond-CAT-XAT-Other-Top-MBA-Entrance-Exams-for-GIBS-2026.png"
            alt="GIBS Ad"
            className="w-48 h-auto border rounded-sm shadow-lg"
          />
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex flex-1 flex-col lg:flex-row items-center px-4 lg:px-12 gap-8">
        {/* LEFT SIDE: DYNAMIC BANNER (GoDaddy Style) */}
        <div className="lg:w-3/5 w-full">
          <div className="relative">
            {/* Portal image dynamic-ah varum, illana default banner */}
            <img
              src={
                "https://img1.wsimg.com/cdn/Image/All/All/1/All/f6e48ede-79b6-4d78-aa96-a96be2d5716b/og-web-hosting.jpg"
              }
              alt="Welcome Banner"
              className="w-full h-auto rounded-sm shadow-xl"
            />
            <div className="absolute -top-12 left-6 lg:left-10">
              <h1 className="text-3xl lg:text-4xl font-light text-gray-800 tracking-tight">
                Welcome to HELPDESKTECH
                {/* <span className="font-bold uppercase">
                  {org?.name || "HELPDESKTECH"}
                </span> */}
              </h1>
            </div>
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

            <form className="space-y-5">
              {/* Email Input */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700">
                  Email address
                </label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  className="py-6 px-4 rounded-md border-gray-200 focus-visible:ring-blue-500/20 bg-gray-50/30"
                />
              </div>

              <Button
                type="submit"
                className={`w-full py-6 text-white font-bold text-lg rounded-md transition-all active:scale-95 shadow-lg shadow-blue-500/20  bg-blue-600 hover:bg-blue-700`}
              >
                Continue to portal
                <ArrowRight className="ml-2 w-5 h-5" />
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
