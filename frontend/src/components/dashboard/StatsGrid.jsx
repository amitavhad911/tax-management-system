import { Users, UserRound, Building2, Wallet, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/format";
import { Skeleton } from "@/components/ui/skeleton";

const iconBgMap = {
  users: "bg-[#EEF2FF] text-[#4F46E5]",
  individuals: "bg-[#ECFDF5] text-[#10B981]",
  institutional: "bg-[#FFF7ED] text-[#F59E0B]",
  tax: "bg-[#EFF6FF] text-[#3B82F6]",
  top: "bg-[#FEF2F2] text-[#EF4444]",
};

const StatCard = ({ title, value, icon: Icon, type, route, loading }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      onClick={() => route && navigate(route)}
      className={`bg-white dark:bg-gray-800 border border-[#E2E8F0] dark:border-gray-700 rounded-xl p-5 min-h-[130px] flex flex-col justify-between ${
        route ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBgMap[type]}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        {route && (
          <span className="text-xs text-[#64748B] dark:text-gray-400">
            View →
          </span>
        )}
      </div>

      <div>
        <p className="text-sm text-[#64748B] dark:text-gray-400 mb-1">
          {title}
        </p>

        {loading ? (
          <Skeleton className="h-7 w-28" />
        ) : (
          <p className="text-xl font-bold text-[#0F172A] dark:text-white truncate">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
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