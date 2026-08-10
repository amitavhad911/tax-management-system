import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserRound, Building2 } from "lucide-react";

import userService from "../services/userService";
import { toast } from "react-hot-toast";

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import PageTransition from "../components/PageTransition";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),

  email: z.string().email("Invalid email"),

  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, "Phone number must contain 10 digits"),

  address: z.string().optional(),

  panNumber: z
    .string()
    .regex(
      /^[A-Z]{5}\d{4}[A-Z]$/,
      "Enter a valid PAN (e.g. ABCDE1234F)"
    ),

  userType: z.enum(["INDIVIDUAL", "INSTITUTIONAL"]),
});

export default function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = !!id;

  const form = useForm({
    resolver: zodResolver(schema),

    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      panNumber: "",
      userType: "INDIVIDUAL",
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (!isEdit) return;

    const loadUser = async () => {
      try {
        const res = await userService.getById(id);

        const user = res.data?.data;

        if (!user) {
          toast.error("User not found");
          navigate("/users");
          return;
        }

        form.reset({
          fullName: user.fullName || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          address: user.address || "",
          panNumber: user.panNumber || "",
          userType: user.userType || "INDIVIDUAL",
        });
      } catch (error) {
        console.error("Failed to load user:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load user"
        );

        navigate("/users");
      }
    };

    loadUser();
  }, [id, isEdit, navigate, form]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await userService.update(id, data);
        toast.success("User updated successfully");
      } else {
        await userService.create(data);
        toast.success("User created successfully");
      }

      navigate("/users");
    } catch (err) {
      console.error("Error saving user:", err);

      toast.error(
        err.response?.data?.message ||
          "Error saving taxpayer"
      );
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {isEdit ? "Edit User" : "Add User"}
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {isEdit
              ? "Update taxpayer information."
              : "Add an individual or institutional taxpayer."}
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
          >
            {/* Taxpayer Type */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
              <div className="mb-3">
                <h2 className="font-semibold text-[var(--foreground)]">
                  Taxpayer Type
                </h2>

                <p className="text-sm text-[var(--muted-foreground)]">
                  Select whether this taxpayer is an individual
                  or an institution.
                </p>
              </div>

              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Type</FormLabel>

                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select taxpayer type" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="INDIVIDUAL">
                          <div className="flex items-center gap-2">
                            <UserRound className="h-4 w-4" />
                            <span>Individual</span>
                          </div>
                        </SelectItem>

                        <SelectItem value="INSTITUTIONAL">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>Institutional</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Basic Information */}
            <div>
              <h2 className="mb-4 font-semibold text-[var(--foreground)]">
                Taxpayer Information
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter full name"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter email"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="10-digit phone number"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PAN */}
                <FormField
                  control={form.control}
                  name="panNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN</FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          maxLength={10}
                          placeholder="ABCDE1234F"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.toUpperCase()
                            )
                          }
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter address"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/users")}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : isEdit
                    ? "Update User"
                    : "Save User"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageTransition>
  );
}