"use client";

import { useTransition } from "react";
import { toggleAttendance } from "@/lib/actions/casts";

export function AttendanceToggle({
  castId,
  isWorking,
}: {
  castId: string;
  isWorking: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleAttendance(castId))}
      className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-60 ${
        isWorking
          ? "bg-emerald-600 text-white hover:bg-emerald-500"
          : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
      }`}
    >
      {isWorking ? "出勤中" : "未出勤"}
    </button>
  );
}
