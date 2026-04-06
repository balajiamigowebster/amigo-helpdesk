"use client";

import React from "react";
import { Search, Bell, User, HelpCircle, Settings } from "lucide-react";

const DashboardNavbar = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20">
      {/* Left Side: Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          Help Desk
        </h1>
      </div>

      {/* Center: Search Bar (Optional but looks professional) */}
      {/* <div className="hidden md:flex items-center bg-gray-100 px-3 py-1.5 rounded-lg w-96">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search tickets, assets..."
          className="bg-transparent border-none outline-none ml-2 text-sm w-full text-gray-600"
        />
      </div> */}

      {/* Right Side: Icons & Profile */}
      <div className="flex items-center gap-5">
        <button className="text-gray-500 hover:text-blue-600 transition-colors relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
            3
          </span>
        </button>

        <button className="text-gray-500 hover:text-blue-600 transition-colors">
          <Settings size={20} />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              Amigo
            </p>
            <p className="text-[10px] text-gray-400 uppercase font-black">
              Admin
            </p>
          </div>
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-blue-100">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
