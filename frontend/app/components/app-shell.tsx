"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { LogoMark } from "@/app/components/logo-mark";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "AI Assessment",
    href: "/dashboard?section=assessment",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    ),
  },
  {
    label: "University Matcher",
    href: "/dashboard?section=recommendations",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    ),
  },
  {
    label: "Universities",
    href: "/dashboard?section=universities",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    ),
  },
  {
    label: "Career Paths",
    href: "/dashboard?section=careers",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
  },
  {
    label: "Compare Programs",
    href: "/dashboard?section=comparison",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    ),
  },
];

export function AppShell({
  children,
  active,
}: {
  children: ReactNode;
  active: string;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-70 shrink-0 flex-col border-r border-white/8 bg-slate-950/22 lg:flex">
        <div className="border-b border-white/6 px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500 shadow-[0_10px_30px_rgba(39,108,223,0.22)]">
              <LogoMark className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">EduPath</span>
              <p className="mt-0.5 text-xs text-blue-200/55">Orientation Hub</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5">
          {navItems.map((item) => {
            const isActive = item.label === active;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`sidebar-item flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${
                  isActive ? "active" : ""
                }`}
              >
                <svg
                  className="h-5 w-5 text-blue-400/90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {item.icon}
                </svg>
                <span className="text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="min-h-screen flex-1 p-5 lg:p-8">{children}</main>
    </div>
  );
}
