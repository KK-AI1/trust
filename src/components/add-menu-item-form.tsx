"use client";

import { useState, useTransition } from "react";
import { createMenuItem } from "@/lib/actions/menu";

export function AddMenuItemForm({ categoryId }: { categoryId: string }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [isBottle, setIsBottle] = useState(false);
  const [backAmount, setBackAmount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await createMenuItem({ categoryId, name, price, isBottle, backAmount });
      setName("");
      setPrice(0);
      setIsBottle(false);
      setBackAmount(0);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="商品名"
        className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100"
      />
      <input
        type="number"
        min={0}
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        placeholder="価格"
        className="w-24 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100"
      />
      <label className="flex items-center gap-1 text-xs text-neutral-400">
        <input
          type="checkbox"
          checked={isBottle}
          onChange={(e) => setIsBottle(e.target.checked)}
        />
        ボトル折半対象
      </label>
      {isBottle && (
        <input
          type="number"
          min={0}
          value={backAmount}
          onChange={(e) => setBackAmount(Number(e.target.value))}
          placeholder="バック額"
          className="w-24 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100"
        />
      )}
      <button
        type="submit"
        disabled={isPending || !name.trim()}
        className="rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-700 disabled:opacity-60"
      >
        + 商品追加
      </button>
    </form>
  );
}
