"use client";

import React, { useState } from "react";
import { X, ChevronDown, Eye } from "lucide-react";
import { toast } from "sonner";

interface NewEmailTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (template: any) => void;
  initialData?: any;
}

export function NewEmailTemplateModal({
  open,
  onClose,
  onSave,
  initialData,
}: NewEmailTemplateModalProps) {
  const [templateName, setTemplateName] = useState("");
  const [fromName, setFromName] = useState("IMMICA");
  const [triggerEvent, setTriggerEvent] = useState("Welcome Email");
  const [sendDelay, setSendDelay] = useState("0");
  const [subjectLine, setSubjectLine] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isActive, setIsActive] = useState(true);

  React.useEffect(() => {
    if (initialData) {
      setTemplateName(initialData.name || "");
      setTriggerEvent(initialData.badge || "Welcome Email");
      setSubjectLine(initialData.description || "");
      setEmailBody(initialData.body || "Hello {{name}},\n\nYour immigration journey with IMMICA is underway.");
    } else {
      setTemplateName("");
      setFromName("IMMICA");
      setTriggerEvent("Welcome Email");
      setSendDelay("0");
      setSubjectLine("");
      setEmailBody("");
      setIsActive(true);
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTemplate = {
      id: initialData?.id || `tpl-${Date.now()}`,
      name: templateName.trim() || "Custom Template",
      badge: triggerEvent,
      description: subjectLine.trim() || "Automated Email Notification",
      trigger: initialData?.trigger || `When ${triggerEvent.toLowerCase()} occurs`,
      sentCount: initialData?.sentCount ?? 0,
    };

    if (onSave) {
      onSave(updatedTemplate);
    }
    toast.success(initialData ? "Template updated successfully" : "New email template created successfully");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#111827]">
            New Email Template
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Template Name & From Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                TEMPLATE NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Welcome Email"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00a859] focus:border-[#00a859] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                FROM NAME
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00a859] focus:border-[#00a859] transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Trigger Event & Send Delay */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                TRIGGER EVENT
              </label>
              <div className="relative">
                <select
                  value={triggerEvent}
                  onChange={(e) => setTriggerEvent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#111827] appearance-none focus:outline-none focus:ring-1 focus:ring-[#00a859] focus:border-[#00a859] transition-colors cursor-pointer"
                >
                  <option value="Welcome Email">Welcome Email</option>
                  <option value="Assessment Completed">Assessment Completed</option>
                  <option value="Payment Confirmation">Payment Confirmation</option>
                  <option value="Consultation Booked">Consultation Booked</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                SEND DELAY (HOURS)
              </label>
              <input
                type="number"
                value={sendDelay}
                onChange={(e) => setSendDelay(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#00a859] focus:border-[#00a859] transition-colors"
              />
              <span className="text-[11px] text-gray-400 block">
                0 = send immediately
              </span>
            </div>
          </div>

          {/* Row 3: Subject Line */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              SUBJECT LINE
            </label>
            <input
              type="text"
              value={subjectLine}
              onChange={(e) => setSubjectLine(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#00a859] focus:border-[#00a859] transition-colors"
            />
          </div>

          {/* Row 4: Email Body with Preview Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                EMAIL BODY
              </label>
              <button
                type="button"
                onClick={() => toast.info(`Subject: ${subjectLine}\nBody: ${emailBody}`)}
                className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-white text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#00a859] focus:border-[#00a859] transition-colors resize-none font-normal"
            />
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer accent-[#2563eb]"
            />
            <label
              htmlFor="isActive"
              className="text-xs font-semibold text-gray-700 cursor-pointer select-none"
            >
              Active (will send automatically when triggered)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl border border-[#00a859] text-[#00a859] text-sm font-medium hover:bg-emerald-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#00a859] hover:bg-[#00924e] text-white text-sm font-medium transition-colors shadow-2xs"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewEmailTemplateModal;
