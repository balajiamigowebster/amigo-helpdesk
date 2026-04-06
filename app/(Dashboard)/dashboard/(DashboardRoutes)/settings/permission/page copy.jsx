"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Building2,
  Calendar as CalendarIcon,
  Clock,
  Save,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const ROLES = [
  { label: "Super Admin", value: "SUPER_ADMIN" },
  { label: "HDT Admin", value: "HDT_ADMIN" },
  { label: "HDT Manager", value: "HDT_MANAGER" },
  { label: "HDT Tech", value: "HDT_TECH" },
  { label: "ORG Admin", value: "ORG_ADMIN" },
  { label: "ORG Tech", value: "ORG_TECH" },
];

const ORGANIZATIONS = [
  { id: "global", name: "Global Technology" },
  { id: "amigo", name: "Amigo Webster" },
  { id: "tech-corp", name: "Tech Corp Solutions" },
  { id: "innovate", name: "Innovate Systems" },
  { id: "cyber-sec", name: "Cyber Security Hub" },
];

const PERMISSION_OPTIONS = [
  { id: "global_setting", label: "Global Setting", category: "General" },
  { id: "my_settings", label: "My Settings", category: "General" },
  { id: "access_permission", label: "Access Permission", category: "Security" },
  { id: "emp_administration", label: "Emp Administration", category: "Admin" },
  { id: "task_lists", label: "Task Lists", category: "Tickets" },
  { id: "ticket_rules", label: "Ticket Rules", category: "Tickets" },
  { id: "ticket_views", label: "Ticket Views", category: "Tickets" },
  { id: "canned_responses", label: "Canned Responses", category: "Tickets" },
];

const SETTINGS_CATEGORIES = [
  { label: "Global Settings", value: "GLOBAL" },
  { label: "My Settings", value: "MY_SETTINGS" },
  { label: "Permission", value: "PERMISSION" },
  { label: "Employee Administration", value: "EMP_ADMIN" },
  { label: "Task Lists", value: "TASK_LISTS" },
  { label: "Ticket Rules", value: "TICKET_RULES" },
  { label: "Ticket Views", value: "TICKET_VIEWS" },
  { label: "Canned Responses", value: "CANNED_RESPONSES" },
];

const GENERAL_CATEGORIES = [
  { label: "General", value: "GENERAL" },
  { label: "Import/Export Tickets", value: "IMPORT_EXPORT" },
  { label: "Email", value: "EMAIL" },
  { label: "Monitors and Alerts", value: "MONITORS" },
  { label: "User Portal", value: "USER_PORTAL" },
  { label: "Ticket Categories", value: "TICKET_CAT" },
  { label: "Custom Attributes", value: "CUSTOM_ATTR" },
  { label: "User Management", value: "USER_MGMT" },
];
// --- MOCK DATA LOGIC ---
// Intha data thaan backend-la irunthu varatha imagine pannikonga
const INITIAL_MOCK_DATA = {
  SUPER_ADMIN: {
    global_setting: { show: true, edit: true, disable: false, expiry: null },
    my_settings: { show: true, edit: true, disable: false, expiry: null },
    access_permission: { show: true, edit: true, disable: false, expiry: null },
    emp_administration: {
      show: true,
      edit: true,
      disable: false,
      expiry: null,
    },
    task_lists: { show: true, edit: true, disable: false, expiry: null },
    ticket_rules: { show: true, edit: true, disable: false, expiry: null },
    ticket_views: { show: true, edit: true, disable: false, expiry: null },
    canned_responses: { show: true, edit: true, disable: false, expiry: null },
  },
  HDT_ADMIN: {
    global_setting: {
      show: true,
      edit: true,
      disable: false,
      expiry: new Date(2026, 5, 20),
    },
    my_settings: { show: true, edit: true, disable: false, expiry: null },
    access_permission: {
      show: true,
      edit: false,
      disable: false,
      expiry: null,
    },
    emp_administration: {
      show: true,
      edit: true,
      disable: false,
      expiry: null,
    },
    task_lists: { show: true, edit: true, disable: false, expiry: null },
    ticket_rules: { show: true, edit: true, disable: false, expiry: null },
    ticket_views: { show: true, edit: true, disable: false, expiry: null },
    canned_responses: { show: true, edit: true, disable: false, expiry: null },
  },
  ORG_TECH: {
    global_setting: { show: false, edit: false, disable: true, expiry: null },
    my_settings: { show: true, edit: false, disable: false, expiry: null },
    access_permission: {
      show: false,
      edit: false,
      disable: true,
      expiry: null,
    },
    emp_administration: {
      show: false,
      edit: false,
      disable: true,
      expiry: null,
    },
    task_lists: { show: true, edit: false, disable: false, expiry: null },
    ticket_rules: { show: false, edit: false, disable: true, expiry: null },
    ticket_views: { show: true, edit: false, disable: false, expiry: null },
    canned_responses: { show: true, edit: false, disable: false, expiry: null },
  },
};

