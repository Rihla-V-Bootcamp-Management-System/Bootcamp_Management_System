import React from "react";

export function Badge({ children, variant = "default", className = "", size = "md" }) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const variantStyles = {
    default:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    primary:
      "bg-[#e5f1ed] text-[#185848] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    danger:
      "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800",
    purple:
      "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.default} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
