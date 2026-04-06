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
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const ROLES = [
  // { label: "Super Admin", value: "SUPER_ADMIN" },
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

const STORAGE_KEY = "app_permissions_v1";

const PermissionClientPage = ({ initialOrganizations = [] }) => {
  // Ippo intha state thaan full table permissions-aiyum track pannum
  const [selectedOrg, setSelectedOrg] = useState("");
  const [permissions, setPermissions] = useState({});
  const [selectedRole, setSelectedRole] = useState("");
  const [openPopoverId, setOpenPopoverId] = useState(null);

  console.log("root console", permissions);

  // --- 1. LOCAL STORAGE LOAD ---
  useEffect(() => {
    const saveData = localStorage.getItem(STORAGE_KEY);
    if (!saveData) return;

    try {
      const parsed = JSON.parse(saveData);

      // ❌ REMOVE WRONG KEYS
      const cleaned = Object.keys(parsed).reduce((acc, key) => {
        // valid key must contain "_"
        if (key.includes("_")) {
          acc[key] = parsed[key];
        }
        return acc;
      }, {});

      setPermissions(cleaned);
    } catch (e) {
      console.error("Error loading local storage", e);
      toast.error("Invalid local storage data");
    }
  }, []);

  // Current selected combination key (e.g., "amigo_SUPER_ADMIN")
  const activeKey =
    selectedOrg && selectedRole ? `${selectedOrg}_${selectedRole}` : null;

  // Role maarum pothu data-vai fetch panni state update pandra logic
  // const handleRoleChange = (rolevalue) => {
  //   // User select panna role value-ai (e.g., SUPER_ADMIN) state-la save pandrom
  //   setSelectedRole(rolevalue);
  //   // Inga backend API call-ku bathila mock data use pandrom

  //   // Initial mock data-la irunthu antha role-ku munnadiye irukura permissions-ai edukkurom
  //   const roleData = INITIAL_MOCK_DATA[rolevalue] || {};

  //   // Default-ah data illana ellathaiyum false/null panni vaikuroam

  //   // Temporary-ah oru object create panni athula data-vai process panna porom
  //   const updatedPermission = {};

  //   // Namma permission options list-ai looping panni ovvonna check pandrom
  //   PERMISSION_OPTIONS.forEach((opt) => {
  //     updatedPermission[opt.id] = roleData[opt.id] || {
  //       show: false,
  //       edit: false,
  //       disable: true,
  //       expiry: null,
  //     };
  //   });
  //   // Kadaisiya ellam ready panni "permissions" state-ai update panni table-la show pandrom
  //   setPermissions(updatedPermission);
  // };

  // --- CHECKBOX CLICK PANNUM POTHU TOGGLE PANNA ---
  const handleToggle = (id, field) => {
    // Role select pannama click panna error vara koodathunu intha check
    if (!activeKey) {
      toast.error("Please select both Organization and Role!");
      return;
    }

    console.log("Toggle console", permissions);

    setPermissions((prev) => {
      const currentRoleData = prev[activeKey] || {};
      const currentItem = currentRoleData[id] || {
        show: false,
        edit: false,
        disable: true,
        expiry: null,
      };

      const isCurrentlyChecked = currentItem[field];
      let newValues = { ...currentItem, [field]: !isCurrentlyChecked };

      // Business Logic
      if (field === "show" && !isCurrentlyChecked) newValues.disable = false;
      if (field === "disable" && !isCurrentlyChecked) {
        newValues.show = false;
        newValues.edit = false;
      }
      // if (field === "edit" && !isCurrentlyChecked) {
      //   // newValues.show = true;
      //   newValues.disable = false;
      // }

      return {
        ...prev,
        [activeKey]: {
          ...currentRoleData,
          [id]: newValues,
        },
      };
    });
  };

  // --- DATE MAARUM POTHU EXPIRY UPDATE PANNA ---
  const handleDateUpdate = (id, date) => {
    // 1. Role and Org select aagi irukkanum
    if (!activeKey) {
      toast.error("Please select both Organization and Role first!");
      return;
    }
    // State-ai update panna porom
    setPermissions((prev) => {
      // 2. Ippo irukura state-la irunthu current role data-vai edukkurom
      const currentRoleData = prev[activeKey] || {};
      const currentItem = currentRoleData[id] || {
        show: false,
        edit: false,
        disable: true,
        expiry: null,
      };

      // 3. State-ai nested-ah update pandrom
      return {
        ...prev,
        [activeKey]: {
          ...currentRoleData,
          [id]: {
            ...currentItem,
            expiry: date, // New date update aaguthu
          },
        },
      };
    });
    setOpenPopoverId(null);
  };

  // --- 3. SAVE TO LOCAL STORAGE ---
  const handleSave = () => {
    const cleaned = Object.keys(permissions).reduce((acc, key) => {
      if (key.includes("_")) {
        acc[key] = permissions[key];
      }
      return acc;
    }, {});

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    toast.success("Permissions saved to Local Storage!");
    console.log("Saved Data:", cleaned);
  };

  // Organization change aagum pothu trigger aagum
  const handleOrgChange = (orgId) => {
    console.log(orgId);
    setSelectedOrg(orgId);
    // Role already select panni iruntha automatic-ah data fetch aagum (re-render)
    // toast.info(
    //   `Organization switched to: ${ORGANIZATIONS.find((o) => o.id === orgId)?.name}`,
    // );
  };

  // Role change aagum pothu trigger aagum
  const handleRoleChange = (roleValue) => {
    console.log(roleValue);
    setSelectedRole(roleValue);
    // toast.info(
    //   `Role switched to: ${ROLES.find((r) => r.value === roleValue)?.label}`,
    // );
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
            onClick={handleSave}
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

            <Select onValueChange={handleRoleChange} value={selectedRole}>
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
              <span className="text-xs font-black uppercase">Headings</span>
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

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3 text-emerald-600">
              <Building2 size={18} strokeWidth={2.5} />
              <span className="text-xs font-black uppercase tracking-widest">
                Organization
              </span>
            </div>
            <Select onValueChange={handleOrgChange} value={selectedOrg}>
              <SelectTrigger className="w-full rounded-lg h-12 border-slate-200 bg-slate-50/50">
                <SelectValue
                  placeholder={
                    initialOrganizations && initialOrganizations.length > 0
                      ? "Choose an organization"
                      : "No organizations found"
                  }
                />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {initialOrganizations && initialOrganizations.length > 0 ? (
                  initialOrganizations.map((org) => (
                    <SelectItem
                      key={org.id}
                      value={org.id}
                      className="py-3 rounded-xl cursor-pointer"
                    >
                      {org.name}
                    </SelectItem>
                  ))
                ) : (
                  /* Organization illana intha message show aagum */
                  <SelectItem
                    value="none"
                    disabled
                    className="py-6 text-center text-slate-500 italic"
                  >
                    No organizations found
                  </SelectItem>
                )}
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
        </div>

        {/* Permissions Table Card */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Show", "Edit", "Disable"].map((head) => (
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
                  const roleData = permissions[activeKey] || {};
                  const data = roleData[option.id] || {
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
                      <td className="px-6 py-5 text-center">
                        {option.id !== "access_permission" ? (
                          <Checkbox
                            checked={data.edit}
                            onCheckedChange={() =>
                              handleToggle(option.id, "edit")
                            }
                            className="h-6 w-6 rounded-md border-slate-400/70  data-[state=checked]:bg-blue-600 data-[state=checked]:border-none shadow-sm"
                          />
                        ) : (
                          <div className="h-6 w-6 mx-auto" />
                        )}
                      </td>
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

export default PermissionClientPage;
