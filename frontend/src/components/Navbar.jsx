import {
  Bell,
  LogOut,
  Settings,
  UserRound,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">

      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          Tax Management System
        </h1>

        <p className="hidden text-xs text-muted-foreground sm:block">
          Administration Dashboard
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* ================= NOTIFICATIONS ================= */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground hover:bg-accent"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />

              <Badge
                className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-80 bg-background text-foreground shadow-xl"
          >
            <DropdownMenuLabel className="text-foreground">
              Notifications
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer gap-3 py-3 text-foreground">
              <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />

              <div>
                <p className="text-sm font-medium">
                  Tax computation completed
                </p>

                <p className="text-xs text-muted-foreground">
                  Recent tax calculation was completed successfully.
                </p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer gap-3 py-3 text-foreground">
              <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" />

              <div>
                <p className="text-sm font-medium">
                  Backup reminder
                </p>

                <p className="text-xs text-muted-foreground">
                  Consider creating a recent system backup.
                </p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer gap-3 py-3 text-foreground">
              <Info className="h-4 w-4 shrink-0 text-blue-500" />

              <div>
                <p className="text-sm font-medium">
                  System information
                </p>

                <p className="text-xs text-muted-foreground">
                  Review your latest system activity.
                </p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer justify-center text-sm font-medium text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ================= PROFILE ================= */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 text-foreground hover:bg-accent"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0EA5E9] text-sm font-semibold text-white">
                A
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-none text-foreground">
                  Admin
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Super Admin
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 bg-background text-foreground shadow-xl"
          >
            <DropdownMenuLabel className="text-foreground">
              My Account
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Profile */}
            <DropdownMenuItem
              asChild
              className="cursor-pointer text-foreground focus:bg-accent focus:text-accent-foreground"
            >
              <Link
                to="/profile"
                className="flex w-full items-center gap-2"
              >
                <UserRound className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>

            {/* Settings */}
            <DropdownMenuItem
              asChild
              className="cursor-pointer text-foreground focus:bg-accent focus:text-accent-foreground"
            >
              <Link
                to="/settings"
                className="flex w-full items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}