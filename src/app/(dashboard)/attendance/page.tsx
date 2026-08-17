import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";
import { getMonthRange } from "@/lib/payroll";
import { MonthPicker } from "@/components/month-picker";
import { AddTimeCardForm } from "@/components/add-timecard-form";
import { TimeCardRow } from "@/components/timecard-row";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const storeId = await requireStoreId();
  const { start, end, label, value } = getMonthRange(month);

  const [timeCards, casts] = await Promise.all([
    prisma.timeCard.findMany({
      where: {
        cast: { storeId },
        workDate: { gte: start, lt: end },
      },
      include: { cast: true },
      orderBy: [{ workDate: "desc" }, { clockInAt: "desc" }],
    }),
    prisma.cast.findMany({
      where: { storeId, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-100">
          勤怠 - {label}
        </h1>
        <MonthPicker value={value} />
      </div>

      <AddTimeCardForm casts={casts.map((c) => ({ id: c.id, name: c.name }))} />

      <div className="overflow-x-auto rounded-md border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-3 py-2 text-left">氏名</th>
              <th className="px-3 py-2 text-left">日付</th>
              <th className="px-3 py-2 text-left">出勤</th>
              <th className="px-3 py-2 text-left">退勤</th>
              <th className="px-3 py-2 text-left">実働時間</th>
              <th className="px-3 py-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {timeCards.map((tc) => (
              <TimeCardRow
                key={tc.id}
                tc={{
                  id: tc.id,
                  castName: tc.cast.name,
                  workDate: tc.workDate.toISOString(),
                  clockInAt: tc.clockInAt.toISOString(),
                  clockOutAt: tc.clockOutAt?.toISOString() ?? null,
                }}
              />
            ))}
            {timeCards.length === 0 && (
              <tr>
                <td
                  colSpan={6}
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
