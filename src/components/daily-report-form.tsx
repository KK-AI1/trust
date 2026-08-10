"use client";

import { useState, useTransition } from "react";
import { upsertDailyReport } from "@/lib/actions/reports";

export function DailyReportForm({
  date,
  autoSalesTotal,
  initial,
}: {
  date: string;
  autoSalesTotal: number;
  initial?: { cashTotal: number; cardTotal: number; notes: string };
}) {
  const [isPending, startTransition] = useTransition();
  const [cashTotal, setCashTotal] = useState(initial?.cashTotal ?? autoSalesTotal);
  const [cardTotal, setCardTotal] = useState(initial?.cardTotal ?? 0);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saved, setSaved] = useState(false);

  const total = cashTotal + cardTotal;
  const diff = total - autoSalesTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await upsertDailyReport({ reportDate: date, cashTotal, cardTotal, notes });
      setSaved(true);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-neutral-800 bg-neutral-900 p-3"
    >
      <h2 className="mb-2 text-sm font-semibold text-neutral-300">
        {date} の日報
      </h2>
      <p className="mb-3 text-xs text-neutral-500">
        レジ精算(自動集計): ¥{autoSalesTotal.toLocaleString()}
      </p>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-neutral-400">現金</label>
          <input
            type="number"
            min={0}
            value={cashTotal}
            onChange={(e) => setCashTotal(Number(e.target.value))}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-400">カード</label>
          <input
            type="number"
            min={0}
            value={cardTotal}
            onChange={(e) => setCardTotal(Number(e.target.value))}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100"
          />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="text-neutral-400">入力合計</span>
        <span className="text-neutral-100">¥{total.toLocaleString()}</span>
      </div>
      {diff !== 0 && (
        <p className="mb-3 text-xs text-red-400">
          自動集計との差異: {diff > 0 ? "+" : ""}
          ¥{diff.toLocaleString()}
        </p>
      )}

      <div className="mb-3">
        <label className="mb-1 block text-xs text-neutral-400">備考</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-amber-400 disabled:opacity-60"
      >
        {isPending ? "保存中..." : "保存"}
      </button>
      {saved && !isPending && (
        <p className="mt-2 text-center text-xs text-emerald-400">保存しました</p>
      )}
    </form>
  );
}
