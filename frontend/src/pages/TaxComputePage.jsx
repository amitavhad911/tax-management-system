import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import taxService from "../services/taxService";
import userService from "../services/userService";

import { toast } from "react-hot-toast";
import { formatCurrency } from "../utils/format";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Card, CardContent } from "@/components/ui/card";
import PageTransition from "../components/PageTransition";

import {
  Calculator,
  User,
  Building2,
  IndianRupee,
  ReceiptText,
  WalletCards,
  Percent,
  CheckCircle2,
  Info,
} from "lucide-react";


/* =========================================================
   FORM VALIDATION
   ========================================================= */

const schema = z.object({
  userId: z
    .string()
    .min(1, "Please select a user"),

  financialYear: z
    .string()
    .regex(
      /^\d{4}-\d{4}$/,
      "Format must be YYYY-YYYY"
    ),

  grossIncome: z
    .string()
    .min(1, "Gross income is required")
    .refine(
      (value) => Number(value) > 0,
      {
        message: "Gross income must be greater than 0",
      }
    ),

  deductions: z
    .string()
    .optional()
    .default("0")
    .refine(
      (value) =>
        value === "" || Number(value) >= 0,
      {
        message: "Deductions cannot be negative",
      }
    ),

  expenses: z
    .string()
    .optional()
    .default("0")
    .refine(
      (value) =>
        value === "" || Number(value) >= 0,
      {
        message: "Expenses cannot be negative",
      }
    ),
});


