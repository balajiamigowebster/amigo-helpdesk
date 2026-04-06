"use client"; // Error components must be Client Components

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-black text-gray-900 mb-2 italic uppercase tracking-tighter">
        Something went wrong!
      </h1>
      <p className="text-gray-500 max-w-md mb-8">
        We encountered an error while loading the support portal. It might be a
        temporary connection issue.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95"
        >
          Try Again
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-white border-2 border-gray-200 text-gray-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
