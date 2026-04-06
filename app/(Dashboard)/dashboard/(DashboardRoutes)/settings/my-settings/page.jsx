"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD", "MMM DD, YYYY"];

const MySettings = () => {
  const [theme, setTheme] = useState("system");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">My settings</h1>
      </div>

      {/* Main Settings Container */}
      <div className="divide-y divide-slate-100">
        {/* 1. Automatic Ticket Updates */}
        <div className="flex items-center justify-between py-6">
          <div className="space-y-0.5">
            <Label className="text-sm font-bold text-slate-700">
              Automatic ticket updates
            </Label>
          </div>
          <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
        </div>

        {/* 2. Ticket Browser Notifications */}
        <div className="flex items-center justify-between py-6">
          <div className="space-y-0.5">
            <Label className="text-sm font-bold text-slate-700">
              Ticket browser notifications
            </Label>
          </div>
          <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
        </div>

        {/* 3. Theme Selection */}
        <div className="flex items-start justify-between py-8">
          <div className="space-y-1">
            <Label className="text-sm font-bold text-slate-700">Theme</Label>
            <p className="text-sm text-slate-500 max-w-75">
              Dark Theme is currently only available on the Tickets page.
            </p>
          </div>

          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="w-60 space-y-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem
                value="light"
                id="light"
                className="border-slate-300 text-blue-600"
              />
              <Label
                htmlFor="light"
                className="text-sm text-slate-600 font-medium cursor-pointer"
              >
                Light
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem
                value="dark"
                id="dark"
                className="border-slate-300 text-blue-600"
              />
              <Label
                htmlFor="dark"
                className="text-sm text-slate-600 font-medium cursor-pointer"
              >
                Dark
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem
                value="system"
                id="system"
                className="border-slate-300 text-blue-600"
              />
              <Label
                htmlFor="system"
                className="text-sm text-slate-600 font-medium cursor-pointer"
              >
                Match OS System Settings
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* 4. Date Display Format */}
        <div className="flex items-center justify-between py-8">
          <div className="space-y-0.5">
            <Label className="text-sm font-bold text-slate-700">
              Date display format
            </Label>
          </div>
          <div className="w-60">
            <Select defaultValue={dateFormats[0]}>
              <SelectTrigger className="w-full bg-white border-slate-200 h-10 shadow-xs text-slate-600 focus:ring-1 focus:ring-cyan-500 outline-hidden">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>

              <SelectContent>
                {dateFormats.map((format) => (
                  <SelectItem
                    key={format}
                    value={format}
                    className="text-slate-600 text-[13px] cursor-pointer transition-colors"
                  >
                    {format}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 5. Relative Dates */}
        <div className="flex items-start justify-between py-8 border-b border-slate-100">
          <div className="space-y-1">
            <Label className="text-sm font-bold text-slate-700">
              Relative dates
            </Label>
            <p className="text-sm text-slate-500 max-w-87.5">
              Overrides <span className="italic">Date display format</span> with
              relative dates (example: "3d ago") for dates occurring in the last
              week and upcoming week.
            </p>
          </div>
          <Switch className="data-[state=checked]:bg-blue-600" />
        </div>
      </div>
    </div>
  );
};

export default MySettings;
