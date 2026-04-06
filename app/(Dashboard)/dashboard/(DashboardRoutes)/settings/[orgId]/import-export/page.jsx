"use client";

import React, { use } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Trash2,
  Link as LinkIcon,
  Info,
  Upload,
  Download,
  ExternalLink,
} from "lucide-react";
import RippleButton from "@/Component/RippleButton";

export default function ImportExportSettings({ params }) {
  const { orgId } = use(params);

  const orgData = {
    name: "Amigo",
    helpDeskUrl: "https://amigowebster.helpdesktech.in",
  };

  return (
    <div className="bg-[#f8fafc] min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- HEADER SECTION (Same as General) --- */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {orgData.name}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
              <LinkIcon size={14} className="text-blue-500" />
              {orgData.helpDeskUrl}
            </p>
          </div>
          <RippleButton
            variant="outline"
            className="border-red-100 text-sm bg-red-100 text-red-500 shadow-sm hover:bg-red-200/65 cursor-pointer  rounded-md transition-all px-6 py-5 "
          >
            <Trash2 size={18} className="mr-2" />
            Delete organization
          </RippleButton>
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white/60 border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-5 space-y-8">
            <section>
              {/* Section Header */}
              <div className="relative flex items-center bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-50 py-3 px-4 border-l-4 border-slate-700 group rounded-l-md cursor-pointer transition-all duration-200">
                <h2 className="text-lg font-black text-slate-900">
                  Import / Export Tickets
                </h2>
              </div>

              {/* Instruction Text */}
              <div className="px-5 py-6">
                <p className="text-slate-600 text-[14px]">
                  If you have not exported the tickets you want to import yet,
                  follow these instructions to
                  <span className="text-blue-600 underline cursor-pointer ml-1 inline-flex items-center gap-1">
                    export your tickets from on-prem help desk{" "}
                    <ExternalLink size={12} />
                  </span>
                  .
                </p>
              </div>

              <Separator className="bg-slate-200" />

              {/* --- IMPORT SECTION --- */}
              <div className="p-5 space-y-6">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                  Import
                </h3>

                {/* Information Alert Box */}
                <div className="bg-linear-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600 rounded-xl p-6 flex gap-4 shadow-md shadow-blue-900/5 transition-all duration-300">
                  {/* Icon Container with matching blue theme */}
                  <div className="bg-blue-600/10 p-2 h-fit rounded-full shadow-sm">
                    <Info size={24} className="text-blue-600" />
                  </div>

                  <div className="space-y-3">
                    <p className="font-bold text-[15px] leading-tight tracking-wide text-blue-900">
                      During periods of high import volume your ticket import
                      could take days.
                    </p>
                    <p className="text-blue-800/80 text-[14px]  leading-relaxed">
                      You'll receive an email when the import starts. Imported
                      tickets and users will not appear until the import
                      finishes. Uploading the same file multiple times can
                      result in ticket duplication and delays. If the import
                      fails or takes longer than 72 hours,{" "}
                      <span className="underline decoration-blue-600/40 underline-offset-4 font-bold cursor-pointer text-blue-700 hover:text-blue-600 hover:decoration-blue-600 transition-all">
                        contact support
                      </span>
                      . Thank you for your patience.
                    </p>
                  </div>
                </div>

                {/* Upload Button */}
                <div className="py-4">
                  <label className="cursor-pointer text-[14px] inline-flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all px-6 py-3 rounded-xl font-semibold text-slate-700 shadow-sm group">
                    <Upload
                      size={18}
                      className="text-slate-400 group-hover:text-blue-500"
                    />
                    Choose file to upload (.json)
                    <input type="file" className="hidden" accept=".json" />
                  </label>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              {/* --- EXPORT SECTION --- */}
              <div className="p-5 space-y-4">
                <h3 className="text-lg font-black text-slate-800  tracking-tight">
                  Export
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 text-[14px]">
                    Export .json reports of your tickets from the
                    <span className="text-blue-600 font-bold mx-1 cursor-pointer hover:underline">
                      reports section
                    </span>
                    of help desk.
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-xl border-slate-200 font-bold px-6 py-5 hover:bg-slate-50"
                  >
                    <Download size={18} className="mr-2 text-slate-500" />
                    Go to Reports
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
