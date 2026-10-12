import React, { useState } from "react";
import { Copy, Edit2, Trash2 } from "lucide-react";
import { NewEmailTemplateModal } from "@/components/modal/NewEmailTemplateModal";

export interface WorkflowItem {
  id?: string | number;
  name: string;
  tag: string;
  description: string;
  subDescription?: string;
  link?: string;
  metricLabel: string;
  onCopy?: () => void;
  onCheck?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface WorkflowListProps {
  title?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  items: WorkflowItem[];
}

export function WorkflowList({
  title,
  buttonText,
  onButtonClick,
  items,
}: WorkflowListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full">
      <NewEmailTemplateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {(title || buttonText) && (
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          {title && (
            <p className="text-xl md:text-2xl text-title font-semibold">
              {title}
            </p>
          )}
          {buttonText && (
            <button
              onClick={() => {
                if (onButtonClick) onButtonClick();
                setIsModalOpen(true);
              }}
              className="h-10 px-4 bg-[#16851f] text-white text-base font-semibold rounded-lg hover:bg-[#13721a] transition-colors flex items-center gap-2 w-fit"
            >
              <span>{buttonText}</span>
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={item.id ?? i}
            className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 p-4 border border-[#e9e9ef] bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#16851f]"></div>
                <h4 className="text-base md:text-lg font-bold text-title">
                  {item.name}
                </h4>
                <span className="text-sm md:text-base bg-[#e6fcf0] text-[#16851f] font-semibold px-2 py-0.5 rounded ml-2">
                  {item.tag}
                </span>
              </div>

              <p className="text-base md:text-lg text-description ml-3.5">
                {item.description}
              </p>

              {item.subDescription && (
                <p className="text-sm md:text-base text-[#a0a0b0] ml-3.5 mt-1">
                  {item.subDescription}
                </p>
              )}

              {item.link && (
                <a
                  href="#"
                  className="text-xs text-[#0088ff] font-medium ml-3.5 mt-1 inline-block hover:underline"
                >
                  {item.link}
                </a>
              )}
            </div>

            <div className="flex items-center gap-6 ml-3.5 lg:ml-0 shrink-0">
              <span className="text-sm md:text-base text-description font-semibold">
                {item.metricLabel}
              </span>
              <div className="flex items-center gap-1">
                {item.onCopy && (
                  <button
                    onClick={item.onCopy}
                    className="p-1.5 text-description hover:text-[#2f2f37] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Copy size={20} />
                  </button>
                )}
                {item.onCheck && (
                  <button
                    onClick={item.onCheck}
                    className="p-1.5 text-[#16851f] hover:text-[#13721a] hover:bg-[#e6fcf0] rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth={2}
                      />
                    </svg>
                  </button>
                )}
                {item.onEdit && (
                  <button
                    onClick={item.onEdit}
                    className="p-1.5 text-description hover:text-[#0088ff] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={20} />
                  </button>
                )}
                {item.onDelete && (
                  <button
                    onClick={item.onDelete}
                    className="p-1.5 text-red-500 cursor-pointer hover:text-[#ff6164] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
