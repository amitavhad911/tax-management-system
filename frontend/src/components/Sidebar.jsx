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
                "group mx-3 flex h-10 items-center gap-3 rounded-lg px-3",
                "text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20 dark:bg-sky-500 dark:text-white"
                  : "text-slate-600 hover:bg-sky-50 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-sky-500 dark:text-slate-400 dark:group-hover:text-sky-400"
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
    <div
      className="
        flex h-full flex-col
        bg-white text-slate-900
        dark:bg-[#111827] dark:text-white
      "
    >
      {/* ================= BRAND ================= */}
      <div
        className="
          flex h-16 shrink-0 items-center
          border-b border-slate-200
          px-5
          dark:border-slate-700
        "
      >
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Tax Management
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            System
          </p>
        </div>
      </div>

      {/* ================= NAVIGATION ================= */}
      <nav className="flex-1 space-y-6 overflow-y-auto py-5">

        {/* MAIN */}
        <section>
          <p
            className="
              mb-2 px-5 text-[11px] font-semibold
              uppercase tracking-[0.08em]
              text-slate-400
              dark:text-slate-500
            "
          >
            Main
          </p>

          <SidebarLinks
            links={mainLinks}
            onNavigate={onNavigate}
          />
        </section>

        {/* REPORTS & TOOLS */}
        <section>
          <p
            className="
              mb-2 px-5 text-[11px] font-semibold
              uppercase tracking-[0.08em]
              text-slate-400
              dark:text-slate-500
            "
          >
            Reports & Tools
          </p>

          <SidebarLinks
            links={reportLinks}
            onNavigate={onNavigate}
          />
        </section>

        {/* SYSTEM */}
        <section>
          <p
            className="
              mb-2 px-5 text-[11px] font-semibold
              uppercase tracking-[0.08em]
              text-slate-400
              dark:text-slate-500
            "
          >
            System
          </p>

          <SidebarLinks
            links={systemLinks}
            onNavigate={onNavigate}
          />
        </section>

      </nav>

      {/* ================= BOTTOM ================= */}
      <div
        className="
          shrink-0
          border-t border-slate-200
          p-4
          dark:border-slate-700
        "
      >
        <button
          type="button"
          onClick={toggle}
          className="
            flex h-10 w-full items-center gap-3 rounded-lg
            border border-slate-200
            bg-slate-50
            px-3
            text-[13px]
            text-slate-700
            transition-all duration-150
            hover:border-sky-200
            hover:bg-sky-50
            hover:text-sky-600

            dark:border-slate-700
            dark:bg-slate-800
            dark:text-slate-200
            dark:hover:border-slate-600
            dark:hover:bg-slate-700
            dark:hover:text-white
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

        <p
          className="
            mt-3 text-center text-[11px]
            text-slate-400
            dark:text-slate-500
          "
        >
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
      {/* ================= MOBILE MENU BUTTON ================= */}
      <Button
        variant="ghost"
        size="icon"
        className="
          fixed left-3 top-3 z-50
          bg-white
          text-slate-700
          shadow-md
          hover:bg-sky-50
          hover:text-sky-600

          dark:bg-slate-800
          dark:text-white
          dark:hover:bg-slate-700

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

      {/* ================= DESKTOP ================= */}
      <aside
        className="
          fixed inset-y-0 left-0 z-40
          hidden w-[248px] flex-col
          border-r border-slate-200
          bg-white

          dark:border-slate-700
          dark:bg-[#111827]

          lg:flex
        "
      >
        <SidebarContent onNavigate={closeMobile} />
      </aside>

      {/* ================= MOBILE ================= */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              className="
                fixed inset-0 z-40
                bg-slate-900
                lg:hidden
              "
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
                fixed inset-y-0 left-0 z-50
                w-[280px]
                border-r border-slate-200
                bg-white

                dark:border-slate-700
                dark:bg-[#111827]

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