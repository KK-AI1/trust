"use client";

import { useState, useTransition } from "react";
import { createTimeCard } from "@/lib/actions/attendance";

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function AddTimeCardForm({
  casts,
}: {
  casts: { id: string; name: string }[];
}) {
  const [castId, setCastId] = useState(casts[0]?.id ?? "");
  const [workDate, setWorkDate] = useState(todayString());
  const [clockIn, setClockIn] = useState("20:00");
  const [clockOut, setClockOut] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!castId) return;
    startTransition(async () => {
      await createTimeCard({ castId, workDate, clockIn, clockOut });
      setClockOut("");
    });
  };

  if (casts.length === 0) {
    return (
      <p className="mb-4 text-sm text-neutral-500">
        キャストが登録されていません。先にキャスト管理画面で登録してください。
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-wrap items-end gap-2 rounded-md border border-neutral-800 bg-neutral-900 p-3"
    >
      <div>
        <label className="mb-1 block text-xs text-neutral-400">キャスト</label>
        <select
          value={castId}
          onChange={(e) => setCastId(e.target.value)}
          className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-100"
        >
          {casts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-neutral-400">日付</label>
        <input
          type="date"
          value={workDate}
          onChange={(e) => setWorkDate(e.target.value)}
          className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-neutral-400">出勤</label>
        <input
          type="time"
          value={clockIn}
          onChange={(e) => setClockIn(e.target.value)}
          className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-neutral-400">
          退勤(空欄可)
        </label>
        <input
          type="time"
          value={clockOut}
          onChange={(e) => setClockOut(e.target.value)}
          className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-100"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-neutral-950 hover:bg-amber-400 disabled:opacity-60"
      >
        + 勤怠を追加
      </button>
    </form>
  );
}
