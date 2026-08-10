import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

export default function TaxCollectionChart() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],

    datasets: [
      {
        label: "Tax Collected",
        data: [12000, 19000, 25000, 22000, 30000, 32000],
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79,70,229,0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#4F46E5",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      intersect: false,
      mode: "index",
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context) =>
            ` Tax Collected: ₹${Number(context.raw).toLocaleString("en-IN")}`,
        },
      },
    },

    scales: {
      y: {
        beginAtZero: true,

        grid: {
          color: "#E2E8F0",
        },

        ticks: {
          callback: (value) =>
            `₹${Number(value).toLocaleString("en-IN")}`,
        },
      },

      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-[#E2E8F0] dark:border-gray-700 rounded-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Tax Collection Overview
              </CardTitle>

              <p className="text-xs text-[#64748B] dark:text-gray-400 mt-1">
                Monthly tax collection trend
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
              <span className="text-[#64748B] dark:text-gray-400">
                Tax Collected
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-[300px]">
            <Line data={data} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}