import {
  Users,
  UserRound,
  Building2,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/format";
import { Skeleton } from "@/components/ui/skeleton";

const iconBgMap = {
  users: "bg-[var(--accent)] text-[var(--primary)]",
  individuals: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  institutional: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  tax: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  top: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  type,
  route,
  loading,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      onClick={() => route && navigate(route)}
      className={`
        theme-card
        rounded-xl
        p-5
        min-h-[130px]
        flex flex-col justify-between
        transition-all duration-200
        ${
          route
            ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
            : ""
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div
          className={`
            w-11 h-11
            rounded-xl
            flex items-center justify-center
            ${iconBgMap[type]}
          `}
        >
          <Icon className="w-5 h-5" />
        </div>

        {route && (
          <span className="text-xs text-[var(--muted-foreground)]">
            View →
          </span>
        )}
      </div>

      <div>
        <p className="mb-1 text-sm text-[var(--muted-foreground)]">
          {title}
        </p>

        {loading ? (
          <Skeleton className="h-7 w-28" />
        ) : (
          <p className="text-xl font-bold text-[var(--foreground)] truncate">
            {value}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default function StatsGrid({ dashboard, loading }) {
  const data = dashboard || {};

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        title="Total Users"
        value={data.totalUsers ?? 0}
        icon={Users}
        type="users"
        route="/users"
        loading={loading}
      />

      <StatCard
        title="Individual Taxpayers"
        value={data.individualCount ?? 0}
        icon={UserRound}
        type="individuals"
        route="/users"
        loading={loading}
      />

      <StatCard
        title="Institutional Taxpayers"
        value={data.institutionalCount ?? 0}
        icon={Building2}
        type="institutional"
        route="/users"
        loading={loading}
      />

      <StatCard
        title="Total Tax Collected"
        value={formatCurrency(data.totalTaxCollected ?? 0)}
        icon={Wallet}
        type="tax"
        loading={loading}
      />

      <StatCard
        title="Highest Taxpayer"
        value={data.highestTaxpayer?.userName || "N/A"}
        icon={TrendingUp}
        type="top"
        route={
          data.highestTaxpayer
            ? `/tax/history/${data.highestTaxpayer.userId}`
            : undefined
        }
        loading={loading}
      />
    </div>
  );
}