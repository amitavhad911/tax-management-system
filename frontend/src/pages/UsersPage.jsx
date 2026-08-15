import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import userService from "../services/userService";
import { toast } from "react-hot-toast";

import {
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Search,
  UserRound,
  Building2,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "../hooks/useDebounce";
import PageTransition from "../components/PageTransition";

const USERS_PER_PAGE = 5;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [taxpayerType, setTaxpayerType] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchUsers();
  }, []);

  /*
   * IMPORTANT:
   * Load more than the backend default 10 users.
   * This allows the frontend pagination/filtering to work
   * with all taxpayers, including 11, 13, 20, etc.
   */
  const fetchUsers = async () => {
    setLoading(true);

    try {
      const res = await userService.getAll({
        page: 0,
        size: 100,
      });

      setUsers(res.data?.data?.content || []);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await userService.remove(deleteId);

      toast.success("User deleted successfully");
      setDeleteId(null);

      await fetchUsers();

      const remainingUsers = users.length - 1;
      const remainingPages = Math.max(
        1,
        Math.ceil(remainingUsers / USERS_PER_PAGE)
      );

      if (currentPage > remainingPages) {
        setCurrentPage(remainingPages);
      }
    } catch (error) {
      console.error("Error deleting user:", error);

      toast.error(
        error.response?.data?.message || "Error deleting user"
      );
    }
  };

  const search = debouncedSearch.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = String(user.fullName || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const panNumber = String(user.panNumber || "").toLowerCase();
      const userType = String(user.userType || "").toLowerCase();

      const matchesSearch =
        !search ||
        fullName.includes(search) ||
        email.includes(search) ||
        panNumber.includes(search) ||
        userType.includes(search);

      const matchesType =
        taxpayerType === "ALL" ||
        user.userType === taxpayerType;

      return matchesSearch && matchesType;
    });
  }, [users, search, taxpayerType]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * USERS_PER_PAGE,
    safeCurrentPage * USERS_PER_PAGE
  );

  const startEntry =
    filteredUsers.length === 0
      ? 0
      : (safeCurrentPage - 1) * USERS_PER_PAGE + 1;

  const endEntry = Math.min(
    safeCurrentPage * USERS_PER_PAGE,
    filteredUsers.length
  );

  const individualCount = users.filter(
    (user) => user.userType === "INDIVIDUAL"
  ).length;

  const institutionalCount = users.filter(
    (user) => user.userType === "INSTITUTIONAL"
  ).length;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getUserTypeLabel = (userType) => {
    return userType === "INSTITUTIONAL"
      ? "Institutional"
      : "Individual";
  };

  const getInitials = (name = "") => {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) return "U";

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getAvatarClass = (index) => {
    const classes = [
      "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
      "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
    ];

    return classes[index % classes.length];
  };

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="h-9 w-32" />
              <Skeleton className="mt-2 h-5 w-80" />
            </div>

            <Skeleton className="h-11 w-32 rounded-lg" />
          </div>

          <Skeleton className="h-12 w-full rounded-xl" />

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <div className="space-y-5 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Users
            </h1>

            <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
              Manage individual and institutional taxpayers.
            </p>
          </div>

          <Link to="/users/add">
            <Button
              className="
                h-11
                gap-2
                rounded-lg
                px-5
                shadow-sm
                transition-all
                hover:-translate-y-0.5
              "
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-[var(--muted-foreground)]">
                  Total Taxpayers
                </p>

                <p className="text-xl font-bold text-[var(--foreground)]">
                  {users.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                <UserRound className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
                  Individual Taxpayers
                </p>

                <p className="text-xl font-bold text-violet-800 dark:text-violet-200">
                  {individualCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Institutional Taxpayers
                </p>

                <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                  {institutionalCount}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* SEARCH + TAXPAYER TYPE FILTER */}
        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">
            <Search
              className="
                absolute
                left-4
                top-1/2
                h-[18px]
                w-[18px]
                -translate-y-1/2
                text-[var(--muted-foreground)]
              "
            />

            <Input
              placeholder="Search by name, email, PAN, or taxpayer type..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="
                h-12
                rounded-xl
                border-[var(--border)]
                bg-[var(--card)]
                pl-11
                pr-4
                text-sm
                text-[var(--foreground)]
                shadow-sm
                placeholder:text-[var(--muted-foreground)]
                focus:ring-2
                focus:ring-[var(--primary)]/20
              "
            />
          </div>

          {/* NATIVE SELECT - NO OVERLAP */}
          <div className="relative w-full lg:w-64">
            <select
              value={taxpayerType}
              onChange={(e) => {
                setTaxpayerType(e.target.value);
                setCurrentPage(1);
              }}
              className="
                h-12
                w-full
                appearance-none
                rounded-xl
                border
                border-[var(--border)]
                bg-[var(--card)]
                px-4
                pr-10
                text-sm
                font-medium
                text-[var(--foreground)]
                outline-none
                transition
                focus:border-[var(--primary)]
                focus:ring-2
                focus:ring-[var(--primary)]/20
                dark:bg-[var(--card)]
              "
            >
              <option value="ALL">
                All Taxpayer Types
              </option>

              <option value="INDIVIDUAL">
                Individual
              </option>

              <option value="INSTITUTIONAL">
                Institutional
              </option>
            </select>

            <ChevronRight
              className="
                pointer-events-none
                absolute
                right-4
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                rotate-90
                text-[var(--muted-foreground)]
              "
            />
          </div>
        </div>

        {/* TABLE */}
        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-[var(--border)]
            bg-[var(--card)]
            shadow-sm
          "
        >
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">

              <TableHeader>
                <TableRow
                  className="
                    border-b
                    border-[var(--border)]
                    bg-[var(--muted)]/40
                    hover:bg-[var(--muted)]/40
                  "
                >
                  <TableHead className="h-14 px-6 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Taxpayer
                  </TableHead>

                  <TableHead className="h-14 px-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Email
                  </TableHead>

                  <TableHead className="h-14 px-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    PAN
                  </TableHead>

                  <TableHead className="h-14 px-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Type
                  </TableHead>

                  <TableHead className="h-14 px-6 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-72 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">

                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
                          <UserRound className="h-6 w-6" />
                        </div>

                        <div>
                          <p className="font-semibold text-[var(--foreground)]">
                            No taxpayers found
                          </p>

                          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                            Try changing your search or taxpayer type filter.
                          </p>
                        </div>

                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user, index) => {
                    const isInstitutional =
                      user.userType === "INSTITUTIONAL";

                    const UserTypeIcon = isInstitutional
                      ? Building2
                      : UserRound;

                    return (
                      <TableRow
                        key={user.id}
                        className="
                          group
                          border-b
                          border-[var(--border)]
                          transition-colors
                          hover:bg-[var(--muted)]/30
                        "
                      >

                        {/* TAXPAYER */}
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">

                            <div
                              className={`
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                text-xs
                                font-bold
                                ${getAvatarClass(index)}
                              `}
                            >
                              {getInitials(user.fullName)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[var(--foreground)]">
                                {user.fullName || "—"}
                              </p>

                              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                                Taxpayer ID: {user.id}
                              </p>
                            </div>

                          </div>
                        </TableCell>

                        {/* EMAIL */}
                        <TableCell className="px-5 py-4">
                          <span className="text-sm text-[var(--foreground)]">
                            {user.email || "—"}
                          </span>
                        </TableCell>

                        {/* PAN */}
                        <TableCell className="px-5 py-4">
                          <span
                            className="
                              inline-block
                              rounded-md
                              bg-[var(--muted)]
                              px-2.5
                              py-1
                              font-mono
                              text-xs
                              font-medium
                              tracking-wide
                              text-[var(--foreground)]
                            "
                          >
                            {user.panNumber || "—"}
                          </span>
                        </TableCell>

                        {/* TYPE */}
                        <TableCell className="px-5 py-4">
                          <div
                            className={`
                              inline-flex
                              min-w-[125px]
                              items-center
                              justify-center
                              gap-2
                              rounded-lg
                              border
                              px-3
                              py-1.5
                              text-xs
                              font-semibold
                              whitespace-nowrap
                              ${
                                isInstitutional
                                  ? `
                                    border-emerald-200
                                    bg-emerald-50
                                    text-emerald-700
                                    dark:border-emerald-500/20
                                    dark:bg-emerald-500/10
                                    dark:text-emerald-300
                                  `
                                  : `
                                    border-violet-200
                                    bg-violet-50
                                    text-violet-700
                                    dark:border-violet-500/20
                                    dark:bg-violet-500/10
                                    dark:text-violet-300
                                  `
                              }
                            `}
                          >
                            <UserTypeIcon className="h-3.5 w-3.5 shrink-0" />

                            <span>
                              {getUserTypeLabel(user.userType)}
                            </span>
                          </div>
                        </TableCell>

                        {/* ACTIONS */}
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">

                            <Link to={`/users/edit/${user.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Edit User"
                                className="
                                  h-9
                                  w-9
                                  rounded-lg
                                  text-[var(--muted-foreground)]
                                  hover:bg-blue-50
                                  hover:text-blue-600
                                  dark:hover:bg-blue-500/10
                                  dark:hover:text-blue-400
                                "
                              >
                                <Edit className="h-[17px] w-[17px]" />
                              </Button>
                            </Link>

                            <Link to={`/tax/history/${user.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Tax History"
                                className="
                                  h-9
                                  w-9
                                  rounded-lg
                                  text-[var(--muted-foreground)]
                                  hover:bg-cyan-50
                                  hover:text-cyan-600
                                  dark:hover:bg-cyan-500/10
                                  dark:hover:text-cyan-400
                                "
                              >
                                <Eye className="h-[18px] w-[18px]" />
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(user.id)}
                              title="Delete User"
                              className="
                                h-9
                                w-9
                                rounded-lg
                                text-red-500
                                hover:bg-red-50
                                hover:text-red-600
                                dark:text-red-400
                                dark:hover:bg-red-500/10
                                dark:hover:text-red-300
                              "
                            >
                              <Trash2 className="h-[17px] w-[17px]" />
                            </Button>

                          </div>
                        </TableCell>

                      </TableRow>
                    );
                  })
                )}

              </TableBody>
            </Table>
          </div>

          {/* PAGINATION */}
          {filteredUsers.length > 0 && (
            <div
              className="
                flex
                flex-col
                gap-4
                border-t
                border-[var(--border)]
                px-6
                py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <p className="text-sm text-[var(--muted-foreground)]">
                Showing{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {startEntry}
                </span>
                {"–"}
                <span className="font-semibold text-[var(--foreground)]">
                  {endEntry}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {filteredUsers.length}
                </span>{" "}
                taxpayers
              </p>

              <div className="flex items-center gap-1.5">

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handlePageChange(safeCurrentPage - 1)
                  }
                  disabled={safeCurrentPage === 1}
                  className="
                    h-9
                    w-9
                    rounded-lg
                    border-[var(--border)]
                    bg-[var(--card)]
                  "
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {pageNumbers.map((page) => (
                  <Button
                    key={page}
                    variant={
                      page === safeCurrentPage
                        ? "default"
                        : "outline"
                    }
                    size="icon"
                    onClick={() => handlePageChange(page)}
                    className={`
                      h-9
                      w-9
                      rounded-lg
                      ${
                        page === safeCurrentPage
                          ? "shadow-sm"
                          : "border-[var(--border)] bg-[var(--card)]"
                      }
                    `}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handlePageChange(safeCurrentPage + 1)
                  }
                  disabled={safeCurrentPage === totalPages}
                  className="
                    h-9
                    w-9
                    rounded-lg
                    border-[var(--border)]
                    bg-[var(--card)]
                  "
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

              </div>
            </div>
          )}
        </div>

        {/* DELETE CONFIRMATION */}
        <Dialog
          open={!!deleteId}
          onOpenChange={() => setDeleteId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Delete Taxpayer
              </DialogTitle>

              <DialogDescription>
                Are you sure you want to delete this taxpayer?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>

              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>

            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </PageTransition>
  );
}