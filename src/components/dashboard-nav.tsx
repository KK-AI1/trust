"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "ホール状況" },
  { href: "/casts", label: "キャスト" },
  { href: "/attendance", label: "勤怠" },
  { href: "/payroll", label: "給与" },
  { href: "/reports/daily", label: "日報" },
  { href: "/reports/cash", label: "収支" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              isActive
                ? "bg-amber-500 text-neutral-950"
                : "text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
