import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Download,
  FileArchive,
} from "lucide-react";

import backupService from "../services/backupService";
import PageTransition from "../components/PageTransition";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BackupPage() {
  const [format, setFormat] = useState("json");
  const [exporting, setExporting] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);

  const handleExport = async () => {
    setExporting(true);

    try {
      const res = await backupService.exportData(format);

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `tax-management-backup.${format}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setLastBackup({
        date: new Date(),
        format:
          format === "xlsx"
            ? "Excel"
            : format === "json"
              ? "JSON"
              : format === "pdf"
                ? "PDF"
                : "CSV",
        status: "Successful",
      });

      toast.success("Backup saved successfully");
    } catch (error) {
      console.error("Backup export failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Backup export failed"
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div>
          <h1 className="text-2xl font-bold">
            System Backup
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Create and download a backup of your tax management
            system data.
          </p>
        </div>

        {/* BACKUP CARD */}
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Save Backup
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="rounded-lg bg-muted/50 border p-4">
                <div className="flex gap-3">
                  <FileArchive className="w-5 h-5 text-primary mt-0.5" />

                  <div>
                    <p className="font-medium">
                      Create a system backup
                    </p>

                    <p className="text-sm text-muted-foreground mt-1">
                      Export taxpayer, tax computation and system
                      data.
                    </p>
                  </div>
                </div>
              </div>

              {/* BACKUP FORMAT */}
              <div>
                <label
                  htmlFor="export-format"
                  className="block text-sm font-medium mb-2"
                >
                  Backup Format
                </label>

                <select
                  id="export-format"
                  value={format}
                  onChange={(e) =>
                    setFormat(e.target.value)
                  }
                  disabled={exporting}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel</option>
                  <option value="json">JSON</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>

              {/* SAVE BUTTON */}
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />

                {exporting
                  ? "Saving Backup..."
                  : "Save Backup"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* LAST BACKUP */}
        {lastBackup && (
          <div className="max-w-2xl">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      Last Backup
                    </p>

                    <p className="text-sm text-muted-foreground mt-1">
                      {lastBackup.date.toLocaleString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm">
                      Format:{" "}
                      <span className="font-medium">
                        {lastBackup.format}
                      </span>
                    </p>

                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                      Status: {lastBackup.status}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* INFORMATION */}
        <div className="max-w-2xl">
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
            <div className="flex gap-3">
              <FileArchive className="w-5 h-5 text-amber-600 shrink-0" />

              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  Backup Information
                </p>

                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Regular backups help protect taxpayer and tax
                  computation data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}