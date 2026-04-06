"use client";

import React from "react";
import { Lock, ArrowLeft } from "lucide-react"; // lucide-react use pannirukaen, neenga normal-ah kooda pannalam
import { useRouter } from "next/navigation";

const UnauthorizedUI = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-lg">
        {/* Icon Section */}
        <div className="flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <Lock className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Text Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            401 - Unauthorized
          </h1>
          <p className="text-gray-500">
            Oh no ! You don’t have permission to view this page. Please log in
            and try again.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={() => router.push("/login")}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Login Page
          </button>
        </div>

        <p className="text-xs text-gray-400">
          If you think this is a mistake, please contact your Organization
          Admin.
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedUI;
