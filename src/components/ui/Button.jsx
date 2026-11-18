import { RefreshCw } from "lucide-react";

const variants = {
  primary: "bg-[#F97316] text-white hover:bg-[#EA580C]",
  secondary: "border border-[#D7DFEA] bg-white text-[#03152B] hover:bg-[#F7F9FC]",
  warning: "bg-amber-50 text-amber-700 hover:bg-amber-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#03152B]",
  ghostBrand: "text-[#64748B] hover:bg-[#FFF7ED] hover:text-[#F97316]",
  ghostDanger: "text-[#64748B] hover:bg-red-50 hover:text-red-600",
  plain: "",
};

const sizes = {
  md: "px-4 py-2",
  sm: "px-3 py-2",
  icon: "h-9 w-9 shrink-0 p-0",
  iconSm: "h-8 w-8 shrink-0 p-0",
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  className = "",
  ...props
}) {
  const iconOnly = size === "icon" || size === "iconSm";

  return (
    <button
      // Forward aria-label, title, form, ref, and other native button props.
      {...props}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || props["aria-busy"]}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold
        transition-all duration-200 cursor-pointer disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]
        ${sizes[size] || sizes.md}
        ${variants[variant] || ""}
        ${loading && variant === "primary" ? "!bg-[#FB923C] !shadow-none" : ""}
        ${className}
      `}
    >
      {/* Replace the icon while loading so square buttons keep their size. */}
      {!(loading && iconOnly) && children}
      {loading && <RefreshCw size={18} className="shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
    </button>
  );
}
