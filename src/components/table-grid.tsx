"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createVisit } from "@/lib/actions/visits";

type TableCardData = {
  id: string;
  name: string;
  capacity: number;
  status: "VACANT" | "OCCUPIED";
  visitId: string | null;
  customerName: string | null;
  guestCount: number | null;
  checkInAt: string | null;
  amount: number;
};

export function TableGrid({ tables }: { tables: TableCardData[] }) {
  const router = useRouter();
  const [startingTableId, setStartingTableId] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [customerName, setCustomerName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const initial = setTimeout(tick, 0);
    const timer = setInterval(() => {
      tick();
      router.refresh();
    }, 30000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [router]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {tables.map((table) => {
        if (table.status === "OCCUPIED" && table.visitId) {
          const minutes =
            table.checkInAt && now !== null
              ? Math.max(
                  0,
                  Math.floor(
                    (now - new Date(table.checkInAt).getTime()) / 60000,
                  ),
                )
              : 0;
          return (
            <button
              key={table.id}
              onClick={() => router.push(`/visits/${table.visitId}`)}
              className="flex flex-col items-start rounded-lg border border-amber-600 bg-amber-950/40 p-3 text-left transition hover:bg-amber-900/40"
            >
              <span className="text-sm font-semibold text-amber-300">
                {table.name}
                {table.customerName ? ` - ${table.customerName}様` : ""}
              </span>
              <span className="text-xs text-neutral-400">
                {table.guestCount}名 / {minutes}分経過
              </span>
              <span className="mt-1 text-lg font-bold text-neutral-100">
                ¥{table.amount.toLocaleString()}
              </span>
            </button>
          );
        }

        const isStarting = startingTableId === table.id;

        return (
          <div
            key={table.id}
            className="flex flex-col items-start rounded-lg border border-neutral-800 bg-neutral-900 p-3"
          >
            <span className="text-sm font-semibold text-neutral-200">
              {table.name}
            </span>
            <span className="text-xs text-neutral-500">空席</span>

            {isStarting ? (
              <div className="mt-2 flex w-full flex-col gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="お客様名(任意)"
                  className="w-full rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-14 rounded border border-neutral-700 bg-neutral-800 px-1 py-0.5 text-sm text-neutral-100"
                  />
                  <span className="text-xs text-neutral-400">名</span>
                  <button
                    disabled={isPending}
                    onClick={() =>
                      startTransition(() => {
                        createVisit(table.id, guestCount, customerName);
                      })
                    }
                    className="ml-auto rounded bg-amber-500 px-2 py-1 text-xs font-medium text-neutral-950 hover:bg-amber-400 disabled:opacity-60"
                  >
                    開始
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setStartingTableId(table.id);
                  setCustomerName("");
                  setGuestCount(2);
                }}
                className="mt-2 w-full rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-700"
              >
                入店
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
