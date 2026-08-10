import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";
import { getMonthRange } from "@/lib/payroll";
import { MonthPicker } from "@/components/month-picker";

function formatDateTime(d: Date) {
  return d.toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const storeId = await requireStoreId();
  const { start, end, label, value } = getMonthRange(month);

  const timeCards = await prisma.timeCard.findMany({
    where: {
      cast: { storeId },
      workDate: { gte: start, lt: end },
    },
    include: { cast: true },
    orderBy: [{ workDate: "desc" }, { clockInAt: "desc" }],
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-100">
          勤怠 - {label}
        </h1>
        <MonthPicker value={value} />
      </div>

      <div className="overflow-x-auto rounded-md border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-3 py-2 text-left">氏名</th>
              <th className="px-3 py-2 text-left">日付</th>
              <th className="px-3 py-2 text-left">出勤</th>
              <th className="px-3 py-2 text-left">退勤</th>
              <th className="px-3 py-2 text-left">実働時間</th>
            </tr>
          </thead>
          <tbody>
            {timeCards.map((tc) => {
              const hours = tc.clockOutAt
                ? (
                    (tc.clockOutAt.getTime() - tc.clockInAt.getTime()) /
                    3_600_000
                  ).toFixed(1)
                : "-";
              return (
                <tr key={tc.id} className="border-t border-neutral-800">
                  <td className="px-3 py-2 text-neutral-100">
                    {tc.cast.name}
                  </td>
                  <td className="px-3 py-2 text-neutral-400">
                    {tc.workDate.toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-3 py-2 text-neutral-400">
                    {formatDateTime(tc.clockInAt)}
                  </td>
                  <td className="px-3 py-2 text-neutral-400">
                    {tc.clockOutAt ? formatDateTime(tc.clockOutAt) : "出勤中"}
                  </td>
                  <td className="px-3 py-2 text-neutral-400">{hours}</td>
                </tr>
              );
            })}
            {timeCards.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-neutral-500"
                >
                  この月の勤怠記録はありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
