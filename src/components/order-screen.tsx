"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { addOrderItem, decrementOrderItem } from "@/lib/actions/orders";
import { addExtension, closeVisit } from "@/lib/actions/visits";

const EXTENSION_AMOUNT = 3000;

type MenuItemData = { id: string; name: string; price: number };
type CategoryData = { id: string; name: string; items: MenuItemData[] };
type OrderItemData = {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export function OrderScreen({
  visit,
  categories,
  orderItems,
  total,
}: {
  visit: {
    id: string;
    tableName: string;
    guestCount: number;
    checkInAt: string;
    status: string;
    extensionMinutes: number;
  };
  categories: CategoryData[];
  orderItems: OrderItemData[];
  total: number;
}) {
  const [activeCategoryId, setActiveCategoryId] = useState(
    categories[0]?.id ?? "",
  );
  const [isPending, startTransition] = useTransition();

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-neutral-400 hover:underline">
            ← ホール状況に戻る
          </Link>
          <h1 className="text-2xl font-semibold text-neutral-100">
            {visit.tableName}({visit.guestCount}名)
          </h1>
        </div>
        <div className="text-right">
          <div className="text-xs text-neutral-500">合計</div>
          <div className="text-2xl font-bold text-amber-400">
            ¥{total.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap gap-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategoryId(c.id)}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  c.id === activeCategoryId
                    ? "bg-amber-500 text-neutral-950"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {activeCategory?.items.map((item) => (
              <button
                key={item.id}
                disabled={isPending}
                onClick={() =>
                  startTransition(() => {
                    addOrderItem(visit.id, item.id);
                  })
                }
                className="rounded-md border border-neutral-800 bg-neutral-900 p-3 text-left transition hover:border-amber-600 disabled:opacity-60"
              >
                <div className="text-sm text-neutral-200">{item.name}</div>
                <div className="text-xs text-neutral-500">
                  ¥{item.price.toLocaleString()}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <button
              disabled={isPending}
              onClick={() =>
                startTransition(() => {
                  addExtension(visit.id, EXTENSION_AMOUNT);
                })
              }
              className="rounded-md bg-neutral-800 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700 disabled:opacity-60"
            >
              延長 +30分(¥{EXTENSION_AMOUNT.toLocaleString()})
            </button>
            {visit.extensionMinutes > 0 && (
              <span className="ml-2 text-xs text-neutral-500">
                延長合計 {visit.extensionMinutes}分
              </span>
            )}
          </div>
        </div>

        <div className="rounded-md border border-neutral-800 bg-neutral-900 p-3">
          <h2 className="mb-2 text-sm font-semibold text-neutral-300">
            注文内容
          </h2>
          <ul className="space-y-2">
            {orderItems.length === 0 && (
              <li className="text-sm text-neutral-500">まだ注文がありません</li>
            )}
            {orderItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
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
              </li>
            ))}
          </ul>

          <button
            disabled={isPending}
            onClick={() => {
              if (!confirm("会計を確定しますか?")) return;
              startTransition(() => {
                closeVisit(visit.id);
              });
            }}
            className="mt-4 w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-amber-400 disabled:opacity-60"
          >
            会計
          </button>
        </div>
      </div>
    </div>
  );
}
