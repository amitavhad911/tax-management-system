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
  RotateCcw,
  CalendarDays,
} from "lucide-react";


const FINANCIAL_YEARS = [
  "2026-2027",
  "2025-2026",
  "2024-2025",
  "2023-2024",
];

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

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)]">

              <Calculator className="h-5 w-5" />

            </div>

            <div>

              <h1 className="text-2xl font-bold text-[var(--card-foreground)]">
                Tax Computation
              </h1>

              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Prepare tax computation for a financial year.
              </p>

            </div>

          </div>

        </div>


        {/* Regime Information */}

        <div className="rounded-xl border border-[var(--border)] bg-[var(--accent)] p-4">

          <div className="flex items-start gap-3">

            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-foreground)]" />

            <div>

              <p className="font-semibold text-[var(--accent-foreground)]">
                Tax rules are selected automatically
              </p>

              <p className="mt-1 text-sm text-[var(--accent-foreground)]">
                Tax rules are selected according to the taxpayer type and
                financial year. Individual taxpayers use applicable New Tax
                Regime slabs, while institutional taxpayers use the configured
                institutional tax rate.
              </p>

            </div>

          </div>

        </div>


        {/* Main Grid */}

        <div className="grid gap-6 xl:grid-cols-3">


          {/* Form */}

          <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-sm xl:col-span-2">

            <CardContent className="p-6">

              <div className="mb-6">

                <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
                  Enter Tax Details
                </h2>

                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
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

                        <FormLabel className="text-[var(--foreground)]">
                          Taxpayer
                        </FormLabel>

                        <FormControl>

                          <select
                            {...field}
                            disabled={loadingUsers}
                            className="flex h-10 w-full rounded-md border border-[var(--input)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--card-foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60"
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

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--accent)]/70 p-4">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">

                            {selectedUser.userType === "INSTITUTIONAL" ? (

                              <Building2 className="h-5 w-5" />

                            ) : (

                              <User className="h-5 w-5" />

                            )}

                          </div>

                          <div className="min-w-0">

                            <p className="truncate font-semibold text-[var(--card-foreground)]">
                              {selectedUser.fullName}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">

                              {selectedUser.panNumber && (
                                <span>
                                  PAN: {selectedUser.panNumber}
                                </span>
                              )}

                              <span>
                                Taxpayer ID: {selectedUser.id}
                              </span>

                            </div>

                          </div>

                        </div>

                        <span
                          className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            selectedUser.userType === "INSTITUTIONAL"
                              ? "bg-[var(--accent)] text-[var(--foreground)]  "
                              : "bg-[var(--accent)] text-[var(--foreground)]  "
                          }`}
                        >
                          {selectedUser.userType === "INSTITUTIONAL" ? (
                            <Building2 className="h-3.5 w-3.5" />
                          ) : (
                            <User className="h-3.5 w-3.5" />
                          )}
                          {selectedUser.userType === "INSTITUTIONAL"
                            ? "Institutional"
                            : "Individual"}
                        </span>

                      </div>

                    </div>

                  )}


                  {/* Financial Year */}

                  <FormField
                    control={form.control}
                    name="financialYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[var(--foreground)]">
                          Financial Year
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                            <select
                              {...field}
                              className="flex h-10 w-full appearance-none rounded-md border border-[var(--input)] bg-[var(--card)] pl-10 pr-9 py-2 text-sm text-[var(--card-foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]"
                            >
                              {FINANCIAL_YEARS.map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>
                        </FormControl>
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

                          <FormLabel className="text-[var(--foreground)]">
                            Gross Income
                          </FormLabel>

                          <FormControl>

                            <div className="relative">

                              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />

                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="bg-[var(--card)] pl-9"
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

                          <FormLabel className="text-[var(--foreground)]">
                            Deductions
                          </FormLabel>

                          <FormControl>

                            <div className="relative">

                              <ReceiptText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />

                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="bg-[var(--card)] pl-9"
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

                          <FormLabel className="text-[var(--foreground)]">
                            Expenses
                          </FormLabel>

                          <FormControl>

                            <div className="relative">

                              <WalletCards className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />

                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="bg-[var(--card)] pl-9"
                              />

                            </div>

                          </FormControl>

                          <FormMessage />

                        </FormItem>

                      )}
                    />

                  </div>


                  {/* Submit */}

                  <div className="flex justify-end border-t border-[var(--border)] pt-5">

                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() => {
                        form.reset({
                          userId: "",
                          financialYear: "2025-2026",
                          grossIncome: "",
                          deductions: "0",
                          expenses: "0",
                        });
                        setResult(null);
                      }}
                      className="mr-2 border-[var(--input)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        loadingUsers
                      }
                      className="bg-[var(--primary)] px-6 text-[var(--primary-foreground)] hover:bg-[var(--primary)]"
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

          <Card className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-sm">

            <CardContent className="p-6">

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
                  {selectedUser?.userType === "INSTITUTIONAL" ? (
                    <Building2 className="h-5 w-5" />
                  ) : (
                    <ReceiptText className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--card-foreground)]">
                    Applicable Tax Rules
                  </h2>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {selectedUser
                      ? `${selectedUser.userType === "INSTITUTIONAL" ? "Institutional" : "Individual"} taxpayer • FY ${form.watch("financialYear")}`
                      : "Select a taxpayer to view applicable rules"}
                  </p>
                </div>
              </div>

              {!selectedUser ? (
                <div className="rounded-xl border border-dashed border-[var(--input)] bg-[var(--muted)] p-5 text-center">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Select a taxpayer
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Applicable tax-rule information will appear here.
                  </p>
                </div>
              ) : selectedUser.userType === "INSTITUTIONAL" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-[var(--accent-foreground)]" />
                      <span className="text-xs font-medium text-[var(--foreground)]">
                        Institutional Taxpayer
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full bg-[var(--accent)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]">
                      25% Flat Rate
                    </span>
                  </div>

                  <RuleRow
                    label="Financial Year"
                    value={form.watch("financialYear")}
                  />

                  <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Institutional Tax Rules
                  </p>

                  <RuleRow label="Tax Rate" value="25%" />
                  <RuleRow label="Tax Type" value="Flat Tax Rate" />
                  <RuleRow
                    label="Calculation"
                    value="Taxable Income × 25%"
                  />
                  <RuleRow
                    label="Health & Education Cess"
                    value="4% of Income Tax"
                  />

                  <div className="rounded-lg bg-[var(--muted)] p-3">
                    <p className="text-xs font-medium leading-5 text-[var(--foreground)]">
                      Institutional taxpayers are currently calculated using
                      the project's configured 25% institutional tax rate.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <User className="h-4 w-4 shrink-0 text-[var(--accent-foreground)]" />
                      <span className="text-xs font-medium text-[var(--foreground)]">
                        Individual Taxpayer
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full bg-[var(--accent)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]">
                      New Regime
                    </span>
                  </div>

                  <RuleRow
                    label="Financial Year"
                    value={form.watch("financialYear")}
                  />

                  <RuleRow
                    label="Tax Regime"
                    value="New Tax Regime"
                  />

                  <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Applicable Slabs
                  </p>

                  <SlabRow income="Up to ₹4,00,000" rate="Nil" />
                  <SlabRow income="₹4,00,001 – ₹8,00,000" rate="5%" />
                  <SlabRow income="₹8,00,001 – ₹12,00,000" rate="10%" />
                  <SlabRow income="₹12,00,001 – ₹16,00,000" rate="15%" />
                  <SlabRow income="₹16,00,001 – ₹20,00,000" rate="20%" />
                  <SlabRow income="₹20,00,001 – ₹24,00,000" rate="25%" />
                  <SlabRow income="Above ₹24,00,000" rate="30%" />

                  <div className="mt-4 rounded-lg bg-[var(--muted)] p-3">
                    <p className="text-xs font-medium leading-5 text-[var(--foreground)]">
                      Section 87A rebate is applied by the backend tax engine
                      where applicable.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-lg bg-[var(--muted)] p-3">
                <p className="text-xs font-medium text-[var(--foreground)]">
                  Final taxable income, applicable rate and tax liability are
                  calculated by the backend.
                </p>
              </div>

            </CardContent>

          </Card>

        </div>


        {/* Result */}

        {result && (

          <Card className="overflow-hidden border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-sm">

            <div className="border-b border-[var(--border)] bg-[var(--muted)]/70 px-6 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">

                  <CheckCircle2 className="h-5 w-5" />

                </div>

                <div>

                  <h2 className="font-semibold text-[var(--card-foreground)]">
                    {selectedUser?.userType === "INSTITUTIONAL"
                      ? "Institutional Tax"
                      : "Tax Computation"}{" "}
                    Summary
                  </h2>

                  <p className="text-xs text-[var(--muted-foreground)]">
                    Based on applicable backend tax rules
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
                  label="Allowable Deductions"
                  value={formatCurrency(
                    result.deductions
                  )}
                />

                <ResultItem
                  label="Allowable Expenses"
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
                  label="Applicable Tax Rate"
                  value={`${result.taxRate}%`}
                  icon={
                    <Percent className="h-4 w-4" />
                  }
                />

                <div className="rounded-xl border border-[var(--border)] bg-[var(--accent)] p-4">

                  <p className="text-sm text-[var(--muted-foreground)]">
                    Total Tax Liability
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[var(--accent-foreground)]">
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


function RuleRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
      <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
      <span className="text-right text-sm font-semibold text-[var(--card-foreground)]">{value}</span>
    </div>
  );
}


/* =========================================================
   SLAB ROW
   ========================================================= */

function SlabRow({ income, rate }) {

  return (

    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2">

      <span className="text-xs text-[var(--foreground)]">
        {income}
      </span>

      <span className="font-semibold text-[var(--card-foreground)]">
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
          ? "border-[var(--border)] bg-[var(--accent)]/70  "
          : "border-[var(--border)] bg-[var(--muted)]  "
      }`}
    >

      <div className="flex items-center gap-2">

        <p className="text-sm text-[var(--muted-foreground)]">
          {label}
        </p>

        {icon && (

          <span className="text-[var(--muted-foreground)]">
            {icon}
          </span>

        )}

      </div>

      <p
        className={`mt-2 text-lg font-semibold ${
          highlight
            ? "text-[var(--accent-foreground)] "
            : "text-[var(--card-foreground)] "
        }`}
      >
        {value}
      </p>

    </div>

  );
}