import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";
import { AttendanceToggle } from "@/components/attendance-toggle";

const EMPLOYMENT_LABEL: Record<string, string> = {
  REGULAR: "レギュラー",
  TRIAL: "体験入店",
  DISPATCH: "派遣",
};

const WAGE_LABEL: Record<string, string> = {
  HOURLY: "時給",
  DAILY: "日給",
  MONTHLY: "月給",
};

export default async function CastsPage() {
  const storeId = await requireStoreId();

  const casts = await prisma.cast.findMany({
    where: { storeId },
    orderBy: { createdAt: "asc" },
    include: {
      timeCards: {
        where: { clockOutAt: null },
        orderBy: { clockInAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-100">
          キャスト管理
        </h1>
        <Link
          href="/casts/new"
          className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-neutral-950 hover:bg-amber-400"
        >
          + 新規キャスト
        </Link>
      </div>

      <div className="overflow-x-auto rounded-md border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="px-3 py-2 text-left">氏名</th>
              <th className="px-3 py-2 text-left">区分</th>
              <th className="px-3 py-2 text-left">給与形態</th>
              <th className="px-3 py-2 text-left">単価</th>
              <th className="px-3 py-2 text-left">厚生費率</th>
              <th className="px-3 py-2 text-left">本日出勤</th>
              <th className="px-3 py-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {casts.map((cast) => (
              <tr key={cast.id} className="border-t border-neutral-800">
                <td className="px-3 py-2 text-neutral-100">{cast.name}</td>
                <td className="px-3 py-2 text-neutral-400">
                  {EMPLOYMENT_LABEL[cast.employmentType]}
                </td>
                <td className="px-3 py-2 text-neutral-400">
                  {WAGE_LABEL[cast.wageType]}
                </td>
                <td className="px-3 py-2 text-neutral-400">
                  ¥{cast.wageAmount.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-neutral-400">
                  {(cast.welfareRate * 100).toFixed(1)}%
                </td>
                <td className="px-3 py-2">
                  <AttendanceToggle
                    castId={cast.id}
                    isWorking={cast.timeCards.length > 0}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`/casts/${cast.id}/edit`}
                    className="text-amber-400 hover:underline"
                  >
                    編集
                  </Link>
                </td>
              </tr>
            ))}
            {casts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-neutral-500">
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
