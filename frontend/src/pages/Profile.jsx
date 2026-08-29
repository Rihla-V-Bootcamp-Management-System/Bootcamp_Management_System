import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Shield,
  Phone,
  Send,
  Calendar,
  KeyRound,
  Lock,
  CheckCircle,
  Layers,
  Award,
} from "lucide-react";
import apiClient from "../services/apiClient";
import useAuth from "../context/useAuth";
import Button from "../components/ui/Button";
import Card, { CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";

function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/users/profile/me");
      setProfile(res.data.user || authUser);
    } catch (err) {
      console.error("LOAD PROFILE ERROR:", err);
      setProfile(authUser);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await apiClient.patch("/users/profile/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success(res.data.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("CHANGE PASSWORD ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const currentUser = profile || authUser;
  const userRole = currentUser?.role || "user";
  const userInitial = (currentUser?.name || "U").charAt(0).toUpperCase();

  const roleBadgeVariant = {
    superadmin: "purple",
    admin: "primary",
    mentor: "success",
    student: "warning",
  }[userRole] || "default";

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* HEADER BANNER */}
      <Card className="relative overflow-hidden border-none bg-linear-to-r from-navy-950 via-slate-900 to-blue-950 text-white p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-[#1f6f5b]/90 text-3xl font-extrabold text-white shadow-xl ring-4 ring-white/10">
            {userInitial}
          </div>

          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {currentUser?.name || "User Profile"}
              </h1>
              <Badge variant={roleBadgeVariant} size="md" className="capitalize">
                {userRole}
              </Badge>
            </div>

            <p className="mt-1 text-xs sm:text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail size={14} className="text-slate-400" />
              {currentUser?.email}
            </p>

            {currentUser?.batchId?.name && (
              <p className="mt-2 text-xs text-blue-300 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <Layers size={14} /> Assigned Batch: {currentUser.batchId.name}
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-8 md:grid-cols-3">
        {/* LEFT COLUMN: PERSONAL DETAILS */}
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} className="text-[#1f6f5b] dark:text-blue-400" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Overview of your registered account details.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-5 sm:grid-cols-2 text-xs">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:border-[#15253f] dark:bg-[#070e1b]">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Full Name
                </p>
                <p className="mt-1 font-bold text-slate-900 dark:text-white text-sm">
                  {currentUser?.name || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:border-[#15253f] dark:bg-[#070e1b]">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Email Address
                </p>
                <p className="mt-1 font-bold text-slate-900 dark:text-white text-sm truncate">
                  {currentUser?.email || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:border-[#15253f] dark:bg-[#070e1b]">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Account Role
                </p>
                <p className="mt-1 font-bold text-slate-900 dark:text-white text-sm capitalize">
                  {userRole}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:border-[#15253f] dark:bg-[#070e1b]">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Gender
                </p>
                <p className="mt-1 font-bold text-slate-900 dark:text-white text-sm">
                  {currentUser?.gender || "Not specified"}
                </p>
              </div>

              {currentUser?.phone && (
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:border-[#15253f] dark:bg-[#070e1b]">
                  <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Phone Number
                  </p>
                  <p className="mt-1 font-bold text-slate-900 dark:text-white text-sm">
                    {currentUser.phone}
                  </p>
                </div>
              )}

              {currentUser?.telegramUsername && (
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:border-[#15253f] dark:bg-[#070e1b]">
                  <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Telegram Username
                  </p>
                  <p className="mt-1 font-bold text-slate-900 dark:text-white text-sm">
                    {currentUser.telegramUsername}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* PASSWORD CHANGE FORM */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={18} className="text-amber-500" />
                Change Password
              </CardTitle>
              <CardDescription>
                Ensure your account is protected with a secure password.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                icon={KeyRound}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  icon={Lock}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  icon={Lock}
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" loading={updatingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* RIGHT COLUMN: ROLE WIDGETS */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Award size={16} className="text-[#1f6f5b] dark:text-blue-400" />
                Role Status & Permissions
              </CardTitle>
            </CardHeader>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-[#15253f]">
                <span className="text-slate-500 dark:text-slate-400">Access Level</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">{userRole}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-[#15253f]">
                <span className="text-slate-500 dark:text-slate-400">Account Status</span>
                <Badge variant="success" size="sm">Active</Badge>
              </div>

              {currentUser?.createdAt && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-[#15253f]">
                  <span className="text-slate-500 dark:text-slate-400">Member Since</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {userRole === "student" && (
              <div className="mt-6 rounded-xl bg-[#e5f1ed] p-4 dark:bg-[#0c1f2e] dark:border dark:border-[#133854] text-xs">
                <p className="font-semibold text-emerald-900 dark:text-emerald-300">Student Portal</p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  Check your progress, submit assignments, and review daily sessions directly from your student dashboard.
                </p>
              </div>
            )}

            {userRole === "mentor" && (
              <div className="mt-6 rounded-xl bg-emerald-50 p-4 dark:bg-[#0c241c] dark:border dark:border-[#144233] text-xs">
                <p className="font-semibold text-emerald-900 dark:text-emerald-300">Mentor Portal</p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  You have privileges to grade assignments, provide student feedback, and broadcast announcements to your cohort.
                </p>
              </div>
            )}

            {(userRole === "admin" || userRole === "superadmin") && (
              <div className="mt-6 rounded-xl bg-purple-50 p-4 dark:bg-[#13112e] dark:border dark:border-[#2b1b4a] text-xs">
                <p className="font-semibold text-purple-900 dark:text-purple-300">Administrative Access</p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  Full administrative permissions to manage registrations, sessions, batches, modules, and user roles.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile;
