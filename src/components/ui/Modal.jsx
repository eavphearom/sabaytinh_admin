import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) {
  const [present, setPresent] = useState(isOpen);

  if (isOpen && !present) setPresent(true);

  useEffect(() => {
    if (isOpen || !present) return;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 180;
    const timer = window.setTimeout(() => setPresent(false), duration);
    return () => window.clearTimeout(timer);
  }, [isOpen, present]);

  if (!isOpen && !present) return null;
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl",
  };
  return (
    <div
      inert={!isOpen ? true : undefined}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#03152B]/50 p-4 motion-reduce:animate-none ${
        isOpen
          ? "animate-[modalOverlayIn_250ms_ease-out_both]"
          : "animate-[modalOverlayOut_180ms_ease-in_both]"
      }`}
    >
      <div
        className={`flex max-h-[90vh] w-full ${sizes[size]} flex-col overflow-hidden rounded-lg border border-[#D7DFEA] bg-white shadow-xl motion-reduce:animate-none ${
          isOpen
            ? "animate-[modalDropIn_250ms_cubic-bezier(0.16,1,0.3,1)_both]"
            : "animate-[modalDropOut_180ms_ease-in_both]"
        }`}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-[#E5EAF1] p-4">
          <h2 className="text-lg font-semibold text-[#03152B]">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 cursor-pointer text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#03152B]"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal content */}
        <div className="overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden">{children}</div>
      </div>
    </div>
  );
}
