"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { redirect, useRouter } from "next/navigation";

// Top row stats cards
const StatCard = ({ title, value, trend }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col flex-1 min-w-37.5">
    <span className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-tight">
      {title}
    </span>
    <div className="flex items-center gap-2">
      <span className="text-3xl font-medium text-gray-700">{value}</span>
      {trend && (
        <span className="text-red-500 flex items-center text-xs font-bold bg-red-50 px-1 rounded">
          ↑ {trend}
        </span>
      )}
    </div>
  </div>
);

// Performance metrics (Response time)
const TimeMetric = ({ label, minutes, seconds }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
    <span className="text-sm font-bold text-gray-700 block mb-1">{label}</span>
    <span className="text-[10px] text-gray-400 block mb-3 uppercase tracking-widest font-bold">
      Average
    </span>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-light text-gray-800">{minutes}</span>
      <span className="text-xs text-gray-400 font-bold">minutes</span>
      <span className="text-4xl font-light text-gray-800">{seconds}</span>
      <span className="text-xs text-gray-400 font-bold">seconds</span>
    </div>
  </div>
);

export default function DashboardPage() {
  redirect("/dashboard/tickets");

  return null;

  return (
    <div className="space-y-6">
      {/* Header Filters */}
      <div className="flex items-center gap-4 text-sm font-bold text-gray-500 mb-4">
        <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
          Last 7 Days <ChevronDown size={14} />
        </div>
        <div className="w-px h-4 bg-gray-200"></div>
        <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
          All Organizations <ChevronDown size={14} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Section */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap gap-4">
            <StatCard title="New Tickets" value="2" trend="2" />
            <StatCard title="Your Tickets" value="2" trend="2" />
            <StatCard title="Open Tickets" value="0" />
            <StatCard title="Unassigned Tickets" value="0" />
          </div>

          {/* Ticket History Chart Area */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-87.5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">
              Ticket History
            </h3>
            <div className="w-full h-64 flex items-center justify-center border-t border-gray-50">
              <p className="text-gray-300 text-sm font-medium italic">
                Graph visuals will appear here...
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full lg:w-80 space-y-6">
          <TimeMetric label="First Response Time" minutes="36" seconds="36" />
          <TimeMetric label="Tickets Close Time" minutes="37" seconds="26" />

          {/* Promo Box */}
          <div className="bg-[#4a90e2] p-8 rounded-2xl text-white shadow-lg shadow-blue-100 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black mb-1 uppercase tracking-tighter opacity-80">
                spiceworks
              </p>
              <h2 className="text-xl font-bold mb-2">Cloud Help Desk</h2>
              <p className="text-xs opacity-90 mb-6 leading-relaxed">
                No server procurement, setup, or maintenance. Just sign up and
                you are ready to go.
              </p>
              <button className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-bold text-xs uppercase shadow-sm active:scale-95 transition-transform">
                Sign up NOW
              </button>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
