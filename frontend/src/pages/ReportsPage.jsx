import { useState, useEffect } from "react";
import reportService from "../services/reportService";
import { toast } from "react-hot-toast";
import {
  FileDown,
  Trophy,
  IndianRupee,
  Calculator,
  Users,
  RefreshCw,
} from "lucide-react";

import { formatCurrency } from "../utils/format";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import PageTransition from "../components/PageTransition";

export default function ReportsPage() {
  const [top, setTop] = useState([]);
  const [summary, setSummary] = useState(null);

  const [topN, setTopN] = useState(5);
  const [loading, setLoading] = useState(true);

  const loadReports = async (limit = topN) => {
    setLoading(true);

    try {
      const [topRes, summaryRes] = await Promise.all([
        reportService.getTopTaxpayers(limit),
        reportService.getSummary(),
      ]);

      setTop(topRes.data.data || []);
      setSummary(summaryRes.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(5);
  }, []);

  const handleTopNChange = async (value) => {
    const number = Number(value);
    setTopN(number);
    await loadReports(number);
  };

  const handleExport = async (type) => {
    try {
      const fn =
        type === "pdf"
          ? reportService.exportPdf
          : reportService.exportExcel;

      const res = await fn();

      const url = window.URL.createObjectURL(
        new Blob([res.data])
      );

      const a = document.createElement("a");
      a.href = url;
      a.download = `tax_report.${type === "pdf" ? "pdf" : "xlsx"}`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      toast.success(`${type.toUpperCase()} report downloaded`);
    } catch (error) {
      console.error(error);
      toast.error("Report download failed");
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Tax Reports & Analytics
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              Analyze tax collection and identify the highest taxpayers.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadReports()}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 h-28 animate-pulse bg-muted/30" />
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Calculator className="w-6 h-6 text-primary" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Records
                      </p>
                      <p className="text-2xl font-bold">
                        {summary?.totalRecords ?? 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <IndianRupee className="w-6 h-6 text-primary" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Tax Collected
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(summary?.totalTaxCollected || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Users className="w-6 h-6 text-primary" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Average Tax
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(summary?.averageTaxAmount || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Top {topN} Taxpayers
                    </CardTitle>

                    <p className="text-sm text-muted-foreground mt-1">
                      Ranked by tax amount.
                    </p>
                  </div>

                  <select
                    value={topN}
                    onChange={(e) => handleTopNChange(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value={5}>Top 5</option>
                    <option value={10}>Top 10</option>
                    <option value={20}>Top 20</option>
                    <option value={50}>Top 50</option>
                  </select>
                </div>
              </CardHeader>

              <CardContent>
                {top.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No taxpayer data available.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {top.map((taxpayer, index) => (
                      <div
                        key={taxpayer.id || index}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 font-bold text-primary">
                            {taxpayer.rank || index + 1}
                          </div>

                          <div>
                            <p className="font-medium">
                              {taxpayer.userName}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Taxpayer Rank #{taxpayer.rank || index + 1}
                            </p>
                          </div>
                        </div>

                        <p className="font-bold">
                          {formatCurrency(taxpayer.taxAmount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Reports</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => handleExport("pdf")}
                    className="gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Download PDF Report
                  </Button>

                  <Button
                    onClick={() => handleExport("excel")}
                    variant="outline"
                    className="gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Download Excel Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageTransition>
  );
}