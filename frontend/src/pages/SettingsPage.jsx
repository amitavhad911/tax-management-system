import { useState } from "react";
import {
  Settings,
  Bell,
  Calculator,
  DatabaseBackup,
  Save,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageTransition from "../components/PageTransition";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    taxCalculation: true,
    reportGeneration: true,
    backupRestore: true,
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
      <div className="max-w-3xl mx-auto space-y-5 pb-8">

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
                Controlled from sidebar
              </span>
            </div>
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

          <CardContent className="space-y-4">
            <PreferenceRow
              title="Default Financial Year"
              description="Year used when preparing a new computation."
              value="2025–26"
            />

            <PreferenceRow
              title="Currency"
              description="Currency used for tax calculations and reports."
              value="₹ INR"
            />
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="rounded-xl border-slate-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-500" />
              Notifications
            </CardTitle>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Control important system notifications.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <SettingToggle
              title="Tax Calculation Updates"
              description="Notify when a taxpayer's tax computation is completed."
              checked={settings.taxCalculation}
              onChange={() => updateSetting("taxCalculation")}
            />

            <SettingToggle
              title="Report Generation"
              description="Notify when a PDF or Excel report is ready."
              checked={settings.reportGeneration}
              onChange={() => updateSetting("reportGeneration")}
            />

            <SettingToggle
              title="Backup & Restore Alerts"
              description="Notify when backup or restore operations complete."
              checked={settings.backupRestore}
              onChange={() => updateSetting("backupRestore")}
            />
          </CardContent>
        </Card>

        {/* Security & Actions */}
        <Card className="rounded-xl border-slate-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-500" />
              Security & Actions
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <SettingToggle
              title="Confirm Before Deleting"
              description="Ask for confirmation before removing a taxpayer."
              checked={settings.confirmDelete}
              onChange={() => updateSetting("confirmDelete")}
            />

            <SettingToggle
              title="Auto-refresh Reports"
              description="Automatically refresh report information."
              checked={settings.autoRefresh}
              onChange={() => updateSetting("autoRefresh")}
            />
          </CardContent>
        </Card>

        {/* Backup shortcut */}
        <Card className="rounded-xl border-slate-200 dark:border-gray-800">
          <CardContent className="flex items-center justify-between gap-4 p-4">
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

function PreferenceRow({ title, description, value }) {
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

      <span className="shrink-0 rounded-md border border-slate-200 dark:border-gray-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300">
        {value}
      </span>
    </div>
  );
}

function SettingToggle({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {title}
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-5">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onChange}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${
          checked ? "bg-sky-500" : "bg-slate-300 dark:bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
