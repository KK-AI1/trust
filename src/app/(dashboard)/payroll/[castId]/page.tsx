import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStoreId } from "@/lib/current-store";
import { getMonthRange, computeCastPayroll } from "@/lib/payroll";
import { MonthPicker } from "@/components/month-picker";

const WAGE_LABEL: Record<string, string> = {
  HOURLY: "時給",
  DAILY: "日給",
  MONTHLY: "月給",
};

export default async function CastPayrollDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ castId: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { castId } = await params;
  const { month } = await searchParams;
  const storeId = await requireStoreId();
  const { start, end, label, value } = getMonthRange(month);

  const payroll = await computeCastPayroll(castId, storeId, start, end);

  if (!payroll) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/payroll"
        className="mb-2 inline-block text-sm text-neutral-400 hover:underline"
      >
        ← 給与一覧に戻る
      </Link>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-100">
          {payroll.castName} - {label}
        </h1>
        <div className="flex items-center gap-2">
          <MonthPicker value={value} />
          <a
            href={`/api/payroll/${castId}/pdf?month=${value}`}
            className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-neutral-950 hover:bg-amber-400"
          >
            PDFダウンロード
          </a>
        </div>
      </div>

      <div className="max-w-lg space-y-1 rounded-md border border-neutral-800 bg-neutral-900 p-4 text-sm">
        <Row label="給与形態" value={WAGE_LABEL[payroll.wageType]} />
        <Row label="出勤日数" value={`${payroll.workedDays}日`} />
        <Row label="実働時間" value={`${payroll.workedHours}h`} />
        <Row label="基本給" value={`¥${payroll.wagePay.toLocaleString()}`} />
        <Row
          label={`本指名(${payroll.honshimeiCount}件) / 場内(${payroll.jonaiCount}件) / 同伴(${payroll.dohanCount}件)`}
          value={`¥${payroll.nominationBackTotal.toLocaleString()}`}
        />
        <Row
          label="ボトルバック"
          value={`¥${payroll.bottleBackTotal.toLocaleString()}`}
        />
        <Row
          label="支給合計(控除前)"
          value={`¥${payroll.grossBeforeWelfare.toLocaleString()}`}
        />
        <Row
          label={`厚生費控除(${(payroll.welfareRate * 100).toFixed(1)}%)`}
          value={`−¥${payroll.welfareDeduction.toLocaleString()}`}
        />
        <div className="mt-2 flex items-center justify-between border-t border-neutral-700 pt-2">
          <span className="font-semibold text-neutral-200">差引支給額</span>
          <span className="text-lg font-bold text-amber-400">
            ¥{payroll.netPay.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-800 py-1.5">
      <span className="text-neutral-400">{label}</span>
      <span className="text-neutral-100">{value}</span>
    </div>
  );
}
