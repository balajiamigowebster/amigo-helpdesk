"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center">
        {/* Animated Rings */}
        <div className="relative flex items-center justify-center mb-8">
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-20 h-20 bg-blue-500 rounded-full blur-xl"
          />
          <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-slate-100">
            {/* Inner Bouncing Dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  initial={{ y: 0 }}
                  animate={{ y: [-6, 0, -6] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: index * 0.15,
                    ease: "easeInOut",
                  }}
                  className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Text Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          {/* <h2 className="text-slate-800 font-black uppercase tracking-[0.2em] text-sm italic">
            Preparing Portal
          </h2> */}
          <p className="text-slate-400 text-xs font-medium animate-pulse">
            Please wait a moment...
          </p>
        </motion.div>
      </div>

      {/* Decorative Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-20" />
    </div>
  );
}
