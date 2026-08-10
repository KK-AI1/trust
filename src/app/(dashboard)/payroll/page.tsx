import Link from "next/link";
import { requireStoreId } from "@/lib/current-store";
import { getMonthRange, computeStorePayroll } from "@/lib/payroll";
import { MonthPicker } from "@/components/month-picker";

const WAGE_LABEL: Record<string, string> = {
  HOURLY: "時給",
  DAILY: "日給",
  MONTHLY: "月給",
};

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const storeId = await requireStoreId();
  const { start, end, label, value } = getMonthRange(month);

  const payrolls = await computeStorePayroll(storeId, start, end);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-100">
          給与 - {label}
        </h1>
        <MonthPicker value={value} />
      </div>

      <div className="overflow-x-auto rounded-md border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-3 py-2 text-left">氏名</th>
              <th className="px-3 py-2 text-left">給与形態</th>
              <th className="px-3 py-2 text-right">出勤日数</th>
              <th className="px-3 py-2 text-right">実働時間</th>
              <th className="px-3 py-2 text-right">基本給</th>
              <th className="px-3 py-2 text-right">本指名</th>
              <th className="px-3 py-2 text-right">場内指名</th>
              <th className="px-3 py-2 text-right">同伴</th>
              <th className="px-3 py-2 text-right">ボトルバック</th>
              <th className="px-3 py-2 text-right">厚生費</th>
              <th className="px-3 py-2 text-right">差引支給額</th>
              <th className="px-3 py-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((p) => (
              <tr key={p.castId} className="border-t border-neutral-800">
                <td className="px-3 py-2 text-neutral-100">{p.castName}</td>
                <td className="px-3 py-2 text-neutral-400">
                  {WAGE_LABEL[p.wageType]}
                </td>
                <td className="px-3 py-2 text-right text-neutral-400">
                  {p.workedDays}日
                </td>
                <td className="px-3 py-2 text-right text-neutral-400">
                  {p.workedHours}h
                </td>
                <td className="px-3 py-2 text-right text-neutral-400">
                  ¥{p.wagePay.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right text-neutral-400">
                  {p.honshimeiCount}件
                </td>
                <td className="px-3 py-2 text-right text-neutral-400">
                  {p.jonaiCount}件
                </td>
                <td className="px-3 py-2 text-right text-neutral-400">
                  {p.dohanCount}件
                </td>
                <td className="px-3 py-2 text-right text-neutral-400">
                  ¥{p.bottleBackTotal.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right text-red-400">
                  −¥{p.welfareDeduction.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-amber-400">
                  ¥{p.netPay.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`/payroll/${p.castId}?month=${value}`}
                    className="text-amber-400 hover:underline"
                  >
                    明細
                  </Link>
                </td>
              </tr>
            ))}
            {payrolls.length === 0 && (
              <tr>
                <td
                  colSpan={12}
                  className="px-3 py-6 text-center text-neutral-500"
                >
                  キャストが登録されていません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
