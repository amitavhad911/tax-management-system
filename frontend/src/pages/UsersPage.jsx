import { useEffect, useState } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const res = await userService.getAll();

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
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        error.response?.data?.message || "Error deleting user"
      );
    }
  };

  const search = debouncedSearch.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    const fullName = String(user.fullName || "").toLowerCase();
    const email = String(user.email || "").toLowerCase();
    const panNumber = String(user.panNumber || "").toLowerCase();
    const userType = String(user.userType || "").toLowerCase();

    return (
      fullName.includes(search) ||
      email.includes(search) ||
      panNumber.includes(search) ||
      userType.includes(search)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * USERS_PER_PAGE,
    safeCurrentPage * USERS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getUserTypeLabel = (userType) => {
    if (userType === "INSTITUTIONAL") {
      return "Institutional";
    }

    return "Individual";
  };

  const getUserTypeIcon = (userType) => {
    return userType === "INSTITUTIONAL" ? Building2 : UserRound;
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>

          <Skeleton className="h-10 w-full" />

          <div className="rounded-lg border overflow-hidden">
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
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
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Users
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Manage individual and institutional taxpayers.
            </p>
          </div>

          <Link to="/users/add">
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />

          <Input
            placeholder="Search by name, email, PAN, or taxpayer type..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        {/* User Table */}
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>PAN</TableHead>
                <TableHead>Taxpayer Type</TableHead>
                <TableHead className="text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-[var(--muted-foreground)]"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <UserRound className="h-8 w-8 opacity-50" />

                      <span>
                        {searchTerm
                          ? "No users match your search."
                          : "No users found."}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const UserTypeIcon = getUserTypeIcon(user.userType);

                  return (
                    <TableRow key={user.id}>
                      {/* Name */}
                      <TableCell className="font-medium text-[var(--foreground)]">
                        {user.fullName || "—"}
                      </TableCell>

                      {/* Email */}
                      <TableCell className="text-[var(--foreground)]">
                        {user.email || "—"}
                      </TableCell>

                      {/* PAN */}
                      <TableCell className="font-mono text-[var(--foreground)]">
                        {user.panNumber || "—"}
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--accent-foreground)]">
                            <UserTypeIcon className="h-4 w-4" />
                          </div>

                          <span className="text-sm font-medium text-[var(--foreground)]">
                            {getUserTypeLabel(user.userType)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Link to={`/users/edit/${user.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>

                          <Link to={`/tax/history/${user.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Tax History"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(user.id)}
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
            >
              Previous
            </Button>

            <span className="text-sm text-[var(--muted-foreground)]">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Delete Confirmation */}
        <Dialog
          open={!!deleteId}
          onOpenChange={() => setDeleteId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>

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