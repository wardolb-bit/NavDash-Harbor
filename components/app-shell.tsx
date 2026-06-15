"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Anchor,
  Bell,
  ClipboardCheck,
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  Ship,
  ShieldAlert,
  SlidersHorizontal,
  UserCog,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import type { HeaderContext, Profile } from "@/lib/types";
import { logout } from "@/app/(auth)/login/actions";
import { ScrollReset } from "@/components/scroll-reset";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Voyages", href: "/voyages", icon: Ship },
  { label: "Checklists", href: "/checklists", icon: ClipboardCheck },
  { label: "PMS", href: "/pms", icon: Wrench },
  { label: "Issues", href: "/issues", icon: ShieldAlert },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Reports", href: "/reports", icon: Gauge },
];

export function AppShell({
  children,
  profile,
  headerContext,
}: {
  children: React.ReactNode;
  profile: Profile;
  headerContext: HeaderContext;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100">
      <ScrollReset />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-30 flex flex-col bg-harbor-navy text-white transition-all duration-200",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/10 text-cyan-200">
            <Anchor className="h-6 w-6" aria-hidden />
          </div>
          {!collapsed ? (
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">NavDash</p>
              <p className="text-xs text-slate-300">Harbor</p>
            </div>
          ) : null}
        </div>

        <button
          className="mx-4 mt-4 flex h-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-bold transition",
                  active
                    ? "bg-harbor-cyan text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {!collapsed ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/admin"
            className={clsx(
              "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white",
              pathname.startsWith("/admin") && "bg-white/10 text-white",
              collapsed && "justify-center px-0",
            )}
            title={collapsed ? "Admin" : undefined}
          >
            <UserCog className="h-5 w-5 shrink-0" aria-hidden />
            {!collapsed ? <span>Admin</span> : null}
          </Link>
        </div>
      </aside>

      <div className={clsx("min-h-screen transition-all duration-200", collapsed ? "pl-20" : "pl-64")}>
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-slate-200 bg-harbor-deep px-6 text-white">
          <div className="grid gap-1 md:grid-cols-[minmax(160px,1fr)_minmax(160px,1fr)_auto] md:items-center md:gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Vessel</p>
              <p className="text-sm font-bold">{headerContext.vesselName}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Active Voyage</p>
              <p className="text-sm font-bold">{headerContext.activeVoyage}</p>
            </div>
            <span className="status-pill border-cyan-300/40 bg-cyan-300/10 text-cyan-100">{headerContext.voyagePhase}</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-slate-100 hover:bg-white/15" aria-label="Notifications">
              <Bell className="h-5 w-5" aria-hidden />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-harbor-gold" />
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold">{profile.full_name ?? profile.username}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">{profile.role}</p>
            </div>
            <form action={logout}>
              <button className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-slate-100 hover:bg-white/15" aria-label="Logout">
                <LogOut className="h-5 w-5" aria-hidden />
              </button>
            </form>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
