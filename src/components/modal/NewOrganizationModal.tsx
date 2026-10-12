import { useCreateOrganizationMutation } from "@/redux/api/adminApi";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import InputField from "../ui/InputField";
import { CustomModal } from "./CustomModal";

interface NewOrganizationModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewOrganizationModal({
  open,
  onClose,
}: NewOrganizationModalProps) {
  const [createOrganization, { isLoading }] = useCreateOrganizationMutation();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    companyName: "",
    slug: "",
    type: "",
    status: "",
    plan: "",
    billingEmail: "",
    billingName: "",
    maxUsers: "",
    maxAssessments: "",
    maxReports: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["maxUsers", "maxAssessments", "maxReports"].includes(name)
        ? Number(value)
        : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async () => {
    setErrors({});
    try {
      await createOrganization(form).unwrap();
      toast.success("Organization created successfully!");
      resetForm();
      onClose();
    } catch (error: any) {
      if (error?.data?.errors) {
        const newErrors: Record<string, string> = {};
        error.data.errors.forEach((err: any) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error("Failed to create organization:", error);
      }
    }
  };

  const resetForm = () => {
    setForm({
      companyName: "",
      slug: "",
      type: "",
      status: "",
      plan: "",
      billingEmail: "",
      billingName: "",
      maxUsers: "",
      maxAssessments: "",
      maxReports: "",
      notes: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title="New Organization"
      maxWidth="3xl"
      actions={[
        {
          label: "Cancel",
          onClick: handleClose,
          variant: "secondary",
        },
        {
          label: isLoading ? "Creating..." : "Create Organization",
          onClick: handleSubmit,
          variant: "primary",
        },
      ]}
    >
      <div className="space-y-6">
        {/* Rest of the form remains unchanged */}
        <div className="flex flex-col gap-2">
          <label className="text-base md:text-lg font-bold text-title">
            Organization Name <span className="text-red-500">*</span>
          </label>
          <InputField
            type="text"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            placeholder="Type org name"
            error={errors.companyName}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-base md:text-lg font-bold text-title">
              Slug
            </label>
            <InputField
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="e.g. acme-immigration"
              error={errors.slug}
            />
          </div>
          <div className="flex flex-col gap-2 relative">
            <label className="text-base md:text-lg font-bold text-title">
              Org Type
            </label>
            <div className="relative">
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[#e9e9ef] bg-white text-base text-title appearance-none focus:outline-none focus:ring-1 focus:ring-[#1bd254]"
              >
                <option value="">Select Type</option>
                <option value="enterprise">Enterprise</option>
                <option value="consultant">Immigration Consultant</option>
                <option value="lawyer">Immigration Lawyer</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0a0b0] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 relative">
            <label className="text-base md:text-lg font-bold text-title">
              Status
            </label>
            <div className="relative">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[#e9e9ef] bg-white text-base text-title appearance-none focus:outline-none focus:ring-1 focus:ring-[#1bd254]"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0a0b0] pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-2 relative">
            <label className="text-base md:text-lg font-bold text-title">
              Plan
            </label>
            <div className="relative">
              <select
                name="plan"
                value={form.plan}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[#e9e9ef] bg-white text-base text-title appearance-none focus:outline-none focus:ring-1 focus:ring-[#1bd254]"
              >
                <option value="">Select Plan</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0a0b0] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-base md:text-lg font-bold text-title">
              Billing Email
            </label>
            <InputField
              type="email"
              name="billingEmail"
              value={form.billingEmail}
              onChange={handleChange}
              placeholder="e.g. billing@acme.com"
              error={errors.billingEmail}
            />
            {errors.billingEmail && (
              <span className="text-red-500 text-base md:text-lg">
                {errors.billingEmail}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-base md:text-lg font-bold text-title">
              Billing Name
            </label>
            <InputField
              type="text"
              name="billingName"
              value={form.billingName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              error={errors.billingName}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-base md:text-lg font-bold text-title">
              Max Users
            </label>
            <InputField
              type="number"
              name="maxUsers"
              value={form.maxUsers}
              onChange={handleChange}
              placeholder="Max Users"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-base md:text-lg font-bold text-title">
              Max Assessments/Month
            </label>
            <InputField
              type="number"
              name="maxAssessments"
              value={form.maxAssessments}
              onChange={handleChange}
              placeholder="Max Assessments"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-base md:text-lg font-bold text-title">
              Max Reports/Month
            </label>
            <InputField
              type="number"
              name="maxReports"
              value={form.maxReports}
              onChange={handleChange}
              placeholder="Max Reports"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base md:text-lg font-bold text-title">
            Notes
          </label>
          <InputField
            type="textarea"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Describe the purpose..."
            className="h-[100px]"
          />
        </div>
      </div>
    </CustomModal>
  );
}