const PermissionPage = () => {
  // Ippo intha state thaan full table permissions-aiyum track pannum
  const [permissions, setPermissions] = useState({});
  const [selectedRole, setSelectedRole] = useState("");
  const [openPopoverId, setOpenPopoverId] = useState(null);

  // Role maarum pothu data-vai fetch panni state update pandra logic
  const handleRoleChange = (rolevalue) => {
    // User select panna role value-ai (e.g., SUPER_ADMIN) state-la save pandrom
    setSelectedRole(rolevalue);
    // Inga backend API call-ku bathila mock data use pandrom

    // Initial mock data-la irunthu antha role-ku munnadiye irukura permissions-ai edukkurom
    const roleData = INITIAL_MOCK_DATA[rolevalue] || {};

    // Default-ah data illana ellathaiyum false/null panni vaikuroam

    // Temporary-ah oru object create panni athula data-vai process panna porom
    const updatedPermission = {};

    // Namma permission options list-ai looping panni ovvonna check pandrom
    PERMISSION_OPTIONS.forEach((opt) => {
      updatedPermission[opt.id] = roleData[opt.id] || {
        show: false,
        edit: false,
        disable: true,
        expiry: null,
      };
    });
    // Kadaisiya ellam ready panni "permissions" state-ai update panni table-la show pandrom
    setPermissions(updatedPermission);
  };

  // --- CHECKBOX CLICK PANNUM POTHU TOGGLE PANNA ---
  const handleToggle = (id, field) => {
    // Role select pannama click panna error vara koodathunu intha check
    if (!selectedRole || !permissions[id]) {
      // Alert-ku bathila ippo Toast kaatrom
      toast.error("Please select a role first!");
      return;
    }

    setPermissions((prev) => {
      // Palaiya values-ai eduthu oru constant-la vachikurom
      const currentValues = prev[id];
      const isCurrentlyChecked = currentValues[field];

      // New values object-ai initialize pandrom
      let newValues = {
        ...currentValues,
        [field]: !isCurrentlyChecked, // Click panna field-ai toggle pandrom
      };

      // --- USER KETTA LOGIC INGA THAAN IRUKKU ---
      // 1. Show-ai click panna, automatic-ah Disable-ai uncheck (false) panna vaikிறோம்
      if (field === "show" && !isCurrentlyChecked) {
        newValues.disable = false;
      }

      // 2. Disable-ai click panna, automatic-ah Show-aiyum Edit-aiyum uncheck panna vaikிறோம்
      if (field === "disable" && !isCurrentlyChecked) {
        newValues.show = false;
        newValues.edit = false;
      }

      // 3. Edit-ai click panna, kandippa Show-um active aaganum (Optional but standard logic)
      if (field === "edit" && !isCurrentlyChecked) {
        newValues.show = true;
        newValues.disable = false;
      }

      return {
        ...prev,
        [id]: newValues,
      };
    });
  };

  // --- DATE MAARUM POTHU EXPIRY UPDATE PANNA ---
  const handleDateUpdate = (id, date) => {
    // State-ai update panna porom
    setPermissions((prev) => ({
      // Palaiya data-vai safe-ah spread pannikkirom
      ...prev,
      // Particular permission ID-kulla poyi athoda expiry date-ai mattum backend style-la update pandrom
      [id]: {
        ...prev[id],
        expiry: date,
      },
    }));
    setOpenPopoverId(null);
  };

  return (
    <div className=" bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ShieldCheck className="text-blue-600 size-8" />
              Permission Control
            </h1>
          </div>
          <Button
            onClick={() => console.log("Final Data to Save:", permissions)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all hover:scale-105 active:scale-95 flex gap-2"
          >
            <Save size={20} strokeWidth={2.5} />
            Save Configuration
          </Button>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow ">
            <div className="flex items-center gap-3 mb-3 text-blue-600">
              <Settings2 size={18} strokeWidth={2.5} />
              <span className="text-xs font-black uppercase tracking-widest">
                Select Role
              </span>
            </div>

            <Select onValueChange={handleRoleChange}>
              <SelectTrigger className="w-full rounded-lg h-16 border-slate-200 bg-slate-50/50">
                <SelectValue placeholder="Choose a Role" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {ROLES.map((role) => (
                  <SelectItem
                    key={role.value}
                    value={role.value}
                    className="py-3 rounded-xl cursor-pointer"
                  >
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Settings Categories (Image 2) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-purple-600">
              <Settings2 size={18} />
              <span className="text-xs font-black uppercase">Settings</span>
            </div>
            <Select>
              <SelectTrigger className="w-full rounded-lg h-12 border-slate-200 bg-slate-50/50">
                <SelectValue placeholder="Select Setting" />
              </SelectTrigger>
              <SelectContent>
                {SETTINGS_CATEGORIES.map((s) => (
                  <SelectItem
                    key={s.value}
                    value={s.value}
                    className="py-3 rounded-xl cursor-pointer"
                  >
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* General Categories (Image 3) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-emerald-600">
              <Building2 size={18} />
              <span className="text-xs font-black uppercase">
                General & Tickets
              </span>
            </div>
            <Select>
              <SelectTrigger className="w-full rounded-lg h-12 border-slate-200 bg-slate-50/50">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {GENERAL_CATEGORIES.map((g) => (
                  <SelectItem
                    key={g.value}
                    value={g.value}
                    className="py-3 rounded-xl cursor-pointer"
                  >
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3 text-purple-600">
              <Settings2 size={18} strokeWidth={2.5} />
              <span className="text-xs font-black uppercase tracking-widest">
                Category
              </span>
            </div>
            <Select defaultValue="GLOBAL">
              <SelectTrigger className="w-full rounded-lg h-16 border-slate-200 bg-slate-50/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {SETTINGS_CATEGORIES.map((cat) => (
                  <SelectItem
                    key={cat.value}
                    value={cat.value}
                    className="py-3 rounded-xl"
                  >
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3 text-emerald-600">
              <Building2 size={18} strokeWidth={2.5} />
              <span className="text-xs font-black uppercase tracking-widest">
                Organization
              </span>
            </div>
            <Select>
              <SelectTrigger className="w-full rounded-lg h-12 border-slate-200 bg-slate-50/50">
                <SelectValue placeholder="Choose a organization" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {/* 3. Mapping the Organization Array */}
                {ORGANIZATIONS.map((org) => (
                  <SelectItem
                    key={org.id}
                    value={org.id}
                    className="py-3 rounded-xl cursor-pointer"
                  >
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Permissions Table Card */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Show", "Disable"].map((head) => (
                    <th
                      key={head}
                      className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center"
                    >
                      {head}
                    </th>
                  ))}
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                    Category
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                    Access Expiry
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {PERMISSION_OPTIONS.map((option) => {
                  const data = permissions[option.id] || {
                    show: false,
                    edit: false,
                    disable: true,
                    expiry: null,
                  };

                  return (
                    <tr
                      key={option.id}
                      className="group hover:bg-blue-50/50 transition-all"
                    >
                      <td className="px-6 py-5 text-center">
                        <Checkbox
                          checked={data.show}
                          disabled={!selectedRole}
                          onCheckedChange={() => {
                            handleToggle(option.id, "show");
                          }}
                          className="h-6 w-6 rounded-md cursor-pointer border-slate-400/70  data-[state=checked]:bg-blue-600 data-[state=checked]:border-none shadow-sm"
                        />
                      </td>
                      {/* <td className="px-6 py-5 text-center">
                        <Checkbox
                          checked={data.show}
                          onCheckedChange={() =>
                            handleToggle(option.id, "edit")
                          }
                          className="h-6 w-6 rounded-md border-slate-400/70  data-[state=checked]:bg-blue-600 data-[state=checked]:border-none shadow-sm"
                        />
                      </td> */}
                      <td className="px-6 py-5 text-center">
                        <Checkbox
                          checked={data.disable}
                          disabled={!selectedRole}
                          onCheckedChange={() =>
                            handleToggle(option.id, "disable")
                          }
                          className="h-6 w-6 rounded-md cursor-pointer border-slate-400/70 data-[state=checked]:bg-blue-600 data-[state=checked]:border-none shadow-sm"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-[14px]  text-neutral-700 group-hover:text-blue-700 transition-colors ">
                            {option.label}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            {option.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Popover
                          open={openPopoverId === option.id}
                          onOpenChange={(open) =>
                            setOpenPopoverId(open ? option.id : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-44 justify-start text-left  text-xs h-10 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white transition-all",
                                !data.expiry && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-3 w-3 text-blue-500" />
                              {data.expiry ? (
                                format(data.expiry, "PPP")
                              ) : (
                                <span className="text-neutral-700">
                                  Set Expiry
                                </span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl">
                            <Calendar
                              className="rounded-2xl"
                              mode="single"
                              onSelect={(date) =>
                                handleDateUpdate(option.id, date)
                              }
                              selected={data.expiry}
                              captionLayout="dropdown"
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Table Footer Info */}
          <div className="bg-slate-50/80 p-4 border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock size={14} />
              <span className="text-[11px] font-black uppercase tracking-wider">
                {selectedRole
                  ? `Viewing permissions for ${selectedRole}`
                  : "Select a role to start"}
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 italic">
              * Changes apply only to selected role
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionPage;
