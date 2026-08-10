"use client";

import { useState, useTransition } from "react";
import { addCashEntry } from "@/lib/actions/reports";

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CashEntryForm() {
  const [isPending, startTransition] = useTransition();
  const [entryDate, setEntryDate] = useState(todayString());
  const [type, setType] = useState<"CASH_IN" | "CASH_OUT">("CASH_OUT");
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await addCashEntry({ entryDate, type, amount, reason });
      setAmount(0);
      setReason("");
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-neutral-800 bg-neutral-900 p-3"
    >
      <h2 className="mb-2 text-sm font-semibold text-neutral-300">
        入出金を記録
      </h2>
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-neutral-400">日付</label>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-400">区分</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "CASH_IN" | "CASH_OUT")}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100"
          >
            <option value="CASH_OUT">出金</option>
            <option value="CASH_IN">入金</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-xs text-neutral-400">金額</label>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100"
        />
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-xs text-neutral-400">理由</label>
        <input
          type="text"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || amount <= 0}
        className="w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-amber-400 disabled:opacity-60"
      >
        {isPending ? "登録中..." : "登録"}
      </button>
    </form>
  );
}
