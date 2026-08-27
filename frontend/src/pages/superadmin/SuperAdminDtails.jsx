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
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      {/* HEADER */}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* AVATAR */}

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-900 text-2xl font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || "SA"}
          </div>

          {/* INFO */}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.name || "Super Admin"}
              </h1>

              <ShieldCheck
                size={22}
                className="text-gray-700"
              />
            </div>

            <p className="mt-1 text-sm text-gray-500">
              System Administrator
            </p>

            <span className="mt-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              SUPER ADMIN
            </span>
          </div>
        </div>
      </div>

      {/* DETAILS */}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">
          Account Information
        </h2>

        <p className="mt-1 text-sm text-gray-500">
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

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">
          System Access
        </h2>

        <p className="mt-1 text-sm text-gray-500">
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
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="rounded-lg bg-white p-3 shadow-sm">
        <Icon
          size={20}
          className="text-gray-700"
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-gray-900">
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
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
      <ShieldCheck
        size={19}
        className="text-gray-700"
      />

      <span className="text-sm font-medium text-gray-700">
        {text}
      </span>
    </div>
  );
}

export default SuperAdminDetails;