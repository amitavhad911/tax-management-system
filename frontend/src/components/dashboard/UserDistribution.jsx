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

        backgroundColor: ["#4F46E5", "#10B981"],

        hoverBackgroundColor: ["#4338CA", "#059669"],

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
      <Card className="h-full border border-[#E2E8F0] dark:border-gray-700 rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Taxpayer Distribution
          </CardTitle>

          <p className="text-xs text-[#64748B] dark:text-gray-400">
            Individual vs institutional taxpayers
          </p>
        </CardHeader>

        <CardContent>
          <div className="relative h-[220px] flex items-center justify-center">
            <Doughnut data={data} options={options} />

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-[#0F172A] dark:text-white">
                {total}
              </span>

              <span className="text-xs text-[#64748B] dark:text-gray-400">
                Total Users
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-lg bg-[#EEF2FF] dark:bg-indigo-950/30 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />

                <span className="text-xs text-[#64748B] dark:text-gray-400">
                  Individuals
                </span>
              </div>

              <p className="text-lg font-bold text-[#4F46E5]">
                {individualCount}
              </p>
            </div>

            <div className="rounded-lg bg-[#ECFDF5] dark:bg-emerald-950/30 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />

                <span className="text-xs text-[#64748B] dark:text-gray-400">
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