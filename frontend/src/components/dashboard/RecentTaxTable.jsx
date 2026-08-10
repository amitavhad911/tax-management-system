import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taxService
      .getHistory(1)
      .then((res) => {
        setRecords(res.data?.data?.slice(0, 5) || []);
      })
      .catch(() => {
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
      <Card className="border border-[#E2E8F0] dark:border-gray-700 rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Recent Tax Computations
            </CardTitle>

            <p className="text-xs text-[#64748B] dark:text-gray-400 mt-1">
              Recently prepared tax computations
            </p>
          </div>

          <Button variant="ghost" size="sm" asChild>
            <Link
              to="/tax/history/1"
              className="flex items-center gap-1 text-sm"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border border-[#E2E8F0] dark:border-gray-700 overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F8FAFC] dark:bg-gray-800">
                <TableRow>
                  <TableHead className="text-xs font-semibold">
                    Taxpayer
                  </TableHead>

                  <TableHead className="text-xs font-semibold">
                    Financial Year
                  </TableHead>

                  <TableHead className="text-xs font-semibold">
                    Taxable Income
                  </TableHead>

                  <TableHead className="text-xs font-semibold">
                    Tax Amount
                  </TableHead>

                  <TableHead className="text-xs font-semibold">
                    Date
                  </TableHead>

                  <TableHead className="text-xs font-semibold">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
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
                      className="py-12 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-[#EEF2FF] flex items-center justify-center mb-3">
                          <Calculator className="w-5 h-5 text-[#4F46E5]" />
                        </div>

                        <p className="font-medium text-sm">
                          No tax computations found
                        </p>

                        <p className="text-xs text-[#64748B] mt-1">
                          Prepare a tax computation to see it here.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r) => (
                    <TableRow
                      key={r.id}
                      className="hover:bg-[#F8FAFC] dark:hover:bg-gray-800"
                    >
                      <TableCell className="font-medium text-sm">
                        {r.userName ||
                          r.user?.fullName ||
                          "N/A"}
                      </TableCell>

                      <TableCell className="text-sm">
                        {r.financialYear}
                      </TableCell>

                      <TableCell className="text-sm">
                        {formatCurrency(r.taxableIncome)}
                      </TableCell>

                      <TableCell className="text-sm font-semibold">
                        {formatCurrency(r.taxAmount)}
                      </TableCell>

                      <TableCell className="text-sm text-[#64748B]">
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
                          className="text-[11px] bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
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

          <div className="flex items-center gap-2 mt-4 text-xs text-[#64748B]">
            <FileText className="w-4 h-4" />
            Tax computations include taxable income, deductions, tax rate
            and final tax liability.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}