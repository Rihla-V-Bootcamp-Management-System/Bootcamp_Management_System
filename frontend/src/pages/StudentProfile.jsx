import { useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Lock,
  Edit3,
  KeyRound,
  X,
} from "lucide-react";
import useAuth from "../context/useAuth";

function StudentProfile() {
  const { user } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const studentName = user?.name || "Student";
  const studentEmail = user?.email || "No email available";
  const studentRole = user?.role || "Student";

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          My Profile
        </h1>

        <p className="mt-2 text-gray-600">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Personal Details */}
        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">

          <div className="flex items-center gap-3 border-b pb-5">
            <div className="rounded-lg bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Personal Details
              </h2>

              <p className="text-sm text-gray-500">
                Your personal information
              </p>
            </div>
          </div>

          {/* Information */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Full Name
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {studentName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="mt-1 flex items-center gap-2 font-medium text-gray-900">
                <Mail className="h-4 w-4 text-gray-400" />
                {studentEmail}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Role
              </p>

              <p className="mt-1 font-medium capitalize text-gray-900">
                {studentRole}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Account
              </p>

              <p className="mt-1 font-medium text-green-600">
                Active
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-6 flex justify-end border-t pt-5">
            <button
              onClick={() => setShowEditProfile(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Account Information */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-5">
            <div className="rounded-lg bg-green-100 p-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Account Information
              </h2>

              <p className="text-sm text-gray-500">
                Account details
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-sm text-gray-500">
                Role
              </p>

              <p className="mt-1 font-medium capitalize text-gray-900">
                {studentRole}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="mt-1 break-all font-medium text-gray-900">
                {studentEmail}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Status
              </p>
              <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Password & Security */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Lock className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Password & Security
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Keep your account secure by using a strong password.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowChangePassword(true)}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            <KeyRound className="h-4 w-4" />
            Change Password
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Profile
              </h2>

              <button
                onClick={() => setShowEditProfile(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  defaultValue={studentName}
                  className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"/>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  defaultValue={studentEmail}
                  className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditProfile(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>

              <button
                onClick={() => setShowEditProfile(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Change Password
              </h2>

              <button
                onClick={() => setShowChangePassword(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Current Password
                </label>

                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"/>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  New Password
                </label>

                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => setShowChangePassword(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" >
                Cancel
              </button>

              <button
                onClick={() => setShowChangePassword(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default StudentProfile;