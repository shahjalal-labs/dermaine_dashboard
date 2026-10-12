"use client";

import { useEffect, useState } from "react";
import { CustomModal } from "./CustomModal";
import InputField from "../ui/InputField";
import { toast } from "sonner";

interface NewSubscriptionPlanModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (plan: any, planId?: string) => void;
  initialPlan?: any | null;
}

export function NewSubscriptionPlanModal({
  open,
  onClose,
  onSave,
  initialPlan,
}: NewSubscriptionPlanModalProps) {
  const [planName, setPlanName] = useState("");
  const [slug, setSlug] = useState("Professional");
  const [status, setStatus] = useState("Draft");
  const [sortOrder, setSortOrder] = useState("1");
  const [monthlyPrice, setMonthlyPrice] = useState("0");
  const [annualPrice, setAnnualPrice] = useState("0");
  const [maxUsers, setMaxUsers] = useState("5");
  const [maxAssessments, setMaxAssessments] = useState("100");
  const [maxReports, setMaxReports] = useState("50");
  const [maxPrograms, setMaxPrograms] = useState("25");
  const [description, setDescription] = useState("");

  const [features, setFeatures] = useState({
    aiReports: true,
    whiteLabel: false,
    apiAccess: false,
    multiCountry: false,
    customDomain: false,
    partnerPortal: false,
  });

  useEffect(() => {
    if (initialPlan) {
      setPlanName(initialPlan.name || "");
      setSlug(initialPlan.slug || "");
      setStatus(
        initialPlan.status
          ? initialPlan.status.charAt(0).toUpperCase() +
              initialPlan.status.slice(1).toLowerCase()
          : "Draft"
      );
      setSortOrder(initialPlan.sortOrder ? String(initialPlan.sortOrder) : "1");

      const monthlyMatch = String(initialPlan.price || "").match(/\d+/);
      setMonthlyPrice(monthlyMatch ? monthlyMatch[0] : "0");

      const annualMatch = String(initialPlan.annual || "").match(/\d+/);
      setAnnualPrice(annualMatch ? annualMatch[0] : "0");

      setMaxUsers(
        initialPlan.users === "Unlimited"
          ? "999"
          : String(initialPlan.users || "5")
      );
      setMaxAssessments(
        initialPlan.assessments === "Unlimited"
          ? "999"
          : String(initialPlan.assessments || "100")
      );
      setMaxReports(
        initialPlan.reports === "Unlimited"
          ? "999"
          : String(initialPlan.reports || "50")
      );
      setMaxPrograms(String(initialPlan.programs || "25"));
      setDescription(initialPlan.subtitle || "");

      if (Array.isArray(initialPlan.features)) {
        const featObj: any = {};
        initialPlan.features.forEach((f: any) => {
          const lower = (f.name || "").toLowerCase();
          if (lower.includes("ai")) featObj.aiReports = Boolean(f.included);
          if (lower.includes("white")) featObj.whiteLabel = Boolean(f.included);
          if (lower.includes("api")) featObj.apiAccess = Boolean(f.included);
          if (lower.includes("country")) featObj.multiCountry = Boolean(f.included);
          if (lower.includes("domain")) featObj.customDomain = Boolean(f.included);
          if (lower.includes("portal")) featObj.partnerPortal = Boolean(f.included);
        });
        setFeatures((prev) => ({ ...prev, ...featObj }));
      }
    } else {
      setPlanName("");
      setSlug("Professional");
      setStatus("Draft");
      setSortOrder("1");
      setMonthlyPrice("0");
      setAnnualPrice("0");
      setMaxUsers("5");
      setMaxAssessments("100");
      setMaxReports("50");
      setMaxPrograms("25");
      setDescription("");
      setFeatures({
        aiReports: true,
        whiteLabel: false,
        apiAccess: false,
        multiCountry: false,
        customDomain: false,
        partnerPortal: false,
      });
    }
  }, [initialPlan, open]);

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    if (!planName.trim()) {
      toast.error("Plan name is required");
      return;
    }

    const payload = {
      planName,
      slug,
      status,
      sortOrder: Number(sortOrder) || 1,
      monthlyPrice: Number(monthlyPrice) || 0,
      annualPrice: Number(annualPrice) || 0,
      maxUsers: Number(maxUsers) || 1,
      maxAssessments: Number(maxAssessments) || 0,
      maxReports: Number(maxReports) || 0,
      maxPrograms: Number(maxPrograms) || 0,
      description,
      features,
    };

    if (onSave) onSave(payload, initialPlan?.id);
    toast.success(
      initialPlan
        ? "Subscription plan updated successfully!"
        : "Subscription plan created in draft status!"
    );
    onClose();
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={initialPlan ? "Edit Subscription Plan" : "New Subscription Plan"}
      maxWidth="2xl"
      actions={[
        {
          label: "Cancel",
          onClick: onClose,
          variant: "secondary",
        },
        {
          label: initialPlan ? "Update Plan" : "Save Plan",
          onClick: handleSave,
          variant: "primary",
        },
      ]}
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-title">Plan Name</label>
            <InputField
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g. Professional"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-title">Slug</label>
            <InputField
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="professional"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-title">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-11 px-3.5 rounded-lg border border-[#e9e9ef] bg-white text-title text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-title">Sort Order</label>
            <InputField
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-title">Monthly Price (CAD)</label>
            <InputField
              type="number"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-title">Annual Price (CAD)</label>
            <InputField
              type="number"
              value={annualPrice}
              onChange={(e) => setAnnualPrice(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-title">Max Users</label>
            <InputField
              type="number"
              value={maxUsers}
              onChange={(e) => setMaxUsers(e.target.value)}
              placeholder="5"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-title">Max Assessments/mo</label>
            <InputField
              type="number"
              value={maxAssessments}
              onChange={(e) => setMaxAssessments(e.target.value)}
              placeholder="100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-title">Max Reports/mo</label>
            <InputField
              type="number"
              value={maxReports}
              onChange={(e) => setMaxReports(e.target.value)}
              placeholder="50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-title">Max Programs</label>
            <InputField
              type="number"
              value={maxPrograms}
              onChange={(e) => setMaxPrograms(e.target.value)}
              placeholder="25"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-title">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Type Description.."
            rows={2}
            className="w-full p-3 rounded-lg border border-[#e9e9ef] bg-white text-title text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="pt-2 border-t border-[#f1f1f5]">
          <label className="block font-bold text-title mb-3">Feature access</label>
          <div className="space-y-2.5">
            {[
              { key: "aiReports", label: "AI Reports" },
              { key: "whiteLabel", label: "White Label" },
              { key: "apiAccess", label: "API Access" },
              { key: "multiCountry", label: "Multi-country" },
              { key: "customDomain", label: "Custom Domain" },
              { key: "partnerPortal", label: "Partner Portal" },
            ].map((f) => {
              const checked = features[f.key as keyof typeof features];
              return (
                <div key={f.key} className="flex items-center justify-between py-1">
                  <span className="text-description font-medium">{f.label}</span>
                  <button
                    type="button"
                    onClick={() => toggleFeature(f.key as keyof typeof features)}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                      checked ? "bg-[#16851f]" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        checked ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CustomModal>
  );
}
