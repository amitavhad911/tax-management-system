import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { motion } from "framer-motion";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function UserDistribution({ dashboard }) {
  if (!dashboard) return null;

  const individualCount = dashboard.individualCount ?? 0;
  const institutionalCount = dashboard.institutionalCount ?? 0;

  const total = individualCount + institutionalCount;

  const data = {
    labels: ["Individuals", "Institutional"],

    datasets: [
      {
        data: [individualCount, institutionalCount],

        backgroundColor: ["#0EA5E9", "#10B981"],
        hoverBackgroundColor: ["#0284C7", "#059669"],

        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    cutout: "70%",

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw || 0;

            const percentage = total
              ? ((value / total) * 100).toFixed(1)
              : 0;

            return ` ${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="h-full border border-[#E2E8F0] bg-white rounded-xl dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0F172A] dark:text-white">
            Taxpayer Distribution
          </CardTitle>

          <p className="mt-1 text-xs text-[#64748B] dark:text-gray-400">
            Individual vs institutional taxpayers
          </p>
        </CardHeader>

        <CardContent>
          {/* Chart */}
          <div className="relative flex h-[220px] items-center justify-center">
            <Doughnut data={data} options={options} />

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[#0F172A] dark:text-white">
                {total}
              </span>

              <span className="text-xs text-[#64748B] dark:text-gray-400">
                Total Users
              </span>
            </div>
          </div>

          {/* Distribution cards */}
          <div className="mt-4 grid grid-cols-2 gap-3">

            {/* Individuals */}
            <div className="rounded-lg border border-[#BAE6FD] bg-[#E0F2FE] p-3 dark:border-sky-900/40 dark:bg-sky-950/30">
              <div className="mb-1 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9]" />

                <span className="text-xs font-medium text-[#475569] dark:text-gray-400">
                  Individuals
                </span>
              </div>

              <p className="text-lg font-bold text-[#0EA5E9]">
                {individualCount}
              </p>
            </div>

            {/* Institutional */}
            <div className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] p-3 dark:border-emerald-900/40 dark:bg-emerald-950/30">
              <div className="mb-1 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />

                <span className="text-xs font-medium text-[#475569] dark:text-gray-400">
                  Institutional
                </span>
              </div>

              <p className="text-lg font-bold text-[#059669]">
                {institutionalCount}
              </p>
            </div>

          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}