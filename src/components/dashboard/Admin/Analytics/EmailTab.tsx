"use client";

import React, { useState } from "react";
import { Plus, RotateCcw, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { NewEmailTemplateModal } from "@/components/modal/NewEmailTemplateModal";

interface EmailTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  trigger: string;
  sentCount: number;
}

const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "tpl-1",
    name: "Welcome Email",
    badge: "Welcome Email",
    description:
      "Welcome to IMMICA — Your Canadian Immigration Journey Starts Here",
    trigger: "When a new user registers",
    sentCount: 0,
  },
  {
    id: "tpl-2",
    name: "Assessment Completed",
    badge: "Assessment Completed",
    description:
      "Your {{assessment_type}} Assessment is Complete — Score: {{score}}/100",
    trigger: "When a user completes an assessment",
    sentCount: 3,
  },
  {
    id: "tpl-3",
    name: "Payment Confirmation",
    badge: "Payment Confirmation",
    description: "Payment Confirmed — {{product}} ({{amount}})",
    trigger: "Immediately after a successful payment",
    sentCount: 1,
  },
];

export function EmailTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(
    DEFAULT_EMAIL_TEMPLATES
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  );

  const topCards = [
    { label: "ACTIVE SEQUENCES", value: "6", color: "text-[#00a859]" },
    { label: "TOTAL TEMPLATES", value: "6", color: "text-[#111827]" },
    { label: "EMAILS SENT", value: "5", color: "text-[#00a859]" },
    { label: "FAILED", value: "0", color: "text-[#111827]" },
  ];

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template deleted successfully");
  };

  const handleResend = (name: string) => {
    toast.success(`Triggered test email for ${name}`);
  };

  const handleEdit = (tpl: EmailTemplate) => {
    setEditingTemplate(tpl);
    setIsModalOpen(true);
  };

  const handleSaveTemplate = (updatedTpl: EmailTemplate) => {
    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === updatedTpl.id ? updatedTpl : t))
      );
    } else {
      setTemplates((prev) => [updatedTpl, ...prev]);
    }
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      <NewEmailTemplateModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
        initialData={editingTemplate}
      />

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topCards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-2xs border border-[#ececf2] flex flex-col items-center justify-center min-h-[130px] transition-all hover:border-gray-300"
          >
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-2 text-center">
              {card.label}
            </span>
            <span className={`text-3xl sm:text-4xl font-extrabold ${card.color}`}>
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Email Templates Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-xs text-gray-500 font-normal">
            Templates are automatically triggered based on user journey events.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingTemplate(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#00a859] hover:bg-[#00924e] text-white text-xs font-semibold rounded-lg transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Template</span>
          </button>
        </div>

        {/* Template Cards List */}
        <div className="space-y-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl p-6 border border-[#ececf2] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-300 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-[#00a859] shrink-0" />
                  <h4 className="text-sm sm:text-base font-bold text-[#111827]">
                    {tpl.name}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#e8f7ee] text-[#00a859]">
                    {tpl.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-normal pl-4.5 mt-1">
                  {tpl.description}
                </p>
                <p className="text-[11px] text-gray-400 pl-4.5 mt-0.5">
                  {tpl.trigger}
                </p>
              </div>

              <div className="flex items-center gap-5 self-end sm:self-center shrink-0">
                <span className="text-xs text-gray-400 font-normal mr-2">
                  {tpl.sentCount} sent
                </span>
                <button
                  type="button"
                  onClick={() => handleResend(tpl.name)}
                  className="p-1 text-[#00a859] hover:opacity-75 transition-opacity cursor-pointer"
                  title="Resend / Trigger"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(tpl)}
                  className="p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  title="Edit Template"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tpl.id)}
                  className="p-1 text-[#fca5a5] hover:text-red-500 transition-colors cursor-pointer"
                  title="Delete Template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmailTab;
