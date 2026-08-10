"use client";

import { useState, useTransition } from "react";
import { createCast, updateCast, type CastFormInput } from "@/lib/actions/casts";

const EMPLOYMENT_OPTIONS = [
  { value: "REGULAR", label: "レギュラー" },
  { value: "TRIAL", label: "体験入店" },
  { value: "DISPATCH", label: "派遣" },
] as const;

const WAGE_OPTIONS = [
  { value: "HOURLY", label: "時給" },
  { value: "DAILY", label: "日給" },
  { value: "MONTHLY", label: "月給" },
] as const;

export function CastForm({
  castId,
  initial,
}: {
  castId?: string;
  initial?: Partial<CastFormInput> & { name?: string };
}) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CastFormInput>({
    name: initial?.name ?? "",
    employmentType: initial?.employmentType ?? "REGULAR",
    wageType: initial?.wageType ?? "HOURLY",
    wageAmount: initial?.wageAmount ?? 0,
    welfareRate: initial?.welfareRate ?? 0,
    honshimeiBackAmount: initial?.honshimeiBackAmount ?? 0,
    jonaiBackAmount: initial?.jonaiBackAmount ?? 0,
    dohanBackAmount: initial?.dohanBackAmount ?? 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      if (castId) {
        updateCast(castId, form);
      } else {
        createCast(form);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg space-y-4 rounded-md border border-neutral-800 bg-neutral-900 p-4"
    >
      <div>
        <label className="mb-1 block text-sm text-neutral-300">氏名</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-300">区分</label>
          <select
            value={form.employmentType}
            onChange={(e) =>
              setForm({
                ...form,
                employmentType: e.target.value as CastFormInput["employmentType"],
              })
            }
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
          >
            {EMPLOYMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-300">
            給与形態
          </label>
          <select
            value={form.wageType}
            onChange={(e) =>
              setForm({
                ...form,
                wageType: e.target.value as CastFormInput["wageType"],
              })
            }
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
          >
            {WAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-300">単価(円)</label>
          <input
            type="number"
            min={0}
            value={form.wageAmount}
            onChange={(e) =>
              setForm({ ...form, wageAmount: Number(e.target.value) })
            }
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-300">
            厚生費率(%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={form.welfareRate * 100}
            onChange={(e) =>
              setForm({
                ...form,
                welfareRate: Number(e.target.value) / 100,
              })
            }
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm text-neutral-300">指名バック(円)</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">
              本指名
            </label>
            <input
              type="number"
              min={0}
              value={form.honshimeiBackAmount}
              onChange={(e) =>
                setForm({
                  ...form,
                  honshimeiBackAmount: Number(e.target.value),
                })
              }
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">
              場内指名
            </label>
            <input
              type="number"
              min={0}
              value={form.jonaiBackAmount}
              onChange={(e) =>
                setForm({ ...form, jonaiBackAmount: Number(e.target.value) })
              }
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">
              同伴指名
            </label>
            <input
              type="number"
              min={0}
              value={form.dohanBackAmount}
              onChange={(e) =>
                setForm({ ...form, dohanBackAmount: Number(e.target.value) })
              }
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-amber-500 px-3 py-2 font-medium text-neutral-950 hover:bg-amber-400 disabled:opacity-60"
      >
        {isPending ? "保存中..." : "保存"}
      </button>
    </form>
  );
}
