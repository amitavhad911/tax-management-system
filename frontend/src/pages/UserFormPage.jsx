import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  UserRound,
  Building2,
  UserPlus,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

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
          error.response?.data?.message || "Failed to load user"
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
        err.response?.data?.message || "Error saving taxpayer"
      );
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-4xl">

        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => navigate("/users")}
            className="mt-1 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                {isEdit ? (
                  <UserRound className="h-5 w-5 text-primary" />
                ) : (
                  <UserPlus className="h-5 w-5 text-primary" />
                )}
              </div>

              <h1 className="text-2xl font-bold text-foreground">
                {isEdit ? "Edit User" : "Add User"}
              </h1>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {isEdit
                ? "Update taxpayer information and account details."
                : "Add an individual or institutional taxpayer to the system."}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            {/* Form Header */}
            <div className="border-b border-border bg-muted/30 px-6 py-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />

                <div>
                  <h2 className="font-semibold text-foreground">
                    Taxpayer Details
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Enter accurate information for tax computation.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8 p-6">

              {/* Taxpayer Type */}
              <section>
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground">
                    Taxpayer Type
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Select the type of taxpayer you want to register.
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
                          <SelectTrigger className="h-11">
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
              </section>

              {/* Personal Information */}
              <section>
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground">
                    Personal Information
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Basic identification and contact information.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>

                        <FormControl>
                          <div className="relative">
                            <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                              {...field}
                              className="h-11 pl-9"
                              placeholder="Enter full name"
                            />
                          </div>
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
                        <FormLabel>Email Address</FormLabel>

                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                              {...field}
                              type="email"
                              className="h-11 pl-9"
                              placeholder="Enter email address"
                            />
                          </div>
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
                        <FormLabel>Phone Number</FormLabel>

                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                              {...field}
                              inputMode="numeric"
                              maxLength={10}
                              className="h-11 pl-9"
                              placeholder="10-digit phone number"
                            />
                          </div>
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
                        <FormLabel>PAN Number</FormLabel>

                        <FormControl>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <Input
                              {...field}
                              maxLength={10}
                              className="h-11 pl-9 uppercase"
                              placeholder="ABCDE1234F"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value.toUpperCase()
                                )
                              }
                            />
                          </div>
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
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                            <Input
                              {...field}
                              className="h-11 pl-9"
                              placeholder="Enter address"
                            />
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/users")}
                  disabled={isSubmitting}
                  className="sm:min-w-28"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="sm:min-w-32"
                >
                  {isSubmitting
                    ? "Saving..."
                    : isEdit
                      ? "Update User"
                      : "Save User"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </PageTransition>
  );
}