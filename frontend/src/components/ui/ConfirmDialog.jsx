import React from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";

export function ConfirmDialog({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-10 animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="absolute right-4 top-4 rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:bg-[#070e1b] hover:text-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              variant === "danger"
                ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
            }`}
          >
            <AlertTriangle size={22} />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            size="md"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
