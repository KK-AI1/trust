"use client";

import { useRouter, usePathname } from "next/navigation";

export function DatePicker({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <input
      type="date"
      value={value}
      onChange={(e) => router.push(`${pathname}?date=${e.target.value}`)}
      className="rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100"
    />
  );
}
