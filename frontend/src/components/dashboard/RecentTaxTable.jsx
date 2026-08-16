import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import taxService from "../../services/taxService";
import { formatCurrency } from "../../utils/format";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  ChevronRight,
  Calculator,
  FileText,
} from "lucide-react";

import { motion } from "framer-motion";

export default function RecentTaxTable() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taxService
      .getAllHistory()
      .then((res) => {
        const allRecords = Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        const sortedRecords = [...allRecords]
          .sort(
            (a, b) =>
              new Date(b?.createdDate || b?.updatedDate || 0) -
              new Date(a?.createdDate || a?.updatedDate || 0)
          )
          .slice(0, 3);

        setRecords(sortedRecords);
      })
      .catch((error) => {
        console.error("Failed to load recent tax computations:", error);
        setRecords([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="theme-card rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold text-[var(--foreground)]">
              Recent Tax Computations
            </CardTitle>

            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Recently prepared tax computations
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            <Link
              to="/tax/history"
              className="flex items-center gap-1 text-sm"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-lg border border-[var(--border)]">
            <Table>
              <TableHeader className="bg-[var(--muted)]">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-[var(--secondary-foreground)]">
                    Taxpayer
                  </TableHead>

                  <TableHead className="text-xs font-semibold text-[var(--secondary-foreground)]">
                    Financial Year
                  </TableHead>

                  <TableHead className="text-xs font-semibold text-[var(--secondary-foreground)]">
                    Taxable Income
                  </TableHead>

                  <TableHead className="text-xs font-semibold text-[var(--secondary-foreground)]">
                    Tax Amount
                  </TableHead>

                  <TableHead className="text-xs font-semibold text-[var(--secondary-foreground)]">
                    Date
                  </TableHead>

                  <TableHead className="text-xs font-semibold text-[var(--secondary-foreground)]">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-[110px]" />
                      </TableCell>

                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>

                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>

                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>

                      <TableCell>
                        <Skeleton className="h-4 w-[70px]" />
                      </TableCell>

                      <TableCell>
                        <Skeleton className="h-5 w-[75px] rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-[var(--foreground)]"
                    >
                      <div className="flex flex-col items-center">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]">
                          <Calculator className="h-5 w-5 text-[var(--primary)]" />
                        </div>

                        <p className="text-sm font-medium text-[var(--foreground)]">
                          No tax computations found
                        </p>

                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                          Prepare a tax computation to see it here.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r) => (
                    <TableRow
                      key={r.id}
                      onClick={() =>
                        navigate(`/tax/history?recordId=${r.id}`)
                      }
                      className="cursor-pointer hover:bg-[var(--muted)]"
                      title="View computation details"
                    >
                      <TableCell className="text-sm font-medium text-[var(--foreground)]">
                        {r.userName ||
                          r.user?.fullName ||
                          r.fullName ||
                          r.taxpayerName ||
                          "N/A"}
                      </TableCell>

                      <TableCell className="text-sm text-[var(--foreground)]">
                        {r.financialYear}
                      </TableCell>

                      <TableCell className="text-sm text-[var(--foreground)]">
                        {formatCurrency(r.taxableIncome)}
                      </TableCell>

                      <TableCell className="text-sm font-semibold text-[var(--foreground)]">
                        {formatCurrency(r.taxAmount)}
                      </TableCell>

                      <TableCell className="text-sm text-[var(--muted-foreground)]">
                        {r.createdDate
                          ? format(
                              new Date(r.createdDate),
                              "dd MMM yy"
                            )
                          : "-"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-[11px] text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                        >
                          Completed
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <FileText className="h-4 w-4" />

            Tax computations include taxable income, deductions, tax rate
            and final tax liability.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
