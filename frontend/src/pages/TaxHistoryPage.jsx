import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import taxService from "../services/taxService";
import { formatCurrency } from "../utils/format";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Download,
  Eye,
  FileDown,
  FileSpreadsheet,
  FileText,
  History,
  RefreshCw,
  RotateCcw,
  Search,
  User,
  Users,
  X,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "../components/PageTransition";

const PAGE_SIZE = 10;

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "T";

const normalizeType = (value) => {
  const type = String(value || "").toUpperCase();
  return type === "INSTITUTIONAL" ? "INSTITUTIONAL" : "INDIVIDUAL";
};

const getTaxpayerName = (record) =>
  record?.userName ||
  record?.fullName ||
  record?.taxpayerName ||
  `Taxpayer ${record?.userId ?? ""}`.trim();

const getTaxpayerId = (record) =>
  record?.userId ?? record?.taxpayerId ?? record?.user?.id ?? "";

const getPan = (record) =>
  record?.panNumber ||
  record?.pan ||
  record?.user?.panNumber ||
  record?.user?.pan ||
  "";

const formatIndianCurrency = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const typeBadgeClass = (type) =>
  normalizeType(type) === "INSTITUTIONAL"
    ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
    : "border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300";

export default function TaxHistoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [taxpayerType, setTaxpayerType] = useState("ALL");
  const [financialYear, setFinancialYear] = useState("ALL");
  const [page, setPage] = useState(1);

  const [selectedRecord, setSelectedRecord] = useState(null);

  const loadHistory = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await taxService.getAllHistory();
      const data = Array.isArray(res?.data?.data) ? res.data.data : [];

      // Keep newest computations first.
      const sortedData = [...data].sort(
        (a, b) =>
          new Date(b?.createdDate || b?.updatedDate || 0) -
          new Date(a?.createdDate || a?.updatedDate || 0)
      );

      setRecords(sortedData);
    } catch (error) {
      console.error("Failed to load global tax history:", error);
      setRecords([]);
      toast.error("Failed to load tax history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const financialYears = useMemo(
    () =>
      [...new Set(records.map((record) => record.financialYear).filter(Boolean))]
        .sort((a, b) => String(b).localeCompare(String(a))),
    [records]
  );

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const name = getTaxpayerName(record);
      const id = getTaxpayerId(record);
      const pan = getPan(record);
      const type = normalizeType(record.userType || record.taxpayerType);
      const year = String(record.financialYear || "");

      const matchesSearch =
        !query ||
        String(name).toLowerCase().includes(query) ||
        String(id).toLowerCase().includes(query) ||
        String(pan).toLowerCase().includes(query) ||
        year.toLowerCase().includes(query) ||
        String(record.id || "").toLowerCase().includes(query);

      const matchesType =
        taxpayerType === "ALL" || type === taxpayerType;

      const selectedUserId = searchParams.get("userId");
      const matchesUser =
        !selectedUserId ||
        String(getTaxpayerId(record)) === String(selectedUserId);

      const matchesYear =
        financialYear === "ALL" || year === financialYear;

      return matchesSearch && matchesType && matchesYear && matchesUser;
    });
  }, [records, search, taxpayerType, financialYear, searchParams]);

  const uniqueTaxpayers = useMemo(
    () =>
      new Set(
        records
          .map((record) => getTaxpayerId(record))
          .filter((id) => id !== "" && id !== null && id !== undefined)
          .map(String)
      ).size,
    [records]
  );

  const totalTaxLiability = useMemo(
    () =>
      records.reduce(
        (sum, record) => sum + Number(record.taxAmount || 0),
        0
      ),
    [records]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));

  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, page]);

  useEffect(() => {
    setPage(1);
  }, [search, taxpayerType, financialYear]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    const recordId = searchParams.get("recordId");

    if (!recordId || !records.length) {
      return;
    }

    const record = records.find(
      (item) => String(item.id) === String(recordId)
    );

    if (record) {
      setSelectedRecord(record);
    }
  }, [records, searchParams]);

  const resetFilters = () => {
    setSearch("");
    setTaxpayerType("ALL");
    setFinancialYear("ALL");
    setPage(1);
  };

  const downloadExcel = () => {
    if (!filteredRecords.length) {
      toast.error("No tax records available to export");
      return;
    }

    const headers = [
      "Taxpayer",
      "Taxpayer ID",
      "PAN",
      "Type",
      "Financial Year",
      "Gross Income",
      "Taxable Income",
      "Tax Rate",
      "Tax Liability",
      "Status",
      "Computation ID",
    ];

    const rows = filteredRecords.map((record) => [
      getTaxpayerName(record),
      getTaxpayerId(record),
      getPan(record),
      normalizeType(record.userType || record.taxpayerType) === "INSTITUTIONAL"
        ? "Institutional"
        : "Individual",
      record.financialYear || "",
      record.grossIncome || 0,
      record.taxableIncome || 0,
      record.taxRate != null ? `${record.taxRate}%` : "",
      record.taxAmount || 0,
      "Completed",
      record.id || "",
    ]);

    const csv =
      "\ufeff" +
      [headers, ...rows]
        .map((row) =>
          row
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\r\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tax-computation-history.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    toast.success("Tax history exported for Excel");
  };

  const downloadPdf = () => {
    if (!filteredRecords.length) {
      toast.error("No tax records available to export");
      return;
    }

    window.print();
  };

  const visibleStart =
    filteredRecords.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const visibleEnd = Math.min(page * PAGE_SIZE, filteredRecords.length);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="mb-3 -ml-2 gap-2 text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/10 dark:text-sky-400">
                <History className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                  Tax Computation History
                </h1>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  View all completed tax computations across taxpayers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={downloadExcel}
              disabled={loading || records.length === 0}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download Excel
            </Button>

            <Button
              variant="outline"
              onClick={downloadPdf}
              disabled={loading || records.length === 0}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Taxpayers with Computation
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
                    {loading ? "—" : uniqueTaxpayers}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    Completed at least one computation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Total Computations
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
                    {loading ? "—" : records.length}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    Across all taxpayers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Total Tax Liability
                  </p>
                  <p className="mt-1 truncate text-2xl font-bold text-[var(--foreground)]">
                    {loading ? "—" : formatCurrency(totalTaxLiability)}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    Sum of completed tax liabilities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COMPLETED COMPUTATIONS */}
        <Card className="overflow-hidden">
          <CardHeader className="gap-4 border-b border-[var(--border)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-sky-500" />
                  Completed Tax Computations
                </CardTitle>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {loading
                    ? "Loading completed computations..."
                    : `${filteredRecords.length} computations found`}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => loadHistory(true)}
                disabled={loading || refreshing}
                className="w-fit gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5">
            {/* FILTERS */}
            {searchParams.get("userId") && (
              <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
                Showing tax computations for Taxpayer ID {searchParams.get("userId")}
              </div>
            )}

            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_190px_190px_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search taxpayer, PAN, ID or financial year..."
                  className="h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-9 pr-3 text-sm text-[var(--foreground)] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 placeholder:text-[var(--muted-foreground)]"
                />
              </div>

              <select
                value={taxpayerType}
                onChange={(event) => setTaxpayerType(event.target.value)}
                className="h-10 rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-sky-500"
              >
                <option value="ALL">All Taxpayer Types</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="INSTITUTIONAL">Institutional</option>
              </select>

              <select
                value={financialYear}
                onChange={(event) => setFinancialYear(event.target.value)}
                className="h-10 rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-sky-500"
              >
                <option value="ALL">All Financial Years</option>
                {financialYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                onClick={resetFilters}
                className="h-10 gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <Table className="min-w-[1500px]">
                <TableHeader>
                  <TableRow className="bg-[var(--muted)] hover:bg-[var(--muted)]">
                    <TableHead className="w-[250px]">Taxpayer</TableHead>
                    <TableHead className="w-[110px] whitespace-nowrap">
                      Taxpayer ID
                    </TableHead>
                    <TableHead className="w-[140px] whitespace-nowrap">
                      PAN
                    </TableHead>
                    <TableHead className="w-[150px] whitespace-nowrap">
                      Type
                    </TableHead>
                    <TableHead className="w-[125px] whitespace-nowrap">
                      Financial Year
                    </TableHead>
                    <TableHead className="w-[150px] whitespace-nowrap">
                      Gross Income
                    </TableHead>
                    <TableHead className="w-[155px] whitespace-nowrap">
                      Taxable Income
                    </TableHead>
                    <TableHead className="w-[100px] whitespace-nowrap">
                      Tax Rate
                    </TableHead>
                    <TableHead className="w-[160px] whitespace-nowrap">
                      Tax Liability
                    </TableHead>
                    <TableHead className="w-[125px] whitespace-nowrap">
                      Status
                    </TableHead>
                    <TableHead className="w-[100px] whitespace-nowrap text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 11 }).map((__, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton className="h-4 w-[90px]" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="py-14 text-center">
                        <div className="mx-auto max-w-md">
                          <FileText className="mx-auto mb-3 h-10 w-10 text-[var(--muted-foreground)]" />

                          {records.length === 0 ? (
                            <>
                              <p className="font-semibold text-[var(--foreground)]">
                                No Completed Tax Computations
                              </p>
                              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                No taxpayer has a completed tax computation yet.
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-semibold text-[var(--foreground)]">
                                No matching computations found.
                              </p>
                              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                Try changing the search or filters.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={resetFilters}
                                className="mt-4 gap-2"
                              >
                                <RotateCcw className="h-4 w-4" />
                                Reset Filters
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRecords.map((record) => {
                      const name = getTaxpayerName(record);
                      const id = getTaxpayerId(record);
                      const pan = getPan(record);
                      const type = normalizeType(
                        record.userType || record.taxpayerType
                      );

                      return (
                        <TableRow
                          key={record.id}
                          className="align-middle"
                        >
                          <TableCell>
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
                                {getInitials(name)}
                              </div>
                              <div className="min-w-0">
                                <p
                                  className="truncate font-semibold text-[var(--foreground)]"
                                  title={name}
                                >
                                  {name}
                                </p>
                                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                                  Tax computation #{record.id}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="whitespace-nowrap font-semibold text-[var(--foreground)]">
                            {id || "—"}
                          </TableCell>

                          <TableCell className="whitespace-nowrap font-medium text-[var(--foreground)]">
                            {pan || "—"}
                          </TableCell>

                          <TableCell>
                            <span
                              className={`inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold ${typeBadgeClass(
                                type
                              )}`}
                            >
                              {type === "INSTITUTIONAL" ? (
                                <Building2 className="h-3.5 w-3.5" />
                              ) : (
                                <User className="h-3.5 w-3.5" />
                              )}
                              {type === "INSTITUTIONAL"
                                ? "Institutional"
                                : "Individual"}
                            </span>
                          </TableCell>

                          <TableCell className="whitespace-nowrap font-medium text-[var(--foreground)]">
                            {record.financialYear || "—"}
                          </TableCell>

                          <TableCell className="whitespace-nowrap">
                            {formatCurrency(record.grossIncome)}
                          </TableCell>

                          <TableCell className="whitespace-nowrap font-medium">
                            {formatCurrency(record.taxableIncome)}
                          </TableCell>

                          <TableCell className="whitespace-nowrap">
                            {record.taxRate != null
                              ? `${record.taxRate}%`
                              : "—"}
                          </TableCell>

                          <TableCell className="whitespace-nowrap font-bold text-sky-500 dark:text-sky-400">
                            {formatCurrency(record.taxAmount)}
                          </TableCell>

                          <TableCell>
                            <span className="inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Completed
                            </span>
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRecord(record)}
                              className="gap-1.5"
                              title="View computation"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* PAGINATION */}
            {!loading && filteredRecords.length > 0 && (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Showing {visibleStart}–{visibleEnd} of{" "}
                  {filteredRecords.length} computations
                </p>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    ‹
                  </Button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (pageNumber) => (
                      <Button
                        key={pageNumber}
                        variant={page === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNumber)}
                        className="min-w-9"
                      >
                        {pageNumber}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    disabled={page === totalPages}
                    aria-label="Next page"
                  >
                    ›
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* VIEW COMPUTATION DETAILS */}
        {selectedRecord && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedRecord(null);
              }
            }}
          >
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-500">
                    Completed Tax Computation
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-[var(--foreground)]">
                    {getTaxpayerName(selectedRecord)}
                  </h2>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedRecord(null)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                <DetailItem
                  label="Computation ID"
                  value={selectedRecord.id}
                />
                <DetailItem
                  label="Taxpayer ID"
                  value={getTaxpayerId(selectedRecord)}
                />
                <DetailItem
                  label="PAN"
                  value={getPan(selectedRecord) || "—"}
                />
                <DetailItem
                  label="Taxpayer Type"
                  value={
                    normalizeType(
                      selectedRecord.userType || selectedRecord.taxpayerType
                    ) === "INSTITUTIONAL"
                      ? "Institutional"
                      : "Individual"
                  }
                />
                <DetailItem
                  label="Financial Year"
                  value={selectedRecord.financialYear || "—"}
                />
                <DetailItem
                  label="Gross Income"
                  value={formatCurrency(selectedRecord.grossIncome)}
                />
                <DetailItem
                  label="Deductions"
                  value={formatCurrency(selectedRecord.deductions)}
                />
                <DetailItem
                  label="Expenses"
                  value={formatCurrency(selectedRecord.expenses)}
                />
                <DetailItem
                  label="Taxable Income"
                  value={formatCurrency(selectedRecord.taxableIncome)}
                />
                <DetailItem
                  label="Tax Rate"
                  value={
                    selectedRecord.taxRate != null
                      ? `${selectedRecord.taxRate}%`
                      : "—"
                  }
                />
                <DetailItem
                  label="Tax Liability"
                  value={formatCurrency(selectedRecord.taxAmount)}
                  emphasized
                />
                <DetailItem label="Status" value="✓ Completed" />
              </div>

              <div className="flex justify-end border-t border-[var(--border)] p-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRecord(null)}
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

function DetailItem({ label, value, emphasized = false }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs font-medium text-[var(--muted-foreground)]">
        {label}
      </p>
      <p
        className={`mt-1 break-words font-semibold ${
          emphasized
            ? "text-sky-500 dark:text-sky-400"
            : "text-[var(--foreground)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
