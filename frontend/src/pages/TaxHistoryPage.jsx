import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  History,
  RefreshCw,
  Search,
  Users,
  WalletCards,
} from "lucide-react";
import toast from "react-hot-toast";

import taxService from "../services/taxService";


// ============================================================
// Helpers
// ============================================================

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const getInitial = (name) => {
  if (!name) return "U";

  return name
    .trim()
    .charAt(0)
    .toUpperCase();
};

const getTypeLabel = (type) => {
  if (!type) return "Unknown";

  const normalized = String(type).toUpperCase();

  if (normalized === "INSTITUTIONAL") {
    return "Institutional";
  }

  if (normalized === "INDIVIDUAL") {
    return "Individual";
  }

  return type;
};

const escapeCsv = (value) => {
  const text = String(value ?? "");

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};


// ============================================================
// Component
// ============================================================

export default function TaxHistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  // ----------------------------------------------------------
  // Load ALL tax history
  // ----------------------------------------------------------

  const loadHistory = async () => {
    try {
      setLoading(true);

      const response = await taxService.getAllHistory();

      const data =
        response?.data?.data ??
        response?.data ??
        [];

      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load tax history:", error);

      setRecords([]);

      toast.error("Failed to load tax history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // ----------------------------------------------------------
  // Financial years
  // ----------------------------------------------------------

  const financialYears = useMemo(() => {
    return [
      ...new Set(
        records
          .map((record) => record.financialYear)
          .filter(Boolean)
      ),
    ].sort((a, b) => String(b).localeCompare(String(a)));
  }, [records]);

  // ----------------------------------------------------------
  // Filter records
  // ----------------------------------------------------------

  const filteredRecords = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return records.filter((record) => {
      const userName = String(record.userName || "").toLowerCase();
      const panNumber = String(record.panNumber || "").toLowerCase();
      const userId = String(record.userId || "").toLowerCase();
      const financialYear = String(
        record.financialYear || ""
      ).toLowerCase();

      const taxpayerType = String(
        record.userType ||
        record.taxpayerType ||
        record.type ||
        ""
      ).toUpperCase();

      const matchesSearch =
        !searchText ||
        userName.includes(searchText) ||
        panNumber.includes(searchText) ||
        userId.includes(searchText) ||
        financialYear.includes(searchText);

      const matchesType =
        typeFilter === "ALL" ||
        taxpayerType === typeFilter;

      const matchesYear =
        yearFilter === "ALL" ||
        record.financialYear === yearFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesYear
      );
    });
  }, [records, search, typeFilter, yearFilter]);

  // ----------------------------------------------------------
  // Summary
  // ----------------------------------------------------------

  const totalTax = useMemo(() => {
    return filteredRecords.reduce(
      (sum, record) =>
        sum + Number(record.taxAmount || 0),
      0
    );
  }, [filteredRecords]);

  const totalTaxableIncome = useMemo(() => {
    return filteredRecords.reduce(
      (sum, record) =>
        sum + Number(record.taxableIncome || 0),
      0
    );
  }, [filteredRecords]);

  const uniqueTaxpayers = useMemo(() => {
    return new Set(
      filteredRecords
        .map((record) => record.userId)
        .filter(Boolean)
    ).size;
  }, [filteredRecords]);

  // ----------------------------------------------------------
  // Reset
  // ----------------------------------------------------------

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setYearFilter("ALL");
  };

  // ----------------------------------------------------------
  // Excel download
  // ----------------------------------------------------------

  const downloadExcel = () => {
    if (!filteredRecords.length) {
      toast.error("No tax records available to export");
      return;
    }

    const headers = [
      "Taxpayer ID",
      "Taxpayer Name",
      "PAN",
      "Taxpayer Type",
      "Financial Year",
      "Gross Income",
      "Deductions",
      "Expenses",
      "Taxable Income",
      "Tax Rate",
      "Tax Liability",
      "Computation Date",
    ];

    const rows = filteredRecords.map((record) => [
      record.userId,
      record.userName,
      record.panNumber,
      getTypeLabel(
        record.userType ||
        record.taxpayerType ||
        record.type
      ),
      record.financialYear,
      record.grossIncome,
      record.deductions,
      record.expenses,
      record.taxableIncome,
      `${record.taxRate ?? 0}%`,
      record.taxAmount,
      record.createdDate || "",
    ]);

    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) =>
        row.map(escapeCsv).join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      ["\ufeff" + csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "tax-history.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast.success("Tax history exported successfully");
  };

  // ----------------------------------------------------------
  // PDF download
  // ----------------------------------------------------------

  const downloadPdf = () => {
    if (!filteredRecords.length) {
      toast.error("No tax records available to export");
      return;
    }

    /*
     * Uses the browser print dialog so the user can select
     * "Save as PDF".
     *
     * This avoids adding another PDF dependency to the project.
     */

    const printWindow = window.open(
      "",
      "_blank",
      "width=1200,height=800"
    );

    if (!printWindow) {
      toast.error("Please allow pop-ups to download PDF");
      return;
    }

    const rows = filteredRecords
      .map(
        (record) => `
          <tr>
            <td>${record.userId ?? "-"}</td>
            <td>${record.userName ?? "-"}</td>
            <td>${record.panNumber ?? "-"}</td>
            <td>${getTypeLabel(
              record.userType ||
              record.taxpayerType ||
              record.type
            )}</td>
            <td>${record.financialYear ?? "-"}</td>
            <td>${formatCurrency(record.taxableIncome)}</td>
            <td>${record.taxRate ?? 0}%</td>
            <td>${formatCurrency(record.taxAmount)}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax History Report</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #0f172a;
            }

            h1 {
              margin-bottom: 4px;
            }

            p {
              color: #64748b;
              margin-top: 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 24px;
              font-size: 12px;
            }

            th,
            td {
              border: 1px solid #cbd5e1;
              padding: 8px;
              text-align: left;
            }

            th {
              background: #e2e8f0;
              font-weight: 700;
            }

            .summary {
              display: flex;
              gap: 30px;
              margin-top: 20px;
            }

            .summary-item {
              border: 1px solid #cbd5e1;
              padding: 12px;
              min-width: 180px;
            }

            .label {
              color: #64748b;
              font-size: 11px;
            }

            .value {
              font-size: 18px;
              font-weight: 700;
              margin-top: 5px;
            }

            @media print {
              body {
                padding: 10px;
              }
            }
          </style>
        </head>

        <body>
          <h1>Tax Management System</h1>
          <p>Global Tax Computation History</p>

          <div class="summary">
            <div class="summary-item">
              <div class="label">Taxpayers</div>
              <div class="value">
                ${uniqueTaxpayers}
              </div>
            </div>

            <div class="summary-item">
              <div class="label">Taxable Income</div>
              <div class="value">
                ${formatCurrency(totalTaxableIncome)}
              </div>
            </div>

            <div class="summary-item">
              <div class="label">Total Tax Liability</div>
              <div class="value">
                ${formatCurrency(totalTax)}
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Taxpayer ID</th>
                <th>Name</th>
                <th>PAN</th>
                <th>Type</th>
                <th>Financial Year</th>
                <th>Taxable Income</th>
                <th>Tax Rate</th>
                <th>Tax Liability</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0f172a] dark:text-white">
      <main className="mx-auto w-full max-w-[1600px] px-5 py-6 lg:px-8">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

          <div>
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
                <History className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Tax Computation History
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  View all completed tax computations across taxpayers.
                </p>
              </div>
            </div>
          </div>

          {/* Export buttons */}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadExcel}
              className="
                inline-flex h-10 items-center gap-2 rounded-lg
                border border-slate-300
                bg-white px-4
                text-sm font-semibold text-slate-700
                transition
                hover:border-sky-300
                hover:bg-sky-50
                hover:text-sky-600
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-200
                dark:hover:border-sky-500
                dark:hover:bg-slate-800
                dark:hover:text-sky-400
              "
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download Excel
            </button>

            <button
              type="button"
              onClick={downloadPdf}
              className="
                inline-flex h-10 items-center gap-2 rounded-lg
                border border-slate-300
                bg-white px-4
                text-sm font-semibold text-slate-700
                transition
                hover:border-sky-300
                hover:bg-sky-50
                hover:text-sky-600
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-200
                dark:hover:border-sky-500
                dark:hover:bg-slate-800
                dark:hover:text-sky-400
              "
            >
              <FileText className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>


        {/* ================================================== */}
        {/* SUMMARY CARDS */}
        {/* ================================================== */}

        <div className="mb-6 grid gap-4 md:grid-cols-3">

          {/* Taxpayers */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111827]">
            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Taxpayers
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {uniqueTaxpayers}
                </p>
              </div>

            </div>
          </div>


          {/* Taxable income */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111827]">
            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <WalletCards className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Taxable Income
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(totalTaxableIncome)}
                </p>
              </div>

            </div>
          </div>


          {/* Tax */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#111827]">
            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Tax Liability
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(totalTax)}
                </p>
              </div>

            </div>
          </div>

        </div>


        {/* ================================================== */}
        {/* TABLE CARD */}
        {/* ================================================== */}

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">

          {/* Card header */}

          <div className="border-b border-slate-200 p-5 dark:border-slate-700">

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <History className="h-5 w-5 text-sky-500" />
                  Completed Tax Computations
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {filteredRecords.length} computation
                  {filteredRecords.length === 1 ? "" : "s"} found
                </p>
              </div>

              <button
                type="button"
                onClick={loadHistory}
                disabled={loading}
                className="
                  inline-flex h-9 items-center justify-center gap-2
                  rounded-lg border border-slate-300
                  bg-white px-3
                  text-sm font-medium text-slate-700
                  hover:bg-slate-50
                  disabled:cursor-not-allowed disabled:opacity-50
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-200
                  dark:hover:bg-slate-800
                "
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />

                Refresh
              </button>

            </div>


            {/* Filters */}

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">

              {/* Search */}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search taxpayer, PAN, ID, or financial year..."
                  className="
                    h-10 w-full rounded-lg
                    border border-slate-300
                    bg-white pl-10 pr-3
                    text-sm text-slate-900
                    outline-none
                    transition
                    focus:border-sky-500
                    focus:ring-2
                    focus:ring-sky-500/10
                    dark:border-slate-700
                    dark:bg-slate-900
                    dark:text-white
                  "
                />
              </div>


              {/* Taxpayer type */}

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value)
                }
                className="
                  h-10 rounded-lg
                  border border-slate-300
                  bg-white px-3
                  text-sm text-slate-700
                  outline-none
                  focus:border-sky-500
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-200
                "
              >
                <option value="ALL">
                  All Taxpayer Types
                </option>

                <option value="INDIVIDUAL">
                  Individual
                </option>

                <option value="INSTITUTIONAL">
                  Institutional
                </option>
              </select>


              {/* Financial year */}

              <select
                value={yearFilter}
                onChange={(event) =>
                  setYearFilter(event.target.value)
                }
                className="
                  h-10 rounded-lg
                  border border-slate-300
                  bg-white px-3
                  text-sm text-slate-700
                  outline-none
                  focus:border-sky-500
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-200
                "
              >
                <option value="ALL">
                  All Financial Years
                </option>

                {financialYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>


              {/* Reset */}

              <button
                type="button"
                onClick={resetFilters}
                className="
                  inline-flex h-10 items-center justify-center gap-2
                  rounded-lg border border-slate-300
                  bg-white px-4
                  text-sm font-medium text-slate-700
                  hover:bg-slate-50
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-200
                  dark:hover:bg-slate-800
                "
              >
                Reset
              </button>

            </div>
          </div>


          {/* ================================================= */}
          {/* LOADING */}
          {/* ================================================= */}

          {loading && (
            <div className="flex min-h-[280px] items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">

                <RefreshCw className="h-7 w-7 animate-spin text-sky-500" />

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Loading tax history...
                </p>

              </div>
            </div>
          )}


          {/* ================================================= */}
          {/* EMPTY */}
          {/* ================================================= */}

          {!loading && filteredRecords.length === 0 && (
            <div className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <History className="h-7 w-7" />
              </div>

              <h3 className="text-base font-semibold">
                No tax computations found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                No completed tax computations match the
                selected search and filters.
              </p>

              {(search ||
                typeFilter !== "ALL" ||
                yearFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
                >
                  Clear filters
                </button>
              )}

            </div>
          )}


          {/* ================================================= */}
          {/* TABLE */}
          {/* ================================================= */}

          {!loading && filteredRecords.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1150px] text-sm">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/70">

                    <th className="px-4 py-3 font-semibold">
                      Taxpayer
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Taxpayer ID
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      PAN
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Type
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Financial Year
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Gross Income
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Taxable Income
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Tax Rate
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Tax Liability
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Status
                    </th>

                  </tr>
                </thead>


                <tbody>

                  {filteredRecords.map((record) => {

                    const taxpayerType =
                      record.userType ||
                      record.taxpayerType ||
                      record.type ||
                      "";

                    const typeLabel =
                      getTypeLabel(taxpayerType);

                    const isInstitutional =
                      String(taxpayerType).toUpperCase() ===
                      "INSTITUTIONAL";

                    return (
                      <tr
                        key={
                          record.id ??
                          `${record.userId}-${record.financialYear}`
                        }
                        className="
                          border-b border-slate-100
                          transition
                          hover:bg-slate-50
                          dark:border-slate-800
                          dark:hover:bg-slate-800/50
                        "
                      >

                        {/* Taxpayer */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
                              {getInitial(record.userName)}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate font-semibold text-slate-900 dark:text-white">
                                {record.userName || "Unknown"}
                              </p>

                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Tax computation #{record.id ?? "-"}
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* User ID */}

                        <td className="px-4 py-4 font-medium">
                          #{record.userId ?? "-"}
                        </td>


                        {/* PAN */}

                        <td className="px-4 py-4">
                          {record.panNumber || "-"}
                        </td>


                        {/* Type */}

                        <td className="px-4 py-4">

                          <span
                            className={`
                              inline-flex items-center rounded-full
                              px-3 py-1 text-xs font-semibold
                              ${
                                isInstitutional
                                  ? "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
                                  : "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400"
                              }
                            `}
                          >
                            {typeLabel}
                          </span>

                        </td>


                        {/* Financial year */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2">

                            <CalendarDays className="h-4 w-4 text-slate-400" />

                            <span className="font-medium">
                              {record.financialYear || "-"}
                            </span>

                          </div>

                        </td>


                        {/* Gross income */}

                        <td className="px-4 py-4 whitespace-nowrap">
                          {formatCurrency(record.grossIncome)}
                        </td>


                        {/* Taxable income */}

                        <td className="px-4 py-4 whitespace-nowrap font-semibold">
                          {formatCurrency(record.taxableIncome)}
                        </td>


                        {/* Rate */}

                        <td className="px-4 py-4 whitespace-nowrap">
                          {record.taxRate ?? 0}%
                        </td>


                        {/* Tax */}

                        <td className="px-4 py-4 whitespace-nowrap">

                          <span className="font-bold text-sky-600 dark:text-sky-400">
                            {formatCurrency(record.taxAmount)}
                          </span>

                        </td>


                        {/* Status */}

                        <td className="px-4 py-4">

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">

                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            Completed

                          </span>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}


          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          {!loading && filteredRecords.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">

              <span>
                Showing {filteredRecords.length} of{" "}
                {records.length} tax computation
                {records.length === 1 ? "" : "s"}
              </span>

              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>
                  Exported reports use the currently applied filters.
                </span>
              </div>

            </div>
          )}

        </section>

      </main>
    </div>
  );
}