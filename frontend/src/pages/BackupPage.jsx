import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Upload,
  Download,
  FileArchive,
  AlertTriangle,
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
  const [file, setFile] = useState(null);

  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const fileInputRef = useRef(null);

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

      toast.success("Backup saved successfully");
    } catch (error) {
      console.error("Backup export failed:", error);
      toast.error("Backup export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleRestore = async () => {
    if (!file) {
      toast.error("Please select a backup file first");
      return;
    }

    setRestoring(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("format", format);

      await backupService.restore(formData);

      toast.success("Backup restored successfully");

      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Backup restore failed:", error);

      toast.error(
        error?.response?.data?.message ||
          "Backup restore failed"
      );
    } finally {
      setRestoring(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Save & Restore
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Save system data as a backup and restore it whenever required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SAVE */}
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
                      Export taxpayer, tax computation and system data.
                    </p>
                  </div>
                </div>
              </div>

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
                  onChange={(e) => setFormat(e.target.value)}
                  disabled={exporting || restoring}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel</option>
                </select>
              </div>

              <Button
                onClick={handleExport}
                disabled={exporting || restoring}
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />

                {exporting
                  ? "Saving Backup..."
                  : "Save Backup"}
              </Button>
            </CardContent>
          </Card>

          {/* RESTORE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Restore Backup
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <label
                  htmlFor="backup-file"
                  className="block text-sm font-medium mb-2"
                >
                  Select Backup File
                </label>

                <input
                  ref={fileInputRef}
                  id="backup-file"
                  type="file"
                  accept=".json,.csv,.xlsx"
                  disabled={restoring}
                  onChange={(e) =>
                    setFile(e.target.files?.[0] || null)
                  }
                  className="w-full rounded-md border p-2 text-sm bg-background"
                />

                {file && (
                  <div className="mt-3 rounded-md bg-muted/50 border p-3">
                    <p className="text-sm font-medium">
                      Selected file
                    </p>

                    <p className="text-xs text-muted-foreground mt-1 break-all">
                      {file.name}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleRestore}
                disabled={!file || restoring || exporting}
                variant="outline"
                className="w-full gap-2"
              >
                <Upload className="w-4 h-4" />

                {restoring
                  ? "Restoring..."
                  : "Restore Backup"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />

            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">
                Important
              </p>

              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                Restoring a backup may overwrite existing system data.
                Always save a recent backup before restoring older data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}