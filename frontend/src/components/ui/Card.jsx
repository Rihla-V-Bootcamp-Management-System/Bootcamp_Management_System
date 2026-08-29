import React from "react";

export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 dark:border-[#15253f] dark:bg-[#0b1528] ${
        hover ? "hover:border-slate-300 hover:shadow-md dark:hover:border-[#223b63]" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`border-b border-slate-100 pb-4 mb-4 dark:border-[#15253f] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3 className={`text-base sm:text-lg font-bold text-slate-900 dark:text-white ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  return (
    <p className={`mt-1 text-xs text-slate-500 dark:text-slate-400 ${className}`} {...props}>
      {children}
    </p>
  );
}

export default Card;
