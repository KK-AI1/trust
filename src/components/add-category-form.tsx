"use client";

import { useState, useTransition } from "react";
import { createMenuCategory } from "@/lib/actions/menu";

export function AddCategoryForm() {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await createMenuCategory(name);
      setName("");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="新しいカテゴリー名(例: フード)"
        className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100"
      />
      <button
        type="submit"
        disabled={isPending || !name.trim()}
        className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-neutral-950 hover:bg-amber-400 disabled:opacity-60"
      >
        + カテゴリー追加
      </button>
    </form>
  );
}
