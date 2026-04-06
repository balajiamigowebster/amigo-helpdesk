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
import {
  Building2,
  Plus,
  User,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  EyeOff,
  Eye,
} from "lucide-react";
import React, { useState } from "react";
import RippleButton from "@/Component/RippleButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import {
  RefreshCw, // Suggestion icon
  ClipboardCheck, // Success icon
  Copy,
} from "lucide-react";
import { nanoid } from "nanoid";
// --- IMPORT REACT SELECT ---
import MultipleSelect from "react-select";

const AddEmployeeModal = ({ ownerId, organizations, isLoadingOrgs }) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  // 1. Errors state to track field issues
  const [errors, setErrors] = useState({});

  console.log("errors-field", errors);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
    isLimitedAll: true,
    isNotify: true,
    selectedOrgs: [],
  });
  const [showPassword, setShowPassword] = useState(false); // 1. Password toggle state

  // Convert organizations for React-Select
  const orgOptions =
    organizations?.map((org) => ({
      value: org.id,
      label: org.name,
    })) || [];

  // --- REACT SELECT CUSTOM STYLES ---
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "12px",
      minHeight: "44px",
      borderColor: state.isFocused ? "#09090b" : "#e2e8f0",
      boxShadow: "none",
      paddingLeft: "32px", // Space for the Building icon
      backgroundColor: "#f8fafc33",
      "&:hover": { borderColor: "#cbd5e1" },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 6px" }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#0f172a",
      borderRadius: "6px",
      color: "white",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "white",
      fontWeight: "600",
      fontSize: "11px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "white",
      "&:hover": { backgroundColor: "#1e293b", color: "white" },
    }),
  };

  // 1. IMPROVED VALIDATION (Returns pure boolean)
  const validateEmail = (email) => {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(String(email).toLowerCase());
  };

  // 2. Email Debounce (Wait 500ms after user stops typing)
  const [debouncedEmail] = useDebounce(formData.email, 500);

  // 3. TanStack Query for Email Validation
  const { data: emailCheck, isFetching: isCheckingEmail } = useQuery({
    queryKey: ["check-email", debouncedEmail],
    queryFn: async () => {
      // Logic inside queryFn
      const isValid = validateEmail(debouncedEmail);
      if (!debouncedEmail || !isValid) return null;

      const response = await api.get(
        "/settings/employee-administration/check-email",
        {
          params: { email: debouncedEmail },
        },
      );
      return response.data; // { success: true, exists: true/false }
    },
    enabled: Boolean(debouncedEmail && validateEmail(debouncedEmail)),
    retry: false,
    staleTime: 60000, // Same email-ai thirumba type panna 1 min varai cache irukkum
  });

  // const ROLES = [
  //   { label: "Tech - Limited ticket and settings access.", value: "Tech" },
  //   {
  //     label: "Manager - Full ticket access. Limited settings.",
  //     value: "Manager",
  //   },
  //   { label: "Admin - Full access.", value: "Admin" },
  // ];
  const ROLES = [
    // --- HDT (Help Desk Team) Roles ---
    {
      label:
        "HDT Admin - Full control over HDT Managers, Techs, and Org roles.",
      value: "HDT_ADMIN",
    },
    {
      label: "HDT Manager - Control over HDT Techs and Org level roles.",
      value: "HDT_MANAGER",
    },
    {
      label: "HDT Tech - Can view and access Org Admin and Org Tech settings.",
      value: "HDT_TECH",
    },

    // --- Organization Roles ---
    {
      label: "ORG Admin - Full administration for a specific organization.",
      value: "ORG_ADMIN",
    },
    {
      label: "ORG Tech - Technical access for a specific organization.",
      value: "ORG_TECH",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // User type panna panna error-ai clear seiya
    if (errors[name]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const updateForm = (field, value) => {
    setFormData((prev) => {
      let newData = { ...prev, [field]: value };
      // 1. "isLimitedAll" uncheck panna, 1st org-ai select seiyavum
      if (field === "isLimitedAll" && value === false) {
        if (orgOptions.length > 0) {
          newData.selectedOrgs = [orgOptions[0].value];
        }
      }
      return newData;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[field];
        return newErrs;
      });
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "",
      isLimitedAll: true,
      isNotify: true,
      selectedOrgs: [],
    });
    setErrors({});
  };

  // --- TanStack Mutation with Corrected Optimistic Update ---
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload) => {
      // payload inga FormData object
      const response = await api.post(
        "/settings/employee-administration/employee-create",
        payload,
      );
      return response.data;
    },
    onMutate: async (newEmployeeFormData) => {
      setOpen(false);
      await queryClient.cancelQueries({ queryKey: ["employees"] });
      const previousEmployees = queryClient.getQueryData(["employees"]);

      // FormData-vil irunthu values eduthu temporary state create panrom
      const firstName = newEmployeeFormData.get("firstName");
      const lastName = newEmployeeFormData.get("lastName");
      const email = newEmployeeFormData.get("email");
      const role = newEmployeeFormData.get("role");

      const optimisticId = Date.now().toString();

      queryClient.setQueryData(["employees"], (old = []) => [
        {
          id: optimisticId,
          firstName,
          lastName,
          email,
          role,
          isVerified: false,
          displayOrganizations: "Processing...",
          isOptimistic: true,
        },
        ...old,
      ]);

      // 3. Form-ai clear panniduvom
      resetForm();

      return { previousEmployees, optimisticId };
    },
    onError: (err, newEmployee, context) => {
      queryClient.setQueryData(["employees"], context.previousEmployees);
      toast.error(err.response?.data?.message || "Failed to add employee.");
    },
    onSuccess: (responseData) => {
      // Backend response data-vai vaitchu UI-ai update seivom
      queryClient.setQueryData(["employees"], (old = []) => {
        return old.map((emp) =>
          emp.isOptimistic
            ? { ...responseData.data, isOptimistic: false }
            : emp,
        );
      });

      // Refetch background-il nadakkum, but UI hide aagathu
      queryClient.invalidateQueries({ queryKey: ["employees"] });

      setOpen(false);
      resetForm();
      toast.success("Employee created successfully!");
    },
  });

  const handleCreate = () => {
    // if (
    //   !formData.firstName ||
    //   !formData.email ||
    //   !formData.role ||
    //   !formData.lastName
    // ) {
    //   toast.error("Please fill required fields");
    //   return;
    // }

    const newErrors = {};

    // Required Field Validation
    if (!formData.firstName.trim()) newErrors.firstName = true;
    if (!formData.lastName.trim()) newErrors.lastName = true;
    if (!formData.role) newErrors.role = true;

    // Password validation: Admin password type panna mattum length check pannanum

    if (formData.password.trim() !== "") {
      if (formData.password.length < 6) {
        newErrors.password = true;
        toast.error("Password must be at least 6 characters");
        setErrors(newErrors); // Error state-ai update seiyavum
        return; // Validation fail aanal stop seiyavum
      }
    }

    // Email logic with DB check
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      newErrors.email = true;
    } else if (emailCheck?.exists) {
      // Email DB-la irundha ingaye stop pannanum
      toast.error("This email is already taken!");
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields correctly");
      return;
    }

    const dataPayload = new FormData();

    // Logic: isLimitedAll true-na array-la ["ALL"] mattum irukanum
    // False-na user select panna values (formData.selectedOrgs) irukanum

    const orgsArray = formData.isLimitedAll ? ["ALL"] : formData.selectedOrgs;

    const submissionData = {
      ...formData,
      ownerId: ownerId,
      isNotifyEnabled: formData.isNotify,
      accessScope: formData.isLimitedAll ? "ALL" : "SPECIFIC",
      organizations: JSON.stringify(orgsArray),
    };

    delete submissionData.isLimitedAll;
    delete submissionData.isNotify;
    // delete submissionData.selectedOrgs; // Ithu oru array, stringify panni 'organizations' la anupittom

    Object.keys(submissionData).forEach((key) => {
      if (submissionData[key] !== undefined && submissionData[key] !== null) {
        dataPayload.append(key, submissionData[key]);
      }
    });

    mutate(dataPayload);
  };

  // 2. Unique Password Generator using Nanoid
  const generateUniquePassword = () => {
    // 12 character unique string generate pannum (letters and numbers)
    // Idhu base62 use pandradhala repeat aaga vaaippe illai
    const newPassword = nanoid(12);
    updateForm("password", newPassword);
    // setShowPassword(true); // Password-ai kaatuvom
    toast.success("Unique password suggested!");
  };

  // 3. Optional: Copy to clipboard function
  const copyToClipboard = () => {
    if (formData.password) {
      navigator.clipboard.writeText(formData.password);
      toast.success("Password copied to clipboard!");
    }
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
        <RippleButton className="cursor-pointer">
          <Plus size={18} strokeWidth={3} />
          Add employee
        </RippleButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-110 rounded-4xl p-6 outline-none border-none shadow-2xl flex flex-col overflow-hidden bg-white max-h-[95vh]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            Add New Employee
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 no-scrollbar">
          <div className="grid grid-cols-1 gap-4 py-5">
            {/* First Name */}
            <div className="relative">
              <User className="absolute left-3.5 top-3 size-4 text-slate-400" />
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                className={`w-full rounded-xl h-11 pl-10 transition-all ${
                  errors.firstName
                    ? "border-red-500  focus-visible:ring-red-300"
                    : "border-slate-200"
                }`}
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
                className={`w-full rounded-xl h-11 pl-10 transition-all ${
                  errors.lastName
                    ? "border-red-500  focus-visible:ring-red-300"
                    : "border-slate-200"
                }`}
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail
                className={`absolute left-3.5 top-3 size-4 transition-colors ${
                  emailCheck?.exists ? "text-red-500" : "text-slate-400"
                }`}
              />{" "}
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className={`w-full rounded-xl h-11 pl-10 transition-all ${
                  errors.email || emailCheck?.exists
                    ? "border-red-500  focus-visible:ring-red-300"
                    : "border-slate-200"
                }`}
              />
              {/* Status Icons inside the Input box */}
              <div className="absolute right-3.5 top-3.5 flex items-center">
                {isCheckingEmail ? (
                  <Loader2 className="size-4 animate-spin text-blue-500" />
                ) : emailCheck?.exists ? (
                  <AlertCircle className="size-4 text-red-500" />
                ) : formData.email &&
                  validateEmail(formData.email) &&
                  !isCheckingEmail ? (
                  <CheckCircle2 className="size-4 text-green-500" />
                ) : null}
              </div>
              {/* Message below input */}
              {emailCheck?.exists && (
                <p className="text-[11px] text-red-500 font-bold mt-1 ml-2 animate-in fade-in slide-in-from-top-1">
                  This email is already registered.
                </p>
              )}
            </div>

            {/* Updated Password Section */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <Label className="text-[11px] text-slate-600   tracking-wider">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={generateUniquePassword}
                  className="text-[10px] font-bold text-slate-600 hover:text-blue-700 flex cursor-pointer items-center gap-1 transition-all uppercase tracking-tighter"
                >
                  <RefreshCw
                    size={10}
                    className={isPending ? "animate-spin" : ""}
                  />
                  Suggest Unique
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 size-4 text-slate-400" />
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  autoComplete="new-password"
                  onChange={handleChange}
                  placeholder="Create password"
                  className={`w-full rounded-xl h-11 pl-10 transition-all ${
                    errors.password
                      ? "border-red-500 focus-visible:ring-red-300"
                      : "border-slate-200"
                  }`}
                />
                {formData.password.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none animate-in fade-in zoom-in-95 duration-200"
                  >
                    {showPassword ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </button>
                )}
                {errors.password && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 italic">
                    * Minimum 6 characters required
                  </p>
                )}
              </div>
            </div>

            {/* Role Select */}
            <div className="space-y-1.5">
              <Select
                onValueChange={(val) => updateForm("role", val)}
                value={formData.role}
              >
                <SelectTrigger
                  className={`w-full rounded-xl h-11 py-5.5  transition-all ${
                    errors.role ? "border-red-500 " : "border-slate-200"
                  }`}
                >
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

            {/* Access Control */}
            <div
              onClick={() => updateForm("isLimitedAll", !formData.isLimitedAll)}
              className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                formData.isLimitedAll
                  ? "bg-blue-50/50 border-blue-200"
                  : "bg-slate-50/50 border-slate-300 hover:bg-slate-100"
              }`}
            >
              <span className="text-[13px] text-slate-700">
                Limited Access All organizations
              </span>
              <Checkbox
                checked={formData.isLimitedAll}
                onCheckedChange={(val) => updateForm("isLimitedAll", val)}
                onClick={(e) => e.stopPropagation()}
                className="h-5 w-5 border-slate-300 data-[state=checked]:bg-blue-600 rounded-lg"
              />
            </div>

            {/* --- REACT SELECT FOR ORGANIZATIONS --- */}

            {!formData.isLimitedAll && (
              <div>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3.5 size-4 text-slate-400 z-10" />
                  <MultipleSelect
                    options={orgOptions}
                    styles={selectStyles}
                    isMulti
                    placeholder="Select Organizations..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isLoading={isLoadingOrgs}
                    onChange={(selected) => {
                      const values = selected
                        ? selected.map((x) => x.value)
                        : [];

                      if (values.length === 0) {
                        // Ellathaiyum remove panna, isLimitedAll-ai true aakkuvum
                        updateForm("isLimitedAll", true);
                      } else {
                        updateForm("selectedOrgs", values);
                      }
                    }}
                    value={orgOptions.filter((opt) =>
                      formData.selectedOrgs.includes(opt.value),
                    )}
                  />
                </div>
              </div>
            )}

            {/* {!formData.isLimitedAll && (
            <div className="animate-in zoom-in-95 fade-in duration-200">
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 size-4 text-slate-400" />
                <Select
                  value={formData.organization}
                  onValueChange={(val) => updateForm("organization", val)}
                >
                  <SelectTrigger className="w-full rounded-xl h-10 pl-10 py-5 border-slate-300 bg-blue-50/20">
                    <SelectValue
                      placeholder={
                        isLoadingOrgs
                          ? "Loading organizations..."
                          : "Select Organization"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {isLoadingOrgs ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2
                          className="animate-spin text-blue-500"
                          size={20}
                        />
                      </div>
                    ) : organizations?.length > 0 ? (
                      organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-xs text-slate-400">
                        No organizations found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )} */}

            {/* Notifications Switch */}
            <div
              onClick={() => updateForm("isNotify", !formData.isNotify)}
              className={`mt-2 flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                formData.isNotify
                  ? "bg-slate-900 border-slate-800 shadow-lg shadow-slate-200"
                  : "bg-slate-50 border-slate-100 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3 px-1">
                <span
                  className={`text-[12px] font-black ${
                    formData.isNotify ? "text-white" : "text-slate-600"
                  }`}
                >
                  Email Notifications
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {formData.isNotify ? "Enabled" : "Disabled"}
                </span>
              </div>
              <Switch
                checked={formData.isNotify}
                onCheckedChange={(val) => updateForm("isNotify", val)}
                className={
                  formData.isNotify ? "data-[state=checked]:bg-green-400" : ""
                }
              />
            </div>
          </div>
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
