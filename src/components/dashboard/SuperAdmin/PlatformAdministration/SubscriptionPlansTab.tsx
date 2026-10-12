"use client";

import { useState } from "react";
import { Check, Edit2, Plus, X } from "lucide-react";
import { NewSubscriptionPlanModal } from "@/components/modal/NewSubscriptionPlanModal";

interface PlanCard {
  id: string;
  name: string;
  slug: string;
  price: string;
  annual: string;
  subtitle: string;
  status: string;
  users: string;
  assessments: string;
  reports: string;
  features: {
    name: string;
    included: boolean;
  }[];
}

const DEFAULT_PLANS: PlanCard[] = [
  {
    id: "trial",
    name: "TRIAL",
    slug: "trial",
    price: "$0/mo CAD",
    annual: "",
    subtitle: "14-day free trial with core features",
    status: "DRAFT",
    users: "02",
    assessments: "20",
    reports: "05",
    features: [
      { name: "AI Reports", included: true },
      { name: "White Label", included: false },
      { name: "API Access", included: false },
      { name: "Multi Country", included: false },
      { name: "Custom Domain", included: false },
      { name: "Partner Portal", included: false },
    ],
  },
  {
    id: "starter",
    name: "STARTER",
    slug: "starter",
    price: "$149/mo CAD",
    annual: "$1490/yr",
    subtitle: "For solo consultants and small practices",
    status: "DRAFT",
    users: "03",
    assessments: "100",
    reports: "50",
    features: [
      { name: "AI Reports", included: true },
      { name: "White Label", included: false },
      { name: "API Access", included: false },
      { name: "Multi Country", included: false },
      { name: "Custom Domain", included: false },
      { name: "Partner Portal", included: false },
    ],
  },
  {
    id: "professional",
    name: "PROFESSIONAL",
    slug: "professional",
    price: "$399/mo CAD",
    annual: "$3990/yr",
    subtitle: "For growing immigration firms and agencies",
    status: "DRAFT",
    users: "10",
    assessments: "500",
    reports: "250",
    features: [
      { name: "AI Reports", included: true },
      { name: "White Label", included: true },
      { name: "API Access", included: true },
      { name: "Multi Country", included: false },
      { name: "Custom Domain", included: true },
      { name: "Partner Portal", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    slug: "enterprise",
    price: "$999/mo CAD",
    annual: "$9990/yr",
    subtitle: "For large firms, law offices, and international mobility companies",
    status: "DRAFT",
    users: "Unlimited",
    assessments: "Unlimited",
    reports: "Unlimited",
    features: [
      { name: "AI Reports", included: true },
      { name: "White Label", included: true },
      { name: "API Access", included: true },
      { name: "Multi Country", included: true },
      { name: "Custom Domain", included: true },
      { name: "Partner Portal", included: true },
    ],
  },
];

export function SubscriptionPlansTab() {
  const [plans, setPlans] = useState<PlanCard[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dermaine_platform_plans");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_PLANS;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanCard | null>(null);

  const handleSavePlan = (updatedPlan: any, planId?: string) => {
    const formatted: PlanCard = {
      id: planId || updatedPlan.slug || String(Date.now()),
      name: updatedPlan.planName.toUpperCase(),
      slug: updatedPlan.slug,
      price: `$${updatedPlan.monthlyPrice}/mo CAD`,
      annual: updatedPlan.annualPrice > 0 ? `$${updatedPlan.annualPrice}/yr` : "",
      subtitle: updatedPlan.description || "Custom SaaS package",
      status: (updatedPlan.status || "DRAFT").toUpperCase(),
      users: String(updatedPlan.maxUsers),
      assessments: String(updatedPlan.maxAssessments),
      reports: String(updatedPlan.maxReports),
      features: [
        { name: "AI Reports", included: Boolean(updatedPlan.features?.aiReports) },
        { name: "White Label", included: Boolean(updatedPlan.features?.whiteLabel) },
        { name: "API Access", included: Boolean(updatedPlan.features?.apiAccess) },
        { name: "Multi Country", included: Boolean(updatedPlan.features?.multiCountry) },
        { name: "Custom Domain", included: Boolean(updatedPlan.features?.customDomain) },
        { name: "Partner Portal", included: Boolean(updatedPlan.features?.partnerPortal) },
      ],
    };

    if (planId) {
      setPlans((prev) => {
        const next = prev.map((p) => (p.id === planId ? formatted : p));
        try { localStorage.setItem("dermaine_platform_plans", JSON.stringify(next)); } catch (e) {}
        return next;
      });
    } else {
      setPlans((prev) => {
        const next = [...prev, formatted];
        try { localStorage.setItem("dermaine_platform_plans", JSON.stringify(next)); } catch (e) {}
        return next;
      });
    }
    setEditingPlan(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-serif font-bold text-title mb-1">
            Subscription Plans
          </h3>
          <p className="text-xs md:text-sm text-[#8c8c9e]">
            Manage SaaS pricing tiers, limits, and feature access. All plans are in draft until activated.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
          className="h-10 px-5 bg-[#16851f] hover:bg-[#13721a] text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 self-start md:self-auto shadow-xs cursor-pointer"
        >
          <Plus size={18} />
          <span>+ New Plan</span>
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-2xl p-6 border border-[#f0f0f5] shadow-xs flex flex-col justify-between relative"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-title text-lg tracking-wide">
                  {plan.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#f1fcf5] text-[#16851f] border border-emerald-100">
                    {plan.status}
                  </span>
                  <button
                    onClick={() => {
                      setEditingPlan(plan);
                      setIsModalOpen(true);
                    }}
                    className="text-[#8c8c9e] hover:text-title p-1 rounded-lg transition-colors cursor-pointer"
                    title="Edit plan"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#8c8c9e] capitalize mb-4">{plan.slug}</p>

              {/* Pricing */}
              <div className="mb-4">
                <div className="text-3xl font-extrabold text-title tracking-tight">
                  {plan.price}
                </div>
                {plan.annual ? (
                  <p className="text-xs text-[#8c8c9e] mt-0.5 font-medium">{plan.annual}</p>
                ) : null}
                <p className="text-xs text-[#8c8c9e] mt-2 min-h-[32px] leading-relaxed">
                  {plan.subtitle}
                </p>
              </div>

              {/* Limits */}
              <div className="border-t border-b border-gray-100 py-3 mb-4 space-y-1.5 text-xs text-title font-medium">
                <div className="flex justify-between">
                  <span className="text-[#8c8c9e]">Users</span>
                  <span className="font-bold">{plan.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c8c9e]">Assessments/Mon</span>
                  <span className="font-bold">{plan.assessments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c8c9e]">Reports/Mon</span>
                  <span className="font-bold">{plan.reports}</span>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2">
                {plan.features.map((f, fi) => (
                  <div key={fi} className="flex items-center gap-2 text-xs">
                    {f.included ? (
                      <div className="w-4 h-4 rounded bg-[#16851f] text-white flex items-center justify-center shrink-0">
                        <Check size={11} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center shrink-0 text-transparent" />
                    )}
                    <span
                      className={`${
                        f.included ? "text-title font-medium" : "text-[#a0a0b0] line-through"
                      }`}
                    >
                      {f.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <NewSubscriptionPlanModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        initialPlan={editingPlan}
        onSave={handleSavePlan}
      />
    </div>
  );
}
