"use client";

import { useState, type TransitionStartFunction } from "react";
import { decrementOrderItem } from "@/lib/actions/orders";
import { setBottleSplit } from "@/lib/actions/bottle-splits";

type OrderItemData = {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  isBottle: boolean;
  backAmount: number;
  bottleSplits: { castId: string; castName: string; backAmount: number }[];
};
type CastOption = { id: string; name: string };

export function OrderLineRow({
  item,
  workingCasts,
  isPending,
  startTransition,
}: {
  item: OrderItemData;
  workingCasts: CastOption[];
  isPending: boolean;
  startTransition: TransitionStartFunction;
}) {
  const [showSplit, setShowSplit] = useState(false);
  const [selectedCastIds, setSelectedCastIds] = useState<string[]>(
    item.bottleSplits.map((s) => s.castId),
  );

  const toggleCast = (castId: string) => {
    setSelectedCastIds((prev) =>
      prev.includes(castId)
        ? prev.filter((id) => id !== castId)
        : [...prev, castId],
    );
  };

  return (
    <li className="text-sm">
      <div className="flex items-center justify-between">
        <span className="text-neutral-200">
          {item.name} × {item.quantity}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">
            ¥{(item.unitPrice * item.quantity).toLocaleString()}
          </span>
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                decrementOrderItem(item.id);
              })
            }
            className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300 hover:bg-neutral-700 disabled:opacity-60"
          >
            −
          </button>
        </div>
      </div>

      {item.isBottle && (
        <div className="mt-1 pl-1">
          {item.bottleSplits.length > 0 ? (
            <p className="text-xs text-neutral-500">
              折半: {item.bottleSplits
                .map((s) => `${s.castName}(¥${s.backAmount.toLocaleString()})`)
                .join(" / ")}
            </p>
          ) : (
            <p className="text-xs text-neutral-600">バック未折半</p>
          )}

          <button
            onClick={() => setShowSplit((v) => !v)}
            className="mt-0.5 text-xs text-amber-400 hover:underline"
          >
            {showSplit ? "閉じる" : "ボトル折半を設定"}
          </button>

          {showSplit && (
            <div className="mt-1 space-y-1 rounded border border-neutral-800 bg-neutral-950 p-2">
              <p className="text-xs text-neutral-500">
                バック総額 ¥{item.backAmount.toLocaleString()} を選択したキャストで均等に折半します
              </p>
              <div className="flex flex-wrap gap-2">
                {workingCasts.map((cast) => (
                  <label
                    key={cast.id}
                    className="flex items-center gap-1 text-xs text-neutral-300"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCastIds.includes(cast.id)}
                      onChange={() => toggleCast(cast.id)}
                    />
                    {cast.name}
                  </label>
                ))}
              </div>
              <button
                disabled={isPending}
                onClick={() =>
                  startTransition(() => {
                    setBottleSplit(item.id, selectedCastIds);
                    setShowSplit(false);
                  })
                }
                className="rounded bg-amber-500 px-2 py-1 text-xs font-medium text-neutral-950 hover:bg-amber-400 disabled:opacity-60"
              >
                確定
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
