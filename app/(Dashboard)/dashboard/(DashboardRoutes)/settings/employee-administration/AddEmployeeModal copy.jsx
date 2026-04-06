import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Building2, DollarSign, Mail, Plus, User } from "lucide-react";
import React, { useState } from "react";
import RippleButton from "@/Component/RippleButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { toast } from "sonner";

const AddEmployeeModal = ({ ownerId }) => {
  // const [isLimitedAll, setIsLimitedAll] = useState(true);
  const [open, setOpen] = useState(false);
  // const [isNotify, setIsNotify] = useState(true);
  const queryClient = useQueryClient();

  // --- Single Object State ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    isLimitedAll: true,
    isNotify: true,
    organization: "Testing-1",
  });

  // console.log(formData);

  // Generic Change Handler for Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Direct Update Handler for non-event components (Select, Switch, etc.)
  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      isLimitedAll: true,
      isNotify: true,
      organization: "Testing-1",
    });
  };

  // 1. Inga oru constant array create pannurom
  const ROLES = [
    {
      label: "Tech - Limited ticket and settings access.",
      value: "Tech",
    },
    {
      label: "Manager - Full ticket access. Limited settings.",
      value: "Manager",
    },
    {
      label: "Admin - Full access.",
      value: "Admin",
    },
  ];

  // --- TanStack Mutation with Optimistic Update ---
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(
        "/settings/employee-administration/employee-create",
        payload
      );
      return data;
    },
    onMutate: async (newEmployee) => {
      await queryClient.cancelQueries({ queryKey: ["employees"] });
      const previousEmployees = queryClient.getQueryData(["employees"]);

      queryClient.setQueryData(["employees"], (old = []) => [
        {
          id: Date.now().toString(), // Instant Show
          ...newEmployee,
          isVerified: false,
          displayOrganizations:
            newEmployee.accessScope === "ALL"
              ? "All organizations"
              : newEmployee.organization,
          employeeImage: null,
        },
        ...old,
      ]);
      return previousEmployees;
    },
    onError: (err, newEmployee, context) => {
      queryClient.setQueryData(["employees"], context.previousEmployees);
      toast.error("Failed to add employee. Record removed.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setOpen(false);
      resetForm();
    },
  });

  const handleCreate = () => {
    console.log("Current Owner ID being sent:", ownerId); // Inga check pannunga
    if (
      !formData.firstName ||
      !formData.email ||
      !formData.role ||
      !formData.lastName
    ) {
      toast.error("Please fill required fields");
      return;
    }

    // --- Object.keys logic for cleaner code ---
    const dataPayload = new FormData();

    // Map existing state to correct API keys
    const submissionData = {
      ...formData,
      ownerId: ownerId,
      isNotifyEnabled: formData.isNotify,
      accessScope: formData.isLimitedAll ? "ALL" : "SPECIFIC",
      organizations: JSON.stringify(
        formData.isLimitedAll ? ["ALL"] : [formData.organization]
      ),
    };

    // Remove internal UI-only state keys before sending
    delete submissionData.isLimitedAll;
    delete submissionData.isNotify;

    Object.keys(submissionData).forEach((key) => {
      if (submissionData[key] !== undefined && submissionData[key] !== null) {
        dataPayload.append(key, submissionData[key]);
      }
    });

    mutate(dataPayload);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {/* Main page-la iruntha button-ai inga trigger-ah veachurukkoam */}
        <RippleButton className="cursor-pointer">
          <Plus size={18} strokeWidth={3} />
          Add employee
        </RippleButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-110 rounded-4xl p-6 outline-none border-none shadow-2xl bg-white">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            Add New Employee
          </DialogTitle>
          {/* <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Workspace Directory
          </p> */}
        </DialogHeader>
        {/* Form Container - w-full layouts */}
        <div className="grid grid-cols-1 gap-4  py-5">
          {/* Stacked Name Inputs */}

          {/* First Name */}
          <div className="relative">
            <User className="absolute left-3.5 top-3 size-4 text-slate-400" />
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              className="w-full rounded-md h-10 pl-10  border-slate-300 focus:bg-white transition-all "
            />
          </div>
          {/* Last Name */}
          <div className="relative">
            <User className="absolute left-3.5 top-3 size-4 text-slate-400" />
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className="w-full rounded-md h-10 pl-10  border-slate-300 focus:bg-white transition-all "
            />
          </div>
          {/* Email - Full Width */}
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 size-4 text-slate-400" />
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full rounded-md h-10 pl-10  border-slate-300 focus:bg-white transition-all "
            />
          </div>

          {/* Role Select */}
          <div className="space-y-1.5">
            <Select
              onValueChange={(val) => updateForm("role", val)}
              value={formData.value}
            >
              <SelectTrigger className="w-full rounded-md h-10 border-slate-300 py-5 focus:bg-white transition-all  ">
                <SelectValue
                  placeholder="Select role"
                  className="font-bold text-slate-700"
                />
              </SelectTrigger>
              <SelectContent className="rounded-md border-slate-300 shadow-xl">
                {ROLES.map((role) => (
                  <SelectItem
                    key={role.value}
                    value={role.value}
                    className="py-3 cursor-pointer text-[13px] font-medium"
                  >
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Styled Checkbox Box */}

          <div
            onClick={() => updateForm("isLimitedAll", !formData.isLimitedAll)} // Card-ai click panna toggle aagum
            className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
              formData.isLimitedAll
                ? "bg-blue-50/50 border-blue-200 "
                : "bg-slate-50/50 border-slate-300 hover:bg-slate-100"
            }`}
          >
            <div className="flex flex-col gap-0.5 ">
              <span className="text-[13px]  text-slate-700">
                Limited Access All organizations
              </span>
              {/* <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                All organizations (Present & Future)
              </span> */}
            </div>

            <Checkbox
              id="limited"
              checked={formData.isLimitedAll}
              onCheckedChange={(val) => updateForm("isLimitedAll", val)}
              // Checkbox click event card-ku pogama irukka prevent kooda pannalam (Optional)
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-lg transition-all"
            />
          </div>

          {!formData.isLimitedAll && (
            <div className="animate-in zoom-in-95  fade-in duration-200">
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 size-4 text-slate-400" />
                <Select
                  value={formData.organization}
                  onValueChange={(val) => updateForm("organization", val)}
                >
                  <SelectTrigger className="w-full rounded-xl h-10 pl-10 py-5 border-slate-300 bg-blue-50/20 ">
                    <SelectValue placeholder="Organization" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl ">
                    <SelectItem value="Testing">Testing-1</SelectItem>
                    <SelectItem value="Testing-2">Testing-2</SelectItem>
                    <SelectItem value="Testing-3">Testing-3</SelectItem>
                    <SelectItem value="Testing-4">Testing-4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* <div className="relative ">
            <DollarSign className="absolute left-3.5 top-3 size-4 text-slate-400" />
            <Input
              type="number"
              placeholder="Rate"
              className="w-full rounded-md h-10 pl-10  border-slate-300 focus:bg-white transition-all "
            />
          </div> */}
          <div
            onClick={() => updateForm("isNotify", !formData.isNotify)}
            className={`mt-2 flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none
    ${
      formData.isNotify
        ? "bg-slate-900 border-slate-800 shadow-lg shadow-slate-200"
        : "bg-slate-50 border-slate-100 hover:bg-slate-100"
    }`}
          >
            <div className="flex items-center gap-3 px-1">
              <span
                className={`text-[12px] font-black transition-colors ${
                  formData.isNotify ? "text-white" : "text-slate-600"
                }`}
              >
                Email Notifications
              </span>
              <span
                className={`text-[10px] font-bold ${
                  formData.isNotify ? "text-slate-400" : "text-slate-400"
                }`}
              >
                {formData.isNotify ? "Enabled" : "Disabled"}
              </span>
            </div>
            <Switch
              checked={formData.isNotify}
              onCheckedChange={(val) => updateForm("isNotify", val)}
              className={`transition-all ${
                formData.isNotify ? "data-[state=checked]:bg-green-400" : ""
              }`}
            />
          </div>
          {/* <div className="mt-2 flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex flex-col gap-0.5 px-1">
              <span className="text-[12px] font-black text-slate-700">
                Email Notifications to New Employee
              </span>
            </div>
            <Switch
              className="data-[state=checked]:bg-green-500"
              defaultChecked
            />
          </div> */}
        </div>
        <DialogFooter className="flex gap-2.5 sm:justify-between">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 px-4 py-2.5 text-xs font-black border rounded-2xl text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
          >
            Close
          </button>
          <RippleButton
            disabled={isPending}
            className="flex-[1.5] rounded-2xl h-11 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200"
            onClick={handleCreate}
          >
            {isPending ? "Creating..." : "Create Account"}
          </RippleButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeModal;
