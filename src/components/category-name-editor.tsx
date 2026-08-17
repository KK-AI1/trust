"use client";

import { useState, useTransition } from "react";
import { updateMenuCategory } from "@/lib/actions/menu";

export function CategoryNameEditor({
  categoryId,
  name,
}: {
  categoryId: string;
  name: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <div className="mb-2 flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm font-semibold text-neutral-100"
        />
        <button
          disabled={isPending || !value.trim()}
          onClick={() =>
            startTransition(async () => {
              await updateMenuCategory(categoryId, value);
              setEditing(false);
            })
          }
          className="rounded bg-amber-500 px-2 py-1 text-xs font-medium text-neutral-950 hover:bg-amber-400 disabled:opacity-60"
        >
          保存
        </button>
        <button
          onClick={() => {
            setValue(name);
            setEditing(false);
          }}
          className="rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-700"
        >
          キャンセル
        </button>
      </div>
    );
  }

  return (
    <div className="mb-2 flex items-center gap-2">
      <h2 className="text-sm font-semibold text-neutral-300">{name}</h2>
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-amber-400 hover:underline"
      >
        編集
      </button>
    </div>
  );
}
