import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  Bot,
  Calculator,
  ChartNoAxesCombined,
  DatabaseBackup,
  History,
  LayoutDashboard,
  Menu,
  Moon,
  Settings,
  Sun,
  UserCircle,
  Users,
  X,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

const mainLinks = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/users", icon: Users, label: "Users" },
  { to: "/tax/compute", icon: Calculator, label: "Tax Computation" },
  { to: "/tax/history/1", icon: History, label: "Tax History" },
];

const reportLinks = [
  { to: "/reports", icon: ChartNoAxesCombined, label: "Reports" },
  { to: "/backup", icon: DatabaseBackup, label: "Backup & Restore" },
  { to: "/ai-assistant", icon: Bot, label: "AI Assistant" },
];

const systemLinks = [
  { to: "/profile", icon: UserCircle, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function SidebarLinks({ links, onNavigate }) {
  return (
    <div className="space-y-1">
      {links.map((link) => {
        const Icon = link.icon;

        return (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "sidebar-item mx-3 flex h-10 items-center gap-3 rounded-lg px-3",
                "text-sm font-medium transition-colors duration-150",
                isActive
                  ? "active"
                  : "",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 ${
                    isActive
                      ? "text-white"
                      : "text-[var(--sidebar-muted)]"
                  }`}
                />

                <span className="truncate">{link.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}

function SidebarContent({ onNavigate }) {
  const { darkMode, toggle } = useTheme();

  return (
    <div className="sidebar-theme flex h-full flex-col">

      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center border-b border-[var(--sidebar-border)] px-5">
        <div>
          <h2 className="text-base font-bold">
            Tax Management
          </h2>

          <p className="text-xs text-[var(--sidebar-muted)]">
            System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto py-5">

        <section>
          <p className="sidebar-section-title mb-2 px-5 text-[11px] font-semibold uppercase tracking-[0.08em]">
            Main
          </p>

          <SidebarLinks
            links={mainLinks}
            onNavigate={onNavigate}
          />
        </section>

        <section>
          <p className="sidebar-section-title mb-2 px-5 text-[11px] font-semibold uppercase tracking-[0.08em]">
            Reports & Tools
          </p>

          <SidebarLinks
            links={reportLinks}
            onNavigate={onNavigate}
          />
        </section>

        <section>
          <p className="sidebar-section-title mb-2 px-5 text-[11px] font-semibold uppercase tracking-[0.08em]">
            System
          </p>

          <SidebarLinks
            links={systemLinks}
            onNavigate={onNavigate}
          />
        </section>

      </nav>

      {/* Bottom */}
      <div className="shrink-0 border-t border-[var(--sidebar-border)] p-4">

        <button
          type="button"
          onClick={toggle}
          className="
            flex h-10 w-full items-center gap-3 rounded-lg
            border border-[var(--sidebar-border)]
            bg-[var(--sidebar-hover)]
            px-3 text-[13px]
            text-[var(--sidebar-foreground)]
            transition-colors
            hover:opacity-90
          "
        >
          {darkMode ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}

          <span>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        <p className="mt-3 text-center text-[11px] text-[var(--sidebar-muted)]">
          TaxManager v1.0.0
        </p>

      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="
          fixed left-3 top-3 z-50
          bg-[var(--card)]
          text-[var(--foreground)]
          shadow-md
          lg:hidden
        "
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
      >
        {mobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Desktop */}
      <aside
        className="
          sidebar-theme
          fixed inset-y-0 left-0 z-40
          hidden w-[248px] flex-col
          border-r
          lg:flex
        "
      >
        <SidebarContent onNavigate={closeMobile} />
      </aside>

      {/* Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black lg:hidden"
              onClick={closeMobile}
              aria-hidden="true"
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{
                type: "tween",
                duration: 0.25,
              }}
              className="
                sidebar-theme
                fixed inset-y-0 left-0 z-50
                w-[280px]
                border-r
                lg:hidden
              "
            >
              <SidebarContent onNavigate={closeMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}