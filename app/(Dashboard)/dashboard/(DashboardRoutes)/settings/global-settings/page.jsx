"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, ShieldAlert, Trash2 } from "lucide-react";

const GlobalSettings = () => {
  const [mfaType, setMfaType] = useState("off");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Global settings</h1>
      </div>

      {/* --- Section 1: Comment & Notification Options --- */}
      <div className="space-y-8">
        {/* Edit Ticket Comments */}
        <div className="flex items-start justify-between gap-10">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-700">
              Edit Ticket Comment Options
            </h3>
            <p className="text-[13px] text-slate-500 max-w-xl">
              Allows employees (but not end users) to delete/edit their ticket
              text. Comment changes will display edited timestamp, but no audit
              history is shown.
            </p>
          </div>
          <Switch className="data-[state=checked]:bg-blue-600" />
        </div>

        {/* Delete Ticket Comments */}
        <div className="flex items-start justify-between gap-10">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-700">
              Delete Ticket Comments
            </h3>
            <p className="text-[13px] text-slate-500 max-w-xl">
              Allows employees (but not end users) to delete their ticket
              comments. Owners can delete any ticket comment as needed. Audit
              history is visible to users.
            </p>
          </div>
          <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
        </div>

        {/* Mute Email Notifications */}
        <div className="flex items-start justify-between gap-10">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-700">
              Mute Email Notifications
            </h3>
            <p className="text-[13px] text-slate-500 max-w-xl">
              Mute all outgoing ticket email notifications for this account.
            </p>
          </div>
          <Switch className="data-[state=checked]:bg-blue-600" />
        </div>
      </div>

      {/* --- Section 2: MFA Settings (Radio Buttons) --- */}
      <div className="pt-6 border-t border-slate-100">
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-slate-700">
              Enable Multi-Factor Authentication (MFA)
            </h3>
            <p className="text-[13px] text-slate-500 flex items-center gap-2">
              Security Level: High <Info size={14} className="text-blue-500" />
            </p>
          </div>

          <RadioGroup
            value={mfaType}
            defaultValue="off"
            onValueChange={setMfaType}
            className="space-y-1 mt-4 "
          >
            <div className="flex items-center space-x-3 ">
              <RadioGroupItem
                value="off"
                id="off"
                className={`text-blue-600 peer ${mfaType === "off" ? "border-red-400/40 text-red-400/40 data-[state=checked]:bg-red-50 " : "border-slate-300"} focus-visible:ring-2 focus-visible:ring-red-500/30`}
              />
              <Label
                htmlFor="off"
                className={`text-[13px] font-medium uppercase cursor-pointer  ${mfaType === "off" ? "text-red-400 font-bold " : "text-slate-800"}`}
              >
                Off
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem
                value="otp"
                id="otp"
                className={` peer  ${mfaType === "otp" ? "data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-50  focus-visible:ring-2 focus-visible:ring-blue-500" : "text-blue-600"}  `}
              />
              <Label
                htmlFor="otp"
                className={`text-[13px] font-medium uppercase cursor-pointer ${mfaType === "otp" ? "peer-data-[state=checked]:text-blue-700 peer-data-[state=checked]:font-bold" : "text-slate-800"}  `}
              >
                OTP based using Authenticator Apps
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem
                value="otp-email"
                id="otp-email"
                className={` peer ${mfaType === "otp-email" ? "data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-50  focus-visible:ring-2 focus-visible:ring-blue-500" : "text-blue-600"} `}
              />
              <Label
                htmlFor="otp-email"
                className={`text-[13px] font-medium uppercase cursor-pointer ${mfaType === "otp-email" ? "peer-data-[state=checked]:text-blue-700 peer-data-[state=checked]:font-bold" : "text-slate-800"}  `}
              >
                OTP based using Email
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* --- Section 3: Bulk Ticket Delete (Alert Style) --- */}
      <div className="space-y-6 pt-6">
        <h2 className="text-xl font-bold text-slate-800">Bulk ticket delete</h2>

        <div className="bg-linear-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600 rounded-xl p-6 flex gap-4 shadow-md shadow-blue-900/5 transition-all duration-300">
          {/* Icon Container with matching blue theme */}
          <div className="bg-blue-600/10 p-2 h-fit rounded-full shadow-sm">
            <ShieldAlert size={24} className="text-blue-600" />
          </div>

          <div className="space-y-3">
            <p className="text-blue-800/80 text-[14px]  leading-relaxed">
              To protect your account, tickets with the creator/contact field as
              an employee cannot be deleted using this process.{" "}
              <span className="underline decoration-blue-600/40 underline-offset-4 font-bold cursor-pointer text-blue-700 hover:text-blue-600 hover:decoration-blue-600 transition-all">
                Learn more
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="space-y-1">
            <h3 className="font-medium text-slate-700">
              Delete users associated with tickets to be deleted
            </h3>
            <p className="text-[12px] text-slate-400 font-medium">
              (Admins will not be deleted)
            </p>
          </div>
          <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 py-4 border-t border-dashed border-slate-200">
          <Label className="text-sm text-slate-600 whitespace-nowrap">
            Delete all tickets from ticket IDs
          </Label>
          <div className="flex items-center gap-2">
            <Input className="w-24 h-9 bg-white" placeholder="From" />
            <span className="text-slate-400">to</span>
            <Input className="w-24 h-9 bg-white" placeholder="To" />
          </div>
          <Button
            variant="destructive"
            className="cursor-pointer hover:bg-red-700"
          >
            Delete Tickets
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;
