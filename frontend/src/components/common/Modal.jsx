import { useEffect } from "react";
import { X } from "lucide-react";
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "md"
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl"
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {
    /* Backdrop */
  }
      <div
    className="fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs transition-opacity"
    onClick={onClose}
    aria-hidden="true"
  />

      {
    /* Modal Card */
  }
      <div
    className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white dark:bg-[#0b0d15] rounded-3xl shadow-2xl border border-[#E8E5EE] dark:border-slate-800 overflow-hidden transform transition-all z-10 theme-transition`}
    role="dialog"
    aria-modal="true"
  >
        {
    /* Header */
  }
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-950/80 theme-transition">
          <div>
            <h3 className="text-base font-bold text-[#15131D] dark:text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#686476] dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
    onClick={onClose}
    className="p-1.5 rounded-xl text-[#8E8A9C] hover:text-[#15131D] dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
    aria-label="Close dialog"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Content */
  }
        <div className="p-6 max-h-[80vh] overflow-y-auto text-[#15131D] dark:text-slate-100">{children}</div>
      </div>
    </div>;
};
export {
  Modal
};
