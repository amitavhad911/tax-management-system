import { useCallback, useEffect, useMemo, useState } from "react";
import reportService from "../services/reportService";
import { toast } from "react-hot-toast";
import {
  BarChart3,
  Building2,
  Calculator,
  Download,
  FileDown,
  IndianRupee,
  RefreshCw,
  RotateCcw,
  Search,
  Trophy,
  UserRound,
  Users,
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

const getRecordUserType = (record) =>
  record.userType || record.taxpayerType || "INDIVIDUAL";

const getRecordTax = (record) => Number(record.taxAmount ?? 0);

const getRecordId = (record) =>
  record.id ?? `${record.userId}-${record.financialYear}`;

const getUniqueTaxpayers = (records) => {
  const map = new Map();

  records.forEach((record) => {
    const userId = record.userId ?? record.id;
    const key = String(userId);

    if (!map.has(key)) {
      map.set(key, {
        userId,
        userName: record.userName || "Unknown Taxpayer",
        panNumber: record.panNumber || "—",
        userType: getRecordUserType(record),
        taxAmount: 0,
        computationCount: 0,
      });
    }

    const taxpayer = map.get(key);
    taxpayer.taxAmount += getRecordTax(record);
    taxpayer.computationCount += 1;
  });

  return Array.from(map.values());
};

const downloadBlob = (data, filename) => {
  const blob = data instanceof Blob ? data : new Blob([data]);
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.URL.revokeObjectURL(url);
};

export default function ReportsPage() {
  const [records, setRecords] = useState([]);
  const [topN, setTopN] = useState(5);

  const [financialYear, setFinancialYear] = useState("");
  const [taxpayerType, setTaxpayerType] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [exporting, setExporting] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await reportService.getAllHistory();
      const data = response?.data?.data || [];

      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const financialYears = useMemo(() => {
    return Array.from(
      new Set(records.map((record) => record.financialYear).filter(Boolean))
    ).sort((a, b) => b.localeCompare(a));
  }, [records]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const type = getRecordUserType(record);

      const matchesYear =
        !financialYear || record.financialYear === financialYear;

      const matchesType =
        !taxpayerType || type === taxpayerType;

      const searchable = [
        record.userName,
        record.panNumber,
        record.userId,
        record.financialYear,
        record.id,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      return (
        matchesYear &&
        matchesType &&
        (!query || searchable.includes(query))
      );
    });
  }, [records, financialYear, taxpayerType, search]);

  const uniqueTaxpayers = useMemo(
    () => getUniqueTaxpayers(filteredRecords),
    [filteredRecords]
  );

  const summary = useMemo(() => {
    const totalComputations = filteredRecords.length;
    const totalTaxCollected = filteredRecords.reduce(
      (sum, record) => sum + getRecordTax(record),
      0
    );

    return {
      totalComputations,
      totalTaxCollected,
      averageTax:
        totalComputations > 0
          ? totalTaxCollected / totalComputations
          : 0,
      totalTaxpayers: uniqueTaxpayers.length,
    };
  }, [filteredRecords, uniqueTaxpayers]);

  const topTaxpayers = useMemo(() => {
    return [...uniqueTaxpayers]
      .sort((a, b) => b.taxAmount - a.taxAmount)
      .slice(0, topN);
  }, [uniqueTaxpayers, topN]);

  const typeCollection = useMemo(() => {
    const result = {
      INDIVIDUAL: 0,
      INSTITUTIONAL: 0,
    };

    filteredRecords.forEach((record) => {
      const type = getRecordUserType(record);

      if (type === "INSTITUTIONAL") {
        result.INSTITUTIONAL += getRecordTax(record);
      } else {
        result.INDIVIDUAL += getRecordTax(record);
      }
    });

    return result;
  }, [filteredRecords]);

  const yearCollection = useMemo(() => {
    const map = new Map();

    filteredRecords.forEach((record) => {
      const year = record.financialYear || "Unknown";
      map.set(year, (map.get(year) || 0) + getRecordTax(record));
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, amount]) => ({ year, amount }));
  }, [filteredRecords]);

  const maxYearTax = Math.max(
    ...yearCollection.map((item) => item.amount),
    0
  );

  const maxTypeTax = Math.max(
    typeCollection.INDIVIDUAL,
    typeCollection.INSTITUTIONAL,
    0
  );

  const resetFilters = () => {
    setFinancialYear("");
    setTaxpayerType("");
    setSearch("");
    setTopN(5);
  };

  const handleExport = async (type) => {
    setExporting(type);

    try {
      const response =
        type === "pdf"
          ? await reportService.exportPdf()
          : await reportService.exportExcel();

      downloadBlob(
        response.data,
        type === "pdf" ? "tax_report.pdf" : "tax_report.xlsx"
      );

      toast.success(
        `${type === "pdf" ? "PDF" : "Excel"} report downloaded`
      );
    } catch (err) {
      console.error(err);
      toast.error("Report download failed");
    } finally {
      setExporting("");
    }
  };

  const hasRecords = records.length > 0;
  const hasFilteredRecords = filteredRecords.length > 0;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Tax Reports &amp; Analytics
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Analyze tax collection and identify the highest taxpayers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadReports()}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("excel")}
              disabled={Boolean(exporting)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {exporting === "excel" ? "Downloading..." : "Download Excel"}
            </Button>

            <Button
              size="sm"
              onClick={() => handleExport("pdf")}
              disabled={Boolean(exporting)}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              {exporting === "pdf" ? "Downloading..." : "Download PDF"}
            </Button>
          </div>
        </div>

        {/* ERROR STATE */}
        {error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <BarChart3 className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  Unable to Load Reports
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We couldn't retrieve the latest tax report data.
                </p>
              </div>
              <Button onClick={loadReports} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : loading ? (
          /* LOADING STATE */
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <Card key={item}>
                  <CardContent className="h-32 animate-pulse p-6">
                    <div className="h-full rounded-lg bg-muted/50" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="h-32 animate-pulse p-6">
                <div className="h-full rounded-lg bg-muted/50" />
              </CardContent>
            </Card>
          </div>
        ) : !hasRecords ? (
          /* EMPTY STATE */
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  No Tax Computations Available
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  No completed tax computations are available for the selected
                  filters.
                </p>
              </div>
              <Button variant="outline" onClick={resetFilters} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-primary/10 p-3">
                      <Calculator className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Computations
                      </p>
                      <p className="text-2xl font-bold">
                        {summary.totalComputations}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Completed records
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-primary/10 p-3">
                      <IndianRupee className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        Total Tax Collected
                      </p>
                      <p className="truncate text-2xl font-bold">
                        {formatCurrency(summary.totalTaxCollected)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Across all computations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-primary/10 p-3">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        Average Tax
                      </p>
                      <p className="truncate text-2xl font-bold">
                        {formatCurrency(summary.averageTax)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Per computation
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FILTERS */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Report Filters</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_2fr_auto]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Financial Year
                    </label>
                    <select
                      value={financialYear}
                      onChange={(event) => setFinancialYear(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">All Financial Years</option>
                      {financialYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Taxpayer Type
                    </label>
                    <select
                      value={taxpayerType}
                      onChange={(event) => setTaxpayerType(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">All Taxpayer Types</option>
                      <option value="INDIVIDUAL">Individual</option>
                      <option value="INSTITUTIONAL">Institutional</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Search taxpayer
                    </label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search taxpayer name, PAN or ID..."
                        className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="w-full gap-2 xl:w-auto"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!hasFilteredRecords ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h2 className="text-lg font-semibold">
                      No matching computations found.
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try changing the search or filters.
                    </p>
                  </div>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* TAXPAYER DISTRIBUTION */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Taxpayer Distribution
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-lg border bg-background p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="rounded-lg bg-violet-500/10 p-2 text-violet-600 dark:text-violet-400">
                              <UserRound className="h-5 w-5" />
                            </div>
                            <span className="font-medium">Individual</span>
                          </div>
                          <span className="text-xl font-bold">
                            {
                              uniqueTaxpayers.filter(
                                (item) => item.userType === "INDIVIDUAL"
                              ).length
                            }
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg border bg-background p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                              <Building2 className="h-5 w-5" />
                            </div>
                            <span className="font-medium">Institutional</span>
                          </div>
                          <span className="text-xl font-bold">
                            {
                              uniqueTaxpayers.filter(
                                (item) => item.userType === "INSTITUTIONAL"
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* TOP TAXPAYERS */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-primary" />
                          Top Taxpayers
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Ranked by total tax liability across completed
                          computations.
                        </p>
                      </div>

                      <select
                        value={topN}
                        onChange={(event) => setTopN(Number(event.target.value))}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value={5}>Top 5</option>
                        <option value={10}>Top 10</option>
                        <option value={20}>Top 20</option>
                      </select>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {topTaxpayers.map((taxpayer, index) => {
                        const institutional =
                          taxpayer.userType === "INSTITUTIONAL";

                        return (
                          <div
                            key={taxpayer.userId}
                            className="flex flex-col gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex min-w-0 items-center gap-4">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                {index + 1}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {taxpayer.userName}
                                </p>

                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                  <span
                                    className={[
                                      "inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium",
                                      institutional
                                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                        : "bg-violet-500/10 text-violet-700 dark:text-violet-400",
                                    ].join(" ")}
                                  >
                                    {institutional ? (
                                      <Building2 className="h-3 w-3" />
                                    ) : (
                                      <UserRound className="h-3 w-3" />
                                    )}
                                    {institutional
                                      ? "Institutional"
                                      : "Individual"}
                                  </span>

                                  <span className="text-muted-foreground">
                                    ID: {taxpayer.userId}
                                  </span>

                                  <span className="text-muted-foreground">
                                    PAN: {taxpayer.panNumber}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 text-left sm:text-right">
                              <p className="text-xs text-muted-foreground">
                                Tax Liability
                              </p>
                              <p className="font-bold">
                                {formatCurrency(taxpayer.taxAmount)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* COLLECTION ANALYTICS */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IndianRupee className="h-5 w-5 text-primary" />
                        Tax Collection by Taxpayer Type
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-5">
                        {[
                          {
                            label: "Individual",
                            value: typeCollection.INDIVIDUAL,
                            icon: UserRound,
                            className:
                              "bg-violet-500/10 text-violet-700 dark:text-violet-400",
                          },
                          {
                            label: "Institutional",
                            value: typeCollection.INSTITUTIONAL,
                            icon: Building2,
                            className:
                              "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                          },
                        ].map((item) => {
                          const Icon = item.icon;
                          const width =
                            maxTypeTax > 0
                              ? (item.value / maxTypeTax) * 100
                              : 0;

                          return (
                            <div key={item.label} className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded-md p-1.5 ${item.className}`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </span>
                                  <span className="text-sm font-medium">
                                    {item.label}
                                  </span>
                                </div>
                                <span className="text-sm font-semibold">
                                  {formatCurrency(item.value)}
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary transition-all"
                                  style={{ width: `${width}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Tax Collection by Financial Year
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      {yearCollection.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          No financial-year data available.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {yearCollection.map((item) => {
                            const width =
                              maxYearTax > 0
                                ? (item.amount / maxYearTax) * 100
                                : 0;

                            return (
                              <div key={item.year} className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-sm font-medium">
                                    {item.year}
                                  </span>
                                  <span className="text-sm font-semibold">
                                    {formatCurrency(item.amount)}
                                  </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${width}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}