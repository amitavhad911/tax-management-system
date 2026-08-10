import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import taxService from "../services/taxService";
import { formatCurrency } from "../utils/format";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  IndianRupee,
  ReceiptText,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "../components/PageTransition";

export default function TaxHistoryPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const totalTax = records.reduce(
    (sum, record) => sum + Number(record.taxAmount || 0),
    0
  );

  const totalTaxable = records.reduce(
    (sum, record) => sum + Number(record.taxableIncome || 0),
    0
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/users")}
                className="gap-2 px-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Users
              </Button>
            </div>

            <h1 className="text-2xl font-bold">
              Previous Tax Computations
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              View tax computation records for taxpayer #{userId}.
            </p>
          </div>
        </div>

        {!loading && records.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Years Available
                    </p>
                    <p className="text-xl font-bold">
                      {records.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IndianRupee className="w-5 h-5 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Tax
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(totalTax)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ReceiptText className="w-5 h-5 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Taxable Income
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(totalTaxable)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Tax Computation History
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Financial Year</TableHead>
                    <TableHead>Gross Income</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Expenses</TableHead>
                    <TableHead>Taxable Income</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead>Tax Liability</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-[90px]" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No previous tax computations found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.financialYear}
                        </TableCell>

                        <TableCell>
                          {formatCurrency(record.grossIncome)}
                        </TableCell>

                        <TableCell>
                          {formatCurrency(record.deductions)}
                        </TableCell>

                        <TableCell>
                          {formatCurrency(record.expenses || 0)}
                        </TableCell>

                        <TableCell className="font-medium">
                          {formatCurrency(record.taxableIncome)}
                        </TableCell>

                        <TableCell>
                          {record.taxRate}%
                        </TableCell>

                        <TableCell className="font-bold text-primary">
                          {formatCurrency(record.taxAmount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}