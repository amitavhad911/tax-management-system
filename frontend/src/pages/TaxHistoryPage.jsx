import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import taxService from "../services/taxService";
import { formatCurrency } from "../utils/format";
import { toast } from "react-hot-toast";
import {
  ArrowLeft, CalendarDays, FileText, IndianRupee, ReceiptText,
  Download, FileSpreadsheet, FileDown, Search, RotateCcw,
  User, Building2,
} from "lucide-react";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "../components/PageTransition";

const getInitials = (name = "") =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((x) => x[0]?.toUpperCase()).join("") || "T";

export default function TaxHistoryPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [financialYear, setFinancialYear] = useState("ALL");
  const [taxpayerType, setTaxpayerType] = useState("ALL");

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const res = await taxService.getHistory(userId);
        setRecords(res.data.data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load tax history");
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [userId]);

  const first = records[0] || {};
  const taxpayer = first.user || first.taxpayer || {};
  const taxpayerName =
    taxpayer.fullName || taxpayer.userName || first.fullName ||
    first.userName || `Taxpayer #${userId}`;
  const taxpayerPan =
    taxpayer.panNumber || taxpayer.pan || first.panNumber || first.pan || "";
  const taxpayerTypeValue =
    taxpayer.userType || taxpayer.taxpayerType ||
    first.userType || first.taxpayerType || "";

  const years = useMemo(
    () => [...new Set(records.map(r => r.financialYear).filter(Boolean))]
      .sort((a, b) => String(b).localeCompare(String(a))),
    [records]
  );

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const type = String(r.userType || r.taxpayerType || taxpayerTypeValue).toUpperCase();
      const matchesSearch =
        !q ||
        String(r.financialYear || "").toLowerCase().includes(q) ||
        String(r.id || "").toLowerCase().includes(q);
      return matchesSearch &&
        (financialYear === "ALL" || String(r.financialYear) === financialYear) &&
        (taxpayerType === "ALL" || type === taxpayerType);
    });
  }, [records, search, financialYear, taxpayerType, taxpayerTypeValue]);

  const totalTax = filteredRecords.reduce((s, r) => s + Number(r.taxAmount || 0), 0);
  const latestYear = [...filteredRecords].map(r => r.financialYear).filter(Boolean)
    .sort((a, b) => String(b).localeCompare(String(a)))[0] || "—";

  const resetFilters = () => {
    setSearch("");
    setFinancialYear("ALL");
    setTaxpayerType("ALL");
  };

  const downloadExcel = () => {
    if (!filteredRecords.length) {
      toast.error("No tax records available to export");
      return;
    }
    const headers = [
      "Financial Year", "Gross Income", "Deductions", "Expenses",
      "Taxable Income", "Tax Rate", "Tax Amount",
    ];
    const rows = filteredRecords.map(r => [
      r.financialYear || "", r.grossIncome || 0, r.deductions || 0,
      r.expenses || 0, r.taxableIncome || 0,
      r.taxRate != null ? `${r.taxRate}%` : "", r.taxAmount || 0,
    ]);
    const csv = "\ufeff" + [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `tax-history-${userId || "taxpayer"}.csv`;
    a.click();
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

  const isInstitutional = String(taxpayerTypeValue).toUpperCase() === "INSTITUTIONAL";

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/users")} className="gap-2 px-2">
                <ArrowLeft className="h-4 w-4" /> Users
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Tax Computation History</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              View previous-year tax computations for this taxpayer.
            </p>
          </div>
          {!loading && records.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={downloadExcel} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" /> Download Excel
              </Button>
              <Button variant="outline" onClick={downloadPdf} className="gap-2">
                <FileDown className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          )}
        </div>

        {!loading && records.length > 0 && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {getInitials(taxpayerName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{taxpayerName}</p>
                      <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                        <span>Taxpayer ID: {userId}</span>
                        {taxpayerPan && <span>PAN: {taxpayerPan}</span>}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    isInstitutional
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-violet-100 text-violet-700"
                  }`}>
                    {isInstitutional ? <Building2 className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                    {isInstitutional ? "Institutional" : "Individual"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card><CardContent className="p-5"><div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2"><CalendarDays className="h-5 w-5 text-primary" /></div>
                <div><p className="text-sm text-muted-foreground">Total Years</p><p className="text-xl font-bold">{filteredRecords.length}</p></div>
              </div></CardContent></Card>
              <Card><CardContent className="p-5"><div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2"><IndianRupee className="h-5 w-5 text-primary" /></div>
                <div><p className="text-sm text-muted-foreground">Total Tax Liability</p><p className="text-xl font-bold">{formatCurrency(totalTax)}</p></div>
              </div></CardContent></Card>
              <Card><CardContent className="p-5"><div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2"><ReceiptText className="h-5 w-5 text-primary" /></div>
                <div><p className="text-sm text-muted-foreground">Latest Financial Year</p><p className="text-xl font-bold">{latestYear}</p></div>
              </div></CardContent></Card>
            </div>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Completed Tax Computations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[1fr_190px_190px_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search financial year or computation ID..."
                  className="h-10 w-full rounded-md border border-[var(--input)] bg-[var(--card)] pl-9 pr-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]" />
              </div>
              <select value={taxpayerType} onChange={e => setTaxpayerType(e.target.value)}
                className="h-10 rounded-md border border-[var(--input)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)]">
                <option value="ALL">All Taxpayer Types</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="INSTITUTIONAL">Institutional</option>
              </select>
              <select value={financialYear} onChange={e => setFinancialYear(e.target.value)}
                className="h-10 rounded-md border border-[var(--input)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)]">
                <option value="ALL">All Financial Years</option>
                {years.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
              <Button variant="outline" onClick={resetFilters} className="h-10 gap-2">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Financial Year</TableHead><TableHead>Gross Income</TableHead>
                  <TableHead>Deductions</TableHead><TableHead>Expenses</TableHead>
                  <TableHead>Taxable Income</TableHead><TableHead>Tax Rate</TableHead>
                  <TableHead>Tax Liability</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {loading ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) =>
                      <TableCell key={j}><Skeleton className="h-4 w-[90px]" /></TableCell>
                    )}</TableRow>
                  )) : filteredRecords.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      {records.length === 0 ? (
                        <><p className="font-medium text-[var(--foreground)]">No Completed Tax Computations</p>
                        <p className="mt-1 text-sm">No taxpayer has a completed tax computation yet.</p></>
                      ) : (
                        <><p className="font-medium text-[var(--foreground)]">No matching computations found.</p>
                        <p className="mt-1 text-sm">Try changing the search or filters.</p>
                        <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4 gap-2">
                          <RotateCcw className="h-4 w-4" /> Reset Filters
                        </Button></>
                      )}
                    </TableCell></TableRow>
                  ) : filteredRecords.map(record => (
                    <TableRow key={record.id}>
                      <TableCell><span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{record.financialYear}</span></TableCell>
                      <TableCell>{formatCurrency(record.grossIncome)}</TableCell>
                      <TableCell>{formatCurrency(record.deductions)}</TableCell>
                      <TableCell>{formatCurrency(record.expenses || 0)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(record.taxableIncome)}</TableCell>
                      <TableCell>{record.taxRate != null ? `${record.taxRate}%` : "—"}</TableCell>
                      <TableCell className="font-bold text-primary">{formatCurrency(record.taxAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {!loading && filteredRecords.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button variant="outline" size="sm" onClick={downloadExcel} className="gap-2">
                  <Download className="h-4 w-4" /> Excel
                </Button>
                <Button variant="outline" size="sm" onClick={downloadPdf} className="gap-2">
                  <FileDown className="h-4 w-4" /> PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}