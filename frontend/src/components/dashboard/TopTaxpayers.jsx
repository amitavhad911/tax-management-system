import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import reportService from "../../services/reportService";
import { formatCurrency } from "../../utils/format";

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
  Medal,
  Trophy,
  Users,
} from "lucide-react";

import { motion } from "framer-motion";

export default function TopTaxpayers() {
  const [top, setTop] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopTaxpayers = async () => {
      try {
        const res = await reportService.getTopTaxpayers(5);
        setTop(res.data?.data || []);
      } catch (error) {
        console.error("Failed to load top taxpayers:", error);
        setTop([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopTaxpayers();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="theme-card h-full rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold text-[var(--foreground)]">
              Top Taxpayers
            </CardTitle>

            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Highest tax contribution
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            <Link
              to="/reports"
              className="flex items-center gap-1 text-sm"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3"
                >
                  <Skeleton className="h-9 w-9 rounded-full" />

                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>

                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : top.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="mb-2 h-8 w-8 text-[var(--muted-foreground)]" />

              <p className="text-sm font-medium text-[var(--foreground)]">
                No taxpayer data available
              </p>

              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Tax computations will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {top.map((taxpayer, index) => {
                const rank = taxpayer.rank || index + 1;

                return (
                  <Link
                    key={taxpayer.userId || index}
                    to={`/tax/history/${taxpayer.userId}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-[var(--muted)]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)]">
                      {rank <= 3 ? (
                        <Medal
                          className={`h-5 w-5 ${
                            rank === 1
                              ? "text-amber-500"
                              : rank === 2
                                ? "text-slate-400"
                                : "text-orange-600"
                          }`}
                        />
                      ) : (
                        <span className="text-sm font-semibold text-[var(--muted-foreground)]">
                          {rank}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">
                        {taxpayer.userName || "Unknown Taxpayer"}
                      </p>

                      <p className="text-xs text-[var(--muted-foreground)]">
                        Rank #{rank}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {formatCurrency(taxpayer.taxAmount)}
                      </p>

                      <p className="text-xs text-[var(--muted-foreground)]">
                        Tax paid
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!loading && top.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <Trophy className="h-4 w-4" />
                Top 5 taxpayers
              </div>

              <Link
                to="/reports"
                className="text-xs font-medium text-[var(--primary)] hover:underline"
              >
                View full report
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}