"use client";

import { useState, useTransition } from "react";
import { updateMenuItem, setMenuItemAvailable } from "@/lib/actions/menu";

type MenuItemData = {
  id: string;
  name: string;
  price: number;
  isBottle: boolean;
  backAmount: number;
  isAvailable: boolean;
};

export function MenuItemRow({ item }: { item: MenuItemData }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const [isBottle, setIsBottle] = useState(item.isBottle);
  const [backAmount, setBackAmount] = useState(item.backAmount);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <li className="rounded-md border border-neutral-700 bg-neutral-950 p-2">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100"
          />
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
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
        </div>
        <div className="flex gap-2">
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await updateMenuItem(item.id, { name, price, isBottle, backAmount });
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
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between rounded-md border border-neutral-800 px-2 py-1.5 text-sm">
      <div>
        <span className={item.isAvailable ? "text-neutral-200" : "text-neutral-600 line-through"}>
          {item.name}
        </span>
        <span className="ml-2 text-neutral-500">¥{item.price.toLocaleString()}</span>
        {item.isBottle && (
          <span className="ml-2 text-xs text-amber-500">
            折半対象(バック¥{item.backAmount.toLocaleString()})
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-amber-400 hover:underline"
        >
          編集
        </button>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              setMenuItemAvailable(item.id, !item.isAvailable);
            })
          }
          className="text-xs text-neutral-400 hover:underline disabled:opacity-60"
        >
          {item.isAvailable ? "非表示にする" : "再表示する"}
        </button>
      </div>
    </li>
  );
}
