import { prisma } from "@/lib/prisma";

export type CastPayroll = {
  castId: string;
  castName: string;
  wageType: string;
  wageAmount: number;
  welfareRate: number;
  workedDays: number;
  workedHours: number;
  wagePay: number;
  honshimeiCount: number;
  jonaiCount: number;
  dohanCount: number;
  nominationBackTotal: number;
  bottleBackTotal: number;
  grossBeforeWelfare: number;
  welfareDeduction: number;
  netPay: number;
};

export function getMonthRange(monthParam?: string) {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    month = m - 1;
  }

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  const label = `${year}年${month + 1}月`;
  const value = `${year}-${String(month + 1).padStart(2, "0")}`;

  return { start, end, label, value };
}

export async function computeStorePayroll(
  storeId: string,
  start: Date,
  end: Date,
): Promise<CastPayroll[]> {
  const casts = await prisma.cast.findMany({
    where: { storeId },
    orderBy: { name: "asc" },
    include: {
      timeCards: {
        where: { workDate: { gte: start, lt: end } },
      },
      nominations: {
        where: { createdAt: { gte: start, lt: end } },
      },
      bottleSplits: {
        where: { createdAt: { gte: start, lt: end } },
      },
    },
  });

  return casts.map(mapCastToPayroll);
}

export async function computeCastPayroll(
  castId: string,
  storeId: string,
  start: Date,
  end: Date,
): Promise<CastPayroll | null> {
  const cast = await prisma.cast.findFirst({
    where: { id: castId, storeId },
    include: {
      timeCards: {
        where: { workDate: { gte: start, lt: end } },
      },
      nominations: {
        where: { createdAt: { gte: start, lt: end } },
      },
      bottleSplits: {
        where: { createdAt: { gte: start, lt: end } },
      },
    },
  });

  return cast ? mapCastToPayroll(cast) : null;
}

type CastWithPeriodData = NonNullable<
  Awaited<ReturnType<typeof prisma.cast.findFirst<{
    include: {
      timeCards: true;
      nominations: true;
      bottleSplits: true;
    };
  }>>>
>;

function mapCastToPayroll(cast: CastWithPeriodData): CastPayroll {
  const closedCards = cast.timeCards.filter((tc) => tc.clockOutAt);
    const workedHours = closedCards.reduce((sum, tc) => {
      const ms = tc.clockOutAt!.getTime() - tc.clockInAt.getTime();
      return sum + ms / 3_600_000;
    }, 0);
    const workedDays = new Set(
      cast.timeCards.map((tc) => tc.workDate.toISOString().slice(0, 10)),
    ).size;

    let wagePay = 0;
    if (cast.wageType === "HOURLY") {
      wagePay = Math.round(workedHours * cast.wageAmount);
    } else if (cast.wageType === "DAILY") {
      wagePay = workedDays * cast.wageAmount;
    } else {
      wagePay = workedDays > 0 ? cast.wageAmount : 0;
    }

    const honshimeiCount = cast.nominations.filter(
      (n) => n.type === "HONSHIMEI",
    ).length;
    const jonaiCount = cast.nominations.filter(
      (n) => n.type === "JONAI",
    ).length;
    const dohanCount = cast.nominations.filter(
      (n) => n.type === "DOHAN",
    ).length;

    const nominationBackTotal =
      honshimeiCount * cast.honshimeiBackAmount +
      jonaiCount * cast.jonaiBackAmount +
      dohanCount * cast.dohanBackAmount;

    const bottleBackTotal = cast.bottleSplits.reduce(
      (sum, s) => sum + s.backAmount,
      0,
    );

    const grossBeforeWelfare = wagePay + nominationBackTotal + bottleBackTotal;
    const welfareDeduction = Math.round(grossBeforeWelfare * cast.welfareRate);
    const netPay = grossBeforeWelfare - welfareDeduction;

    return {
      castId: cast.id,
      castName: cast.name,
      wageType: cast.wageType,
      wageAmount: cast.wageAmount,
      welfareRate: cast.welfareRate,
      workedDays,
      workedHours: Math.round(workedHours * 10) / 10,
      wagePay,
      honshimeiCount,
      jonaiCount,
      dohanCount,
      nominationBackTotal,
      bottleBackTotal,
      grossBeforeWelfare,
      welfareDeduction,
    netPay,
  };
}
