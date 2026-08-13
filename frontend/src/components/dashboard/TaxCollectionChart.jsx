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

import { useEffect, useState } from "react";

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

  const [taxCollection, setTaxCollection] = useState([]);

  useEffect(() => {

    const fetchTaxCollection = async () => {
      try {

        const response = await fetch("/api/reports/dashboard");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const result = await response.json();

        setTaxCollection(
          result?.data?.taxCollectionByFinancialYear || []
        );

      } catch (error) {

        console.error(
          "Error fetching tax collection:",
          error
        );

        setTaxCollection([]);
      }
    };

    fetchTaxCollection();

  }, []);


  const data = {

    labels: taxCollection.map(
      (item) => item.financialYear
    ),

    datasets: [
      {
        label: "Tax Collected",

        data: taxCollection.map(
          (item) => Number(item.taxAmount)
        ),

        borderColor: "#0EA5E9",

        backgroundColor:
          "rgba(14,165,233,0.08)",

        fill: true,

        tension: 0.4,

        pointRadius: 4,

        pointHoverRadius: 6,

        pointBackgroundColor: "#0EA5E9",
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
            ` Tax Collected: ₹${Number(
              context.raw
            ).toLocaleString("en-IN")}`,
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
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
    >

      <Card className="border border-[#E2E8F0] dark:border-gray-700 rounded-xl">

        <CardHeader className="pb-2">

          <div className="flex items-center justify-between">

            <div>

              <CardTitle className="text-base font-semibold">
                Tax Collection Overview
              </CardTitle>

              <p className="text-xs text-[#64748B] dark:text-gray-400 mt-1">
                Financial year-wise tax collection
              </p>

            </div>

            <div className="flex items-center gap-2 text-xs">

              <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />

              <span className="text-[#64748B] dark:text-gray-400">
                Tax Collected
              </span>

            </div>

          </div>

        </CardHeader>


        <CardContent>

          <div className="h-[300px]">

            {taxCollection.length > 0 ? (

              <Line
                data={data}
                options={options}
              />

            ) : (

              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                No tax collection data available
              </div>

            )}

          </div>

        </CardContent>

      </Card>

    </motion.div>
  );
}