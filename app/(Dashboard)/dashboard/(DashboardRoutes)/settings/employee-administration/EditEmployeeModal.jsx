import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Camera } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import RippleButton from "@/Component/RippleButton";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox"; // Checkbox maranthuraatheenga
import { Building2 } from "lucide-react";
import MultipleSelect from "react-select";
import api from "@/api";

const EditEmployeeModal = ({
  employee,
  open,
  setOpen,
  organizations,
  isLoadingOrgs,
}) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  // 1. Errors state: Field-la value illana track panna help pannum
  const [errors, setErrors] = useState({});
  // --- New States for Resend Logic ---
  const [isResending, setIsResending] = useState(false);
  // 1. Countdown-ai oru object-ah maathikonga { employeeId: seconds }
  const [countdown, setCountdown] = useState({});

  // Timer Effect: Countdown 0 aagura varai kuraitchu kittae varum
  // useEffect(() => {
  //   let timer;
  //   if (countdown > 0) {
  //     timer = setInterval(() => {
  //       setCountdown((prev) => prev - 1);
  //     }, 1000);
  //   }
  //   return () => clearInterval(timer);
  // }, [countdown]);

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "12px",
      minHeight: "44px",
      borderColor: state.isFocused ? "#09090b" : "#e2e8f0",
      boxShadow: "none",
      paddingLeft: "32px",
      backgroundColor: "transparent",
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

  // --- Corrected Timer Logic ---
  useEffect(() => {
    // Modal open-ah illana logic-ae run panna vendaam
    if (!open) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        // 1. Check if there is anything to update
        const ids = Object.keys(prev);
        if (ids.length === 0) return prev; // Ithu rerender-ai thadukkum

        const newCountdowns = { ...prev };
        let hasChanged = false;

        ids.forEach((id) => {
          if (newCountdowns[id] > 0) {
            newCountdowns[id] -= 1;
            hasChanged = true;
          } else {
            delete newCountdowns[id];
            hasChanged = true;
          }
        });

        // 2. Changes iruntha mattum puthu object anupunga
        return hasChanged ? newCountdowns : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]); // Eppovumae [open] dependency array-la fixed-ah irukanum

  // Intha specific employee-oda countdown-ai mattum edukka:
  const currentCountdown = countdown[employee?.id] || 0;

  // Resend Email Logic
  const handleResendEmail = async () => {
    if (currentCountdown > 0 || isResending) return;

    setIsResending(true);
    try {
      const data = new FormData();
      data.append("isResend", "true"); // Backend-la namma check panra key

      const res = await api.put(
        `/settings/employee-administration/update-employee/${employee.id}`,
        data,
      );

      if (res.data.success) {
        toast.success("Verification email resent successfully!"); // Mail confirm-ah send aana mattum varum
      } else {
        toast.error("Mail could not be sent!");
      }

      // 2. Intha specific employee ID-ku mattum timer set panrom
      setCountdown((prev) => ({
        ...prev,
        [employee?.id]: 60,
      })); // 1 minute cooldown start panrom
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to resend email";
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    // hourlyRate:'0',
    isNotify: true,
    isLimitedAll: true, // New field
    selectedOrgs: [], // New field
  });

  // console.log(formData);
  // console.log(selectedFile);

  const orgOptions =
    organizations?.map((org) => ({
      value: org.id,
      label: org.name,
    })) || [];

  const ROLES = [
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
    {
      label: "ORG Admin - Full administration for a specific organization.",
      value: "ORG_ADMIN",
    },
    {
      label: "ORG Tech - Technical access for a specific organization.",
      value: "ORG_TECH",
    },
  ];

  // Load Initial Data
  useEffect(() => {
    if (open && employee) {
      // Check if employee has 'ALL' access or specific orgs
      const isAll =
        employee.accessScope === "ALL" ||
        employee.organizations?.includes("ALL");

      setFormData({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        role: employee.role || "",
        // hourlyRate: employee.hourlyRate || "0",

        isNotify: employee.isNotifyEnabled ?? true,
        isLimitedAll: isAll,
        selectedOrgs: isAll ? [] : employee.organizations || [],
      });
      // DB-la already image irundha adhai preview-va set pannuvom
      setPreviewUrl(employee.employeeImage || null);
    }
  }, [employee?.id, open]);

  // Logic for Limited Access Toggle
  const handleLimitedAccessToggle = (checkedValue) => {
    setFormData((prev) => {
      let newOrgs = [...prev.selectedOrgs];
      // Condition: Uncheck panna automatic-ah 1st org select aaganum
      if (
        checkedValue === false &&
        newOrgs.length === 0 &&
        orgOptions.length > 0
      ) {
        newOrgs = [orgOptions[0].value];
      }
      return {
        ...prev,
        isLimitedAll: checkedValue,
        selectedOrgs: newOrgs,
      };
    });
  };

  // --- TanStack Mutation ---
  const mutation = useMutation({
    mutationFn: async (updatedData) => {
      // Form data prepare panrom (Image irundha image-um pogum)
      const data = new FormData();
      data.append("firstName", updatedData.firstName);
      data.append("lastName", updatedData.lastName);
      data.append("role", updatedData.role);
      data.append("isNotifyEnabled", updatedData.isNotify);
      // Access Logic for backend
      data.append("accessScope", updatedData.isLimitedAll ? "ALL" : "SPECIFIC");
      data.append(
        "organizations",
        JSON.stringify(
          updatedData.isLimitedAll ? ["ALL"] : updatedData.selectedOrgs,
        ),
      );

      if (selectedFile) {
        data.append("Employeeimage", selectedFile);
      }

      const response = await api.put(
        `/settings/employee-administration/update-employee/${employee.id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      // Success aana udane 'employees' query-ai refresh panna sollurom
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully");
      setOpen(false); // Modal close aagidum
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Update failed";
      toast.error(msg);
    },
  });

  // 2. Validation Logic: Update click pannum pothu check pannum

  const handleUpdate = () => {
    const newErrors = {};

    // Trim panni check panrom, whitespace mattum irundha error kaatum
    if (!formData.firstName?.trim()) newErrors.firstName = true;
    if (!formData.lastName?.trim()) newErrors.lastName = true;
    if (!formData.role) newErrors.role = true;

    // Edhavadhu error irundha mutate function-ai stop panniduvom
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields");
      return;
    }

    // const payload = {
    //   ...formData,
    //   accessScope: formData.isLimitedAll ? "ALL" : "SPECIFIC",
    //   organizations: formData.isLimitedAll ? ["ALL"] : formData.selectedOrgs,
    // };

    mutation.mutate(formData);
  };

  // Image selection handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // 1MB Validation
      const MAX_SIZE = 1 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        toast.error(
          "Image size is too large. Please select an image under 1MB.",
        );
        e.target.value = null; // Clear the input
        return;
      }
      setSelectedFile(file);
      // Client-side preview create panrom
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Type panna aarambicha udane, andha field-oda error-ai clear panrom
    if (errors[name]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  //   console.log(selectedEmployee);
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        // Mutation loading-la irundha modal-ai close panna vida koodathu
        if (!mutation.isPending) {
          setOpen(val);
          // FIX 2: Modal close aagum pothu errors reset panrom
          if (!val) setErrors({});
        }
      }}
    >
      <DialogContent
        // pointer-events-none apply pannuna veliya click panna close aagathu
        onPointerDownOutside={(e) => mutation.isPending && e.preventDefault()}
        onEscapeKeyDown={(e) => mutation.isPending && e.preventDefault()}
        className="sm:max-w-2xl rounded-4xl p-8 outline-none border-none shadow-2xl bg-[#f0f2f5]"
      >
        <DialogTitle className="sr-only">Edit Employee Profile</DialogTitle>

        {/* Verification Alert Banner */}
        {!employee?.isVerified && (
          <div
            className="flex items-start mt-5 gap-4 p-2 mb-2 rounded-md  border-l-4 border-yellow-400
    bg-yellow-50"
          >
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-1 shrink-0" />
            <div className="text-[13px] font-medium text-yellow-900">
              <span className="font-bold capitalize">
                {formData.firstName} {formData.lastName}'s
              </span>{" "}
              account has not been verified. Until it is verified, they will be
              unable to login.{" "}
              <button
                onClick={handleResendEmail}
                disabled={currentCountdown > 0 || isResending}
                className={`${currentCountdown > 0 || isResending ? "text-slate-400 cursor-not-allowed" : "cursor-pointer font-bold hover:underline "}`}
              >
                {isResending
                  ? "Sending..."
                  : currentCountdown > 0
                    ? `Resend available in ${currentCountdown}s`
                    : "Resend their verification email"}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-10 mt-4">
          {/* Image Section - Disable camera button during loading */}
          {/* LEFT SIDE: Image Upload Section */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl text-4xl">
                {/* 1. previewUrl irundha image kaatum (select panna image or DB image) */}
                <AvatarImage src={previewUrl} className="object-cover" />
                {/* 2. Image ethuvumae illana initials kaatum */}
                <AvatarFallback className="bg-orange-500 text-2xl md:text-5xl text-white font-black ">
                  {formData.firstName?.[0]?.toUpperCase()}
                  {formData.lastName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Invisible File Input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <button
                disabled={mutation.isPending}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 -right-1 p-2.5 bg-white cursor-pointer rounded-full shadow-lg hover:bg-slate-50 border border-slate-100 transition-transform active:scale-90"
              >
                <Camera size={20} className="text-slate-600" />
              </button>
            </div>
          </div>
          {/* RIGHT SIDE: Inputs Section */}
          <div className="flex-1 space-y-6">
            <div className="relative">
              <label
                //   className="absolute -top-2.5 left-3 px-1 bg-[#f0f2f5] text-[12px] font-medium text-slate-500 z-10"
                className="absolute -top-2.5 left-3 px-1 bg-[#f0f2f5] text-[13px]  text-slate-700  z-10"
              >
                First name
              </label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                // Error irundha red border and ring apply aagum
                className={`w-full rounded-lg h-12 bg-transparent transition-all ${
                  errors.firstName
                    ? "border-red-500  focus-visible:ring-red-300"
                    : "border-slate-300"
                }`}
              />
            </div>
            <div className="relative">
              <label
                //   className="absolute -top-2.5 left-3 px-1 bg-[#f0f2f5] text-[12px] font-medium text-slate-500 z-10"
                className="absolute -top-2.5 left-3 px-1 bg-[#f0f2f5] text-[13px]  text-slate-700  z-10"
              >
                Last name
              </label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full rounded-lg h-12 bg-transparent transition-all ${
                  errors.lastName
                    ? "border-red-500  focus-visible:ring-red-300"
                    : "border-slate-300"
                }`}
              />
            </div>
            <div className="relative">
              <label
                //   className="absolute -top-2.5 left-3 px-1 bg-[#f0f2f5] text-[12px] font-medium text-slate-500 z-10"
                className="absolute -top-2.5 left-3 px-1 bg-[#f0f2f5] text-[13px]  text-slate-400  z-10"
              >
                Email
              </label>
              <Input
                value={formData.email}
                disabled
                onChange={handleChange}
                className="w-full rounded-lg h-12 border-slate-300 bg-transparent "
              />
              {/* <p className="text-[11px] text-slate-500 mt-2 px-1">
                Tell {formData.firstName} to
                <span className="underline cursor-pointer font-bold">
                  login in order to update their email address.
                </span>
              </p> */}
            </div>

            {/* Role Select Section (After Role Select) */}
            <div
              onClick={() => handleLimitedAccessToggle(!formData.isLimitedAll)}
              className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${formData.isLimitedAll ? "bg-blue-50/50 border-blue-200" : "bg-white border-slate-300 hover:bg-slate-50"}`}
            >
              <span className="text-[13px] text-slate-700 font-medium">
                Limited Access All organizations
              </span>
              <Checkbox
                checked={formData.isLimitedAll}
                onCheckedChange={handleLimitedAccessToggle}
                onClick={(e) => e.stopPropagation()}
                className="h-5 w-5 border-slate-300 data-[state=checked]:bg-blue-600 rounded-lg"
              />
            </div>

            {!formData.isLimitedAll && (
              <div className="relative animate-in fade-in zoom-in-95">
                <Building2 className="absolute left-3.5 top-3.5 size-4 text-slate-400 z-10" />
                <MultipleSelect
                  options={orgOptions}
                  styles={selectStyles}
                  isMulti
                  placeholder="Select Organizations..."
                  isLoading={isLoadingOrgs}
                  value={orgOptions.filter((opt) =>
                    formData.selectedOrgs.includes(opt.value),
                  )}
                  onChange={(selected) => {
                    const values = selected ? selected.map((x) => x.value) : [];
                    if (values.length === 0) {
                      // Condition: All remove pannuna automatic-ah Limited Access checked aaganum
                      setFormData((prev) => ({
                        ...prev,
                        selectedOrgs: [],
                        isLimitedAll: true,
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        selectedOrgs: values,
                      }));
                    }
                  }}
                />
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <span className="text-[14px] font-bold text-slate-700">
                Send email notifications to this user
              </span>
              <Switch
                checked={formData.isNotify}
                onCheckedChange={(val) =>
                  setFormData((prev) => ({ ...prev, isNotify: val }))
                }
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button
            disabled={mutation.isPending}
            onClick={() => setOpen(false)}
            className="px-6 py-2.5 text-sm font-bold border-2 border-slate-200 bg-white rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <RippleButton
            disabled={mutation.isPending}
            onClick={handleUpdate}
            // className="px-8 py-2.5 text-sm font-bold bg-[#0082a3] text-white rounded-lg hover:bg-[#006e8a] shadow-md"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </RippleButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeModal;
