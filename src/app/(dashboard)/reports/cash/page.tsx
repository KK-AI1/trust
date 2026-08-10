import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";
import { getMonthRange } from "@/lib/payroll";
import { MonthPicker } from "@/components/month-picker";
import { CashEntryForm } from "@/components/cash-entry-form";

export default async function CashReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const storeId = await requireStoreId();
  const { start, end, label, value } = getMonthRange(month);

  const [entries, dailyReports] = await Promise.all([
    prisma.cashRegisterLog.findMany({
      where: { storeId, entryDate: { gte: start, lt: end } },
      orderBy: { entryDate: "desc" },
    }),
    prisma.dailyReport.findMany({
      where: { storeId, reportDate: { gte: start, lt: end } },
    }),
  ]);

  const salesTotal = dailyReports.reduce((sum, r) => sum + r.salesTotal, 0);
  const cashInTotal = entries
    .filter((e) => e.type === "CASH_IN")
    .reduce((sum, e) => sum + e.amount, 0);
  const cashOutTotal = entries
    .filter((e) => e.type === "CASH_OUT")
    .reduce((sum, e) => sum + e.amount, 0);
  const netCashFlow = cashInTotal - cashOutTotal;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-100">
          収支 - {label}
        </h1>
        <MonthPicker value={value} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="売上合計" value={salesTotal} />
        <SummaryCard label="入金合計" value={cashInTotal} tone="positive" />
        <SummaryCard label="出金合計" value={cashOutTotal} tone="negative" />
        <SummaryCard label="収支差引" value={netCashFlow} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CashEntryForm />

        <div className="rounded-md border border-neutral-800 bg-neutral-900 p-3">
          <h2 className="mb-2 text-sm font-semibold text-neutral-300">
            入出金明細
          </h2>
          <table className="w-full text-sm">
            <thead className="text-neutral-500">
              <tr>
                <th className="py-1 text-left">日付</th>
                <th className="py-1 text-left">区分</th>
                <th className="py-1 text-left">理由</th>
                <th className="py-1 text-right">金額</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-neutral-800">
                  <td className="py-1 text-neutral-300">
                    {e.entryDate.toLocaleDateString("ja-JP")}
                  </td>
                  <td className="py-1 text-neutral-400">
                    {e.type === "CASH_IN" ? "入金" : "出金"}
                  </td>
                  <td className="py-1 text-neutral-400">{e.reason}</td>
                  <td
                    className={`py-1 text-right ${
                      e.type === "CASH_IN" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {e.type === "CASH_IN" ? "+" : "−"}¥
                    {e.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-neutral-500">
                    入出金記録がありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "positive" | "negative";
}) {
  const color =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
        ? "text-red-400"
        : "text-amber-400";

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-900 p-3">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className={`text-lg font-bold ${color}`}>
        ¥{value.toLocaleString()}
      </div>
    </div>
  );
}