/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function TaxComputePage() {

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [result, setResult] = useState(null);

  const form = useForm({
    resolver: zodResolver(schema),

    defaultValues: {
      userId: "",
      financialYear: "2025-2026",
      grossIncome: "",
      deductions: "0",
      expenses: "0",
    },
  });

  const { isSubmitting } = form.formState;


  /* =========================================================
     LOAD USERS
     ========================================================= */

  useEffect(() => {

    const loadUsers = async () => {

      try {

        setLoadingUsers(true);

        const response = await userService.getAll({
          page: 0,
          size: 100,
        });

        const data = response?.data?.data;

        if (Array.isArray(data?.content)) {

          setUsers(data.content);

        } else if (Array.isArray(data)) {

          setUsers(data);

        } else {

          setUsers([]);
        }

      } catch (error) {

        console.error(
          "Failed to load users:",
          error
        );

        toast.error(
          error.response?.data?.message ||
          "Unable to load users"
        );

      } finally {

        setLoadingUsers(false);
      }
    };

    loadUsers();

  }, []);


  /* =========================================================
     SUBMIT
     ========================================================= */

  const onSubmit = async (data) => {

    try {

      const payload = {
        userId: Number(data.userId),

        financialYear:
          data.financialYear,

        grossIncome:
          Number(data.grossIncome),

        deductions:
          Number(data.deductions || 0),

        expenses:
          Number(data.expenses || 0),
      };

      const response =
        await taxService.compute(payload);

      setResult(
        response?.data?.data
      );

      toast.success(
        "Tax computation completed successfully"
      );

    } catch (error) {

      console.error(
        "Tax computation error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Unable to compute tax. Please try again."
      );
    }
  };


  /* =========================================================
     SELECTED USER
     ========================================================= */

  const selectedUserId =
    form.watch("userId");

  const selectedUser =
    users.find(
      (user) =>
        String(user.id) ===
        String(selectedUserId)
    );


  /* =========================================================
     UI
     ========================================================= */

  return (

    <PageTransition>

      <div className="min-h-full space-y-6">

        {/* Header */}

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">

              <Calculator className="h-5 w-5" />

            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Tax Computation
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Calculate income tax using the New Tax Regime.
              </p>

            </div>

          </div>

        </div>


        {/* Regime Information */}

        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-500/20 dark:bg-sky-500/10">

          <div className="flex items-start gap-3">

            <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />

            <div>

              <p className="font-semibold text-sky-900 dark:text-sky-200">
                New Tax Regime — FY 2025-26
              </p>

              <p className="mt-1 text-sm text-sky-700 dark:text-sky-300">
                Tax is calculated according to the applicable New Tax Regime
                slabs. Rebate under Section 87A is applied where applicable.
              </p>

            </div>

          </div>

        </div>


        {/* Main Grid */}

        <div className="grid gap-6 xl:grid-cols-3">


          {/* Form */}

          <Card className="border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 xl:col-span-2">

            <CardContent className="p-6">

              <div className="mb-6">

                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Enter Tax Details
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Select the taxpayer and provide the applicable income details.
                </p>

              </div>


              <Form {...form}>

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >


                  {/* Taxpayer */}

                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (

                      <FormItem>

                        <FormLabel className="text-slate-700 dark:text-slate-300">
                          Taxpayer
                        </FormLabel>

                        <FormControl>

                          <select
                            {...field}
                            disabled={loadingUsers}
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                          >

                            <option value="">

                              {loadingUsers
                                ? "Loading taxpayers..."
                                : "Select taxpayer"}

                            </option>

                            {users.map((user) => (

                              <option
                                key={user.id}
                                value={user.id}
                              >

                                {user.fullName}

                                {user.panNumber
                                  ? ` — ${user.panNumber}`
                                  : ""}

                              </option>

                            ))}

                          </select>

                        </FormControl>

                        <FormMessage />

                      </FormItem>

                    )}
                  />


                  {/* Selected User */}

                  {selectedUser && (

                    <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4 dark:border-sky-500/20 dark:bg-sky-500/10">

                      <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">

                          {selectedUser.userType === "INSTITUTIONAL" ? (

                            <Building2 className="h-5 w-5" />

                          ) : (

                            <User className="h-5 w-5" />

                          )}

                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {selectedUser.fullName}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">

                            {selectedUser.panNumber && (

                              <span>
                                PAN: {selectedUser.panNumber}
                              </span>

                            )}

                            {selectedUser.userType && (

                              <span>
                                Type: {selectedUser.userType}
                              </span>

                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                  )}


                  {/* Financial Year */}

                  <FormField
                    control={form.control}
                    name="financialYear"
                    render={({ field }) => (

                      <FormItem>

                        <FormLabel className="text-slate-700 dark:text-slate-300">
                          Financial Year
                        </FormLabel>

                        <FormControl>

                          <Input
                            {...field}
                            placeholder="2025-2026"
                            className="bg-white dark:bg-slate-950"
                          />

                        </FormControl>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Example: 2025-2026
                        </p>

                        <FormMessage />

                      </FormItem>

                    )}
                  />


                  {/* Income Fields */}

                  <div className="grid gap-5 md:grid-cols-3">


                    {/* Gross Income */}

                    <FormField
                      control={form.control}
                      name="grossIncome"
                      render={({ field }) => (

                        <FormItem>

                          <FormLabel className="text-slate-700 dark:text-slate-300">
                            Gross Income
                          </FormLabel>

                          <FormControl>

                            <div className="relative">

                              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="bg-white pl-9 dark:bg-slate-950"
                              />

                            </div>

                          </FormControl>

                          <FormMessage />

                        </FormItem>

                      )}
                    />


                    {/* Deductions */}

                    <FormField
                      control={form.control}
                      name="deductions"
                      render={({ field }) => (

                        <FormItem>

                          <FormLabel className="text-slate-700 dark:text-slate-300">
                            Deductions
                          </FormLabel>

                          <FormControl>

                            <div className="relative">

                              <ReceiptText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="bg-white pl-9 dark:bg-slate-950"
                              />

                            </div>

                          </FormControl>

                          <FormMessage />

                        </FormItem>

                      )}
                    />


                    {/* Expenses */}

                    <FormField
                      control={form.control}
                      name="expenses"
                      render={({ field }) => (

                        <FormItem>

                          <FormLabel className="text-slate-700 dark:text-slate-300">
                            Expenses
                          </FormLabel>

                          <FormControl>

                            <div className="relative">

                              <WalletCards className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="bg-white pl-9 dark:bg-slate-950"
                              />

                            </div>

                          </FormControl>

                          <FormMessage />

                        </FormItem>

                      )}
                    />

                  </div>


                  {/* Submit */}

                  <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800">

                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        loadingUsers
                      }
                      className="bg-sky-600 px-6 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                    >

                      <Calculator className="mr-2 h-4 w-4" />

                      {isSubmitting
                        ? "Computing..."
                        : "Calculate Tax"}

                    </Button>

                  </div>

                </form>

              </Form>

            </CardContent>

          </Card>


          {/* Tax Slabs */}

          <Card className="border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">

            <CardContent className="p-6">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">

                  <ReceiptText className="h-5 w-5" />

                </div>

                <div>

                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                    New Tax Regime
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    FY 2025-26 / AY 2026-27
                  </p>

                </div>

              </div>


              <div className="space-y-2 text-sm">

                <SlabRow
                  income="Up to ₹4,00,000"
                  rate="Nil"
                />

                <SlabRow
                  income="₹4,00,001 – ₹8,00,000"
                  rate="5%"
                />

                <SlabRow
                  income="₹8,00,001 – ₹12,00,000"
                  rate="10%"
                />

                <SlabRow
                  income="₹12,00,001 – ₹16,00,000"
                  rate="15%"
                />

                <SlabRow
                  income="₹16,00,001 – ₹20,00,000"
                  rate="20%"
                />

                <SlabRow
                  income="₹20,00,001 – ₹24,00,000"
                  rate="25%"
                />

                <SlabRow
                  income="Above ₹24,00,000"
                  rate="30%"
                />

              </div>


              <div className="mt-5 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-500/10">

                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Section 87A rebate is applied by the backend tax engine
                  where applicable.
                </p>

              </div>


              <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">

                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  The final taxable income, applicable rate and tax liability
                  are calculated by the backend.
                </p>

              </div>

            </CardContent>

          </Card>

        </div>


        {/* Result */}

        {result && (

          <Card className="overflow-hidden border-emerald-200 bg-white text-slate-900 shadow-sm dark:border-emerald-500/20 dark:bg-slate-900 dark:text-slate-100">

            <div className="border-b border-emerald-100 bg-emerald-50/70 px-6 py-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">

                  <CheckCircle2 className="h-5 w-5" />

                </div>

                <div>

                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                    Tax Computation Result
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    New Tax Regime — FY {result.financialYear}
                  </p>

                </div>

              </div>

            </div>


            <CardContent className="p-6">

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <ResultItem
                  label="Gross Income"
                  value={formatCurrency(
                    result.grossIncome
                  )}
                />

                <ResultItem
                  label="Deductions"
                  value={formatCurrency(
                    result.deductions
                  )}
                />

                <ResultItem
                  label="Expenses"
                  value={formatCurrency(
                    result.expenses
                  )}
                />

                <ResultItem
                  label="Taxable Income"
                  value={formatCurrency(
                    result.taxableIncome
                  )}
                  highlight
                />

                <ResultItem
                  label="Income Tax"
                  value={formatCurrency(
                    result.incomeTax
                  )}
                />

                <ResultItem
                  label="Cess"
                  value={formatCurrency(
                    result.cess
                  )}
                />

                <ResultItem
                  label="Effective Tax Rate"
                  value={`${result.taxRate}%`}
                  icon={
                    <Percent className="h-4 w-4" />
                  }
                />

                <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-500/20 dark:bg-sky-500/10">

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Total Tax Liability
                  </p>

                  <p className="mt-2 text-2xl font-bold text-sky-600 dark:text-sky-400">
                    {formatCurrency(
                      result.taxAmount
                    )}
                  </p>

                </div>

              </div>

            </CardContent>

          </Card>

        )}

      </div>

    </PageTransition>
  );
}


/* =========================================================
   SLAB ROW
   ========================================================= */

function SlabRow({ income, rate }) {

  return (

    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/50">

      <span className="text-xs text-slate-600 dark:text-slate-300">
        {income}
      </span>

      <span className="font-semibold text-slate-900 dark:text-slate-100">
        {rate}
      </span>

    </div>

  );
}


/* =========================================================
   RESULT ITEM
   ========================================================= */

function ResultItem({
  label,
  value,
  highlight = false,
  icon,
}) {

  return (

    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-sky-200 bg-sky-50/70 dark:border-sky-500/20 dark:bg-sky-500/10"
          : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50"
      }`}
    >

      <div className="flex items-center gap-2">

        <p className="text-sm text-slate-500 dark:text-slate-400">
          {label}
        </p>

        {icon && (

          <span className="text-slate-400 dark:text-slate-500">
            {icon}
          </span>

        )}

      </div>

      <p
        className={`mt-2 text-lg font-semibold ${
          highlight
            ? "text-sky-600 dark:text-sky-400"
            : "text-slate-900 dark:text-slate-100"
        }`}
      >
        {value}
      </p>

    </div>

  );
}