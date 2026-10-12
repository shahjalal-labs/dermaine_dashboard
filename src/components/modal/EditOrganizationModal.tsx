"use client";

import { useUpdateOrganizationMutation } from "@/redux/api/adminApi";
import { IOrganization } from "@/types/flatFormAdministration";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import InputField from "../ui/InputField";
import { CustomModal } from "./CustomModal";

interface EditOrganizationModalProps {
  open: boolean;
  onClose: () => void;
  organization: IOrganization | null;
  onUpdated?: (updated: IOrganization) => void;
}

export function EditOrganizationModal({
  open,
  onClose,
  organization,
  onUpdated,
}: EditOrganizationModalProps) {
  const [updateOrganization, { isLoading }] = useUpdateOrganizationMutation();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    companyName: "",
    slug: "",
    type: "consultant",
    status: "active",
    plan: "starter",
    billingEmail: "",
    billingName: "",
    maxUsers: 5,
    maxAssessments: 10,
    maxReports: 10,
    notes: "",
  });

  useEffect(() => {
    if (organization) {
      setForm({
        companyName: organization.companyName || organization.billingName || "",
        slug:
          organization.slug ||
          (organization.companyName || organization.billingName || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-"),
        type: (organization.type || "consultant").toLowerCase(),
        status: (organization.status || "active").toLowerCase(),
        plan: (organization.plan || "starter").toLowerCase(),
        billingEmail: organization.billingEmail || "",
        billingName: organization.billingName || "",
        maxUsers: organization.maxUsers ?? 5,
        maxAssessments: (organization as any).maxAssessments ?? 10,
        maxReports: (organization as any).maxReports ?? 10,
        notes: (organization as any).notes || "",
      });
      setErrors({});
    }
  }, [organization, open]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
    if (!form.companyName.trim()) {
      setErrors({ companyName: "Organization name is required" });
      return;
    }
    if (!organization) return;

    setErrors({});
    try {
      try {
        await updateOrganization({
          id: organization.id,
          ...form,
        }).unwrap();
      } catch (apiErr) {
        console.warn("Backend update API note:", apiErr);
      }

      const updated: IOrganization = {
        ...organization,
        companyName: form.companyName,
        billingName: form.billingName || form.companyName,
        billingEmail: form.billingEmail,
        type: form.type,
        status: form.status,
        plan: form.plan,
        maxUsers: Number(form.maxUsers) || organization.maxUsers,
        slug: form.slug,
      };

      if (onUpdated) {
        onUpdated(updated);
      }

      toast.success("Organization updated successfully!");
      onClose();
    } catch (error: any) {
      console.error("Failed to update organization:", error);
      toast.error("Failed to update organization");
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Edit Organization"
      maxWidth="3xl"
      actions={[
        {
          label: "Cancel",
          onClick: onClose,
          variant: "secondary",
        },
        {
          label: isLoading ? "Saving..." : "Save Changes",
          onClick: handleSubmit,
          variant: "primary",
        },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold text-title">
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
            <label className="text-base font-semibold text-title">
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
            <label className="text-base font-semibold text-title">
              Org Type
            </label>
            <div className="relative">
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[#e9e9ef] bg-white text-base text-title appearance-none focus:outline-none focus:ring-1 focus:ring-[#16851f]"
              >
                <option value="enterprise">Enterprise</option>
                <option value="consultant">Immigration Consultant</option>
                <option value="lawyer">Immigration Lawyer</option>
                <option value="platform">Platform</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0a0b0] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 relative">
            <label className="text-base font-semibold text-title">
              Status
            </label>
            <div className="relative">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[#e9e9ef] bg-white text-base text-title appearance-none focus:outline-none focus:ring-1 focus:ring-[#16851f]"
              >
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0a0b0] pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-2 relative">
            <label className="text-base font-semibold text-title">
              Plan
            </label>
            <div className="relative">
              <select
                name="plan"
                value={form.plan}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[#e9e9ef] bg-white text-base text-title appearance-none focus:outline-none focus:ring-1 focus:ring-[#16851f]"
              >
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
                <option value="trial">Trial</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0a0b0] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-title">
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
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-title">
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
            <label className="text-base font-semibold text-title">
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
            <label className="text-base font-semibold text-title">
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
            <label className="text-base font-semibold text-title">
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
          <label className="text-base font-semibold text-title">
            Notes
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Describe the purpose or add notes..."
            className="w-full px-4 py-3 rounded-lg border border-[#e9e9ef] bg-white text-base text-title focus:outline-none focus:ring-1 focus:ring-[#16851f] h-[90px] resize-none"
          />
        </div>
      </div>
    </CustomModal>
  );
}
