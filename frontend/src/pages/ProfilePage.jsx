import { useMemo, useState } from "react";
import {
  UserCircle,
  ShieldCheck,
  Lock,
  LogOut,
  Pencil,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import PageTransition from "../components/PageTransition";
import { useAuth } from "../context/AuthContext";


// --------------------------------------------------
// Decode JWT payload safely
// --------------------------------------------------

const getTokenPayload = (token) => {
  try {
    if (!token) {
      return {};
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
      return {};
    }

    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    return JSON.parse(atob(padded));
  } catch (error) {
    console.error("Unable to decode authentication token:", error);
    return {};
  }
};


// --------------------------------------------------
// Profile Page
// --------------------------------------------------

export default function ProfilePage() {
  const { token, logout } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);

  const user = useMemo(() => {
    const payload = getTokenPayload(token);

    const username =
      payload.username ||
      payload.userName ||
      payload.preferred_username ||
      payload.sub ||
      null;

    const role =
      payload.role ||
      payload.roles?.[0] ||
      null;

    return {
      username,
      role,
    };
  }, [token]);


  // --------------------------------------------------
  // Display values
  // --------------------------------------------------

  const displayName =
    user.username || "Authenticated User";

  const displayRole =
    user.role || "Administrator";

  const initial =
    displayName.trim().charAt(0).toUpperCase() || "U";


  const handleLogout = () => {
    logout();
  };


  return (
    <PageTransition>
      <div className="space-y-6 pb-8">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div>
          <h1 className="text-2xl font-bold">
            Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account information, access and security settings.
          </p>
        </div>


        {/* =====================================================
            PROFILE IDENTITY CARD
        ===================================================== */}

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              {/* Identity */}

              <div className="flex items-center gap-4">

                {/* Colored Initial Avatar */}

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xl font-bold text-white shadow-sm">
                  {initial}
                </div>


                {/* User information */}

                <div className="min-w-0">

                  <h2 className="truncate text-lg font-semibold">
                    {displayName}
                  </h2>

                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {displayRole}
                  </p>

                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active
                  </div>

                </div>

              </div>


              {/* Edit button */}

              <Button
                variant="outline"
                className="gap-2 self-start sm:self-center"
                onClick={() => setShowEditModal(true)}
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>

            </div>
          </CardContent>
        </Card>


        {/* =====================================================
            ACCOUNT INFORMATION + ACCOUNT STATUS
        ===================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Account Information */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCircle className="h-4 w-4 text-sky-500" />
                Account Information
              </CardTitle>
            </CardHeader>

            <CardContent>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* Username */}

                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Username
                  </p>

                  <p className="mt-1 font-medium">
                    {user.username || "Not available"}
                  </p>
                </div>


                {/* Role */}

                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Role
                  </p>

                  <p className="mt-1 font-medium">
                    {user.role || "Not available"}
                  </p>
                </div>


                {/* Account Type */}

                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Account Type
                  </p>

                  <p className="mt-1 font-medium">
                    Administrator
                  </p>
                </div>


                {/* Status */}

                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </p>

                  <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Active
                  </div>
                </div>

              </div>

            </CardContent>
          </Card>


          {/* Account Status */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-sky-500" />
                Account Status
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">

              {/* Status */}

              <div className="flex items-start gap-3">

                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Active
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Your account is currently active.
                  </p>
                </div>

              </div>


              {/* Role */}

              <div className="flex items-start gap-3">

                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950">
                  <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Role
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {displayRole}
                  </p>
                </div>

              </div>


              {/* Access information */}

              <div className="flex items-start gap-3">

                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Lock className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Access Level
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Administrative account
                  </p>
                </div>

              </div>

            </CardContent>
          </Card>

        </div>


        {/* =====================================================
            SECURITY & ACCOUNT
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
                    <Lock className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  </div>

                  <div>
                    <p className="font-medium">
                      Password
                    </p>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Keep your account secure by regularly updating your password.
                    </p>
                  </div>

                </div>


                {/* No password API currently exists */}

                <Button
                  variant="outline"
                  disabled
                  className="shrink-0"
                >
                  Change Password
                </Button>

              </div>


              <div className="border-t dark:border-gray-800" />


              {/* Current Session */}

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


                {/* Existing logout */}

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="gap-2 shrink-0"
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
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowEditModal(false);
              }
            }}
          >

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-profile-title"
              className="w-full max-w-md rounded-xl border bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950"
            >

              {/* Modal Header */}

              <div className="flex items-center justify-between border-b px-5 py-4 dark:border-gray-800">

                <div>
                  <h2
                    id="edit-profile-title"
                    className="font-semibold"
                  >
                    Edit Profile
                  </h2>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Update your administrator profile information.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEditModal(false)}
                  aria-label="Close edit profile"
                >
                  <X className="h-4 w-4" />
                </Button>

              </div>


              {/* Modal Content */}

              <div className="space-y-4 p-5">

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">

                  <div className="flex gap-3">

                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />

                    <div>

                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        Profile editing is not configured
                      </p>

                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                        The current application does not provide a profile-update API.
                        Your existing account information cannot be safely modified from this page yet.
                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* Modal Footer */}

              <div className="flex justify-end gap-2 border-t px-5 py-4 dark:border-gray-800">

                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Close
                </Button>

              </div>

            </div>

          </div>
        )}

      </div>
    </PageTransition>
  );
}