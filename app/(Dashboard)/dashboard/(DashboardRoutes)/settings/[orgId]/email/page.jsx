"use client";

import React, { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Trash2,
  Link as LinkIcon,
  Upload,
  ChevronDown,
  Mail,
} from "lucide-react";
import RippleButton from "@/Component/RippleButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function EmailSettings({ params }) {
  const { orgId } = use(params);
  const [isEditing, setIsEditing] = useState(false);
  // Accordion open/close track panna intha state
  const [isOpen, setIsOpen] = useState(false);

  const orgData = {
    name: "Amigo",
    helpDeskUrl: "https://amigowebster.helpdesktech.in",
    email: "help@amigowebster.helpdesktech.in",
    displayName: "Amigo Help Desk",
  };

  // State for additional settings
  const [settings, setSettings] = useState({
    whitelist: "",
    footer: "",
    outboundEmail: "help@amigowebster.helpdesktech.in",
    ignoreSubject: "",
    ignoreBody: "",
    ignoreFullText: "",
    reopenTicket: true,
  });

  return (
    <div className="bg-[#f8fafc] min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- HEADER SECTION --- */}
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
          <RippleButton className="border-red-100 text-sm bg-red-100 text-red-500 shadow-sm hover:bg-red-200/65 cursor-pointer  rounded-md transition-all px-6 py-5 ">
            <Trash2 size={18} className="mr-2" />
            Delete organization
          </RippleButton>
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white/60 border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-5 space-y-8">
            <section>
              {/* Section Title Bar */}
              <div className="relative flex items-center bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-50 py-3 px-4 border-l-4 border-slate-700 group rounded-l-md cursor-pointer transition-all duration-200">
                <h2 className="text-lg font-semibold text-slate-900">Email</h2>
              </div>

              <div className="px-5 divide-y divide-slate-200">
                {/* Row 1: Primary Email */}
                <div className="flex items-center justify-between py-6">
                  <p className="text-[13px] font-black text-slate-700  tracking-widest">
                    Email
                  </p>
                  <p className="text-[14px]  text-slate-700">{orgData.email}</p>
                </div>

                {/* Row 2: Display Name */}
                <div className="flex items-center justify-between py-6 group">
                  <div className="space-y-1">
                    <p className="text-[13px] font-black text-slate-700  tracking-widest">
                      Email display name
                    </p>
                    <p className="text-[14px] text-slate-400 font-medium">
                      Name shown in end user's email client.
                    </p>
                  </div>
                  <p className="text-[14px] text-slate-700">
                    {orgData.displayName}
                  </p>
                  <Button className=" px-6 h-8  text-[13px]  tracking-tight">
                    Edit
                  </Button>
                </div>

                {/* Row 3: Logo Image */}
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <p className="text-[13px] font-black text-slate-700  tracking-widest">
                      Email logo image (optional)
                    </p>
                    <p className="text-[14px] text-slate-400 font-medium">
                      Image displayed at the top of emails. 2mb max.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl border-slate-200 font-bold px-6 py-2 shadow-sm"
                  >
                    <Upload size={16} className="mr-2 text-slate-500" />
                    Upload
                  </Button>
                </div>

                {/* Row 4: Logo Text */}
                <div className="flex items-center justify-between py-6">
                  <div className="space-y-1">
                    <p className="text-[13px] font-black text-slate-700  tracking-widest">
                      Email logo text
                    </p>
                    <p className="text-slate-400 text-[14px]  font-medium max-w-md">
                      Text displays at the right of the logo. If no logo,
                      displays at the top left of each email.
                    </p>
                  </div>
                  <Button className="font-bold px-6 h-8  text-[13px]  tracking-tight">
                    Edit
                  </Button>
                </div>

                {/* Row 5: Customize Content (Link style) */}
                <div className="flex items-center justify-between py-6">
                  <p className="text-[13px] font-black text-slate-700  tracking-widest">
                    Customize email content
                  </p>
                  <p className="text-sm text-slate-600 font-medium">
                    You can customize the content of emails to end-users in the
                    <span className="text-blue-600 font-bold mx-1 cursor-pointer hover:underline underline-offset-4">
                      Alerts and notifications settings
                    </span>
                    .
                  </p>
                </div>
              </div>

              {/* --- ADDITIONAL SETTINGS (Accordion) --- */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  value={isOpen ? "additional" : ""}
                  onValueChange={(value) => setIsOpen(!!value)}
                >
                  <AccordionItem
                    value="additional"
                    className="border rounded-2xl border-slate-100 bg-slate-50/30"
                  >
                    <div className="flex items-center justify-between px-5">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Additional settings
                      </h3>
                      <div className="flex items-center gap-2">
                        {isOpen && isEditing ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(false);
                              }}
                              className="font-bold px-4 h-8 text-[13px]"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(false);
                              }}
                              className="font-bold px-4 h-8 text-[13px] bg-slate-900 text-white"
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          isOpen && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                              }}
                              className=" px-6 h-8 text-[13px] tracking-tight"
                            >
                              Edit
                            </Button>
                          )
                        )}

                        {/* Show/Hide Settings Trigger - Disabled during editing */}
                        {!isEditing && (
                          <AccordionTrigger className="hover:no-underline py-2 border border-slate-200 rounded-md px-4 flex items-center bg-white shadow-sm">
                            <span className="text-sm font-bold text-slate-700">
                              {isOpen ? "Hide settings" : "Show settings"}
                            </span>
                          </AccordionTrigger>
                        )}
                      </div>
                    </div>
                    <AccordionContent className="px-5 mt-5">
                      <div className="divide-y  divide-slate-200 border-t  border-slate-100">
                        {/* Whitelisted Domains */}
                        <div className="flex py-6 justify-between">
                          <div className="w-1/2 pr-4">
                            <p className="text-[13px] font-black text-slate-700  tracking-widest">
                              Incoming email whitelisted domains (optional)
                            </p>
                            <p className="text-[14px] text-slate-500 mt-1">
                              Only allow email addresses from specific domains
                              to create tickets.
                            </p>
                          </div>
                          <div className="w-1/2 text-end">
                            {isEditing ? (
                              <Input
                                placeholder="type domain and press enter"
                                className="bg-slate-50 border-slate-200"
                              />
                            ) : (
                              <p className="text-slate-400 text-sm italic">
                                None
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Custom Footer */}
                        <div className="flex py-6 justify-between">
                          <div className="w-1/3">
                            <p className="text-[13px] font-black text-slate-700  tracking-widest">
                              Custom footer (optional)
                            </p>
                          </div>
                          <div className="w-1/2">
                            {isEditing ? (
                              <Input className="bg-slate-50 border-slate-200" />
                            ) : (
                              <p className="text-slate-400 text-end text-sm italic">
                                None
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Outbound Email */}
                        <div className="flex py-6 justify-between">
                          <div className="w-1/3">
                            <p className="text-[13px] font-black text-slate-700  tracking-widest">
                              Custom outbound email address (optional)
                            </p>
                            <p className="text-[14px] text-slate-500 mt-1">
                              This may cause emails to end up in spam filters.{" "}
                              <span className="text-blue-600 underline cursor-pointer">
                                Learn more.
                              </span>
                            </p>
                          </div>
                          <div className="w-1/2">
                            {isEditing ? (
                              <Input
                                defaultValue={settings.outboundEmail}
                                className="bg-slate-50 border-slate-200"
                              />
                            ) : (
                              <p className=" text-sm text-end text-slate-700">
                                {settings.outboundEmail}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Ignore Subjects (Regex) */}
                        <div className="flex py-6 justify-between">
                          <div className="w-1/3">
                            <p className="text-[13px] font-black text-slate-700  tracking-widest">
                              Ignore subjects with (optional)
                            </p>
                            <p className="text-[14px] text-slate-500 mt-1">
                              Email subject lines matching this regex will be
                              ignored.
                            </p>
                          </div>
                          <div className="w-1/2">
                            {isEditing ? (
                              <Input className="bg-slate-50 border-slate-200" />
                            ) : (
                              <p className="text-slate-400 text-sm text-end italic">
                                None
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Reopen Ticket Toggle */}
                        <div className="flex items-center justify-between py-6">
                          <p className="text-[13px] font-black text-slate-700  tracking-widest">
                            Email from end user reopens a ticket
                          </p>
                          <div
                            className={`p-1 rounded-full ${isEditing ? "bg-slate-100" : ""}`}
                          >
                            {isEditing ? (
                              <Switch
                                className="data-[state=checked]:bg-blue-600"
                                checked={settings.reopenTicket}
                                disabled={!isEditing}
                                onCheckedChange={(checked) =>
                                  setSettings({
                                    ...settings,
                                    reopenTicket: checked,
                                  })
                                }
                              />
                            ) : (
                              <p className="text-sm font-bold text-slate-700">
                                {settings.reopenTicket ? "Yes" : "No"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
