"use client";

import { useState, useTransition } from "react";
import { updateTimeCard, deleteTimeCard } from "@/lib/actions/attendance";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateInput(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toTimeInput(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

type TimeCardData = {
  id: string;
  castName: string;
  workDate: string;
  clockInAt: string;
  clockOutAt: string | null;
};

export function TimeCardRow({ tc }: { tc: TimeCardData }) {
  const [editing, setEditing] = useState(false);
  const [workDate, setWorkDate] = useState(toDateInput(tc.workDate));
  const [clockIn, setClockIn] = useState(toTimeInput(tc.clockInAt));
  const [clockOut, setClockOut] = useState(
    tc.clockOutAt ? toTimeInput(tc.clockOutAt) : "",
  );
  const [isPending, startTransition] = useTransition();

  const hours = tc.clockOutAt
    ? (
        (new Date(tc.clockOutAt).getTime() - new Date(tc.clockInAt).getTime()) /
        3_600_000
      ).toFixed(1)
    : "-";

  if (editing) {
    return (
      <tr className="border-t border-neutral-800 bg-neutral-900">
        <td className="px-3 py-2 text-neutral-100">{tc.castName}</td>
        <td className="px-3 py-2">
          <input
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            className="rounded border border-neutral-700 bg-neutral-800 px-1.5 py-1 text-sm text-neutral-100"
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="time"
            value={clockIn}
            onChange={(e) => setClockIn(e.target.value)}
            className="w-24 rounded border border-neutral-700 bg-neutral-800 px-1.5 py-1 text-sm text-neutral-100"
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="time"
            value={clockOut}
            onChange={(e) => setClockOut(e.target.value)}
            className="w-24 rounded border border-neutral-700 bg-neutral-800 px-1.5 py-1 text-sm text-neutral-100"
          />
        </td>
        <td className="px-3 py-2 text-neutral-500">-</td>
        <td className="px-3 py-2">
          <div className="flex gap-2">
            <button
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await updateTimeCard(tc.id, { workDate, clockIn, clockOut });
                  setEditing(false);
                })
              }
              className="rounded bg-amber-500 px-2 py-1 text-xs font-medium text-neutral-950 hover:bg-amber-400 disabled:opacity-60"
            >
              保存
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-700"
            >
              キャンセル
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-neutral-800">
      <td className="px-3 py-2 text-neutral-100">{tc.castName}</td>
      <td className="px-3 py-2 text-neutral-400">
        {new Date(tc.workDate).toLocaleDateString("ja-JP")}
      </td>
      <td className="px-3 py-2 text-neutral-400">
        {formatDateTime(tc.clockInAt)}
      </td>
      <td className="px-3 py-2 text-neutral-400">
        {tc.clockOutAt ? formatDateTime(tc.clockOutAt) : "出勤中"}
      </td>
      <td className="px-3 py-2 text-neutral-400">{hours}</td>
      <td className="px-3 py-2">
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-amber-400 hover:underline"
          >
            編集
          </button>
          <button
            disabled={isPending}
            onClick={() => {
              if (!confirm("この勤怠記録を削除しますか?")) return;
              startTransition(() => {
                deleteTimeCard(tc.id);
              });
            }}
            className="text-xs text-neutral-500 hover:underline disabled:opacity-60"
          >
            削除
          </button>
        </div>
      </td>
    </tr>
  );
}
