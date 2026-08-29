import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  User,
  CalendarDays,
} from "lucide-react";

import useAuth from "../../context/useAuth";

function SuperAdminDetails() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* BACK */}

      <button
        type="button"
        onClick={() => navigate("/superadmin")}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-slate-900 dark:text-white"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      {/* HEADER */}

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* AVATAR */}

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1f6f5b] text-2xl font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || "SA"}
          </div>

          {/* INFO */}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {user?.name || "Super Admin"}
              </h1>

              <ShieldCheck
                size={22}
                className="text-gray-700 dark:text-slate-200"
              />
            </div>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              System Administrator
            </p>

            <span className="mt-3 inline-flex rounded-full bg-gray-100 dark:bg-[#070e1b] px-3 py-1 text-xs font-semibold text-gray-700 dark:text-slate-200">
              SUPER ADMIN
            </span>
          </div>
        </div>
      </div>

      {/* DETAILS */}

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Account Information
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Your Super Admin account details.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* NAME */}

          <DetailCard
            icon={User}
            label="Full Name"
            value={user?.name || "—"}
          />

          {/* EMAIL */}

          <DetailCard
            icon={Mail}
            label="Email Address"
            value={user?.email || "—"}
          />

          {/* ROLE */}

          <DetailCard
            icon={ShieldCheck}
            label="Role"
            value={user?.role || "superadmin"}
          />

          {/* CREATED */}

          <DetailCard
            icon={CalendarDays}
            label="Account Created"
            value={formatDate(user?.createdAt)}
          />
        </div>
      </div>

      {/* ACCESS */}

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          System Access
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Super Admin permissions in the bootcamp management system.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <AccessItem text="Manage administrators" />

          <AccessItem text="Manage mentors" />

          <AccessItem text="Manage batches" />

          <AccessItem text="Assign students to mentors" />

          <AccessItem text="Manage system settings" />

          <AccessItem text="View audit logs" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] p-4">
      <div className="rounded-lg bg-white dark:bg-[#0b1528] p-3 shadow-sm">
        <Icon
          size={20}
          className="text-gray-700 dark:text-slate-200"
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   ACCESS ITEM
========================================================= */

function AccessItem({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-[#15253f] p-4">
      <ShieldCheck
        size={19}
        className="text-gray-700 dark:text-slate-200"
      />

      <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
        {text}
      </span>
    </div>
  );
}

export default SuperAdminDetails;