import { useState } from "react";
import {
  Settings,
  Bell,
  Calculator,
  ShieldCheck,
  DatabaseBackup,
  Save,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageTransition from "../components/PageTransition";
import { useTheme } from "../context/ThemeContext";

export default function SettingsPage() {
  const { darkMode } = useTheme();

  const [settings, setSettings] = useState({
    taxCompletion: true,
    systemAlerts: true,
    confirmDelete: true,
    autoRefresh: false,
  });

  const updateSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
              <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Settings
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage application preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <Card className="rounded-xl border-slate-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-500" />
              Appearance
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-gray-800 p-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Theme
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Control the application appearance.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                {darkMode ? "Dark" : "Light"}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Use the theme switch in the sidebar to change appearance.
            </p>
          </CardContent>
        </Card>

        {/* Tax Preferences */}
        <Card className="rounded-xl border-slate-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4 text-indigo-500" />
              Tax Preferences
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Default Financial Year
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Year used when preparing a new computation.
                </p>
              </div>

              <span className="rounded-md border border-slate-200 dark:border-gray-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300">
                2025–26
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Currency
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Currency used for tax calculations and reports.
                </p>
              </div>

              <span className="rounded-md border border-slate-200 dark:border-gray-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300">
                ₹ INR
              </span>
            </div>

          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="rounded-xl border-slate-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-500" />
              Notifications
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <SettingToggle
              title="Tax computation completed"
              description="Show a notification after tax calculation."
              checked={settings.taxCompletion}
              onChange={() => updateSetting("taxCompletion")}
            />

            <SettingToggle
              title="System alerts"
              description="Show important application notifications."
              checked={settings.systemAlerts}
              onChange={() => updateSetting("systemAlerts")}
            />

          </CardContent>
        </Card>

        {/* Security */}
        <Card className="rounded-xl border-slate-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              Security & Actions
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <SettingToggle
              title="Confirm before deleting"
              description="Ask for confirmation before removing a taxpayer."
              checked={settings.confirmDelete}
              onChange={() => updateSetting("confirmDelete")}
            />

            <SettingToggle
              title="Auto-refresh reports"
              description="Automatically refresh report information."
              checked={settings.autoRefresh}
              onChange={() => updateSetting("autoRefresh")}
            />

          </CardContent>
        </Card>

        {/* Backup shortcut */}
        <Card className="rounded-xl border-slate-200 dark:border-gray-800">
          <CardContent className="flex items-center justify-between p-4">

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-gray-800">
                <DatabaseBackup className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Backup & Restore
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage your tax management system data.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = "/backup";
              }}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Open
            </Button>

          </CardContent>
        </Card>

      </div>
    </PageTransition>
  );
}


/* --------------------------------------------------
   Reusable Toggle
-------------------------------------------------- */

function SettingToggle({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {title}
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked
            ? "bg-indigo-600"
            : "bg-slate-300 dark:bg-gray-700"
        }`}
        aria-label={title}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>

    </div>
  );
}