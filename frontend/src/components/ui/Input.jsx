import React from "react";

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = "",
  containerClassName = "",
  id,
  required,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Icon size={16} />
          </div>
        )}

        <input
          id={inputId}
          required={required}
          className={`w-full rounded-xl border bg-white py-2.5 text-xs text-slate-900 shadow-xs outline-none transition-all focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed] disabled:bg-slate-100 disabled:text-slate-400 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-white dark:focus:border-[#1f6f5b] dark:focus:ring-[#1f6f5b]/30 placeholder:text-slate-400 dark:placeholder:text-slate-600 ${
            Icon ? "pl-9" : "pl-3.5"
          } pr-3.5 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-100 dark:border-red-500"
              : "border-slate-200 dark:border-[#15253f]"
          } ${className}`}
          {...props}
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}

export default Input;
