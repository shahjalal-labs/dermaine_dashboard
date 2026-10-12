"use client";

interface ModalAction {
  label: string;
  onClick: (data?: any) => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  actions?: ModalAction[];
  title?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-4xl",
  full: "max-w-full",
};
export const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  children,
  actions = [],
  title,
  maxWidth = "2xl",
  showCloseButton = true,
  closeOnOutsideClick = true,
}) => {
  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 "
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/30 "></div>

      <div
        className={`relative bg-background text-title shadow-lg rounded-xl w-full ${maxWidthClasses[maxWidth]} overflow-hidden max-h-[85vh] flex flex-col z-10`}
      >
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center p-6 pb-4 ">
            {title && <h2 className="text-xl font-bold text-title">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-description hover:bg-red-200 p-1  bg-red-100 rounded-full hover:text-[#2f2f37] transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {actions.length > 0 && (
          <div className="flex justify-end gap-3 p-6 pt-4 ">
            {actions.map((btn, i) => (
              <button
                key={i}
                onClick={() => btn.onClick()}
                className={`px-8 py-3 font-medium transition-colors rounded-2xl ${
                  btn.variant === "primary"
                    ? "bg-primary text-white hover:bg-primary/80 transition-colors"
                    : "border border-primary text-title hover:bg-primary/20  transition-colors duration-300 ease-in"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
