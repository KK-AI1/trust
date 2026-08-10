import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";
import { DatePicker } from "@/components/date-picker";
import { DailyReportForm } from "@/components/daily-report-form";
import { getMonthRange } from "@/lib/payroll";

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function DailyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const storeId = await requireStoreId();
  const selectedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayString();
  const dayStart = new Date(`${selectedDate}T00:00:00`);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const [existingReport, closedVisits] = await Promise.all([
    prisma.dailyReport.findUnique({
      where: { storeId_reportDate: { storeId, reportDate: dayStart } },
    }),
    prisma.visit.findMany({
      where: {
        storeId,
        status: "CLOSED",
        checkOutAt: { gte: dayStart, lt: dayEnd },
      },
    }),
  ]);

  const autoSalesTotal = closedVisits.reduce((sum, v) => sum + v.totalAmount, 0);

  const { start: monthStart, end: monthEnd, label: monthLabel } = getMonthRange(
    selectedDate.slice(0, 7),
  );

  const monthlyReports = await prisma.dailyReport.findMany({
    where: { storeId, reportDate: { gte: monthStart, lt: monthEnd } },
    orderBy: { reportDate: "desc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-100">日報</h1>
        <DatePicker value={selectedDate} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DailyReportForm
          date={selectedDate}
          autoSalesTotal={autoSalesTotal}
          initial={
            existingReport
              ? {
                  cashTotal: existingReport.cashTotal,
                  cardTotal: existingReport.cardTotal,
                  notes: existingReport.notes ?? "",
                }
              : undefined
          }
        />

        <div className="rounded-md border border-neutral-800 bg-neutral-900 p-3">
          <h2 className="mb-2 text-sm font-semibold text-neutral-300">
            {monthLabel} の日報一覧
          </h2>
          <table className="w-full text-sm">
            <thead className="text-neutral-500">
              <tr>
                <th className="py-1 text-left">日付</th>
                <th className="py-1 text-right">売上</th>
                <th className="py-1 text-right">現金</th>
                <th className="py-1 text-right">カード</th>
              </tr>
            </thead>
            <tbody>
              {monthlyReports.map((r) => (
                <tr key={r.id} className="border-t border-neutral-800">
                  <td className="py-1 text-neutral-300">
                    {r.reportDate.toLocaleDateString("ja-JP")}
                  </td>
                  <td className="py-1 text-right text-neutral-300">
                    ¥{r.salesTotal.toLocaleString()}
                  </td>
                  <td className="py-1 text-right text-neutral-400">
                    ¥{r.cashTotal.toLocaleString()}
                  </td>
                  <td className="py-1 text-right text-neutral-400">
                    ¥{r.cardTotal.toLocaleString()}
                  </td>
                </tr>
              ))}
              {monthlyReports.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-neutral-500">
                    日報がありません
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
