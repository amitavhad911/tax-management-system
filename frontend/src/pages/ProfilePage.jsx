import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  UserCircle,
  ShieldCheck,
  Lock,
  LogOut,
  Pencil,
  CheckCircle2,
  X,
  KeyRound,
  CalendarDays,
} from "lucide-react";

import PageTransition from "../components/PageTransition";
import { useAuth } from "../context/AuthContext";
import adminService from "../services/adminService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {

  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  const [username, setUsername] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });


  // --------------------------------------------------
  // Load profile
  // --------------------------------------------------

  const loadProfile = async () => {

    setLoading(true);

    try {

      const response = await adminService.getProfile();

      const data = response?.data?.data;

      if (!data) {
        throw new Error("Invalid profile response");
      }

      setProfile(data);
      setUsername(data.username || "");

    } catch (error) {

      console.error("Failed to load profile:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to load profile"
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {
    loadProfile();
  }, []);


  // --------------------------------------------------
  // Initial
  // --------------------------------------------------

  const initial = useMemo(() => {

    if (!profile?.username) {
      return "A";
    }

    return profile.username
      .trim()
      .charAt(0)
      .toUpperCase();

  }, [profile]);


  // --------------------------------------------------
  // Edit profile
  // --------------------------------------------------

  const handleUpdateProfile = async (event) => {

    event.preventDefault();

    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    setSavingProfile(true);

    try {

      const response = await adminService.updateProfile({
        username: username.trim(),
      });

      const updatedProfile = response?.data?.data;

      if (!updatedProfile) {
        throw new Error("Invalid profile response");
      }

      setProfile(updatedProfile);

      setUsername(updatedProfile.username);

      setShowEditModal(false);

      toast.success("Profile updated successfully");

      /*
       * Username is used as the JWT subject.
       *
       * Therefore, after changing the username,
       * the old token still contains the old username.
       *
       * Sign out so the user can authenticate again
       * using the new username.
       */

      toast("Please sign in again with your new username.");

      setTimeout(() => {
        logout();
      }, 1200);

    } catch (error) {

      console.error("Profile update failed:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to update profile"
      );

    } finally {

      setSavingProfile(false);
    }
  };


  // --------------------------------------------------
  // Password
  // --------------------------------------------------

  const handlePasswordChange = async (event) => {

    event.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error("Enter your current password");
      return;
    }

    if (!passwordForm.newPassword) {
      toast.error("Enter a new password");
      return;
    }

    if (
      passwordForm.newPassword.length < 6
    ) {
      toast.error(
        "New password must contain at least 6 characters"
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      toast.error(
        "New password and confirm password do not match"
      );
      return;
    }

    setChangingPassword(true);

    try {

      await adminService.changePassword(
        passwordForm
      );

      toast.success(
        "Password changed successfully"
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordModal(false);

      /*
       * Existing JWT remains valid, so the user
       * can continue using the current session.
       */

    } catch (error) {

      console.error(
        "Password change failed:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        "Failed to change password"
      );

    } finally {

      setChangingPassword(false);
    }
  };


  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {

    return (
      <PageTransition>

        <div className="flex min-h-[400px] items-center justify-center">

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Loading profile...
          </div>

        </div>

      </PageTransition>
    );
  }


  // --------------------------------------------------
  // Error / no profile
  // --------------------------------------------------

  if (!profile) {

    return (
      <PageTransition>

        <div className="flex min-h-[400px] items-center justify-center">

          <Card className="w-full max-w-md">

            <CardContent className="p-6 text-center">

              <p className="font-medium">
                Unable to load profile
              </p>

              <Button
                onClick={loadProfile}
                className="mt-4"
              >
                Try Again
              </Button>

            </CardContent>

          </Card>

        </div>

      </PageTransition>
    );
  }


  return (
    <PageTransition>

      <div className="space-y-6 pb-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div>

          <h1 className="text-2xl font-bold">
            Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your administrator account and security settings.
          </p>

        </div>


        {/* =====================================================
            PROFILE IDENTITY
        ===================================================== */}

        <Card>

          <CardContent className="p-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                {/* Colored initial */}

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xl font-bold text-white shadow-sm">
                  {initial}
                </div>


                <div>

                  <h2 className="text-lg font-semibold">
                    {profile.username}
                  </h2>

                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {profile.role}
                  </p>

                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">

                    <CheckCircle2 className="h-3.5 w-3.5" />

                    Active

                  </div>

                </div>

              </div>


              <Button
                variant="outline"
                className="gap-2 self-start sm:self-center"
                onClick={() => {
                  setUsername(profile.username);
                  setShowEditModal(true);
                }}
              >

                <Pencil className="h-4 w-4" />

                Edit Profile

              </Button>

            </div>

          </CardContent>

        </Card>


        {/* =====================================================
            ACCOUNT INFORMATION
        ===================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          <Card>

            <CardHeader>

              <CardTitle className="flex items-center gap-2 text-base">

                <UserCircle className="h-4 w-4 text-sky-500" />

                Account Information

              </CardTitle>

            </CardHeader>


            <CardContent>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>

                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Username
                  </p>

                  <p className="mt-1 font-medium">
                    {profile.username}
                  </p>

                </div>


                <div>

                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Role
                  </p>

                  <p className="mt-1 font-medium">
                    {profile.role}
                  </p>

                </div>


                <div>

                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Account Type
                  </p>

                  <p className="mt-1 font-medium">
                    Administrator
                  </p>

                </div>


                <div>

                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </p>

                  <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">

                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    Active

                  </div>

                </div>


                <div className="sm:col-span-2">

                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Account Created
                  </p>

                  <div className="mt-1 flex items-center gap-2 font-medium">

                    <CalendarDays className="h-4 w-4 text-gray-400" />

                    {profile.createdAt
                      ? new Date(
                          profile.createdAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "Not available"}

                  </div>

                </div>

              </div>

            </CardContent>

          </Card>


          {/* =====================================================
              ACCOUNT STATUS
          ===================================================== */}

          <Card>

            <CardHeader>

              <CardTitle className="flex items-center gap-2 text-base">

                <ShieldCheck className="h-4 w-4 text-sky-500" />

                Account Status

              </CardTitle>

            </CardHeader>


            <CardContent className="space-y-5">

              <div className="flex items-start gap-3">

                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">

                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />

                </div>

                <div>

                  <p className="text-sm font-medium">
                    Active
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Your administrator account is active.
                  </p>

                </div>

              </div>


              <div className="flex items-start gap-3">

                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950">

                  <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />

                </div>

                <div>

                  <p className="text-sm font-medium">
                    Role
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {profile.role}
                  </p>

                </div>

              </div>


              <div className="flex items-start gap-3">

                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">

                  <Lock className="h-4 w-4 text-slate-600 dark:text-slate-300" />

                </div>

                <div>

                  <p className="text-sm font-medium">
                    Access Level
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {profile.role === "SUPERADMIN"
                      ? "Full administrative access"
                      : "Administrative access"}
                  </p>

                </div>

              </div>

            </CardContent>

          </Card>

        </div>


        {/* =====================================================
            SECURITY
        ===================================================== */}

        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2 text-base">

              <ShieldCheck className="h-4 w-4 text-sky-500" />

              Security & Account

            </CardTitle>

          </CardHeader>


          <CardContent>

            <div className="space-y-6">

              {/* Password */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">

                    <KeyRound className="h-4 w-4 text-slate-600 dark:text-slate-300" />

                  </div>

                  <div>

                    <p className="font-medium">
                      Password
                    </p>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Change your password to keep your account secure.
                    </p>

                  </div>

                </div>


                <Button
                  variant="outline"
                  className="shrink-0 gap-2"
                  onClick={() =>
                    setShowPasswordModal(true)
                  }
                >

                  <Lock className="h-4 w-4" />

                  Change Password

                </Button>

              </div>


              <div className="border-t dark:border-gray-800" />


              {/* Session */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">

                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />

                  </div>

                  <div>

                    <p className="font-medium">
                      Current Session
                    </p>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Your administrator session is currently active.
                    </p>

                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">

                      <span className="h-2 w-2 rounded-full bg-emerald-500" />

                      Active

                    </div>

                  </div>

                </div>


                <Button
                  variant="outline"
                  onClick={logout}
                  className="shrink-0 gap-2"
                >

                  <LogOut className="h-4 w-4" />

                  Sign Out

                </Button>

              </div>

            </div>

          </CardContent>

        </Card>


        {/* =====================================================
            EDIT PROFILE MODAL
        ===================================================== */}

        {showEditModal && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-xl border bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">

              <div className="flex items-center justify-between border-b px-5 py-4 dark:border-gray-800">

                <div>

                  <h2 className="font-semibold">
                    Edit Profile
                  </h2>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Update your administrator username.
                  </p>

                </div>


                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setShowEditModal(false)
                  }
                >

                  <X className="h-4 w-4" />

                </Button>

              </div>


              <form
                onSubmit={handleUpdateProfile}
                className="space-y-5 p-5"
              >

                <div>

                  <label className="text-sm font-medium">
                    Username
                  </label>

                  <Input
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    className="mt-2"
                    disabled={savingProfile}
                    minLength={3}
                    maxLength={50}
                  />

                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Your username is used to sign in.
                  </p>

                </div>


                <div className="flex justify-end gap-2">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setShowEditModal(false)
                    }
                    disabled={savingProfile}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={savingProfile}
                  >
                    {savingProfile
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>

                </div>

              </form>

            </div>

          </div>

        )}


        {/* =====================================================
            CHANGE PASSWORD MODAL
        ===================================================== */}

        {showPasswordModal && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-xl border bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">

              <div className="flex items-center justify-between border-b px-5 py-4 dark:border-gray-800">

                <div>

                  <h2 className="font-semibold">
                    Change Password
                  </h2>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter your current password and choose a new one.
                  </p>

                </div>


                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setShowPasswordModal(false)
                  }
                >

                  <X className="h-4 w-4" />

                </Button>

              </div>


              <form
                onSubmit={handlePasswordChange}
                className="space-y-4 p-5"
              >

                <div>

                  <label className="text-sm font-medium">
                    Current Password
                  </label>

                  <Input
                    type="password"
                    value={
                      passwordForm.currentPassword
                    }
                    onChange={(event) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword:
                          event.target.value,
                      })
                    }
                    className="mt-2"
                    disabled={changingPassword}
                  />

                </div>


                <div>

                  <label className="text-sm font-medium">
                    New Password
                  </label>

                  <Input
                    type="password"
                    value={
                      passwordForm.newPassword
                    }
                    onChange={(event) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword:
                          event.target.value,
                      })
                    }
                    className="mt-2"
                    disabled={changingPassword}
                  />

                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Minimum 6 characters.
                  </p>

                </div>


                <div>

                  <label className="text-sm font-medium">
                    Confirm New Password
                  </label>

                  <Input
                    type="password"
                    value={
                      passwordForm.confirmPassword
                    }
                    onChange={(event) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword:
                          event.target.value,
                      })
                    }
                    className="mt-2"
                    disabled={changingPassword}
                  />

                </div>


                <div className="flex justify-end gap-2 pt-2">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setShowPasswordModal(false)
                    }
                    disabled={changingPassword}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={changingPassword}
                  >
                    {changingPassword
                      ? "Changing..."
                      : "Change Password"}
                  </Button>

                </div>

              </form>

            </div>

          </div>

        )}

      </div>

    </PageTransition>
  );
}